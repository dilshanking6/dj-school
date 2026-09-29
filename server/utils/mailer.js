const axios = require('axios');
const { codeExposed } = require('./otp');

/**
 * Email bhejne ke do raaste hain:
 *
 *  1. SMTP (recommended) — Gmail SMTP + App Password. Ye reliable hai, seedha
 *     chalta hai, aur 500 mail/day tak aasaani se chalta hai. Isi ke liye
 *     `server/.env` me SMTP_USER/SMTP_PASS bharne hote hain.
 *  2. Apps Script `sendMail` — sirf tab, jab aapka apna deployed script me
 *     `sendMail` action likha ho. Ye default me BAND hai: `APPS_SCRIPT_URL`
 *     set hone ka matlab ye nahi ki script mail bhej sakti hai, aur pehle yahi
 *     galat assumption server ko "email ready" dikha rahi thi jabki koi mail
 *     jaata hi nahi tha. Chalane ke liye `APPS_SCRIPT_MAIL=true` set karo.
 *
 * Dono me se jo pehle configured mile use try karte hain; fail ho to doosra.
 * Dono fail = saaf error (code chup chaap nahi hota).
 */

const SMTP_HOST = () => process.env.SMTP_HOST;
const SMTP_USER = () => process.env.SMTP_USER;
const SMTP_PASS = () => process.env.SMTP_PASS;

const smtpConfigured = () => Boolean(SMTP_HOST() && SMTP_USER() && SMTP_PASS());
const appsScriptConfigured = () =>
  Boolean(process.env.APPS_SCRIPT_URL) && process.env.APPS_SCRIPT_MAIL === 'true';

// Nodemailer transport banate waqt connection verify kar leti hai, taaki har
// OTP request par handshake na ho. Isse failure jaldi pata chal jaati hai.
let transportPromise = null;

const smtpTransport = () => {
  if (!transportPromise) {
    const nodemailer = require('nodemailer');
    const port = Number(process.env.SMTP_PORT || 587);
    transportPromise = nodemailer.createTransport({
      host: SMTP_HOST(),
      port,
      // Port 465 direct TLS hai, baaki (587/25) STARTTLS use karte hain.
      secure: process.env.SMTP_SECURE
        ? process.env.SMTP_SECURE === 'true'
        : port === 465,
      auth: { user: SMTP_USER(), pass: SMTP_PASS() },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000
    });
  }
  return transportPromise;
};

/** SMTP galat password par turant fail ho jaata hai — retry ka koi matlab nahi. */
const resetTransport = () => {
  if (transportPromise) {
    transportPromise.then((t) => t.close?.()).catch(() => {});
    transportPromise = null;
  }
};

class MailError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'MailError';
    this.status = 503;
    // Provider ka raw message (jaise "535 Incorrect password") user ko
    // dikhana hai — wo secrets nahi batata, aur bina iske pata hi nahi chalta
    // ki App Password sahi daala ya nahi.
    this.expose = true;
    this.cause = cause;
  }
}

const sendViaSmtp = async ({ to, subject, text, html }) => {
  const transport = await smtpTransport();
  const info = await transport.sendMail({
    from: process.env.MAIL_FROM || `"Digital Janta" <${SMTP_USER()}>`,
    to,
    subject,
    text,
    html
  });
  return { via: 'smtp', id: info.messageId };
};

const sendViaAppsScript = async ({ to, subject, text, html }) => {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) throw new MailError('Email service is not configured.');

  const timeout = Number(process.env.SHEET_WRITE_TIMEOUT || 30000);
  let response;
  try {
    response = await axios.post(url, { action: 'sendMail', to, subject, body: text, html }, { timeout });
  } catch (error) {
    if (error.response) throw new MailError('Email service rejected the request', error);
    if (error.code === 'ECONNABORTED') throw new MailError('Email service timed out. Please try again.', error);
    throw new MailError('Email service is unreachable', error);
  }

  if (response.data && response.data.error) {
    throw new MailError(String(response.data.error).slice(0, 200));
  }
  return { via: 'apps-script' };
};

/**
 * `text` (plain body) aur `html` (rich body) dono bhejte hain — har mail
 * client dono samajhta hai, aur plain text wala OTP parse karna aasaan rehta hai.
 * Sirf `text` diya ho to usi se simple HTML bana lete hain.
 */
const asHtml = ({ text, html }) => html || `<p>${String(text).replace(/\n/g, '<br>')}</p>`;

async function sendMail({ to, subject, text, html }) {
  const message = { to, subject, text, html: asHtml({ text, html }) };
  const problems = [];

  if (smtpConfigured()) {
    try {
      return await sendViaSmtp(message);
    } catch (error) {
      resetTransport();
      // Nodemailer ka message ("535 5.7.8 Username and Password not accepted")
      // user ke liye useful hai, isliye wahi aage bheja jaata hai.
      problems.push(error.message);
    }
  }

  if (appsScriptConfigured()) {
    try {
      return await sendViaAppsScript(message);
    } catch (error) {
      problems.push(error.message);
    }
  }

  const error = new MailError(
    problems.length
      ? problems.join(' | ')
      : 'Email service is not configured. Add SMTP_USER and SMTP_PASS to the server environment.'
  );
  error.problems = problems;
  throw error;
}

const mailConfigured = () => smtpConfigured() || appsScriptConfigured();

/**
 * `false` matlab development/ALLOW_DEV_EMAIL_CODE mode — tab code screen par
 * dikhaya jaata hai aur koi mail nahi jaata.
 */
const shouldSendMail = () => mailConfigured();

/** Diagnostics endpoint / `npm run check:otp` ke liye. Secrets nahi dikhata. */
const mailStatus = () => {
  if (smtpConfigured()) {
    return { available: true, provider: 'smtp', account: SMTP_USER() };
  }
  if (appsScriptConfigured()) {
    return { available: true, provider: 'apps-script' };
  }
  if (process.env.SMTP_USER || process.env.SMTP_PASS) {
    return { available: false, reason: 'SMTP_USER and SMTP_PASS dono chahiye (ek bhi khaali hai)' };
  }
  return { available: false, reason: 'SMTP_USER/SMTP_PASS missing in server env' };
};

/** SMTP credentials sach me kaam kar rahi hain ya nahi — bina mail bheje. */
const verifySmtp = async () => {
  if (!smtpConfigured()) return { ok: false, reason: mailStatus().reason };
  try {
    const transport = await smtpTransport();
    await transport.verify();
    return { ok: true, account: SMTP_USER() };
  } catch (error) {
    resetTransport();
    return { ok: false, reason: error.message };
  }
};

module.exports = {
  sendMail, verifySmtp, mailConfigured, shouldSendMail, mailStatus,
  smtpConfigured, appsScriptConfigured, codeExposed, MailError
};

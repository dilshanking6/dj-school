const axios = require('axios');
const { codeExposed } = require('./otp');

/**
 * Email bhejne ke do raaste hain:
 *
 *  1. `apps-script` (free, Render free plan ke liye) — ek alag Apps Script web
 *     app (`server/scripts/appsScriptMail.gs`) HTTPS (port 443) par mail
 *     bhejta hai. Render ka free plan outbound SMTP ports 25/465/587 block
 *     karta hai, isliye wahan SMTP se mail jaata hi nahi. URL
 *     `APPS_SCRIPT_MAIL_URL` me, shared secret `APPS_SCRIPT_MAIL_TOKEN` me.
 *
 *  2. `smtp` — Gmail SMTP + App Password (port 587). Normal host par
 *     reliable; Render **paid** plan par chalta hai. Iske liye `SMTP_USER`
 *     aur `SMTP_PASS` chahiye.
 *
 * Dono configured ho to `MAIL_TRANSPORT` decide karta hai kaun sa use hoga
 * (upar wale comment me details). Ek fail ho to doosra try hota hai.
 * Dono fail = saaf error — code chup chaap nahi hota.
 */

const SMTP_HOST = () => process.env.SMTP_HOST;
const SMTP_USER = () => process.env.SMTP_USER;
const SMTP_PASS = () => process.env.SMTP_PASS;

const smtpConfigured = () => Boolean(SMTP_HOST() && SMTP_USER() && SMTP_PASS());

/**
 * Mail bhejne ke teen possible "transport" hain:
 *
 *   smtp         — Gmail SMTP (port 587/465). **Render free plan par BAND hai**
 *                  uske official firewall ki wajah se (ports 25/465/587 blocked
 *                  since Sep 2025). Normal host par chalta hai.
 *   apps-script  — ek alag Apps Script web app jo HTTPS (443) par mail bhejta
 *                  hai. Free plan par ye EK MATRA free raasta hai.
 *
 * `MAIL_TRANSPORT` operator ye batata hai ki asli me kaun sa chal raha hai:
 *
 *   auto        (default) — jo bhi configured ho, pehle apps-script, phir smtp
 *   apps-script           — sirf Apps Script (Render free ke liye)
 *   smtp                  — sirf SMTP (paid host ke liye)
 *
 * Ye zaroori isliye hai kyunki `smtpConfigured()` sirf "env var bhar gaye hain"
 * dekhta hai, ye nahi ki connection ban bhi payegi. Render free par SMTP creds
 * perfectly set hone ke bawajood har mail 11 second timeout par marta tha, aur
 * `/api/status` + `/api/auth/otp-channels` `available: true` dikha kar user ko
 * email option dikhate the jo kabhi kaam karta hi nahi tha. Operator ab ye
 * declare karta hai, isliye availability jhooth nahi bolta.
 */
const mailTransport = () => String(process.env.MAIL_TRANSPORT || 'auto').trim().toLowerCase();

// Naya: apna alag mail-only Apps Script (server/scripts/appsScriptMail.gs).
const dedicatedMailUrl = () => String(process.env.APPS_SCRIPT_MAIL_URL || '').trim();
const mailToken = () => String(process.env.APPS_SCRIPT_MAIL_TOKEN || '').trim();

// Purana raasta: wahi sheet wala Apps Script jisme `sendMail` action ho.
const sharedScriptMailConfigured = () =>
  Boolean(process.env.APPS_SCRIPT_URL) && process.env.APPS_SCRIPT_MAIL === 'true';

const appsScriptMailConfigured = () => Boolean(dedicatedMailUrl()) || sharedScriptMailConfigured();

const appsScriptMailUrl = () => dedicatedMailUrl() || process.env.APPS_SCRIPT_URL || '';

/**
 * Kaunse transport kis order me try honge. `MAIL_TRANSPORT` explicitly diya
 * ho to sirf wahi. `auto` me apps-script pehle — wo operator ne jaan boojh kar
 * enable kiya hai, aur Render free par SMTP kabhi kaam nahi karegi (11s hang).
 */
const transportOrder = () => {
  const forced = mailTransport();
  if (forced === 'smtp') return smtpConfigured() ? ['smtp'] : [];
  if (forced === 'apps-script') return appsScriptMailConfigured() ? ['apps-script'] : [];

  const order = [];
  if (appsScriptMailConfigured()) order.push('apps-script');
  if (smtpConfigured()) order.push('smtp');
  return order;
};

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
  const url = appsScriptMailUrl();
  if (!url) throw new MailError('Email service is not configured.');

  const timeout = Number(process.env.SHEET_WRITE_TIMEOUT || 30000);
  let response;
  try {
    response = await axios.post(
      url,
      { action: 'sendMail', token: mailToken(), to, subject, body: text, html },
      { timeout }
    );
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
  const order = transportOrder();

  for (const transport of order) {
    try {
      if (transport === 'apps-script') return await sendViaAppsScript(message);
      return await sendViaSmtp(message);
    } catch (error) {
      // SMTP ka transport dobara connect nahi hona chahiye (535 par wo
      // poison ho jaata hai), isliye use reset karte hain.
      if (transport === 'smtp') resetTransport();
      // Nodemailer ka message ("535 5.7.8 Username and Password not accepted")
      // ya Apps Script ka error — dono user ke liye useful hain.
      problems.push(error.message);
    }
  }

  const error = new MailError(
    problems.length
      ? problems.join(' | ')
      : 'Email service is not configured. Set MAIL_TRANSPORT and its settings in the server environment.'
  );
  error.problems = problems;
  throw error;
}

const mailConfigured = () => transportOrder().length > 0;

/**
 * `false` matlab development/ALLOW_DEV_EMAIL_CODE mode — tab code screen par
 * dikhaya jaata hai aur koi mail nahi jaata.
 */
const shouldSendMail = () => mailConfigured();

/**
 * Diagnostics endpoint / `npm run check:otp` ke liye. Secrets nahi dikhata.
 *
 * `MAIL_TRANSPORT` ko dhyan me rakhta hai — yahi wo jagah hai jahan se
 * `available` ki haaliyat aati hai. Render free par `MAIL_TRANSPORT=smtp`
 * hata kar `apps-script` karna zaroori hai, warna status `available: true`
 * bolega jabki har mail 11 second timeout par marega.
 */
const mailStatus = () => {
  const forced = mailTransport();

  if (forced === 'smtp') {
    if (smtpConfigured()) return { available: true, provider: 'smtp', account: SMTP_USER() };
    return { available: false, provider: 'smtp', reason: smtpMissingReason() };
  }

  if (forced === 'apps-script') {
    if (appsScriptMailConfigured()) return { available: true, provider: 'apps-script' };
    return {
      available: false,
      provider: 'apps-script',
      reason: dedicatedMailUrl()
        ? 'APPS_SCRIPT_MAIL_TOKEN is missing'
        : 'APPS_SCRIPT_MAIL_URL is missing (see server/scripts/appsScriptMail.gs)'
    };
  }

  // auto
  if (appsScriptMailConfigured()) return { available: true, provider: 'apps-script' };
  if (smtpConfigured()) return { available: true, provider: 'smtp', account: SMTP_USER() };
  if (process.env.SMTP_USER || process.env.SMTP_PASS) return { available: false, reason: smtpMissingReason() };
  return { available: false, reason: 'No mail transport configured (set MAIL_TRANSPORT)' };
};

const smtpMissingReason = () =>
  'SMTP_USER and SMTP_PASS dono chahiye (ek bhi khaali hai)';

/**
 * SMTP credentials sach me kaam kar rahi hain ya nahi — bina mail bheje.
 * Sirf `smtp` transport par matlab rakhta hai; apps-script ka koi SMTP
 * handshake nahi hai (wo HTTPS hai), isliye wahan skip ho jaata hai.
 */
const verifySmtp = async () => {
  if (mailTransport() === 'apps-script') return { ok: true, via: 'apps-script' };
  if (!smtpConfigured()) return { ok: false, reason: mailStatus().reason || 'SMTP is not configured' };
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
  smtpConfigured, appsScriptMailConfigured, mailTransport, transportOrder,
  codeExposed, MailError
};

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
  if (forced === 'smtp') return smtpConfigured() && smtpReachable() ? ['smtp'] : [];
  if (forced === 'apps-script') return appsScriptMailConfigured() ? ['apps-script'] : [];

  const order = [];
  if (appsScriptMailConfigured()) order.push('apps-script');
  // Probe ne bol diya ki is host par SMTP port band hai to fallback me ise
  // rakhte nahi — warna har mail 10 second timeout lega aur phir bhi fail hoga.
  if (smtpConfigured() && smtpReachable()) order.push('smtp');
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

/**
 * Credentials bhar jaana alag baat hai, connection ban paana alag baat.
 *
 * `smtpConfigured()` sirf env vars dekhta hai. Render ka free plan outbound
 * SMTP ports 25/465/587 block karta hai, uske official firewall ki wajah se —
 * wahan creds bilkul sahi hone ke bawajood TCP connection banti hi nahi aur
 * nodemailer 10 second timeout par marta hai. Isliye server boot par ek chhota
 * sa probe chalata hai: SMTP host ke port par asli socket connect karke dekhta
 * hai. Iska natija `smtpProbe` me rehta hai aur usi se `mailStatus()` ka
 * `available` aur `transportOrder()` ka fallback decide hota hai.
 *
 * Matlab operator ko `MAIL_TRANSPORT` jaisi cheez declare karne ki zaroorat
 * nahi — server khud jaan jaata hai ki SMTP is host par chal rahi hai ya nahi.
 * Probe fire-and-forget hai: boot kabhi iska intezaar nahi karta.
 */
const SMTP_PROBE_TIMEOUT = 6000;
let smtpProbe = { checked: false, reachable: false, reason: 'not checked yet' };

const smtpReachable = () => !smtpProbe.checked || smtpProbe.reachable;

const probeSmtp = () =>
  new Promise((resolve) => {
    if (!smtpConfigured()) {
      smtpProbe = { checked: true, reachable: false, reason: 'SMTP creds missing' };
      return resolve(smtpProbe);
    }

    const net = require('net');
    const host = SMTP_HOST();
    const port = Number(process.env.SMTP_PORT || 587);
    let settled = false;
    let socket;
    let guard;

    const finish = (reachable, reason) => {
      if (settled) return;
      settled = true;
      if (guard) clearTimeout(guard);
      if (socket) socket.destroy();
      smtpProbe = { checked: true, reachable, reason };
      resolve(smtpProbe);
    };

    // Ye promise HAMESHA resolve hona chahiye. Socket ke events kabhi na aayein
    // to bhi ye guard natija de kar aage badhta hai — nahi to mailStatus
    // hamesha "check is still running" hi bolta rehta.
    guard = setTimeout(
      () => finish(false, `${host}:${port} blocked (no response)`),
      SMTP_PROBE_TIMEOUT + 2000
    );
    if (typeof guard.unref === 'function') guard.unref();

    try {
      socket = net.connect({ host, port });
    } catch (error) {
      finish(false, `${host}:${port} ${error.code || error.message}`);
      return;
    }

    socket.setTimeout(SMTP_PROBE_TIMEOUT);
    socket.once('connect', () => finish(true, ''));
    // Timeout matlab port drop ho raha hai (Render free ka firewall aisa hi
    // karta hai). ECONNREFUSED / EHOSTUNREACH bhi wahi batata hai.
    socket.once('timeout', () => finish(false, `${host}:${port} blocked (timeout)`));
    socket.once('error', (error) => finish(false, `${host}:${port} ${error.code || error.message}`));
  });

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

  const error = new MailError(problems.length ? problems.join(' | ') : noTransportMessage());
  error.problems = problems;
  throw error;
}

/**
 * Koi transport hi available nahi hai — wajah kehti hai (logs ke liye, user ko
 * to controller generic message dikhata hai). Probe ke natija ko yahan
 * shaamil karna zaroori hai, warna "not configured" bolega jabki creds to
 * bhare hain aur asli wajah blocked port hai.
 */
const noTransportMessage = () => {
  if (smtpProbe.checked && !smtpProbe.reachable && !appsScriptMailConfigured()) {
    return (
      `SMTP port unreachable on this host (${smtpProbe.reason}). ` +
      'Render free plan blocks outbound ports 25/465/587 — set APPS_SCRIPT_MAIL_URL ' +
      'and APPS_SCRIPT_MAIL_TOKEN instead (see server/scripts/appsScriptMail.gs).'
    );
  }
  return 'Email service is not configured. Set MAIL_TRANSPORT and its settings in the server environment.';
};

const mailConfigured = () => transportOrder().length > 0;

/**
 * `false` matlab development/ALLOW_DEV_EMAIL_CODE mode — tab code screen par
 * dikhaya jaata hai aur koi mail nahi jaata.
 */
const shouldSendMail = () => mailConfigured();

/**
 * Diagnostics endpoint / `npm run check:otp` ke liye. Secrets nahi dikhata.
 *
 * `available` ki haaliyat do cheezon se aati hai: env vars configured hain, aur
 * (SMTP ke liye) boot-time probe ne port tak connection banate dekhi hai. Isi
 * wajah se Render free par status `available: true` nahi bolta jabki har mail
 * 10 second timeout par marta — port par pahunch hi nahi hoti.
 */
const mailStatus = () => {
  const forced = mailTransport();

  if (forced === 'smtp') {
    if (!smtpConfigured()) return { available: false, provider: 'smtp', reason: smtpMissingReason() };
    return smtpProbeStatus('smtp');
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
  if (smtpConfigured()) return smtpProbeStatus('smtp');
  if (process.env.SMTP_USER || process.env.SMTP_PASS) return { available: false, reason: smtpMissingReason() };
  return { available: false, reason: 'No mail transport configured (set MAIL_TRANSPORT)' };
};

/**
 * SMTP creds to hain par kya port khula hai — probe ka natija.
 * Probe abhi chal raha ho to `available: false` dikhate hain; ye jaan boojh
 * kar hai, kyunki "bata denge" wale jhoothe `true` se hi to dikkat thi.
 */
const smtpProbeStatus = (provider) => {
  const base = { provider, account: SMTP_USER() };
  if (!smtpProbe.checked) {
    return { ...base, available: false, reason: 'SMTP connectivity check is still running' };
  }
  if (!smtpProbe.reachable) {
    return { ...base, available: false, reason: `SMTP port unreachable: ${smtpProbe.reason}` };
  }
  return { ...base, available: true };
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
  probeSmtp, smtpProbe: () => smtpProbe,
  codeExposed, MailError
};

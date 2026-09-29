const axios = require('axios');

/**
 * Mobile OTP bhejne ka raasta. Teen provider support hote hain — sab kuch
 * alag-alag tarike se, isliye provider ka interface ek hi rakha gaya hai:
 *
 *  1. `fast2sms` (default, free) — fast2sms.com ka free account. Free credits
 *     milte hain signup par, aur "Quick SMS" route ke liye DLT ki zaroorat
 *     nahi padti. Key -> https://www.fast2sms.com/dev-api
 *  2. `2factor` (free trial) — 2factor.in. Purana `AUTOTP` endpoint hamare
 *     apne banaye code ko bhejta hai, isliye OTP verify ka pura control
 *     hamare paas hi rehta hai. Key -> 2factor.in dashboard
 *  3. `webhook` — koi bhi doosra provider jo `{ to, message }` POST accept
 *     karta ho. Ye generic raasta hai, koi specific vendor lock-in nahi.
 *
 * Provider set na ho to `false` laut jaata hai aur caller (dev mode me code
 * screen par, production me saaf error) decide karta hai.
 */

class SmsError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'SmsError';
    this.status = 503;
    // Ye error user ko dikhana hai — isliye message khud safe rakha gaya hai
    // (API key ya provider ka raw response kabhi message me nahi jaata).
    this.expose = true;
    this.cause = cause;
  }
}

const providerName = () =>
  String(process.env.SMS_PROVIDER || (process.env.SMS_WEBHOOK_URL ? 'webhook' : ''))
    .trim()
    .toLowerCase();

const apiKey = () => String(process.env.SMS_API_KEY || '').trim();
const webhookUrl = () => String(process.env.SMS_WEBHOOK_URL || '').trim();
const timeout = () => Number(process.env.SMS_TIMEOUT || 10000);

/**
 * Provider `SMS_PROVIDER` se chalta hai. `SMS_WEBHOOK_URL` set hone par
 * `webhook` maan lete hain (purana behaviour), taaki sirf URL daalne wala
 * bhi kaam kar jaaye.
 */
const smsConfigured = () => {
  switch (providerName()) {
    case 'fast2sms':
    case '2factor':
      return Boolean(apiKey());
    case 'webhook':
      return Boolean(webhookUrl());
    default:
      return false;
  }
};

/**
 * Number ko E.164 (bina `+`) form me laata hai. 10 digit ka number Indian
 * maana jaata hai aur uspar `91` lagta hai; `+91...` / `9198...` jaise
 * already country code wale number ko chhoda jaata hai.
 */
const toE164 = (phone) => {
  let digits = String(phone).replace(/\D/g, '');
  // 0987... style leading zero hatao, warna number galat chala jaata hai.
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 10) digits = `91${digits}`;
  return digits;
};

const errorText = (data) => {
  if (!data) return '';
  if (typeof data === 'string') return data;
  const message = data.message ?? data.error ?? data.details;
  if (Array.isArray(message)) return message.join(', ');
  if (message && typeof message === 'object') return JSON.stringify(message);
  return String(message || '');
};

const sendViaFast2sms = async (to, message) => {
  const response = await axios.post(
    'https://www.fast2sms.com/dev/bulkV2',
    {
      // 'q' = Quick SMS (DLT ke bina). DLT template use karna ho to yahan
      // SMS_F2S_ROUTE=dlt aur SMS_F2S_SENDER_ID / SMS_F2S_TEMPLATE set karo.
      route: process.env.SMS_F2S_ROUTE || 'q',
      sender_id: process.env.SMS_F2S_SENDER_ID || undefined,
      numbers: to,
      message
    },
    {
      headers: { Authorization: apiKey(), 'Content-Type': 'application/json' },
      timeout: timeout()
    }
  );

  const data = response.data || {};
  if (data.return === false || Number(data.status_code || 200) >= 400) {
    throw new SmsError(errorText(data) || 'SMS provider rejected the request');
  }
  return { via: 'fast2sms', id: data.request_id };
};

// 2Factor ka `AUTOTP` endpoint hamare hi code ko bhejta hai — provider apna
// alag OTP generate nahi karta, isliye verification hamare store me rehta hai.
const sendVia2factor = async (to, code) => {
  if (!code) throw new SmsError('SMS provider needs the OTP value');

  const url =
    'https://2factor.in/API/V1/' +
    `${encodeURIComponent(apiKey())}/SMS/${encodeURIComponent(to)}/AUTOTP/${encodeURIComponent(code)}`;

  const response = await axios.get(url, { timeout: timeout() });
  const text = response.data;
  const body = typeof text === 'string' ? text : errorText(text);

  // 2factor success par plain "OTP Sent." deta hai, error par "<Status:ERROR>..."
  if (typeof text === 'object' && text && (text.Status === 'ERROR' || text.status === 'ERROR')) {
    throw new SmsError(body || 'SMS provider rejected the request');
  }
  if (typeof text === 'string' && /error|invalid|expired/i.test(text) && !/sent/i.test(text)) {
    throw new SmsError(text.slice(0, 200));
  }
  return { via: '2factor' };
};

const sendViaWebhook = async (to, message, code) => {
  const url = webhookUrl();
  if (!url) throw new SmsError('SMS webhook URL is missing');

  const response = await axios.post(url, { to, message, code }, { timeout: timeout() });
  const body = response.data;
  if (body && body.error) throw new SmsError(String(body.error).slice(0, 200));
  return { via: 'webhook' };
};

/**
 * `code` optional hai — sirf 2Factor ko chahiye. Baaqi providers poora
 * `message` padhte hain, jisme code already shamil hai.
 */
async function sendSms({ to, message, code }) {
  if (!smsConfigured()) return false;

  const number = toE164(to);
  const name = providerName();

  try {
    if (name === 'fast2sms') return await sendViaFast2sms(number, message);
    if (name === '2factor') return await sendVia2factor(number, code);
    return await sendViaWebhook(number, message, code);
  } catch (error) {
    if (error instanceof SmsError) throw error;
    if (error.response) {
      throw new SmsError('SMS provider rejected the request', error);
    }
    if (error.code === 'ECONNABORTED') {
      throw new SmsError('SMS provider timed out. Please try again.', error);
    }
    throw new SmsError('SMS provider is unreachable', error);
  }
}

/** Diagnostics/status endpoint ke liye — config ki haaliyat, secret ke bina. */
const smsStatus = () => {
  const name = providerName();
  if (name === 'fast2sms' || name === '2factor') {
    return apiKey()
      ? { available: true, provider: name }
      : { available: false, provider: name, reason: 'SMS_API_KEY is missing' };
  }
  if (name === 'webhook') {
    return webhookUrl()
      ? { available: true, provider: 'webhook' }
      : { available: false, provider: 'webhook', reason: 'SMS_WEBHOOK_URL is missing' };
  }
  if (!name) return { available: false, reason: 'No SMS provider configured' };
  return { available: false, provider: name, reason: `Unknown SMS provider "${name}"` };
};

module.exports = { sendSms, smsConfigured, smsStatus, toE164, providerName, SmsError };

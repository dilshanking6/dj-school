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
 * Number ko 10 digit Indian form me laata hai. `+91...`, `91...`, `0987...`
 * sab isi shape me aate hain.
 */
const toLocal10 = (phone) => {
  let digits = String(phone).replace(/\D/g, '');
  // 0987... style leading zero hatao, warna number galat chala jaata hai.
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  return digits;
};

/**
 * Number ko E.164 (bina `+`) form me laata hai — `919876543210`. 2Factor aur
 * generic webhook isko samajhte hain. Fast2SMS ko iske bajaye 10 digit chahiye,
 * isliye wo `toLocal10` use karta hai.
 */
const toE164 = (phone) => {
  const local = toLocal10(phone);
  return local.length === 10 ? `91${local}` : local;
};

const errorText = (data) => {
  if (!data) return '';
  if (typeof data === 'string') return data;
  // Provider field ka naam alag alag hota hai: Fast2SMS `message`/`error`,
  // 2Factor `Details` (capital D).
  const message = data.message ?? data.error ?? data.details ?? data.Details;
  if (Array.isArray(message)) return message.join(', ');
  if (message && typeof message === 'object') return JSON.stringify(message);
  return String(message || '');
};

/**
 * Provider ka response success hai ya nahi. 2Factor success par
 * `{"Status":"Success","Details":"OTP Sent."}` deta hai aur error par
 * `{"Status":"Error","Details":"..."}` — yaani `Error`, `ERROR`, `error`,
 * kuch bhi ho sakta hai. Isliye "Success" ko case-insensitive se compare karna
 * zaroori hai, warna asli failure chupke se success ban jati hai.
 */
const isProviderSuccess = (data) => {
  if (!data) return true;
  if (typeof data === 'string') {
    return !/\berrors?\b|\binvalid\b|\bexpired\b|\bnot\s+allowed\b|\bcredits?\b/i.test(data) || /sent/i.test(data);
  }
  if (typeof data !== 'object') return true;

  // Explicit status field ho to wahi source of truth hai.
  const status = data.Status ?? data.status;
  if (status !== undefined && status !== null && String(status).trim() !== '') {
    return String(status).trim().toLowerCase() === 'success';
  }
  // Fast2SMS style: `return: true` ya `status_code` under 400.
  if (data.return !== undefined) return data.return === true;
  const code = Number(data.status_code);
  if (Number.isFinite(code)) return code < 400;
  return true;
};

/**
 * Fast2SMS `/dev/bulkV2`. Do routes hain:
 *  - `q` (Quick SMS, default): DLT ke nahi chahiye, `message` plain text hai.
 *  - `dlt`: TRAI rule ke hisaab se approved template bhejna padta hai. Wahan
 *    `message` template ID hoti hai aur asli code `variables_values` me jaata
 *    hai (pipe se separated). Bina ye samjhe poora message template ID samajh
 *    kar reject ho jayega.
 * Number yahan 10 digit hona chahiye, country code ke saath Fast2SMSe reject
 * ho jaata hai.
 */
const sendViaFast2sms = async (phone, message, code) => {
  const route = (process.env.SMS_F2S_ROUTE || 'q').trim().toLowerCase();
  const payload = { route, numbers: toLocal10(phone) };

  if (route === 'dlt') {
    const template = String(process.env.SMS_F2S_TEMPLATE || '').trim();
    if (!template) throw new SmsError('SMS_F2S_TEMPLATE is missing for the dlt route');
    payload.sender_id = process.env.SMS_F2S_SENDER_ID || '';
    payload.message = template;
    payload.variables_values = String(code || '');
  } else {
    payload.message = message;
  }

  const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', payload, {
    headers: { Authorization: apiKey(), 'Content-Type': 'application/json' },
    timeout: timeout()
  });

  const data = response.data || {};
  if (!isProviderSuccess(data)) {
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

  // Provider ne kya kaha — Render logs me, taaki operator dekh sake ki SMS
  // kyun nahi gaya. Key URL me hai isliye sirf response log hota hai, key nahi.
  const preview = typeof text === 'string' ? text.slice(0, 200) : JSON.stringify(text).slice(0, 200);
  console.log(`[sms:2factor] ${to} -> ${preview}`);

  if (!isProviderSuccess(text)) {
    throw new SmsError(errorText(text) || 'SMS provider rejected the request');
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
 * `code` optional hai — 2Factor aur Fast2SMS ke DLT route ko chahiye. Baaqi
 * providers poora `message` padhte hain, jisme code already shamil hai.
 */
async function sendSms({ to, message, code }) {
  if (!smsConfigured()) return false;

  const name = providerName();

  try {
    // Fast2SMS 10 digit leta hai, isliye use `to` jaise bhi diya gaya waise
    // hi bhejte hain — wo apne aap 91/0 hatata hai. Doosre providers ko
    // country code chahiye.
    if (name === 'fast2sms') return await sendViaFast2sms(to, message, code);
    const number = toE164(to);
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

module.exports = {
  sendSms, smsConfigured, smsStatus, toE164, toLocal10, providerName, SmsError
};

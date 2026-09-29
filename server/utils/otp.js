const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const TTL_MS = Number(process.env.OTP_TTL_MS || 5 * 60 * 1000);
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 30 * 1000;
const SWEEP_INTERVAL_MS = 60 * 1000;

const store = new Map();

const sweep = () => {
  const now = Date.now();
  for (const [phone, record] of store) {
    if (record.expiresAt < now) store.delete(phone);
  }
};

const timer = setInterval(sweep, SWEEP_INTERVAL_MS);
timer.unref();

const normalisePhone = (phone) => String(phone).replace(/[\s-]/g, '');

const normaliseEmail = (email) => String(email).trim().toLowerCase();

const generate = () => String(crypto.randomInt(100000, 1000000));

/**
 * Code 'phone' ya 'email' channel ke liye banaya ja sakta hai. Store key me
 * channel ka prefix hota hai, taaki ek hi phone aur ek hi email par alag
 * code chal sakein aur dono ek doosre ko verify na kar sakein.
 */
const keyFor = (kind, value) => `${kind}:${kind === 'email' ? normaliseEmail(value) : normalisePhone(value)}`;

const create = async (kind, value) => {
  const key = keyFor(kind, value);
  const now = Date.now();
  const existing = store.get(key);

  if (existing && existing.lastSentAt + RESEND_COOLDOWN_MS > now) {
    const wait = Math.ceil((existing.lastSentAt + RESEND_COOLDOWN_MS - now) / 1000);
    const error = new Error(`Please wait ${wait} seconds before requesting another code.`);
    error.status = 429;
    throw error;
  }

  const code = generate();
  store.set(key, {
    hash: await bcrypt.hash(code, 10),
    expiresAt: now + TTL_MS,
    attempts: 0,
    lastSentAt: now
  });

  return code;
};

const verify = async (kind, value, code) => {
  const key = keyFor(kind, value);
  const record = store.get(key);
  const fail = (message, status = 401) => {
    const error = new Error(message);
    error.status = status;
    throw error;
  };

  if (!record) fail('Request a verification code first', 400);
  if (record.expiresAt < Date.now()) {
    store.delete(key);
    fail('Verification code has expired');
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    store.delete(key);
    fail('Too many incorrect attempts. Request a new code.', 429);
  }

  const matches = await bcrypt.compare(String(code ?? ''), record.hash);
  if (!matches) {
    record.attempts += 1;
    if (record.attempts >= MAX_ATTEMPTS) store.delete(key);
    fail('Incorrect verification code');
  }

  store.delete(key);
  return true;
};

module.exports = { create, verify, keyFor, normalisePhone, normaliseEmail };

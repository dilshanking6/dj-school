const { HttpError } = require('./auth');

const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

const text = (value, field, { min = 1, max = 2000, trim = true } = {}) => {
  if (isBlank(value)) throw new HttpError(400, `${field} is required`);
  let out = String(value);
  if (trim) out = out.trim();
  if (out.length < min) throw new HttpError(400, `${field} must be at least ${min} characters`);
  if (out.length > max) throw new HttpError(400, `${field} must be under ${max} characters`);
  return out;
};

const optionalText = (value, field, options = {}) => {
  if (isBlank(value)) return '';
  return text(value, field, options);
};

const email = (value) => {
  const out = text(value, 'Email', { max: 254 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(out)) throw new HttpError(400, 'Enter a valid email address');
  return out;
};

const phone = (value) => {
  const out = text(value, 'Phone number', { max: 20 });
  if (!/^\+?[0-9][0-9\s-]{7,19}$/.test(out)) throw new HttpError(400, 'Enter a valid phone number');
  return out.replace(/[\s-]/g, '');
};

const optionalPhone = (value) => (isBlank(value) ? '' : phone(value));

const password = (value) => {
  const out = String(value ?? '');
  if (out.length < 8) throw new HttpError(400, 'Password must be at least 8 characters');
  if (out.length > 128) throw new HttpError(400, 'Password must be under 128 characters');
  if (!/[a-zA-Z]/.test(out) || !/[0-9]/.test(out)) {
    throw new HttpError(400, 'Password must contain both letters and numbers');
  }
  return out;
};

const oneOf = (value, allowed, field) => {
  const out = String(value ?? '').trim().toLowerCase();
  if (!allowed.includes(out)) throw new HttpError(400, `${field} must be one of: ${allowed.join(', ')}`);
  return out;
};

const optionalOneOf = (value, allowed, field) => (isBlank(value) ? '' : oneOf(value, allowed, field));

const int = (value, field, { min = -Infinity, max = Infinity } = {}) => {
  const num = Number(value);
  if (!Number.isInteger(num)) throw new HttpError(400, `${field} must be a whole number`);
  if (num < min || num > max) throw new HttpError(400, `${field} must be between ${min} and ${max}`);
  return num;
};

const isoDate = (value, field = 'Date') => {
  const out = text(value, field, { max: 40 });
  if (Number.isNaN(Date.parse(out))) throw new HttpError(400, `${field} is not a valid date`);
  return out;
};

const timeString = (value) => {
  if (isBlank(value)) return '';
  const out = String(value).trim();
  if (!/^([01]\d|2[0-3]):[0-5]\d(\s?[AP]M)?$/i.test(out)) {
    throw new HttpError(400, 'Time must look like 09:30 AM');
  }
  return out;
};

const url = (value, field) => {
  if (isBlank(value)) return '';
  const out = text(value, field, { max: 2000 });
  let parsed;
  try {
    parsed = new URL(out);
  } catch {
    throw new HttpError(400, `${field} must be a valid link`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new HttpError(400, `${field} must start with http or https`);
  }
  return out;
};

const dataUrl = (value, field, maxBytes = 20000) => {
  if (isBlank(value)) return '';
  const out = String(value);
  if (!out.startsWith('data:image/')) throw new HttpError(400, `${field} must be an image`);
  if (out.length > maxBytes) throw new HttpError(400, `${field} is too large`);
  return out;
};

const optionalDataUrl = (value, field, maxBytes = 20000) => {
  if (isBlank(value)) return '';
  const out = String(value);
  if (!out.startsWith('data:')) throw new HttpError(400, `${field} must be an uploaded file`);
  if (out.length > maxBytes) throw new HttpError(400, `${field} is too large, share a document link instead`);
  return out;
};

const optionalUrl = (value, field) => (isBlank(value) ? '' : url(value, field));

const array = (value, field, { max = 500, min = 0 } = {}) => {
  if (!Array.isArray(value)) throw new HttpError(400, `${field} must be a list`);
  if (value.length < min) throw new HttpError(400, `${field} must have at least ${min} item(s)`);
  if (value.length > max) throw new HttpError(400, `${field} must have at most ${max} items`);
  return value;
};

module.exports = {
  isBlank, text, optionalText, email, phone, optionalPhone, password,
  oneOf, optionalOneOf, int, isoDate, timeString, url, optionalUrl,
  dataUrl, optionalDataUrl, array
};

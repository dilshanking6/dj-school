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

// Sirf asli Google Mail allow hai — koi bhi free/fake provider nahi
// (example.com, @dj.edu, ya kisi aur domain ka address register nahi hoga).
// Isse portal par sirf wo log account banate hain jinke paas sach me
// inbox control hai, aur email OTP bhi unhi tak pahunch sakta hai.
const ALLOWED_EMAIL_DOMAINS = new Set(
  (process.env.ALLOWED_EMAIL_DOMAINS || 'gmail.com')
    .split(',')
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean)
);

const email = (value) => {
  const out = text(value, 'Email', { max: 254 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(out)) throw new HttpError(400, 'Enter a valid email address');
  const domain = out.split('@')[1];
  if (!ALLOWED_EMAIL_DOMAINS.has(domain)) {
    throw new HttpError(400, `Only ${[...ALLOWED_EMAIL_DOMAINS].join(', ')} email addresses are allowed`);
  }
  return out;
};

const phone = (value) => {
  const raw = text(value, 'Phone number', { max: 20 });
  // Spaces/dashes pehle hata dete hain, warna regex unhe count karke bada
  // number maan leta tha.
  const out = raw.replace(/[\s-]/g, '');
  // `+` ke turant baad 0 kabhi nahi hota — `+0…` matlab number galat hai.
  // (Bina `+` ke 11 digit local number 0 se shuru ho sakta hai — `09876543210`
  // — wo sahi hai aur sms.js me bhi isi ko handle kiya gaya hai.)
  if (/^\+0/.test(out) || !/^\+?[0-9]{9,16}$/.test(out)) {
    throw new HttpError(400, 'Enter a valid phone number');
  }
  return out;
};

const optionalPhone = (value) => (isBlank(value) ? '' : phone(value));

// Kamzor password reject karne wala list. Ye passwords itne common hain ki
// koi serious account inhe use hi nahi karna chahiye.
const WEAK_PASSWORDS = new Set([
  'password', 'password1', 'password123', 'pass123', 'pass1234', '12345678',
  '123456789', '1234567890', 'qwerty123', 'qwertyuiop', 'iloveyou',
  'admin123', 'admin@123', 'administrator', 'welcome123', 'letmein123',
  'abc12345', 'abcd1234', 'student123', 'teacher123', 'school123',
  'default', 'changeme', '123456789a'
]);

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

/**
 * Strong password: kam se kam 8 character, aur teeno chahiye —
 * ek letter, ek number, ek special character. Weak/common password
 * list par bhi reject karta hai taaki account guess karna mushkil ho.
 */
const password = (value) => {
  const out = String(value ?? '');

  if (out.length < PASSWORD_MIN) {
    throw new HttpError(400, `Password must be at least ${PASSWORD_MIN} characters`);
  }
  if (out.length > PASSWORD_MAX) {
    throw new HttpError(400, `Password must be under ${PASSWORD_MAX} characters`);
  }

  const hasLetter = /[a-zA-Z]/.test(out);
  const hasNumber = /[0-9]/.test(out);
  const hasSpecial = /[^a-zA-Z0-9]/.test(out);

  // Ye teenon "shape" checks character-class check se PEHLE chalte hain.
  // Warna wo dono kabhi hit nahi hote: `aaaaaaaa` me koi number/special hai hi
  // nahi (to "repeated" wala rule bekaar), aur `1234567890` me koi letter
  // nahi (to "sequence" wala rule bhi bekaar). Ab har rule apni wajah se
  // message deta hai.
  const lowered = out.toLowerCase();
  if (WEAK_PASSWORDS.has(lowered)) {
    throw new HttpError(400, 'This password is too common. Choose a stronger one.');
  }
  if (/^(.)\1+$/.test(out)) {
    throw new HttpError(400, 'Password must not be the same character repeated.');
  }
  if (/^(0123456789|1234567890|abcdefghij|qwertyuiop)/i.test(lowered)) {
    throw new HttpError(400, 'Password must not be a simple keyboard or number sequence.');
  }

  if (!hasLetter || !hasNumber || !hasSpecial) {
    throw new HttpError(400, 'Password must contain a letter, a number and a special character (for example @, # or _)');
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
  dataUrl, optionalDataUrl, array,
  ALLOWED_EMAIL_DOMAINS, PASSWORD_MIN, PASSWORD_MAX
};

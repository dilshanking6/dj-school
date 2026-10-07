/**
 * Server test suite — Node ka apna built-in runner (koi extra dependency nahi).
 *
 *   npm test
 *
 * Ye jaan boojh kar sirf un modules ke liye hai jinme galti ka nuqsaan sabse
 * zyada hai: input validation, OTP, phone normalisation, sheet row parsing aur
 * date/timezone handling. Ye sab galat hue to users ko chup-chaup galat data
 * dikhta hai ya security kamzor hoti hai.
 */
const test = require('node:test');
const assert = require('node:assert/strict');

const v = require('../middleware/validate');
const otp = require('../utils/otp');
const rows = require('../utils/rows');
const { toLocal10, toE164 } = require('../utils/sms');
const { HttpError } = require('../middleware/auth');

// Helper: ye function HttpError throw kare, warna test fail.
const throwsHttp = (fn, status, messagePart) => {
  assert.throws(fn, (err) => {
    assert.ok(err instanceof HttpError, `HttpError expected, got ${err && err.name}`);
    if (status !== undefined) assert.equal(err.status, status);
    if (messagePart) assert.ok(
      String(err.message).includes(messagePart),
      `message "${err.message}" should contain "${messagePart}"`
    );
    return true;
  });
};

// ---------------------------------------------------------------- email

test('email: normalises case and whitespace', () => {
  assert.equal(v.email('  Student@Gmail.COM '), 'student@gmail.com');
});

test('email: rejects non-allowed domains', () => {
  throwsHttp(() => v.email('someone@yahoo.com'), 400, 'gmail.com');
  throwsHttp(() => v.email('someone@dj.edu'), 400);
});

test('email: rejects malformed input', () => {
  for (const bad of ['', '   ', 'no-at-sign', 'a@b', '@gmail.com', 'a@.com', 'a b@gmail.com']) {
    throwsHttp(() => v.email(bad), 400);
  }
});

test('email: accepts subaddressed gmail', () => {
  assert.equal(v.email('ram.kumar+9@gmail.com'), 'ram.kumar+9@gmail.com');
});

// -------------------------------------------------------------- password

test('password: accepts a strong password', () => {
  assert.equal(v.password('Str0ng@Pass'), 'Str0ng@Pass');
});

test('password: rejects weak and common passwords', () => {
  throwsHttp(() => v.password('short1@'), 400, 'at least 8');
  throwsHttp(() => v.password('password123'), 400, 'too common');
  throwsHttp(() => v.password('teacher123'), 400, 'too common');
  throwsHttp(() => v.password('aaaaaaaa'), 400, 'repeated');
  throwsHttp(() => v.password('1234567890abc@'), 400, 'sequence');
  throwsHttp(() => v.password('NoSpecial123'), 400, 'special character');
  throwsHttp(() => v.password('nodigitshere@'), 400, 'number');
});

test('password: rejects over-long input', () => {
  throwsHttp(() => v.password('a1@' + 'x'.repeat(200)), 400, 'under 128');
});

// ------------------------------------------------------------------ phone

test('phone: strips spaces and dashes', () => {
  assert.equal(v.phone('98765 43210'), '9876543210');
  assert.equal(v.phone('+91 98765-43210'), '+919876543210');
});

test('phone: rejects junk', () => {
  for (const bad of ['', '123', 'abcdefghij', '98765abc10', '+0123456789']) {
    throwsHttp(() => v.phone(bad), 400);
  }
});

test('optionalPhone: blank is allowed, junk is not', () => {
  assert.equal(v.optionalPhone(''), '');
  assert.equal(v.optionalPhone(undefined), '');
  assert.equal(v.optionalPhone('  '), '');
  throwsHttp(() => v.optionalPhone('123'), 400);
});

// -------------------------------------------------------------------- url

test('url: only http/https allowed', () => {
  assert.equal(v.url('https://drive.google.com/x'), 'https://drive.google.com/x');
  assert.equal(v.url(''), '');
  throwsHttp(() => v.url('javascript:alert(1)'), 400, 'http or https');
  throwsHttp(() => v.url('ftp://example.com'), 400);
  throwsHttp(() => v.url('not a url'), 400, 'valid link');
});

// ----------------------------------------------------------------- oneOf

test('oneOf: lowercases and validates against the allow-list', () => {
  assert.equal(v.oneOf('Admin', ['admin', 'teacher'], 'Role'), 'admin');
  throwsHttp(() => v.oneOf('superuser', ['admin'], 'Role'), 400, 'must be one of');
  assert.equal(v.optionalOneOf('', ['admin'], 'Role'), '');
});

// ------------------------------------------------------------------- int

test('int: enforces whole numbers and bounds', () => {
  assert.equal(v.int('42', 'Marks', { min: 0, max: 100 }), 42);
  throwsHttp(() => v.int(3.5, 'Marks'), 400, 'whole number');
  throwsHttp(() => v.int(101, 'Marks', { min: 0, max: 100 }), 400, 'between');
  throwsHttp(() => v.int('abc', 'Marks'), 400);
});

// -------------------------------------------------------------- time/date

test('timeString: accepts 12-hour format only', () => {
  assert.equal(v.timeString('09:30 AM'), '09:30 AM');
  assert.equal(v.timeString('23:59'), '23:59');
  assert.equal(v.timeString(''), '');
  throwsHttp(() => v.timeString('25:00'), 400);
  throwsHttp(() => v.timeString('9am'), 400);
});

test('isoDate: rejects unparseable dates', () => {
  assert.ok(v.isoDate('2026-03-14'));
  throwsHttp(() => v.isoDate('not-a-date'), 400, 'not a valid date');
});

// ------------------------------------------------------------ data urls

test('optionalDataUrl: only data: payloads and under the size cap', () => {
  assert.equal(v.optionalDataUrl('data:image/png;base64,AAA'), 'data:image/png;base64,AAA');
  assert.equal(v.optionalDataUrl('', 'Avatar'), '');
  throwsHttp(() => v.optionalDataUrl('https://evil.test/x.png', 'Avatar'), 400);
  throwsHttp(() => v.optionalDataUrl('data:' + 'x'.repeat(100), 'Avatar', 50), 400, 'too large');
});

// -------------------------------------------------------------------- otp

test('otp: a generated code is exactly 6 digits and verifies once', async () => {
  const value = `98${Date.now()}`;
  const code = await otp.create('phone', value);
  assert.match(code, /^\d{6}$/);
  assert.equal(await otp.verify('phone', value, code), true);
  // Single use — same code dobara chal nahi hona chahiye.
  await assert.rejects(() => otp.verify('phone', value, code), /Request a verification code first/);
});

test('otp: wrong code is rejected', async () => {
  const value = `97${Date.now()}`;
  const code = await otp.create('phone', value);
  const wrong = code === '000000' ? '111111' : '000000';
  await assert.rejects(() => otp.verify('phone', value, wrong), /Incorrect verification code/);
});

test('otp: channels are isolated — email code does not verify a phone', async () => {
  const email = `otp${Date.now()}@gmail.com`;
  const phone = `96${Date.now()}`;
  const emailCode = await otp.create('email', email);
  await assert.rejects(
    () => otp.verify('phone', phone, emailCode),
    /Request a verification code first/
  );
  // Sahi channel me wahi code kaam karta hai.
  assert.equal(await otp.verify('email', email, emailCode), true);
});

test('otp: resend is rate limited with 429', async () => {
  const value = `95${Date.now()}`;
  await otp.create('phone', value);
  await assert.rejects(
    () => otp.create('phone', value),
    (err) => err.status === 429
  );
});

test('otp: attempt limit locks the code out', async () => {
  const value = `94${Date.now()}`;
  await otp.create('phone', value);
  for (let i = 0; i < 5; i += 1) {
    await assert.rejects(() => otp.verify('phone', value, '000000'));
  }
  // Attempts khatam hone par record delete ho gaya, ab 400 aata hai.
  await assert.rejects(
    () => otp.verify('phone', value, '000000'),
    /Request a verification code first/
  );
});

test('otp: keys are normalised so formatting cannot be used to bypass', () => {
  assert.equal(otp.keyFor('phone', '98765 43210'), otp.keyFor('phone', '9876543210'));
  assert.equal(otp.keyFor('email', ' A@Gmail.com '), otp.keyFor('email', 'a@gmail.com'));
});

// ------------------------------------------------------------ phone utils

test('toLocal10: strips country code and leading zero', () => {
  assert.equal(toLocal10('9876543210'), '9876543210');
  assert.equal(toLocal10('09876543210'), '9876543210');
  assert.equal(toLocal10('919876543210'), '9876543210');
  assert.equal(toLocal10('91 98765 43210'), '9876543210');
});

test('toE164: prefixes 91 for a 10 digit number', () => {
  assert.equal(toE164('9876543210'), '919876543210');
  assert.equal(toE164('+919876543210'), '919876543210');
});

// ------------------------------------------------------------------- rows

test('stripHeader: drops the first row and survives bad input', () => {
  assert.deepEqual(rows.stripHeader([['a', 'b'], ['c', 'd']]), [['c', 'd']]);
  assert.deepEqual(rows.stripHeader('nope'), []);
  assert.deepEqual(rows.stripHeader(null), []);
});

test('userRows: strips a header row but keeps real data', () => {
  const withHeader = [['Name', 'Email'], ['Ram', 'ram@gmail.com']];
  assert.deepEqual(rows.userRows(withHeader), [['Ram', 'ram@gmail.com']]);

  // Bina header ke (purana sheet format) — data nahi girega.
  const noHeader = [['Ram', 'ram@gmail.com'], ['Sita', 'sita@gmail.com']];
  assert.deepEqual(rows.userRows(noHeader), noHeader);
});

test('readRows: picks the right strategy per sheet', () => {
  const raw = [['Name', 'Email'], ['Ram', 'ram@gmail.com']];
  assert.deepEqual(rows.readRows('Users', raw), [['Ram', 'ram@gmail.com']]);
  assert.deepEqual(rows.readRows('Attendance', raw), [['Ram', 'ram@gmail.com']]);
});

test('djDate: keeps a plain date and formats a Date object in IST', () => {
  assert.equal(rows.djDate('2026-03-14'), '2026-03-14');
  assert.equal(rows.djDate(''), '');
  assert.equal(rows.djDate(null), '');
  // 2026-03-14T18:30:00Z = 15 Mar 00:00 IST, to agle din nahi jaana chahiye.
  assert.equal(rows.djDate(new Date('2026-03-14T18:30:00Z')), '2026-03-15');
});

test('toNumber / parseIntSafe: never return NaN', () => {
  assert.equal(rows.toNumber('12.5'), 12.5);
  assert.equal(rows.toNumber('abc'), 0);
  assert.equal(rows.parseIntSafe('12abc'), 12);
  assert.equal(rows.parseIntSafe('abc'), 0);
});

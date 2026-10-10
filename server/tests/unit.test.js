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
const { rateLimit } = require('../middleware/rateLimit');

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

// emailFormat = login/office path. Yahan domain ki rok nahi honi chahiye,
// warna office ka banaya student (jiska email server khud
// `student-...@dj.edu` banata hai) kabhi login hi nahi kar paata.
test('emailFormat: accepts the school-generated domain that login must allow', () => {
  assert.equal(v.emailFormat('  Student-12-ABC@DJ.edu '), 'student-12-abc@dj.edu');
  assert.equal(v.emailFormat('someone@yahoo.com'), 'someone@yahoo.com');
});

test('emailFormat: still rejects malformed input', () => {
  for (const bad of ['', '   ', 'no-at-sign', 'a@b', '@gmail.com', 'a@.com', 'a b@gmail.com']) {
    throwsHttp(() => v.emailFormat(bad), 400);
  }
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

// ---------------------------------------------------------------------------
//  Mail transport selection (server/utils/mailer.js)
//
//  Ye isliye important hai ki `mailStatus().available` wahi batata hai jo UI
//  ko dikhta hai. Render FREE plan par SMTP ports 25/465/587 blocked hain —
//  wahan `MAIL_TRANSPORT=smtp` galat hai aur `available: true` jhooth hoga
//  (user email option chunega aur 503 aayega).
// ---------------------------------------------------------------------------

const MAIL_KEYS = [
  'MAIL_TRANSPORT', 'APPS_SCRIPT_MAIL_URL', 'APPS_SCRIPT_MAIL_TOKEN',
  'APPS_SCRIPT_URL', 'APPS_SCRIPT_MAIL', 'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS', 'SMTP_PORT'
];

const freshMailer = (env) => {
  for (const k of MAIL_KEYS) delete process.env[k];
  Object.assign(process.env, env);
  delete require.cache[require.resolve('../utils/mailer.js')];
  const mailer = require('../utils/mailer.js');
  // Ek function lautate hain taaki `const m = done()` sab tests me chale.
  // Is function ka kaam sirf mailer dena hai — env ko ye SAAF nahi karta,
  // warna transportOrder() call ke waqt env khali milta aur sab fail hota.
  // Cleanup agla freshMailer khud karta hai.
  return () => mailer;
};

test('mailer: Render free (MAIL_TRANSPORT=apps-script) sirf apps-script use karta hai', () => {
  const done = freshMailer({
    MAIL_TRANSPORT: 'apps-script',
    APPS_SCRIPT_MAIL_URL: 'https://script.google.com/macros/s/x/exec',
    APPS_SCRIPT_MAIL_TOKEN: 'tok',
    // SMTP creds set hain par free plan par ye bekaar hain — transport order
    // me kabhi aane nahi chahiye, warna har mail 11 second timeout lega.
    SMTP_HOST: 'smtp.gmail.com', SMTP_USER: 'a@b.com', SMTP_PASS: 'x'
  });
  const m = done();
  assert.deepEqual(m.transportOrder(), ['apps-script']);
  const s = m.mailStatus();
  assert.equal(s.available, true);
  assert.equal(s.provider, 'apps-script');
});

test('mailer: apps-script transport par URL missing ho to available=false (jhooth nahi)', () => {
  const done = freshMailer({ MAIL_TRANSPORT: 'apps-script' });
  const m = done();
  assert.deepEqual(m.transportOrder(), []);
  const s = m.mailStatus();
  assert.equal(s.available, false);
  assert.match(s.reason, /APPS_SCRIPT_MAIL_URL/);
});

test('mailer: forced smtp me creds ho to provider smtp, par probe tak jhooth nahi bolta', () => {
  const done = freshMailer({
    MAIL_TRANSPORT: 'smtp',
    SMTP_HOST: 'smtp.gmail.com', SMTP_USER: 'a@b.com', SMTP_PASS: 'x'
  });
  const m = done();
  assert.deepEqual(m.transportOrder(), ['smtp']);
  const s = m.mailStatus();
  assert.equal(s.provider, 'smtp');
  // Probe abhi nahi chala — aise me `available: true` ka matlab hoga ki
  // connection ban jaayegi, jo abhi tak kisi ne check nahi ki. Isliye false.
  assert.equal(s.available, false);
  assert.match(s.reason, /still running/);
});

test('mailer: forced smtp par creds missing ho to available=false', () => {
  const done = freshMailer({ MAIL_TRANSPORT: 'smtp' });
  const m = done();
  assert.deepEqual(m.transportOrder(), []);
  assert.equal(m.mailStatus().available, false);
});

test('mailer: auto me apps-script pehle aata hai, phir smtp (fallback)', () => {
  const done = freshMailer({
    APPS_SCRIPT_MAIL_URL: 'https://script.google.com/macros/s/x/exec',
    APPS_SCRIPT_MAIL_TOKEN: 'tok',
    SMTP_HOST: 'smtp.gmail.com', SMTP_USER: 'a@b.com', SMTP_PASS: 'x'
  });
  const m = done();
  assert.deepEqual(m.transportOrder(), ['apps-script', 'smtp']);
  assert.equal(m.mailStatus().provider, 'apps-script');
});

test('mailer: auto me purana behaviour — sirf SMTP creds ho to smtp hi', () => {
  const done = freshMailer({ SMTP_HOST: 'smtp.gmail.com', SMTP_USER: 'a@b.com', SMTP_PASS: 'x' });
  const m = done();
  assert.deepEqual(m.transportOrder(), ['smtp']);
  assert.equal(m.mailStatus().provider, 'smtp');
});

test('mailer: auto + purana APPS_SCRIPT_MAIL=true bhi chalta hai (back-compat)', () => {
  const done = freshMailer({
    APPS_SCRIPT_URL: 'https://script.google.com/macros/s/sheet/exec',
    APPS_SCRIPT_MAIL: 'true'
  });
  const m = done();
  assert.deepEqual(m.transportOrder(), ['apps-script']);
});

test('mailer: kuch bhi set na ho to available=false', () => {
  const done = freshMailer({});
  const m = done();
  assert.deepEqual(m.transportOrder(), []);
  assert.equal(m.mailConfigured(), false);
  assert.equal(m.mailStatus().available, false);
});

// ---------------------------------------------------------------------------
//  SMTP reachability probe — "creds bhar gaye" aur "connection ban jaayegi"
//  ek hi baat nahi hai. Render FREE plan outbound SMTP ports 25/465/587 block
//  karta hai, isliye wahan creds perfect hote hue bhi mail 10 second timeout
//  par marta tha aur status `available: true` bolta tha. Probe server ko
//  boot par hi bata deta hai ki port asli me khula hai ya nahi.
// ---------------------------------------------------------------------------

const net = require('net');

const listen = (server) => new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const close = (server) => new Promise((resolve) => server.close(resolve));

test('probe: port khula ho to available=true aur smtp fallback chalu rehta hai', async () => {
  const server = net.createServer(() => {});
  await listen(server);
  try {
    const done = freshMailer({
      MAIL_TRANSPORT: 'smtp',
      SMTP_HOST: '127.0.0.1',
      SMTP_PORT: String(server.address().port),
      SMTP_USER: 'a@b.com',
      SMTP_PASS: 'x'
    });
    const m = done();
    const probe = await m.probeSmtp();
    assert.equal(probe.reachable, true);
    assert.equal(m.mailStatus().available, true);
    assert.deepEqual(m.transportOrder(), ['smtp']);
  } finally {
    await close(server);
  }
});

test('probe: band port ho to available=false, order khali, aur send turant fail', async () => {
  // Pehle port lenge aur phir chhod denge, taaki wo khaali ho jaaye —
  // isi par ECONNREFUSED aata hai (jaise firewall drop karta hai).
  const server = net.createServer(() => {});
  await listen(server);
  const port = server.address().port;
  await close(server);

  const done = freshMailer({
    MAIL_TRANSPORT: 'smtp',
    SMTP_HOST: '127.0.0.1',
    SMTP_PORT: String(port),
    SMTP_USER: 'a@b.com',
    SMTP_PASS: 'x'
  });
  const m = done();

  const probe = await m.probeSmtp();
  assert.equal(probe.checked, true);
  assert.equal(probe.reachable, false);

  const status = m.mailStatus();
  assert.equal(status.available, false);
  assert.match(status.reason, /unreachable/i);

  // Fallback hat jaata hai — 10 second timeout ab kabhi na honge.
  assert.deepEqual(m.transportOrder(), []);

  await assert.rejects(
    m.sendMail({ to: 'a@b.com', subject: 'x', text: 'y' }),
    /SMTP port unreachable/
  );
});

test('probe: creds missing ho to bina network ke hi checked ho jaata hai', async () => {
  const done = freshMailer({});
  const m = done();
  const probe = await m.probeSmtp();
  assert.equal(probe.checked, true);
  assert.equal(probe.reachable, false);
  assert.match(probe.reason, /creds missing/);
  assert.equal(m.mailStatus().available, false);
});


// ------------------------------------------------------------------ forms
//
// Principal ka form builder — inhi pure functions par poora feature tikta
// hai: kya HTML safe hai, kaise field banate hain, aur student ko kaunsa
// form dikhta hai. Yahan bug matlab student ko adhura form dikhta hai ya
// principal ka HTML script chala jaata hai.

const forms = require('../controllers/formController');
const { uploadFile, fileStoreStatus, mimeFor, MAX_FILE_MB } = require('../utils/fileStore');

test('form sanitizeHtml: script aur onclick hata deta hai, text nahi', () => {
  const dirty = '<p>Namaste</p><script>alert(1)</script><img src=x onerror="alert(2)">'
    + '<a href="javascript:alert(3)">click</a>';
  const clean = forms.sanitizeHtml(dirty);

  assert.ok(clean.includes('<p>Namaste</p>'), 'legit text rehna chahiye');
  assert.ok(!/script/i.test(clean), '<script> tag hatna chahiye');
  assert.ok(!/onerror/i.test(clean), 'onerror handler hatna chahiye');
  assert.ok(!/javascript:/i.test(clean), 'javascript: URI hatna chahiye');
});

test('form sanitizeHtml: unclosed script tag aur iframe bhi hatate hain', () => {
  // Band `</script>` wala case.
  const closed = forms.sanitizeHtml('ok<iframe src="https://evil"></iframe><script>while(1){}</script>done');
  assert.ok(!/iframe/i.test(closed));
  assert.ok(!/while\(1\)/.test(closed));
  assert.equal(closed.startsWith('ok'), true);

  // Unclosed `<script>` — uske baad ka pura text bhi hatna chahiye,
  // warna script ka body HTML me reh jaata.
  const unclosed = forms.sanitizeHtml('<p>hi</p><script>while(1){}');
  assert.equal(unclosed, '<p>hi</p>');

  // Ekla tag (koi body hi nahi) bhi hat jaata hai.
  assert.equal(forms.sanitizeHtml('<script src="http://x/y.js">'), '');
});

test('form normaliseFields: key khud ban jaata hai aur duplicate rok deta hai', () => {
  const fields = forms.normaliseFields([
    { label: 'Roll Number', type: 'text', required: true },
    { label: 'Class', type: 'select', options: ['9', '10'] }
  ]);

  assert.equal(fields.length, 2);
  assert.equal(fields[0].key, 'f1');
  assert.equal(fields[0].required, true);
  assert.deepEqual(fields[1].options, ['9', '10']);

  // Do field ka key same ho to answer collision ho jaata — isliye reject.
  throwsHttp(() => forms.normaliseFields([
    { label: 'A', type: 'text', key: 'same' },
    { label: 'B', type: 'text', key: 'same' }
  ]), 400, 'Duplicate');
});

test('form normaliseFields: galat type, khali list, select bina option ke — sab 400', () => {
  throwsHttp(() => forms.normaliseFields([]), 400, 'at least 1');
  throwsHttp(() => forms.normaliseFields([{ label: 'A', type: 'rich' }]), 400, 'type');
  throwsHttp(() => forms.normaliseFields([{ label: 'A', type: 'select', options: [] }]), 400, 'at least 1');
  throwsHttp(() => forms.normaliseFields([{ type: 'text' }]), 400, 'label');
});

test('form validateAnswers: required khali ho to 400', () => {
  const fields = forms.normaliseFields([
    { label: 'Name', type: 'text', required: true },
    { label: 'Note', type: 'text' }
  ]);

  throwsHttp(() => forms.validateAnswers(fields, { f1: '   ' }), 400, 'Name');
  assert.deepEqual(forms.validateAnswers(fields, { f1: 'Ram' }), { f1: 'Ram', f2: '' });
});

test('form validateAnswers: number, date, select ka type check hota hai', () => {
  const fields = forms.normaliseFields([
    { label: 'Marks', type: 'number', required: true },
    { label: 'Dob', type: 'date', required: true },
    { label: 'Section', type: 'select', required: true, options: ['A', 'B'] }
  ]);

  throwsHttp(() => forms.validateAnswers(fields, { f1: 'abc', f2: '2020-01-01', f3: 'A' }), 400, 'number');
  throwsHttp(() => forms.validateAnswers(fields, { f1: '10', f2: '01/01/2020', f3: 'A' }), 400, 'date');
  throwsHttp(() => forms.validateAnswers(fields, { f1: '10', f2: '2020-01-01', f3: 'Z' }), 400, 'Section');

  const ok = forms.validateAnswers(fields, { f1: '10', f2: '2020-01-01', f3: 'B' });
  assert.deepEqual(ok, { f1: '10', f2: '2020-01-01', f3: 'B' });
});

test('form validateAnswers: student ke extra keys ignore ho jaati hain', () => {
  const fields = forms.normaliseFields([{ label: 'Answer', type: 'text' }]);
  assert.deepEqual(
    forms.validateAnswers(fields, { f1: 'haan', admin: 'true', status: 'accepted' }),
    { f1: 'haan' }
  );
});

test('form visibleToStudent: draft/closed kabhi nahi dikhta, open+audience dikhta hai', () => {
  const student = { id: 'S1', class: '10' };
  const other = { id: 'S2', class: '11' };
  const base = { audience: 'All', status: 'open' };

  assert.equal(forms.visibleToStudent({ ...base, status: 'draft' }, student), false);
  assert.equal(forms.visibleToStudent({ ...base, status: 'closed' }, student), false);
  assert.equal(forms.visibleToStudent(base, student), true);

  // Class-specific form sirf usi class ko.
  assert.equal(forms.visibleToStudent({ ...base, audience: '10' }, student), true);
  assert.equal(forms.visibleToStudent({ ...base, audience: '10' }, other), false);
  // Class 9 ke student (jinka class field ho) par bhi kaam karta hai.
  assert.equal(forms.visibleToStudent({ ...base, audience: '9' }, { class: '9' }), true);
});

// ------------------------------------------------------------------ files

test('file store: bina setup ke available=false aur upload seedha 503', async () => {
  const status = fileStoreStatus();
  assert.equal(status.available, false);
  assert.equal(status.maxMB, MAX_FILE_MB);
  assert.equal(status.transport, 'none');

  await assert.rejects(
    uploadFile({ name: 'report.pdf', data: Buffer.from('x') }),
    (err) => err instanceof HttpError && err.status === 503 && /APPS_SCRIPT_FILE_URL/.test(err.message)
  );
});

test('file store: mime type extension se pehchana jaata hai', () => {
  assert.equal(mimeFor('a.pdf'), 'application/pdf');
  assert.equal(mimeFor('photo.JPEG'), 'image/jpeg');
  assert.equal(mimeFor('clip.mp4'), 'video/mp4');
  // HTML/SVG kabhi nahi — agar link kisi page me embed hua to script chal sakta.
  assert.equal(mimeFor('evil.html'), null);
  assert.equal(mimeFor('pic.svg'), null);
  assert.equal(mimeFor('unknown', 'text/html'), null);
  assert.equal(mimeFor('ok.txt', ''), 'text/plain');
});

// ----------------------------------------------------------- rate limiting

const fakeReq = () => ({
  method: 'POST', baseUrl: '/api/auth', path: '/login',
  headers: {}, ip: '203.0.113.9', socket: {}
});

const runLimiter = (limiter) => {
  let status = null;
  limiter(fakeReq(), { set() {} }, (err) => {
    if (err) status = err.status;
  });
  return status;
};

test('rateLimit: ek hi route ke do limiter apna bucket share nahi karte', () => {
  const outer = rateLimit({ windowMs: 60000, max: 3 });
  const inner = rateLimit({ windowMs: 60000, max: 3 });

  // Dono ke apne-apne 3 attempts. Pehle inme se koi bhi ek doosre ka count
  // nahi badhata — warna live login par limit aadhi reh jaati thi.
  assert.equal(runLimiter(outer), null);
  assert.equal(runLimiter(inner), null);
  assert.equal(runLimiter(outer), null);
  assert.equal(runLimiter(inner), null);
  assert.equal(runLimiter(outer), null);
  assert.equal(runLimiter(inner), null);

  assert.equal(runLimiter(outer), 429);
  assert.equal(runLimiter(inner), 429);
});

test('rateLimit: ek limiter apne max ke baad rok deta hai', () => {
  const limiter = rateLimit({ windowMs: 60000, max: 2 });
  assert.equal(runLimiter(limiter), null);
  assert.equal(runLimiter(limiter), null);
  assert.equal(runLimiter(limiter), 429);
});

// ------------------------------------------------------------------ files

test('file store: setup ke saath bhi galat file 413/415/400 me ruk jaati hai', async () => {
  const hadUrl = process.env.APPS_SCRIPT_FILE_URL;
  const hadToken = process.env.APPS_SCRIPT_FILE_TOKEN;
  process.env.APPS_SCRIPT_FILE_URL = 'https://example.invalid/exec';
  process.env.APPS_SCRIPT_FILE_TOKEN = 'test-token';

  try {
    await assert.rejects(uploadFile({ name: 'a.pdf', data: Buffer.alloc(0) }), (err) => err.status === 400);
    await assert.rejects(uploadFile({ name: 'evil.html', data: Buffer.from('<h1>x</h1>') }), (err) => err.status === 415);
    await assert.rejects(
      uploadFile({ name: 'big.mp4', data: Buffer.alloc(MAX_FILE_MB * 1024 * 1024 + 1) }),
      (err) => err.status === 413 && /too large/i.test(err.message)
    );
  } finally {
    if (hadUrl === undefined) delete process.env.APPS_SCRIPT_FILE_URL; else process.env.APPS_SCRIPT_FILE_URL = hadUrl;
    if (hadToken === undefined) delete process.env.APPS_SCRIPT_FILE_TOKEN; else process.env.APPS_SCRIPT_FILE_TOKEN = hadToken;
  }
});

// --------------------------------------------------------- academic session

const session = require('../utils/session');

test('session: saal 1 April se badalta hai (IST)', () => {
  // 31 Mar ab bhi purana saal, 1 Apr se naya.
  assert.equal(session.currentSession(new Date('2026-03-31T12:00:00+05:30')), '2025-26');
  assert.equal(session.currentSession(new Date('2026-04-01T12:00:00+05:30')), '2026-27');
  assert.equal(session.currentSession(new Date('2026-12-31T12:00:00+05:30')), '2026-27');
  assert.equal(session.currentSession(new Date('2027-01-15T12:00:00+05:30')), '2026-27');
});

test('session: label do digit ke saath aur nextSession ek saal aage', () => {
  assert.equal(session.nextSession('2026-27'), '2027-28');
  assert.equal(session.nextSession('2029-30'), '2030-31');
  // Invalid par aaj ka session (crash nahi).
  assert.equal(session.isValidSession('2026-27'), true);
  assert.equal(session.isValidSession('2026'), false);
  assert.equal(session.isValidSession('abc-de'), false);
  assert.equal(session.sessionStartDate('2026-27'), '2026-04-01');
});

test('session: promoteClass sirf enrolled classes ko aage bhejta hai', () => {
  assert.equal(session.promoteClass('9'), '10');
  assert.equal(session.promoteClass('10'), '11');
  assert.equal(session.promoteClass('11'), '12');
  // 12 ka koi aage nahi (pass out), N/A/unknown bhi nahi.
  assert.equal(session.promoteClass('12'), null);
  assert.equal(session.promoteClass('N/A'), null);
  assert.equal(session.promoteClass(''), null);
});

test('session: baseSession sabse zyada milne wala session chunta hai', () => {
  assert.equal(session.baseSession(['2025-26', '2025-26', '2024-25'], '2025-26'), '2025-26');
  // Sab khali/invalid ho to fallback.
  assert.equal(session.baseSession([], '2026-27'), '2026-27');
  assert.equal(session.baseSession(['', 'nope'], '2026-27'), '2026-27');
});

// ----------------------------------------------------- attendance analytics

const { summariseAttendance, genderSplit, percent } = require('../utils/analytics');

test('analytics: percent kabhi 0-par bhram nahi deta', () => {
  assert.equal(percent(0, 0), null);
  assert.equal(percent(3, 4), 75);
  assert.equal(percent(2, 3), 67);
});

test('analytics: genderSplit total aur boys/girls gin leta hai', () => {
  const split = genderSplit([
    { class: '9', gender: 'male' },
    { class: '9', gender: 'female' },
    { class: '9', gender: 'male' },
    { class: '10', gender: 'female' }
  ]);
  assert.deepEqual(split['9'], { total: 3, boys: 2, girls: 1 });
  assert.deepEqual(split['10'], { total: 1, boys: 0, girls: 1 });
});

test('analytics: per-student percentage aur range filter sahi', () => {
  const attendance = [
    ['Date', 'Class', 'StudentId', 'Name', 'Status', 'By', 'Id'],
    ['2026-04-10', '9', 'S1', 'A', 'present', 'T1', 'r1'],
    ['2026-04-11', '9', 'S1', 'A', 'absent', 'T1', 'r2'],
    ['2026-04-12', '9', 'S1', 'A', 'present', 'T1', 'r3'],
    ['2026-04-10', '9', 'S2', 'B', 'absent', 'T1', 'r4'],
    ['2026-04-11', '10', 'S3', 'C', 'present', 'T1', 'r5']
  ];
  const students = [
    { id: 'S1', name: 'A', class: '9', gender: 'male', section: 'A' },
    { id: 'S2', name: 'B', class: '9', gender: 'female', section: 'A' },
    { id: 'S3', name: 'C', class: '10', gender: 'male', section: 'A' },
    { id: 'S4', name: 'D', class: '9', gender: 'male', section: 'A' }
  ];

  const report = summariseAttendance(attendance, students, {});
  assert.equal(report.students.length, 4);
  const s1 = report.students.find((s) => s.id === 'S1');
  assert.equal(s1.marked, 3);
  assert.equal(s1.percent, 67);
  const s4 = report.students.find((s) => s.id === 'S4');
  assert.equal(s4.marked, 0);
  assert.equal(s4.percent, null);
  assert.equal(report.summary.students, 4);
  assert.equal(report.summary.withAttendance, 3);
  assert.equal(report.summary.lowAttendance, 2); // S1=67%, S2=0% (dono < 75)

  // Class filter
  const only9 = summariseAttendance(attendance, students, { className: '9' });
  assert.equal(only9.students.length, 3);
  assert.ok(only9.students.every((s) => s.className === '9'));

  // Date range filter — sirf 11 Apr.
  const ranged = summariseAttendance(attendance, students, { from: '2026-04-11', to: '2026-04-11' });
  assert.equal(ranged.students.find((s) => s.id === 'S1').marked, 1);
  assert.equal(ranged.students.find((s) => s.id === 'S1').percent, 0);
  assert.equal(ranged.summary.totalMarked, 2);
});

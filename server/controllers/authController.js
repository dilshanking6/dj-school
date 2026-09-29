const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { getSheetData, appendSheetData, updateSheetData, deleteSheetData } = require('../utils/googleSheets');
const { sendMail, mailConfigured, mailStatus } = require('../utils/mailer');
const { sendSms, smsConfigured, smsStatus } = require('../utils/sms');
const { HttpError, signToken, ROLES } = require('../middleware/auth');
const v = require('../middleware/validate');
const otp = require('../utils/otp');

const { userRows } = require('../utils/rows');

const SELF_REGISTERABLE_ROLES = ['student', 'teacher'];

const parseJson = (value, fallback = {}) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const toUser = (row) => {
  if (!row || row.length < 7) return {};
  const detail = parseJson(row[5], {});
  return {
    id: String(row[6] || '').trim(),
    name: row[0] || '',
    firstName: row[12] || String(row[0] || '').split(' ')[0],
    lastName: row[13] || String(row[0] || '').split(' ')[1] || '',
    email: row[1] || '',
    role: String(row[3] || '').toLowerCase().trim(),
    class: String(row[4] || '').trim(),
    section: row[14] || 'A',
    motherName: row[15] || '',
    fatherName: row[16] || '',
    avatar: row[7] || null,
    phone: row[8],
    subject: row[9] && row[9] !== 'N/A' ? row[9] : '',
    degree: row[10] && row[10] !== 'N/A' ? row[10] : '',
    experience: row[11] || '0',
    status: detail.status || 'active',
    gender: detail.gender || ''
  };
};

const publicUser = (user) => {
  const { status, ...rest } = user;
  return { ...rest, status };
};

const findUserById = async (id) => {
  const rows = userRows(await getSheetData('Users'));
  const row = rows.find((item) => String(item[6] || '').trim() === String(id).trim());
  return row ? { row, user: toUser(row) } : null;
};

const findUserByEmail = async (email) => {
  const rows = userRows(await getSheetData('Users'));
  const row = rows.find((item) => String(item[1] || '').trim().toLowerCase() === String(email).trim().toLowerCase());
  return row ? { row, user: toUser(row) } : null;
};

const findUserByPhone = async (phone) => {
  const rows = userRows(await getSheetData('Users'));
  const row = rows.find((item) => String(item[8] || '').trim() === String(phone).trim());
  return row ? { row, user: toUser(row) } : null;
};

// Naam aur parents ke naam se 'ek hi student ek account' rule.
// Same naam + same father/mother name = wahi student.
const norm = (value) => String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();

const findStudentDuplicate = async ({ name, fatherName = '', motherName = '', ignoreId = null }) => {
  const rows = userRows(await getSheetData('Users'));
  return rows
    .filter((row) => String(row[3] || '').trim().toLowerCase() === 'student')
    .map(toUser)
    .filter((u) => {
      if (ignoreId && String(u.id) === String(ignoreId)) return false;
      if (norm(u.name) !== norm(name) || !u.name) return false;
      const fancyFather = norm(fatherName);
      const fancyMother = norm(motherName);
      const gotFather = norm(u.fatherName);
      const gotMother = norm(u.motherName);
      if (fancyFather && gotFather && fancyFather === gotFather) return true;
      if (fancyMother && gotMother && fancyMother === gotMother) return true;
      return false;
    });
};

/**
 * OTP bhejne ke do channel hain — email aur mobile. Dono ka ek hi code
 * pattern hai, sirf delivery alag hai. Code `dev` me response me wapas
 * aa jaata hai (screen par dikhta hai), production me sirf tab jab
 * ALLOW_DEV_EMAIL_CODE set ho. Ye rule `otp.codeExposed()` me ek jagah hai.
 */
const codeExposed = otp.codeExposed;

const devCode = (code) => (codeExposed() ? { devCode: code } : {});

const OTP_EXPIRY_SECONDS = 300;

const otpMessage = (code) =>
  `${code} is your Digital Janta verification code. It expires in 5 minutes.`;

const otpSubject = 'Your Digital Janta verification code';

const otpHtml = (code) =>
  `<p style="font-family:Arial,sans-serif;font-size:16px">` +
  `Your Digital Janta verification code is ` +
  `<strong style="font-size:24px;letter-spacing:3px">${code}</strong></p>` +
  `<p style="font-family:Arial,sans-serif;font-size:14px;color:#666">` +
  `It expires in 5 minutes. If you did not request this code you can ignore this email.</p>`;

/**
 * Email OTP bhejta hai. Teen hisse se ek ho sakta hai:
 *  - mail configured + delivery successful -> code inbox me
 *  - dev mode (code screen par dikhaya jata hai) -> code log + response me
 *  - production me koi bhi provider nahi/fail -> saaf error, jisme wajah
 *    likhi hoti hai (warna user ko sirf "kuch gadbad ho gayi" milta tha)
 */
const deliverEmailCode = async (email, code) => {
  if (!mailConfigured()) {
    if (!codeExposed()) {
      throw new HttpError(503, mailStatus().reason + '. Verify with your mobile number instead.', { expose: true });
    }
    console.log(`[email-otp] ${email} -> ${code} (no mail provider configured)`);
    return { delivered: false };
  }

  try {
    const info = await sendMail({ to: email, subject: otpSubject, text: otpMessage(code), html: otpHtml(code) });
    console.log(`[email-otp] sent to ${email} via ${info.via}`);
    return { delivered: true, via: info.via };
  } catch (error) {
    console.error(`[email-otp] send failed to ${email}:`, error.message);
    if (!codeExposed()) {
      throw new HttpError(503, `Could not send the verification email (${error.message}). Use mobile verification instead.`, { expose: true });
    }
    return { delivered: false };
  }
};

/**
 * Mobile OTP bhejta hai. `messages` se har caller apni situation ke hisaab se
 * error text choose karta hai (registration vs login).
 */
const deliverPhoneCode = async (phone, code, messages = {}) => {
  const notConfigured = messages.notConfigured || 'SMS service is not configured.';
  const failed = messages.failed || 'Could not send the SMS.';

  if (!smsConfigured()) {
    if (!codeExposed()) {
      throw new HttpError(503, `${notConfigured} Verify with your email instead.`, { expose: true });
    }
    console.log(`[phone-otp] ${phone} -> ${code} (no SMS provider configured)`);
    return { delivered: false };
  }

  try {
    const info = await sendSms({ to: phone, code, message: otpMessage(code) });
    console.log(`[phone-otp] sent to ${phone} via ${info.via}`);
    return { delivered: true, via: info.via };
  } catch (error) {
    console.error(`[phone-otp] send failed to ${phone}:`, error.message);
    if (!codeExposed()) {
      throw new HttpError(503, `${failed} (${error.message})`, { expose: true });
    }
    return { delivered: false };
  }
};

/**
 * Frontend ko batata hai ki verification abhi kaunse channel par chal sakti
 * hai. Isse app un buttons ko khud disable kar deta hai, aur admin ko pata
 * chalta hai ki SMTP/SMS set karna baaki hai.
 */
const otpChannels = async (req, res) => {
  const mail = mailStatus();
  const sms = smsStatus();
  const exposed = codeExposed();
  // Account (SMTP wala Gmail) public nahi karna — baaki sab dikhane layak hai.
  const publicStatus = ({ account, ...rest }) => rest;

  res.json({
    email: { ...publicStatus(mail), codeExposed: exposed },
    sms: { ...publicStatus(sms), codeExposed: exposed },
    anyAvailable: mail.available || sms.available || exposed
  });
};

/**
 * Email OTP ke baad ek chhoti si proof token milti hai. Register karte waqt
 * ye token saath bhejna zaroori hai — iske bina koi naya account nahi ban
 * sakta, to ek fake email/mobile bhi aage nahi aa sakta.
 *
 * Proof 'email:...' ya 'phone:...' key par store hoti hai, isliye jis bhi
 * channel se code verify kiya tha, register usi channel ki maangta hai.
 */
const PROOF_TTL_MS = 15 * 60 * 1000;
const proofStore = new Map();

const sweepProofs = () => {
  const now = Date.now();
  for (const [key, record] of proofStore) {
    if (record.expiresAt < now) proofStore.delete(key);
  }
};
const proofTimer = setInterval(sweepProofs, 60 * 1000);
proofTimer.unref();

const issueProof = (channel, value) => {
  const key = otp.keyFor(channel, value);
  const proof = crypto.randomBytes(24).toString('hex');
  proofStore.set(key, { proof, expiresAt: Date.now() + PROOF_TTL_MS });
  return proof;
};

/**
 * `silent: true` par galat/missing proof par `false` lautata hai (register me
 * dono channels try karne ke liye). Warna user ko seedha saaf error milta hai.
 */
const consumeProof = (channel, value, proof, { silent = false } = {}) => {
  const key = otp.keyFor(channel, value);
  const record = proofStore.get(key);
  const fail = (message, status = 400) => {
    if (silent) return false;
    throw new HttpError(status, message);
  };

  if (!record) return fail('Verify your email or mobile number first — request a verification code.');
  if (record.expiresAt < Date.now()) {
    proofStore.delete(key);
    return fail('Verification expired. Request a new code.');
  }
  if (!proof || String(proof) !== record.proof) {
    return fail('Verification is not valid. Request a new code.');
  }
  // Ek baar use hone ke baad proof khatam — dobara use nahi ho sakta.
  proofStore.delete(key);
  return true;
};

/** Registration ke liye — email ya mobile, jis bhi kaam kare. */
const requestEmailOtp = async (req, res) => {
  const email = v.email(req.body.email);
  const code = await otp.create('email', email);
  const { delivered } = await deliverEmailCode(email, code);

  res.json({
    message: delivered ? 'Verification code sent to your email' : 'Verification code generated',
    expiresIn: OTP_EXPIRY_SECONDS,
    ...(delivered ? {} : devCode(code))
  });
};

/**
 * Registration ke liye mobile OTP. Login wale `requestOtp` se alag hai —
 * wo sirf pehle se registered number ke liye hai, ye kisi bhi number pe
 * kaam karta hai taaki naya account ban sake.
 */
const requestPhoneOtp = async (req, res) => {
  const phone = v.phone(req.body.phone);
  const code = await otp.create('phone', phone);
  const { delivered } = await deliverPhoneCode(phone, code, {
    notConfigured: 'SMS service is not configured on this server.',
    failed: 'Could not send the SMS.'
  });

  res.json({
    message: delivered ? 'Verification code sent to your mobile' : 'Verification code generated',
    expiresIn: OTP_EXPIRY_SECONDS,
    ...(delivered ? {} : devCode(code))
  });
};

const verifyChannelOtp = (channel) => async (req, res) => {
  const value = channel === 'email' ? v.email(req.body.email) : v.phone(req.body.phone);
  const code = v.text(req.body.code, 'Verification code', { max: 10 });

  await otp.verify(channel, value, code);

  res.json({
    message: channel === 'email' ? 'Email verified' : 'Mobile verified',
    proof: issueProof(channel, value),
    expiresIn: PROOF_TTL_MS / 1000
  });
};

const verifyEmailOtp = verifyChannelOtp('email');
const verifyPhoneOtp = verifyChannelOtp('phone');

const requestOtp = async (req, res) => {
  const phone = v.phone(v.text(req.body.phone, 'Phone number', { max: 20 }));
  const email = v.email(req.body.email);

  const found = await findUserByPhone(phone);
  // Email + phone dono match hone hi chahiye, warna koi bhi check kar ke
  // pata kar sakta tha ki kaunsa number school me registered hai.
  if (!found || found.user.email.toLowerCase() !== email) {
    throw new HttpError(404, 'No account matches that email and phone number');
  }
  if (found.user.status === 'banned') {
    throw new HttpError(403, 'This account has been suspended. Contact the school office.');
  }

  const code = await otp.create('phone', phone);
  const { delivered } = await deliverPhoneCode(phone, code, {
    notConfigured: 'Verification codes are temporarily unavailable.',
    failed: 'Could not send the SMS.'
  });

  res.json({
    message: delivered ? 'Verification code sent' : 'Verification code generated',
    expiresIn: OTP_EXPIRY_SECONDS,
    ...(delivered ? {} : devCode(code))
  });
};

const login = async (req, res) => {
  const { role, otp: code } = req.body;

  if (req.body.phone) {
    const phone = v.phone(v.text(req.body.phone, 'Phone number', { max: 20 }));
    await otp.verify('phone', phone, v.text(code, 'Verification code', { max: 10 }));

    const found = await findUserByPhone(phone);
    if (!found) throw new HttpError(401, 'Account not found');
  if (found.user.status === 'banned') {
    throw new HttpError(403, 'This account has been suspended. Contact the school office.');
  }
  if (found.user.status === 'pending') {
    throw new HttpError(403, 'Your account is awaiting approval by the school office.');
  }
  if (role && found.user.role !== v.oneOf(role, ROLES, 'Role')) {
      throw new HttpError(403, 'This portal is not available for your account type');
    }

    return res.json({ token: signToken(found.user), user: publicUser(found.user) });
  }

  const email = v.email(v.text(req.body.email, 'Email', { max: 254 }));
  const rawPassword = String(req.body.password ?? '');
  if (!rawPassword) throw new HttpError(400, 'Password is required');
  if (rawPassword.length > 128) throw new HttpError(400, 'Password is too long');

  const found = await findUserByEmail(email);
  if (!found) throw new HttpError(401, 'Incorrect email or password');
  if (found.user.status === 'banned') {
    throw new HttpError(403, 'This account has been suspended. Contact the school office.');
  }
  if (found.user.status === 'pending') {
    throw new HttpError(403, 'Your account is awaiting approval by the school office.');
  }

  const valid = await bcrypt.compare(rawPassword, found.row[2]);
  if (!valid) throw new HttpError(401, 'Incorrect email or password');

  if (role && found.user.role !== v.oneOf(role, ROLES, 'Role')) {
    throw new HttpError(403, 'This portal is not available for your account type');
  }

  return res.json({ token: signToken(found.user), user: publicUser(found.user) });
};

const register = async (req, res) => {
  const role = v.oneOf(v.text(req.body.role, 'Role', { max: 20 }), SELF_REGISTERABLE_ROLES, 'Role');

  const firstName = v.text(req.body.firstName, 'First name', { max: 60 });
  const lastName = v.text(req.body.lastName, 'Last name', { max: 60 });
  const email = v.email(req.body.email);
  const phone = v.phone(req.body.phone);
  const password = v.password(req.body.password);
  const fatherName = v.text(req.body.fatherName, "Father's name", { max: 80 });
  const motherName = v.text(req.body.motherName, "Mother's name", { max: 80 });
  const section = v.optionalOneOf(String(req.body.section || 'A').toLowerCase(), ['a', 'b', 'c', 'd'], 'Section') ? String(req.body.section).trim().toUpperCase() : 'A';

  const isStudent = role === 'student';
  const isTeacher = role === 'teacher';
  const className = isStudent
    ? v.oneOf(req.body.className, ['9', '10', '11', '12'], 'Class')
    : 'N/A';
  const rollNumber = isStudent ? v.text(req.body.rollNumber, 'Roll number', { max: 20 }) : '';
  const subject = isStudent ? '' : (isTeacher ? v.text(req.body.subject, 'Subject', { max: 60 }) : v.optionalText(req.body.subject, 'Subject', { max: 60 }));
  const degree = isStudent ? '' : v.optionalText(req.body.degree, 'Degree', { max: 60 });
  const experience = isStudent ? '0' : String(v.int(req.body.experience || 0, 'Experience', { min: 0, max: 60 }));
  const avatar = v.dataUrl(req.body.avatar, 'Profile photo', 27000);
  const gender = v.optionalOneOf(req.body.gender, ['male', 'female'], 'Gender');

  const existing = await findUserByEmail(email);
  if (existing) throw new HttpError(409, 'An account with this email already exists');

  // Verification proof ke bina account ban hi nahi sakta. Email ya mobile —
  // jis bhi channel se code verify kiya tha, usi ka proof chahiye.
  const proof = req.body.proof || req.body.emailProof;
  const proofAccepted =
    consumeProof('email', email, proof, { silent: true }) ||
    consumeProof('phone', phone, proof, { silent: true });
  if (!proofAccepted) {
    throw new HttpError(400, 'Verify your email or mobile number first — request a verification code.');
  }

  const phoneTaken = await findUserByPhone(phone);
  if (phoneTaken) throw new HttpError(409, 'An account with this phone number already exists');

  if (isStudent) {
    const dupes = await findStudentDuplicate({
      name: `${firstName} ${lastName}`.trim(),
      fatherName,
      motherName
    });
    if (dupes.length) {
      const dup = dupes[0];
      throw new HttpError(409, `Is naam ${dup.name || ''} aur parents ke naam se ek student pehle se registered hai (Class ${dup.class || '?'}). Ek student ka ek hi account banta hai — login karke use karo.`);
    }
  }

  const id = `USR${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const initialStatus = isStudent ? 'active' : 'pending';
  const detail = JSON.stringify({
    rollNumber,
    isClassTeacher: isStudent ? false : !!req.body.isClassTeacher,
    gender,
    status: initialStatus
  });

  await appendSheetData('Users', [
    `${firstName} ${lastName}`.trim(),
    email,
    await bcrypt.hash(password, 12),
    role,
    className,
    detail,
    id,
    avatar,
    phone,
    subject || 'N/A',
    degree || 'N/A',
    experience || '0',
    firstName,
    lastName,
    section,
    motherName,
    fatherName
  ]);

  res.status(201).json({
    message: isStudent
      ? 'Account created. You can sign in now.'
      : 'Application received. The school office will activate your account.'
  });
};

const changePassword = async (req, res) => {
  const oldPassword = String(req.body.oldPassword ?? '');
  const newPassword = v.password(req.body.newPassword);

  if (!oldPassword) throw new HttpError(400, 'Current password is required');
  if (oldPassword === newPassword) throw new HttpError(400, 'Choose a password different from your current one');

  const found = await findUserById(req.user.id);
  if (!found) throw new HttpError(404, 'Account not found');

  const valid = await bcrypt.compare(oldPassword, found.row[2]);
  if (!valid) throw new HttpError(401, 'Your current password is incorrect');

  const updatedRow = [...found.row];
  updatedRow[2] = await bcrypt.hash(newPassword, 12);
  await updateSheetData('Users', found.user.id, updatedRow);

  res.json({ success: true, message: 'Password updated' });
};

const updateProfile = async (req, res) => {
  const found = await findUserById(req.user.id);
  if (!found) throw new HttpError(404, 'Account not found');

  const updatedRow = [...found.row];
  const updates = {};

  if (!v.isBlank(req.body.email)) {
    const email = v.email(req.body.email);
    if (email !== found.user.email) {
      const taken = await findUserByEmail(email);
      if (taken && taken.user.id !== found.user.id) {
        throw new HttpError(409, 'That email is already in use');
      }
      updatedRow[1] = email;
      updates.email = email;
    }
  }

  if (!v.isBlank(req.body.phone)) {
    const phone = v.phone(req.body.phone);
    if (phone !== String(found.user.phone || '').replace(/[\s-]/g, '')) {
      const taken = await findUserByPhone(phone);
      if (taken && taken.user.id !== found.user.id) {
        throw new HttpError(409, 'That phone number is already in use');
      }
      updatedRow[8] = phone;
      updates.phone = phone;
    }
  }

  if (!v.isBlank(req.body.avatarUrl)) {
    const avatar = v.dataUrl(req.body.avatarUrl, 'Profile photo', 27000);
    updatedRow[7] = avatar;
    updates.avatar = avatar;
  }

  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, 'No changes to save');
  }

  await updateSheetData('Users', found.user.id, updatedRow);

  res.json({
    success: true,
    message: 'Profile updated',
    user: { ...publicUser(found.user), ...updates }
  });
};

const listTeachers = async (req, res) => {
  const rows = userRows(await getSheetData('Users'));
  const teachers = rows
    .filter((row) => String(row[3] || '').trim().toLowerCase() === 'teacher' && parseJson(row[5], {}).status !== 'banned')
    .map((row) => ({
      id: String(row[6] || '').trim(),
      name: row[0] || '',
      subject: row[9] && row[9] !== 'N/A' ? row[9] : 'General',
      degree: row[10] && row[10] !== 'N/A' ? row[10] : ''
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json(teachers);
};

const deleteAccount = async (req, res) => {
  const targetId = req.params.userId;

  if (targetId !== req.user.id && req.user.role !== 'admin') {
    throw new HttpError(403, 'You do not have access to this resource');
  }
  if (targetId === req.user.id && req.user.role === 'admin') {
    throw new HttpError(400, 'Administrators cannot delete their own account');
  }

  const found = await findUserById(targetId);
  if (!found) throw new HttpError(404, 'Account not found');

  await deleteSheetData('Users', targetId);

  res.json({ success: true, message: 'Account deleted' });
};

/**
 * School office (principal/admin) khud teacher, principal ya student ka
 * account bana sakta hai. Isi se 'teacher/principal ka account kaise banega?'
 * ka jawab milta hai — school office banata hai, koi self-register nahi karta
 * staff ke liye (teachers register karke pending ke liye wait karte hain).
 * Password office set karta hai aur usi ko batata hai user ko.
 */
const createUserByOffice = async (req, res) => {
  const officeRole = req.user.role;
  const ALLOWED_BY_ROLE = {
    teacher: ['student'],
    principal: ['student', 'teacher'],
    admin: ['student', 'teacher', 'principal']
  };
  const allowed = ALLOWED_BY_ROLE[officeRole] || [];
  const role = v.oneOf(v.text(req.body.role, 'Role', { max: 20 }), ROLES, 'Role');
  if (!allowed.includes(role)) {
    throw new HttpError(403, officeRole === 'principal'
      ? 'Principal student aur teacher ke accounts bana sakta hai.'
      : 'Ye account system se banaya jata hai, yahan se nahi.');
  }

  const fullName = v.text(req.body.name, 'Full name', { max: 120 });
  let email = req.body.email ? v.email(req.body.email) : '';
  let password = String(req.body.password || '').trim();
  if (!password) {
    if (role !== 'student') throw new HttpError(400, 'Password chahiye student/teacher account ke liye');
    password = 'Student@123';
  } else {
    password = v.password(password);
  }
  if (!email) {
    if (role !== 'student') throw new HttpError(400, 'Email address chahiye');
    const slug = String(`${req.body.rollNumber || ''}-${req.body.className || ''}`).replace(/[^a-z0-9]/g, '');
    email = `student${slug ? `-${slug}` : ''}-${Date.now().toString().slice(-6)}@dj.edu`;
  }
  const phone = v.optionalPhone(req.body.phone);
  const gender = v.optionalOneOf(req.body.gender, ['male', 'female'], 'Gender');
  const sectionInput = String(req.body.section || 'A').toLowerCase();
  const section = v.oneOf(sectionInput, ['a', 'b', 'c', 'd'], 'Section').toUpperCase();
  const fatherName = v.optionalText(req.body.fatherName, "Father's name", { max: 80 });
  const motherName = v.optionalText(req.body.motherName, "Mother's name", { max: 80 });

  let needsClass = role === 'student' || role === 'teacher';
  let className;
  if (officeRole === 'teacher') {
    needsClass = false;
    className = String(req.user.class || 'N/A');
    if (className === 'N/A') {
      throw new HttpError(403, 'Aapke account ko pehle ek class assign honi chahiye');
    }
  } else {
    className = needsClass
      ? v.oneOf(req.body.className, ['9', '10', '11', '12', 'N/A'], 'Class')
      : 'N/A';
  }
  if (role === 'teacher' && className === 'N/A') {
    throw new HttpError(400, 'Assign the teacher a class (9, 10, 11 or 12)');
  }
  const subject = role === 'teacher' ? v.text(req.body.subject, 'Subject', { max: 60 }) : '';
  const rollNumber = role === 'student' ? v.optionalText(req.body.rollNumber, 'Roll number', { max: 20 }) : '';

  const existingEmail = await findUserByEmail(email);
  if (existingEmail) throw new HttpError(409, 'An account with this email already exists');

  if (role === 'student') {
    const dupes = await findStudentDuplicate({ name: fullName, fatherName, motherName });
    if (dupes.length) {
      const dup = dupes[0];
      throw new HttpError(409, `Ye student already registered hai (${dup.name}, Class ${dup.class}). Wahi account hi use hoga — duplicate nahi banta.`);
    }
  }

  if (phone) {
    const existingPhone = await findUserByPhone(phone);
    if (existingPhone) throw new HttpError(409, 'An account with this phone number already exists');
  }

  const nameParts = fullName.split(' ').filter(Boolean);
  const firstName = nameParts[0] || fullName;
  const lastName = nameParts.slice(1).join(' ') || '';
  const id = `USR${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const detail = JSON.stringify({
    rollNumber,
    isClassTeacher: role === 'teacher' ? !!req.body.isClassTeacher : false,
    gender,
    status: 'active'
  });

  await appendSheetData('Users', [
    fullName,
    email,
    await bcrypt.hash(password, 12),
    role,
    className,
    detail,
    id,
    '',
    phone || '',
    subject || 'N/A',
    '',
    '0',
    firstName,
    lastName,
    section || 'A',
    motherName,
    fatherName
  ]);

  res.status(201).json({
    message: `${role} account created for ${fullName} (${email}). Password office ke paas hai.`,
    user: { id, name: fullName, email, role, class: className, password: role === 'student' ? password : undefined }
  });
};

module.exports = {
  requestOtp, login, register, changePassword,
  updateProfile, listTeachers, deleteAccount, createUserByOffice,
  requestEmailOtp, requestPhoneOtp, verifyEmailOtp, verifyPhoneOtp,
  otpChannels, codeExposed,
  toUser, publicUser, findUserById, findUserByEmail, findUserByPhone,
  findStudentDuplicate
};

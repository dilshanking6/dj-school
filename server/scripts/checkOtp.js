/**
 * OTP delivery ka end-to-end test. Ye wahi code chalata hai jo app use karti
 * hai — isliye iska result wahi hoga jo user ko dikhega.
 *
 *   npm run check:otp                       # sirf config check (koi mail/SMS nahi)
 *   npm run check:otp -- you@gmail.com      # config + wahan mail bhej kar dekho
 *   npm run check:otp -- you@gmail.com 9876543210   # mail + SMS dono
 *
 * Ye koi secret print nahi karta — sirf config ki haaliyat aur success/failure.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { mailStatus, verifySmtp, sendMail } = require('../utils/mailer');
const { smsStatus, sendSms } = require('../utils/sms');
const { codeExposed } = require('../utils/otp');

const [, , emailArg, phoneArg] = process.argv;
const email = (emailArg || '').trim();
const phone = (phoneArg || '').trim();

const ok = (text) => console.log(`  OK    ${text}`);
const bad = (text) => console.log(`  FAIL  ${text}`);
const info = (text) => console.log(`  ..    ${text}`);

const divider = () => console.log('-'.repeat(64));

async function checkEmail() {
  const status = mailStatus();
  if (!status.available) {
    bad(`Email: ${status.reason}`);
    if (!codeExposed()) info('Login karo -> Security -> 2-Step Verification -> App passwords (README)');
    return;
  }
  ok(`Email: configured via ${status.provider} (${status.account || 'account hidden'})`);

  const smtp = await verifySmtp();
  if (smtp.ok) ok('Email: SMTP login verified');
  else bad(`Email: SMTP login failed — ${smtp.reason}`);

  if (!email) {
    info('Email address pass nahi ki — sirf config check ho gaya');
    return;
  }
  if (!smtp.ok) {
    bad('Email: send nahi kiya, credentials theek nahi lag rahi');
    return;
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  try {
    await sendMail({
      to: email,
      subject: 'Digital Janta — OTP delivery test',
      text: `${code} is your Digital Janta verification code. It expires in 5 minutes.`,
      html: `<p>Your Digital Janta verification code is <strong style="font-size:24px">${code}</strong></p>`
    });
    ok(`Email: test code ${code} bhej diya — ${email} ke inbox me check karo`);
  } catch (error) {
    bad(`Email: bhejne me dikkat — ${error.message}`);
  }
}

async function checkSms() {
  const status = smsStatus();
  if (!status.available) {
    bad(`SMS: ${status.reason}`);
    if (!phone) info('Mobile number pass nahi ki — config hi galat hai');
    return;
  }
  ok(`SMS: configured via ${status.provider}`);

  if (!phone) {
    info('Mobile number pass nahi ki — sirf config check ho gaya');
    return;
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  try {
    const info_ = await sendSms({
      to: phone,
      code,
      message: `${code} is your Digital Janta verification code. It expires in 5 minutes.`
    });
    ok(`SMS: test code ${code} bhej diya via ${info_.via} — phone pe check karo`);
  } catch (error) {
    bad(`SMS: bhejne me dikkat — ${error.message}`);
  }
}

(async () => {
  console.log(`Digital Janta — OTP check (${process.env.NODE_ENV || 'development'})`);
  divider();
  console.log('Email');
  await checkEmail();
  divider();
  console.log('Mobile');
  await checkSms();
  divider();
  if (codeExposed()) {
    info('Code exposure on hai — codes response me bhi aa sakte hain (development mode).');
  }
  process.exit(0);
})();

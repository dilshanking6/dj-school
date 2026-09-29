/**
 * OTP delivery ka end-to-end test. Ye wahi code chalata hai jo app use karti
 * hai — isliye iska result wahi hoga jo user ko dikhega.
 *
 *   npm run check:otp                       # sirf config check (koi mail/SMS nahi)
 *   npm run check:otp -- you@gmail.com      # config + wahan mail bhej kar dekho
 *   npm run check:otp -- you@gmail.com 9876543210   # mail + SMS dono
 *
 * `--url` se kisi live deployment ka status seedha puchh sakte ho, jo bahut
 * zaroori hai: local .env bharne se deployed server par set hona zaroori nahi
 * (Render/Railway par environment variables alag hote hain).
 *
 *   npm run check:otp -- --url https://your-app.onrender.com
 *
 * Ye koi secret print nahi karta — sirf config ki haaliyat aur success/failure.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { mailStatus, verifySmtp, sendMail } = require('../utils/mailer');
const { smsStatus, sendSms } = require('../utils/sms');
const { codeExposed } = require('../utils/otp');

const args = process.argv.slice(2);
const urlFlag = args.findIndex((a) => a === '--url');
const liveUrl = urlFlag === -1 ? '' : String(args[urlFlag + 1] || '').trim();
const positional = args.filter((_, i) => i !== urlFlag && i !== urlFlag + 1);
const email = (positional[0] || '').trim();
const phone = (positional[1] || '').trim();

const ok = (text) => console.log(`  OK    ${text}`);
const bad = (text) => console.log(`  FAIL  ${text}`);
const info = (text) => console.log(`  ..    ${text}`);

const divider = () => console.log('-'.repeat(64));

/**
 * Live deployment se puchh kar batata hai ki us par kya set hai. Ye `reason`
 * dikhata hai (jaise "SMTP_PASS missing") kyunki ye terminal me operator ke
 * liye hai, browser UI me kabhi nahi.
 */
async function checkLive() {
  const base = liveUrl.replace(/\/+$/, '');
  console.log(`Digital Janta — OTP check (live: ${base})`);
  divider();

  let payload;
  try {
    const axios = require('axios');
    // `/api/status` isliye, `/api/auth/otp-channels` nahi — operator endpoint
    // hai aur `reason` deta hai (jaise "SMTP_PASS missing"), jo yahan terminal
    // me dikhana hai. Public endpoint wo jaan boojh kar nahi deta.
    const response = await axios.get(`${base}/api/status`, { timeout: 20000 });
    const verification = response.data.verification;
    if (!verification) throw new Error('Server par naya /api/status nahi hai — redeploy zaroori hai');
    payload = verification;
  } catch (error) {
    bad(`Live server tak nahi pahunch saka: ${error.message}`);
    info('URL sahi hai? Render me service "Live" honi chahiye, aur free plan me cold start me 30-50 second lag sakte hain.');
    process.exit(1);
  }

  const show = (label, status) => {
    const bits = [status.available ? 'available' : 'NOT configured'];
    if (status.provider) bits.push(`provider: ${status.provider}`);
    if (status.reason) bits.push(`reason: ${status.reason}`);
    (status.available ? ok : bad)(`${label}: ${bits.join(' | ')}`);
  };

  show('Email', payload.email || {});
  divider();
  show('Mobile', payload.sms || {});
  divider();

  if (payload.codeExposed) {
    info('Code exposure on hai — codes browser par bhi dikh rahe hain, delivery ki zaroorat nahi.');
  } else if (!payload.email?.available && !payload.sms?.available) {
    bad('Is server par koi bhi verification channel nahi hai — yahi wajah hai ki code nahi ja raha.');
    info('Fix: SMTP_USER + SMTP_PASS (Gmail app password) ya SMS_PROVIDER + SMS_API_KEY, phir redeploy.');
  }
  process.exit(0);
}

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
  if (liveUrl) await checkLive();

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

/**
 * Digital Janta — FREE email sender (no SMTP ports needed).
 *
 * KYUN: Render ka free plan outbound SMTP ports 25/465/587 BLOCK karta hai
 * (Render docs, Sept 2025 se). Isliye Node server se Gmail SMTP par seedha
 * mail nahi ja sakta — connection hi nahi banti (11 second timeout).
 *
 * Apps Script Google ke apne servers par chalta hai aur HTTPS (port 443)
 * use karta hai, jo free plan par allowed hai. Isliye ye raasta free me
 * kaam karta hai.
 *
 * ---------------------------------------------------------------------------
 *  SETUP (5 minute)
 * ---------------------------------------------------------------------------
 *  1. https://script.google.com  kholo  ->  "+ New project"
 *  2. Poora ye file ka content paste kar do (upar ka comment block bhi).
 *  3. Neeche MAIL_TOKEN ki value badal do (koi bhi lambi random string).
 *  4. Deploy -> New deployment
 *        Type   : Web app
 *        Execute as : Me (aapka Google account)
 *        Who has access : Anyone
 *     -> Deploy  ->  ek URL milega:
 *        https://script.google.com/macros/s/AKfyc.../exec
 *  5. Wo URL Render me `APPS_SCRIPT_MAIL_URL` me daalo, aur wahi
 *     jo token neeche daala tha wo `APPS_SCRIPT_MAIL_TOKEN` me.
 *  6. Render me **Manual Deploy -> Deploy latest commit** dabao
 *     (env change par auto deploy nahi chalta).
 *
 *  VERIFY:  cd server && npm run check:otp -- aapka@gmail.com
 *
 * ---------------------------------------------------------------------------
 *  QUOTA: free Gmail par ~100 mail/din (MailApp). OTP ke liye kaafi hai.
 * ---------------------------------------------------------------------------
 */

// Wo lambi random string jo Render ke APPS_SCRIPT_MAIL_TOKEN me hai.
// Dono jagah SAME honi chahiye, warna mail nahi jayega.
// Random banane ke liye: https://randomkeygen.com  ya koi bhi 40+ char string.
var MAIL_TOKEN = 'YAHAN_APNA_LAMBA_RANDOM_TOKEN_DALO_KOI_BHI_40_CHAR_KI';

// "Digital Janta" <aapka@gmail.com> — agar khali chhodoge to script ke
// owner ka Gmail address use hoga.
var MAIL_FROM_NAME = 'Digital Janta';

/**
 * Ek fixed reply-to — school ka official address. Students seedha yahan
 * reply kar sakte hain (OTP mail ka "noreply" jaisa nahi lagta).
 * Khali string rakhoge to ye step chhod diya jayega.
 */
var REPLY_TO = '';

/** DoS / open-relay se bachne ke liye: 1 ghante me kitni mail. */
var HOURLY_LIMIT = 80;

// ---------------------------------------------------------------------------
//  Neeche ka code chhedna zaruri nahi.
// ---------------------------------------------------------------------------

function doGet(e) {
  // Health check: browser me URL kholne par ye dikhega.
  return json_({ ok: true, service: 'Digital Janta mail', hasToken: !!MAIL_TOKEN });
}

function doPost(e) {
  var started = Date.now();
  var body = {};

  try {
    body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
  } catch (err) {
    return json_({ error: 'Malformed JSON body' });
  }

  // 1. Token check — bina ye koi bhi aapke school ke naam se mail bhej sakta hai.
  var given = String(body.token || header_(e, 'x-mail-token') || '');
  if (!MAIL_TOKEN || given !== MAIL_TOKEN) {
    return json_({ error: 'Unauthorized' }, 401);
  }

  // 2. Kya bhejna hai.
  var to = String(body.to || '').trim();
  var subject = String(body.subject || '').trim();
  var text = String(body.text || body.body || '').trim();
  var html = String(body.html || '').trim();

  if (!to || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return json_({ error: 'Invalid recipient' });
  if (!subject) return json_({ error: 'Subject is required' });
  if (!text && !html) return json_({ error: 'Empty message' });

  // 3. Quota (open relay bachao).
  var used = quota_();
  if (used >= HOURLY_LIMIT) {
    return json_({ error: 'Hourly mail limit reached. Try again later.' }, 429);
  }

  // 4. Bhejo.
  try {
    var options = { name: MAIL_FROM_NAME, htmlBody: html || undefined, body: text };
    if (REPLY_TO) options.replyTo = REPLY_TO;

    MailApp.sendEmail(to, subject, text, options);

    console.log('mail ok -> ' + to + ' in ' + (Date.now() - started) + 'ms (used ' + (used + 1) + '/' + HOURLY_LIMIT + ')');
    return json_({ ok: true, via: 'apps-script' });
  } catch (err) {
    // Raw error server log me jaata hai — browser ko sirf saaf message.
    console.error('mail fail -> ' + to + ' :: ' + (err && err.message ? err.message : err));
    return json_({ error: 'Mail service rejected the request' }, 502);
  }
}

/** Har hour ek naya counter — PropertiesService (persistent) use karta hai. */
function quota_() {
  try {
    var props = PropertiesService.getScriptProperties();
    var bucket = 'MAIL_COUNT_' + Math.floor(Date.now() / 3600000);
    var n = Number(props.getProperty(bucket) || 0);
    props.setProperty(bucket, String(n + 1));
    // Purane buckets hata dete hain taaki property store saaf rahe.
    var keys = props.getKeys();
    for (var i = 0; i < keys.length; i++) {
      if (keys[i].indexOf('MAIL_COUNT_') === 0 && keys[i] !== bucket) props.deleteProperty(keys[i]);
    }
    return n;
  } catch (err) {
    return 0; // quota check fail ho to mail block mat karo
  }
}

function header_(e, name) {
  try {
    var h = e.parameterHeaders || e.headers || {};
    for (var k in h) if (k.toLowerCase() === name) return h[k];
  } catch (err) {}
  return '';
}

function json_(obj, status) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  // Apps Script web app hamesha 200 bhejta hai — server `error` field padh kar
  // failure samajhta hai (mailer.js `response.data.error` check karta hai).
  if (status && status >= 400) console.warn('responding ' + status + ': ' + JSON.stringify(obj));
  return output;
}

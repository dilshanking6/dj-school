const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const { authenticateSocket, HttpError } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimit } = require('./middleware/rateLimit');
const { storageConfigured } = require('./utils/googleSheets');
const { mailStatus, probeSmtp, smtpConfigured } = require('./utils/mailer');
const { smsStatus } = require('./utils/sms');
const { fileStoreStatus } = require('./utils/fileStore');
const { codeExposed } = require('./utils/otp');
const { assertRoomAccess, loadUser } = require('./utils/rooms');

const PORT = Number(process.env.PORT || 5000);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

const app = express();
const server = http.createServer(app);

// Render (aur koi bhi reverse proxy) ke peeche `req.ip`/`req.protocol` asli
// client ke naam pe resolve karne ke liye chahiye, warna rate limiter poore
// proxy ko ek hi IP samajhta hai aur `x-forwarded-*` headers ignore hote hain.
app.set('trust proxy', true);

const allowedOrigins = () => {
  if (CLIENT_ORIGIN) {
    return CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
  }
  if (IS_PRODUCTION) return [];
  return ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173'];
};

const firstHeaderValue = (value) => String(value || '').split(',')[0].trim();

/**
 * Apne hi domain se aaya request same-origin hai, chahe `CLIENT_ORIGIN` set ho
 * ya na ho. Ye zaroori hai kyunki Vite ka build `<script type="module"
 * crossorigin>` aur `<link rel="stylesheet" crossorigin>` emit karta hai —
 * `crossorigin` hone ki wajah se browser SAME-ORIGIN requests me bhi `Origin`
 * header bhejta hai. Pehle guard unhe reject karta tha, jisse app ka JS/CSS
 * 500 pe fail ho jata tha aur page blank safed dikhta tha.
 */
const isSameOrigin = (origin, req) => {
  if (!origin || !req || !req.headers) return false;
  try {
    const url = new URL(origin);
    const host = firstHeaderValue(req.headers['x-forwarded-host'] || req.headers.host);
    if (!host || url.host !== host) return false;
    const proto = firstHeaderValue(req.headers['x-forwarded-proto']);
    return !proto || url.protocol === `${proto}:`;
  } catch {
    return false;
  }
};

const originAllowed = (origin, req) => {
  if (!origin) return true;
  if (isSameOrigin(origin, req)) return true;
  return allowedOrigins().includes(origin);
};

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => callback(null, originAllowed(origin)),
    methods: ['GET', 'POST']
  },
  maxHttpBufferSize: 1e5,
  // Socket.IO ka `cors.origin` ko request nahi milta, isliye same-origin check
  // yahan `allowRequest` me hota hai jahan `req.headers` available hai.
  allowRequest: (req, callback) => callback(null, originAllowed(req.headers.origin, req))
});

app.set('socketio', io);
app.disable('x-powered-by');

// Render khud already HSTS + X-Content-Type-Options lagata hai, par apne
// domain ke saath wo Render ke extra subdomain pe bhi lagta hai — isliye
// sirf apne host pe HSTS rakhte hain, warna onrender.com pe bhi lock lag jayega.
const PUBLIC_HOST = firstHeaderValue(process.env.PUBLIC_HOST);
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  if (PUBLIC_HOST && req.hostname === PUBLIC_HOST) {
    res.set('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  if (IS_PRODUCTION) {
    // Render Cloudflare ke peeche hota hai, isliye `req.secure` hamesha false
    // rehta hai — HSTS tabhi sach me lagta hai jab `x-forwarded-proto` https
    // bataye, warna localhost pe bhi header chala jayega.
    const proto = firstHeaderValue(req.headers['x-forwarded-proto']) || req.protocol;
    if (proto === 'https') {
      res.set('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
    }
    res.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        // Vite ka build inline theme-boot script chalaata hai (index.html),
        // isliye style me 'unsafe-inline' zaroori hai.
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        // Landing page GSAP/WebGL-ish effects + YouTube embeds use karta hai.
        "img-src 'self' data: blob: data:image/svg+xml https:",
        "font-src 'self' data:",
        // Google Sheets/Drive links study material me embed hote hain.
        "connect-src 'self' https: wss:",
        "frame-src 'self' https://www.youtube.com https://drive.google.com",
        "media-src 'self' data: blob: https:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
        "upgrade-insecure-requests"
      ].join('; ')
    );
  }
  next();
});

// Allowed origin reject hone par 500 nahi — bas CORS header nahi bhejte, jisse
// browser request ko block kar deta hai. 500 dene se poori app (JS/CSS) down
// ho jaati thi.
app.use(cors((req, callback) => {
  callback(null, { origin: originAllowed(req.headers.origin, req) });
}));

// File upload (max 25 MB) ko global `express.json({limit: '256kb'})` se pehle
// mount karna padta hai — warna 2 MB se badi PDF bhi 413 ho jaati aur file
// kabhi bhi upload route tak nahi pahunchti. Yahan sirf /api/files ke liye
// badi limit lagi hai, baaki app 256 kb par hi rehta hai.
app.use('/api/files', express.json({ limit: '35mb' }));
app.use('/api/files', require('./routes/fileRoutes.js'));

app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ limit: '256kb', extended: false }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 600, message: 'Too many requests. Please slow down.' }));

// Public health check. Ye Render ka `healthCheckPath` hai aur bina token ke
// open hai, isliye isme koi secret nahi jaata — na SMTP ka account, na
// provider ka naam, na "kaunsi cheez missing hai" wali reason. Ye pehle sab
// public ho jata tha, jisse koi bhi visitor se pata kar sakta tha ki OTP kis
// Gmail se ja raha hai aur kaunsa SMS provider use ho raha hai.
// Details ke liye `x-status-token` header chahiye (STATUS_TOKEN env).
app.get('/api/status', (req, res) => {
  const email = mailStatus();
  const sms = smsStatus();
  const files = fileStoreStatus();
  const base = {
    status: 'ok',
    service: 'Digital Janta API',
    version: require('./package.json').version,
    storage: storageConfigured() ? 'connected' : 'not-configured',
    verification: {
      // Sirf "chal raha hai / nahi" — configuration ka koi detail nahi.
      email: { available: Boolean(email.available), codeExposed: codeExposed() },
      sms: { available: Boolean(sms.available) },
      files: { available: Boolean(files.available), maxMB: files.maxMB }
    }
  };

  const expected = process.env.STATUS_TOKEN;
  const given = String(req.headers['x-status-token'] || '');
  if (!expected || !given || given.length !== expected.length ||
      !require('crypto').timingSafeEqual(Buffer.from(given), Buffer.from(expected))) {
    return res.json(base);
  }

  return res.json({
    ...base,
    // Token sahi hai to operator ko poori diagnosis chahiye.
    verification: { email, sms, files, codeExposed: codeExposed() }
  });
});

app.use('/api/auth', require('./routes/authRoutes.js'));
app.use('/api/public', require('./routes/schoolRoutes.js').publicRouter);
app.use('/api/messages', require('./routes/messageRoutes.js'));
app.use('/api/complaints', require('./routes/complaintRoutes.js'));
app.use('/api/notes', require('./routes/noteRoutes.js'));
app.use('/api/ratings', require('./routes/ratingRoutes.js'));
app.use('/api/school', require('./routes/schoolRoutes.js'));
app.use('/api/chatrooms', require('./routes/chatRoomRoutes.js'));
app.use('/api/study', require('./routes/studyRoutes.js'));
app.use('/api/ai', require('./routes/aiRoutes.js'));
app.use('/api/forms', require('./routes/formRoutes.js'));

// SPA fallback se PEHLE — har unknown route par 404. Ye isliye zaroori hai
// kyunki neeche `app.get('*path')` har kuch pakad leta hai: uske bina
// `/api/kuch-galat` par client ko 200 HTML milta tha (JSON ke bajaye), jisse
// frontend ka `res.data` string ban jata tha aur error message user ko
// garbage dikhta. Saath hi ye asli 404 bhi chhupa deta tha, isliye galat
// endpoint ka pata bhi nahi chalta tha.
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next(new HttpError(404, 'Endpoint not found'));
  }
  return next();
});

if (IS_PRODUCTION) {
  const dist = path.join(__dirname, '../client/dist');
  app.use(express.static(dist));
  app.get('*path', (req, res) => {
    res.sendFile(path.resolve(dist, 'index.html'));
  });
}

app.use(errorHandler);

io.use(authenticateSocket);

io.on('connection', async (socket) => {
  // Personal, role aur class rooms, taaki targeted events leak na hon.
  socket.join(`user:${socket.user.id}`);
  socket.join(`role:${socket.user.role}`);

  try {
    const profile = await loadUser(socket.user.id);
    const className = profile?.class;
    if (className && className !== 'N/A') socket.join(`class:${className}`);
  } catch {
    // Profile lookup fail ho to bhi connection kaam karta rahega.
  }

  socket.on('join_room', async (roomId) => {
    if (typeof roomId !== 'string' || roomId.length === 0 || roomId.length >= 80) return;
    try {
      await assertRoomAccess(roomId, socket.user);
      socket.join(roomId);
    } catch (error) {
      socket.emit('room_error', { roomId, error: error.message });
    }
  });

  socket.on('leave_room', (roomId) => {
    if (typeof roomId === 'string') socket.leave(roomId);
  });
});

if (!process.env.JWT_SECRET) {
  console.warn('[config] JWT_SECRET is missing. Add a strong random value before starting the server.');
}
if (!storageConfigured()) {
  console.warn('[config] APPS_SCRIPT_URL is missing. Set it in server/.env so the portal can store data.');
}

// Verification (OTP) ke warnings — inke bina "Send code" dabane par kuch
// nahi hota, aur user ko sirf ek generic error milti hai.
//
// SMTP creds bhare hue hain par unka port host par khula hai ya nahi, ye
// `mailStatus()` ab probe ke natija se batata hai. Probe fire-and-forget hai
// (boot kabhi iska intezaar nahi karta) — isliye ye log bhi uske baad hi
// likha jaata hai, warna "ready" likh kar baad me 503 aata.
probeSmtp()
  .catch((error) => ({ checked: true, reachable: false, reason: error.message }))
  .then((probe) => {
    if (smtpConfigured()) {
      console.log(
        probe.reachable
          ? `[config] SMTP port reachable (${probe.checked ? 'probe ok' : 'unverified'}).`
          : `[config] SMTP port UNREACHABLE: ${probe.reason} — email will not work over SMTP on this host.`
      );
    }

    const mail = mailStatus();
    if (mail.available) {
      console.log(`[config] Email OTP ready (${mail.provider}).`);
    } else if (codeExposed()) {
      console.log(`[config] Email OTP NOT configured (${mail.reason}) — codes will be shown on screen in this mode.`);
    } else {
      console.warn(`[config] Email OTP is NOT configured (${mail.reason}). Users cannot verify by email. See README "Verification codes" section.`);
    }
  });

const sms = smsStatus();
if (sms.available) {
  console.log(`[config] Mobile OTP ready (${sms.provider}).`);
} else {
  console.warn(`[config] Mobile OTP is NOT configured (${sms.reason}). Users cannot verify by SMS. See README "Mobile: a free SMS provider" section.`);
}
if (IS_PRODUCTION && !CLIENT_ORIGIN) {
  console.warn(
    '[config] CLIENT_ORIGIN is missing. Apne hi domain ka traffic chalega, ' +
      'par alag origin (jaise admin panel) host karna ho to ye set karo.'
  );
}

server.listen(PORT, () => {
  console.log(`Digital Janta API listening on port ${PORT} (${IS_PRODUCTION ? 'production' : 'development'})`);
});

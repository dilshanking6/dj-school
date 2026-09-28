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
const { assertRoomAccess, loadUser } = require('./utils/rooms');

const PORT = Number(process.env.PORT || 5000);
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

const app = express();
const server = http.createServer(app);

const allowedOrigins = () => {
  if (CLIENT_ORIGIN) {
    return CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
  }
  if (IS_PRODUCTION) return [];
  return ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:4173'];
};

const originGuard = (origin, callback) => {
  const allowed = allowedOrigins();
  if (!origin) return callback(null, true);
  if (allowed.includes(origin)) return callback(null, true);
  return callback(new Error('Origin not allowed'));
};

const io = new Server(server, {
  cors: { origin: originGuard, methods: ['GET', 'POST'] },
  maxHttpBufferSize: 1e5
});

app.set('socketio', io);
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.use(cors({ origin: originGuard }));
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ limit: '256kb', extended: false }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 600, message: 'Too many requests. Please slow down.' }));

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Digital Janta API',
    version: require('./package.json').version,
    storage: storageConfigured() ? 'connected' : 'not-configured'
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

if (IS_PRODUCTION) {
  const dist = path.join(__dirname, '../client/dist');
  app.use(express.static(dist));
  app.get('*path', (req, res) => {
    res.sendFile(path.resolve(dist, 'index.html'));
  });
} else {
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next(new HttpError(404, 'Endpoint not found'));
    }
    return next();
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
if (IS_PRODUCTION && !CLIENT_ORIGIN) {
  console.warn('[config] CLIENT_ORIGIN is missing. Set it to your deployed frontend origin.');
}

server.listen(PORT, () => {
  console.log(`Digital Janta API listening on port ${PORT} (${IS_PRODUCTION ? 'production' : 'development'})`);
});

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes.js'));
app.use('/api/messages', require('./routes/messageRoutes.js'));
app.use('/api/complaints', require('./routes/complaintRoutes.js'));
app.use('/api/notes', require('./routes/noteRoutes.js'));
app.use('/api/ratings', require('./routes/ratingRoutes.js'));
app.use('/api/school', require('./routes/schoolRoutes.js'));
app.use('/api/chatrooms', require('./routes/chatRoomRoutes.js'));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
}

// API Routes
app.get('/api/status', (req, res) => {
  res.json({ status: 'Digital Janta Pro API is running', version: '1.0.0' });
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.roomId || data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

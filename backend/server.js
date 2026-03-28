const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configure Allowed Origins for Both Panels
const allowedOrigins = [
  "http://localhost:3000", // User Panel
  "http://localhost:3001"  // Admin Panel (expected port)
];

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// Configure Global CORS
app.use(cors({
  origin: allowedOrigins,
  credentials: true // Important for cookies/authorization headers
}));
app.use(express.json());

// Routes
const messagesRoute = require('./routes/messages');
const authRoute = require('./routes/auth');
const adminRoute = require('./routes/admin');

// Separate public/user routes from admin routes
app.use('/api', messagesRoute);
app.use('/api/auth', authRoute);
app.use('/api/admin', adminRoute);

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('sendMessage', async (message) => {
    // Save in database
    try {
      const Message = require('./models/Message');
      const saved = await Message.create(message);
      io.emit('receiveMessage', saved);
    } catch (err) {
      console.error('Socket message save error:', err);
      io.emit('receiveMessage', { ...message, error: 'Failed to save message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/oyee';

// Connect to MongoDB and start Server (Consolidated)
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB successfully');
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // We'll restrict this in prod
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const roomRoutes = require('./routes/roomRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Make io accessible in controllers
app.set('io', io);

// Socket.io connection listener
io.on('connection', (socket) => {
  const foodName = socket.handshake.query.foodName || 'Anonymous Food';
  console.log(`User connected: ${foodName} (${socket.id})`);

  socket.on('join_room', (roomName) => {
    socket.join(roomName);
    console.log(`${foodName} joined ${roomName}`);
  });

  socket.on('send_message', async (data) => {
    try {
      const Message = require('./models/Message');
      const newMessage = new Message({
        roomName: data.roomName,
        senderId: data.senderId,
        content: data.content,
      });
      await newMessage.save();

      // Populate sender info before broadcasting
      await newMessage.populate('senderId', 'foodName aura');

      io.to(data.roomName).emit('receive_message', newMessage);
    } catch (err) {
      console.error('Message save error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${foodName}`);
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB and start Server
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

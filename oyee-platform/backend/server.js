const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors=require("cors")
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(cors())
// Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.log('MongoDB connection error:', err));

// Mock data for development
const mockData = {
  users: [
    { _id: '1', username: 'admin', role: 'employee', aura: 1000, tier: 'Starborn', banned: false },
    { _id: '2', username: 'user1', role: 'student', aura: 500, tier: 'Thunder', banned: false }
  ],
  violations: [
    { _id: '1', user: 'user1', message: 'This is spam content', flagged: 'spam', time: new Date() }
  ],
  declarations: [
    { _id: '1', type: 'announcement', title: 'Welcome', message: 'Welcome to Oyeee!', status: 'active' }
  ],
  notifications: [],
  orders: [
    { _id: '1', orderId: 'ORD-001', item: 'T-Shirt', auraCost: 500, user: 'user1', status: 'pending' }
  ],
  rooms: [
    { _id: '1', name: 'WiFi Lounge', type: 'WiFi', activeUsers: 47, status: 'Live', violations: 2 }
  ],
  audits: []
};

console.log('Using mock data for development');

// Middleware
app.use(express.json());

// Routes
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/moderation', require('./routes/moderationRoutes'));
app.use('/api/declarations', require('./routes/declarationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));

// Socket.io
io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
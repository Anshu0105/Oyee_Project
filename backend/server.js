const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const allowedOrigins = [
  'http://localhost:3000',
  'https://oyeee-frontend.pages.dev',
  'https://oyeee.chat'
];

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.pages.dev')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

const io = socketIo(server, {
  cors: corsOptions
});
app.use(express.json());

const messagesRoute = require('./routes/messages');
const detectorRoute = require('./routes/detector');
const authRoute = require('./routes/auth');
const adminRoute = require('./routes/admin');
const roomRoute = require('./routes/rooms');
const dmRoute = require('./routes/dm');
const usersRoute = require('./routes/users');
const trendingRoute = require('./routes/trending');

app.use('/api', messagesRoute);
app.use('/api', detectorRoute);
app.use('/api/auth', authRoute);
app.use('/api/admin', adminRoute);
app.use('/api/rooms', roomRoute);
app.use('/api/dm', dmRoute);
app.use('/api/users', usersRoute);
app.use('/api/trending', trendingRoute);

// Serve Standalone Admin UI Safe Zone
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));

// Serve raw file uploads for unmoderated Direct Messages
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


// Socket.io for real-time segmented chat and DMs
const setupSockets = require('./sockets/socketController');
setupSockets(io);

// MongoDB connection and Server Start
const PORT = process.env.PORT || 5002;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/oyee';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('MongoDB connection error:', err);
});



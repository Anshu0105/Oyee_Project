const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
require('./config/passport'); // Initialize passport config
require('dotenv').config();

const allowedOrigins = [
  "https://oyeee.chat",
  "https://www.oyeee.chat",
  "https://oyeee-frontend.pages.dev",
  "http://localhost:3000"
];

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});
app.set('io', io);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by Void Security (CORS)'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Session Configuration for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'oyeee_void_session_secret_2026',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(passport.initialize());
app.use(passport.session());

const messagesRoute = require('./routes/messages');
const detectorRoute = require('./routes/detector');
const authRoute = require('./routes/auth');
const adminRoute = require('./routes/admin');
const roomRoute = require('./routes/rooms');
const dmRoute = require('./routes/dm');
const usersRoute = require('./routes/users');

app.use('/api', messagesRoute);
app.use('/api', detectorRoute);
app.use('/api/auth', authRoute);
app.use('/api/admin', adminRoute);
app.use('/api/rooms', roomRoute);
app.use('/api/dm', dmRoute);
app.use('/api/users', usersRoute);

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



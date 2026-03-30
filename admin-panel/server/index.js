require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.ADMIN_URL || 'http://localhost:3001', credentials: true }
});

app.use(helmet());
app.use(cors({ origin: process.env.ADMIN_URL || 'http://localhost:3001', credentials: true }));
app.use(express.json());

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// Routes
app.use('/api/admin/analytics', require('./routes/admin/analytics'));
app.use('/api/admin/users',     require('./routes/admin/users'));
app.use('/api/admin/rooms',     require('./routes/admin/rooms'));
app.use('/api/admin/messages',  require('./routes/admin/messages'));
app.use('/api/admin/moderation',require('./routes/admin/moderation'));
app.use('/api/admin/leaderboard',require('./routes/admin/leaderboard'));
app.use('/api/admin/store',     require('./routes/admin/store'));
app.use('/api/admin/aura-log',  require('./routes/admin/auraLog'));
app.use('/api/admin/broadcast', require('./routes/admin/broadcast'));
app.use('/api/admin/settings',  require('./routes/admin/settings'));
app.use('/api/auth',            require('./routes/auth'));

// Pass io to routes that need realtime
app.set('io', io);

io.on('connection', (socket) => {
  console.log('Admin socket connected:', socket.id);
  socket.on('disconnect', () => console.log('Admin socket disconnected:', socket.id));
});

const PORT = process.env.PORT || 5001;
httpServer.listen(PORT, () => console.log(`🚀 Admin server running on port ${PORT}`));

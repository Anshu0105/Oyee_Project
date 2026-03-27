const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const messagesRoute = require('./routes/messages');
app.use('/api', messagesRoute);

// Content Detection API
const ContentDetector = require('./utils/contentDetector');
const detector = new ContentDetector();

app.post('/api/detect', (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ isSafe: false, issues: ['No message provided'] });

  const analysis = detector.analyzeContent(message);

  if (!analysis.isClean) {
    console.log(`[CONTENT MODERATION] Flagged message (${analysis.severity} severity):`);
    analysis.violations.forEach(v => console.log(` - ${v.type}: ${v.message}`));
  }

  return res.json({
    isSafe: analysis.isClean,
    issues: analysis.violations.map(v => v.message)
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oyee', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

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

const PORT = process.env.PORT || 5002;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
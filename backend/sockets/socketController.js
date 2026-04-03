const User = require('../models/User');
const UserActivity = require('../models/UserActivity');
const Message = require('../models/Message');
const DirectMessage = require('../models/DirectMessage');
const moderation = require('../utils/contentDetector');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected to void:', socket.id);

    // Identity Mapping for Presence Tracking
    socket.on('authenticate', async (userId) => {
      socket.userId = userId;
      try {
        await User.findByIdAndUpdate(userId, { isOnline: true, socketId: socket.id });
      } catch(err) { console.error('Socket auth failed', err); }
    });

    // Group Management
    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined isolated room: ${roomId}`);
    });

    socket.on('leaveRoom', (roomId) => {
      socket.leave(roomId);
    });

    // Segmented Public Room Communication (Moderated)
    socket.on('sendMessage', async (messageData) => {
      const roomId = messageData.roomId || 'global';
      const isDM = roomId.startsWith('dm_'); // DM check if any mixed usage
      
      if (isDM) {
          try {
            const saved = await Message.create(messageData);
            // (B) TRACK ACTIVITY FOR HEATMAP
            const today = new Date().toISOString().split('T')[0];
            UserActivity.findOneAndUpdate(
              { userId: messageData.senderId, date: today },
              { $inc: { count: 1 } },
              { upsert: true, new: true }
            ).catch(err => console.error("Activity Track Error:", err));

            io.to(roomId).emit('receiveMessage', saved);
          } catch(err) {}
          return;
      }

      // Moderation Engine for Rooms
      try {
        const moderationResult = await moderation.analyze(messageData.text);

        if (moderationResult.blocked) {
          // Track Violations
          if (socket.userId) {
            const user = await User.findByIdAndUpdate(socket.userId, { $inc: { violationCount: 1 } }, { new: true });
            if (user.violationCount >= 3) {
              await User.findByIdAndUpdate(socket.userId, { isReported: true });
              socket.emit('moderationNotice', { 
                  type: 'CRITICAL', 
                  message: 'Your identity has been reported due to repeated rule violations.' 
              });
            } else {
              socket.emit('moderationNotice', { 
                  type: 'BLOCKED', 
                  message: moderationResult.reason 
              });
            }
          }
          return; // Kill the message
        }

        if (moderationResult.flagged) {
          messageData.flagged = true;
          messageData.flagReason = moderationResult.reason;
          messageData.flaggedAt = new Date();
          socket.emit('moderationNotice', { type: 'WARNING', message: moderationResult.reason });
        }

        const saved = await Message.create(messageData);
        
        // (B) TRACK ACTIVITY FOR HEATMAP
        const today = new Date().toISOString().split('T')[0];
        UserActivity.findOneAndUpdate(
          { userId: socket.userId || messageData.senderId, date: today },
          { $inc: { count: 1 } },
          { upsert: true, new: true }
        ).catch(err => console.error("Activity Track Error:", err));

        io.to(roomId).emit('receiveMessage', saved);
        
        // Notify admins if flagged
        if (messageData.flagged) {
            io.emit('adminAlert', { type: 'FLAGGED_MESSAGE', roomId });
        }
      } catch (err) {
        console.error('Socket moderation error:', err);
        socket.emit('receiveMessage', { ...messageData, error: 'Moderation engine timeout' });
      }
    });

    // Direct Communication (Private, Unmoderated, Supports Files)
    socket.on('sendDirectMessage', async (dmData) => {
      try {
        const savedDM = await DirectMessage.create(dmData);
        const populated = await savedDM.populate('senderId', 'username avatarEmoji auraColor');
        
        // (B) TRACK ACTIVITY FOR HEATMAP
        const today = new Date().toISOString().split('T')[0];
        UserActivity.findOneAndUpdate(
          { userId: dmData.senderId, date: today },
          { $inc: { count: 1 } },
          { upsert: true, new: true }
        ).catch(err => console.error("Activity Track Error:", err));

        // Both users listen to a private unified string
        const peers = [dmData.senderId, dmData.receiverId].sort();
        const dmChannel = `dm_${peers[0]}_${peers[1]}`;
        
        io.to(dmChannel).emit('receiveDirectMessage', populated);
      } catch(err) {
        socket.emit('dmError', 'Delivery failed to peer');
      }
    });

    socket.on('disconnect', async () => {
      console.log('User severed connection:', socket.id);
      if (socket.userId) {
        try {
          await User.findByIdAndUpdate(socket.userId, { 
            isOnline: false, 
            lastActive: new Date() 
          });
        } catch(err) {}
      }
    });
  });
};

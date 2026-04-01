const User = require('../models/User');
const Message = require('../models/Message');
const DirectMessage = require('../models/DirectMessage');

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
      try {
        const saved = await Message.create({
          ...messageData,
          state: 'sent'
        });
        const populated = await saved.populate('sender', 'auraName avatarEmoji auraColor');
        // Only emit to users connected to this exact WiFi/Domain/GPS hash
        io.to(roomId).emit('receiveMessage', populated);
      } catch (err) {
        console.error('Socket partitioned message error:', err);
        socket.emit('receiveMessage', { ...messageData, error: 'Database integrity failed' });
      }
    });

    // Typing Indicators
    socket.on('typing', ({ roomId, userId, auraName }) => {
      socket.to(roomId).emit('userTyping', { userId, auraName });
    });

    socket.on('stopTyping', ({ roomId, userId }) => {
      socket.to(roomId).emit('userStoppedTyping', { userId });
    });

    // Message State Updates (Delivered/Read)
    socket.on('updateMessageState', async ({ messageId, state, roomId }) => {
      try {
        const updated = await Message.findByIdAndUpdate(messageId, { state }, { new: true });
        io.to(roomId).emit('messageStateUpdated', { messageId, state });
      } catch (err) {
        console.error('Failed to update message state', err);
      }
    });

    // Direct Communication (Private, Unmoderated, Supports Files)
    socket.on('sendDirectMessage', async (dmData) => {
      try {
        const savedDM = await DirectMessage.create({
          ...dmData,
          state: 'sent'
        });
        const populated = await savedDM.populate('senderId', 'auraName avatarEmoji auraColor');
        
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

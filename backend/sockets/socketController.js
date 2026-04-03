const User = require('../models/User');
const Message = require('../models/Message');
const DirectMessage = require('../models/DirectMessage');
const Room = require('../models/Room');

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
    socket.on('joinRoom', async (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined isolated room: ${roomId}`);
      
      if (socket.userId && roomId && !roomId.startsWith('dm_') && roomId !== 'global') {
        try {
          await Room.findByIdAndUpdate(roomId, { $addToSet: { members: socket.userId } });
        } catch(err) { console.error('Room DB sync failed:', err.message); }
      }
    });

    socket.on('leaveRoom', async (roomId) => {
      socket.leave(roomId);
      if (socket.userId && roomId && !roomId.startsWith('dm_') && roomId !== 'global') {
        try {
          await Room.findByIdAndUpdate(roomId, { $pull: { members: socket.userId } });
        } catch(err) {}
      }
    });

    // Segmented Public Room Communication (Moderated)
    socket.on('sendMessage', async (messageData) => {
      const roomId = messageData.roomId || 'global';
      try {
        const saved = await Message.create(messageData);
        
        // --- REAL-TIME MENTION LOGIC ---
        const mentionRegex = /@(\w+)/g;
        const matches = [...messageData.content.matchAll(mentionRegex)];
        
        if (matches.length > 0) {
          const mentionedUsernames = [...new Set(matches.map(m => m[1]))];
          
          for (const username of mentionedUsernames) {
            const targetUser = await User.findOne({ username }).select('_id socketId auraName');
            if (targetUser && targetUser._id.toString() !== messageData.userId) {
              const notification = {
                type: 'mention',
                from: messageData.userId,
                message: `${messageData.auraName} tagged you in a room.`,
                roomId: roomId,
                isRead: false
              };
              
              // Persist Notification
              await User.findByIdAndUpdate(targetUser._id, {
                $push: { notifications: { $each: [notification], $slice: -50 } }
              });

              // Push via Socket
              if (targetUser.socketId) {
                io.to(targetUser.socketId).emit('notificationReceived', {
                  ...notification,
                  from: { _id: messageData.userId, auraName: messageData.auraName }
                });
              }
            }
          }
        }
        // ------------------------------

        // Only emit to users connected to this exact WiFi/Domain/GPS hash
        io.to(roomId).emit('receiveMessage', saved);
      } catch (err) {
        console.error('Socket partitioned message error:', err);
        socket.emit('receiveMessage', { ...messageData, error: 'Database integrity failed' });
      }
    });

    // Direct Communication (Private, Unmoderated, Supports Files)
    socket.on('sendDirectMessage', async (dmData) => {
      try {
        const savedDM = await DirectMessage.create(dmData);
        const populated = await savedDM.populate('senderId', 'username avatarEmoji auraColor');
        
        // Both users listen to a private unified string
        const peers = [dmData.senderId, dmData.receiverId].sort();
        const dmChannel = `dm_${peers[0]}_${peers[1]}`;
        
        io.to(dmChannel).emit('receiveDirectMessage', populated);

        // --- NEW: PUSH NOTIFICATION FOR DM ---
        const notification = {
          type: 'dm',
          from: dmData.senderId,
          message: `${populated.senderId.username} sent you a private message.`,
          roomId: `dm_${dmData.senderId}`, // Reference for navigation
          isRead: false
        };

        await User.findByIdAndUpdate(dmData.receiverId, {
          $push: { notifications: { $each: [notification], $slice: -50 } }
        });

        // Push real-time if receiver is online
        const receiver = await User.findById(dmData.receiverId).select('socketId');
        if (receiver && receiver.socketId) {
          io.to(receiver.socketId).emit('notificationReceived', {
            ...notification,
            from: { _id: dmData.senderId, username: populated.senderId.username }
          });
        }
        // --------------------------------------

      } catch(err) {
        console.error('DM emission error:', err);
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
          // Unlink from all DB rooms immediately upon disconnecting
          await Room.updateMany({ members: socket.userId }, { $pull: { members: socket.userId } });
        } catch(err) {}
      }
    });
  });
};

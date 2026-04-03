const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

// Fetch top 100 users for the Public Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const topUsers = await User.find({})
      .sort({ aura: -1 })
      .limit(100)
      .select('_id username auraName aura avatarEmoji equippedBadge weeklyAuraGain');
    res.json(topUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch current user's populated social network (Friends/Enemies)
router.get('/me/social', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'auraName aura avatarEmoji equippedBadge')
      .populate('enemies', 'auraName aura avatarEmoji equippedBadge');
      
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      friends: user.friends,
      enemies: user.enemies
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch detailed metadata for a single user, resolving Mutual Friends graph
router.get('/:id/profile', verifyToken, async (req, res) => {
  try {
    const targetId = req.params.id;
    const observerId = req.user.id;

    const [targetUser, observerUser] = await Promise.all([
      User.findById(targetId).select('-password'),
      User.findById(observerId).select('friends enemies')
    ]);

    if (!targetUser) return res.status(404).json({ error: 'Identity not found in the Void' });

    const targetFriends = targetUser.friends || [];
    const observerFriends = observerUser.friends || [];
    
    const mutualFriends = targetFriends.filter(id => 
      observerFriends.some(oid => oid.toString() === id.toString())
    ).length;

    // Determine current relationship status
    let currentRelation = 'none';
    if (observerFriends.some(oid => oid.toString() === targetId)) currentRelation = 'friend';
    if ((observerUser.enemies || []).some(oid => oid.toString() === targetId)) currentRelation = 'enemy';

    res.json({
      _id: targetUser._id,
      auraName: targetUser.auraName,
      avatarEmoji: targetUser.avatarEmoji,
      equippedBadge: targetUser.equippedBadge,
      aura: targetUser.aura,
      weeklyAuraGain: targetUser.weeklyAuraGain || 0,
      createdAt: targetUser.createdAt,
      lastActive: targetUser.lastActive,
      isOnline: targetUser.isOnline,
      totalFriends: targetFriends.length,
      mutualFriends,
      currentRelation
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle Aura Upvote/Downvote (+1 or -1)
router.post('/aura/:id', verifyToken, async (req, res) => {
  try {
    const targetId = req.params.id;
    const voterId = req.user.id;
    const { type } = req.body; // 'up' or 'down'

    if (targetId === voterId) return res.status(400).json({ error: "Cannot vote for self" });
    if (!['up', 'down'].includes(type)) return res.status(400).json({ error: "Invalid vote type" });

    const [targetUser, voterUser] = await Promise.all([
      User.findById(targetId),
      User.findById(voterId)
    ]);

    if (!targetUser) return res.status(404).json({ error: "Identity not found" });

    // Check if voter already cast a vote for this user
    const existingVote = voterUser.auraVotes.given.find(v => v.userId.toString() === targetId);
    if (existingVote) return res.status(400).json({ error: "Already cast an aura vote for this user" });

    const increment = type === 'up' ? 1 : -1;
    
    // Update target's aura and upvoter's history
    await Promise.all([
      User.findByIdAndUpdate(targetId, { $inc: { aura: increment, weeklyAuraGain: increment } }),
      User.findByIdAndUpdate(voterId, { $push: { 'auraVotes.given': { userId: targetId, type } } })
    ]);

    const io = req.app.get('io');
    io.emit('auraUpdate', { userId: targetId, newAura: targetUser.aura + increment });

    res.json({ success: true, newAura: targetUser.aura + increment });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Create/Update Social Relationship (Friend or Enemy) with cleanup logic
router.post('/relationship/:id', verifyToken, async (req, res) => {
  try {
    const targetId = req.params.id;
    const observerId = req.user.id;
    const { type } = req.body; // 'friend' or 'enemy'

    if (targetId === observerId) return res.status(400).json({ error: "Cannot link to self" });

    const observerUser = await User.findById(observerId);

    if (type === 'friend') {
      if (observerUser.friends.includes(targetId)) return res.status(400).json({ error: "Already friends" });
      
      await Promise.all([
        User.findByIdAndUpdate(observerId, { $addToSet: { friends: targetId }, $pull: { enemies: targetId } }),
        User.findByIdAndUpdate(targetId, { $addToSet: { friends: observerId }, $pull: { enemies: observerId } })
      ]);
    } else if (type === 'enemy') {
       if (observerUser.enemies.includes(targetId)) return res.status(400).json({ error: "Already marked as enemy" });

      await Promise.all([
        User.findByIdAndUpdate(observerId, { $addToSet: { enemies: targetId }, $pull: { friends: targetId } }),
        User.findByIdAndUpdate(targetId, { $addToSet: { enemies: observerId }, $pull: { friends: observerId } })
      ]);
    } else {
      return res.status(400).json({ error: "Invalid relation type" });
    }
    
    res.json({ success: true, message: `Relationship marked as ${type}` });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Update current user's aesthetics (avatar, theme)
router.put('/me/profile', verifyToken, async (req, res) => {
  try {
    const { avatarEmoji, theme } = req.body;
    const updates = {};
    if (avatarEmoji) updates.avatarEmoji = avatarEmoji;
    if (theme) updates.theme = theme;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id, 
      { $set: updates }, 
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user identity and clean up cross-links
router.delete('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Remove from all other users' social graphs
    await User.updateMany(
      { $or: [{ friends: userId }, { enemies: userId }] },
      { $pull: { friends: userId, enemies: userId } }
    );

    // 2. Erase the actual identity
    await User.findByIdAndDelete(userId);

    res.json({ success: true, message: 'Identity permanently erased from the Void.' });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

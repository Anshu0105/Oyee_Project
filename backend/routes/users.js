const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControler');
const { verifyToken } = require('../middleware/auth');

// Fetch top 100 users for the Public Leaderboard
router.get('/leaderboard', userController.getLeaderboard);

// Fetch current user's populated social network (Friends/Enemies)
router.get('/me/social', verifyToken, userController.getSocialNetwork);

// Fetch detailed metadata for a single user
router.get('/:id/profile', verifyToken, userController.getProfile);

// Create/Update Social Relationship (Friend or Enemy)
router.post('/relationship/:id', verifyToken, userController.updateRelationship);

// Delete user identity
router.delete('/me', verifyToken, userController.deleteIdentity);

// Update user aura and auraCount
router.post('/me/aura', verifyToken, userController.updateUserAura);

module.exports = router;

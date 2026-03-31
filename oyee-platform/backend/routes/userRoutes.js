const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const chatController = require('../controllers/chatController');
const economyController = require('../controllers/economyController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.get('/messages/:roomId', authenticate, chatController.getMessages);
router.post('/messages', authenticate, chatController.sendMessage);
router.get('/aura', authenticate, economyController.getAuraPoints);
router.post('/purchase', authenticate, economyController.purchaseItem);

module.exports = router;
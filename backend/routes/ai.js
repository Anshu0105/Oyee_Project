const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { verifyToken } = require('../middleware/auth');

// Summary of the current room (last 1 hour)
router.get('/summarize/:roomId', verifyToken, aiController.summarizeRoom);

// General room recommendations (trending/nearby/wifi)
router.get('/recommendations', verifyToken, aiController.getRecommendations);

module.exports = router;

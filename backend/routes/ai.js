const express = require('express');
const router = express.Router();
// Assuming you have an auth middleware
const auth = (req, res, next) => next(); 

const aiController = require('../controllers/aiController');

// Summarize chat room by ID
// Endpoint: GET /api/ai/summarize/:roomId
router.get('/summarize/:roomId', auth, aiController.summarizeRoom);

module.exports = router;

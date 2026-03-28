const express = require('express');
const router = express.Router();
const { getMessages, postMessage } = require('../controllers/messageController');

router.get('/messages', getMessages);
router.post('/messages', postMessage);

module.exports = router;
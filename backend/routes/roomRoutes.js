const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const { getRooms, getRoomMessages, voteMessage } = require('../controllers/roomController');

router.use(authMiddleware);

router.get('/', getRooms);
router.get('/:roomName/messages', getRoomMessages);
router.post('/messages/:messageId/aura', voteMessage);

module.exports = router;

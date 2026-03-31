const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.get('/nearby', roomController.getNearbyRooms);
router.get('/', roomController.getRooms);
router.patch('/:id/status', roomController.updateRoomStatus);
router.delete('/:id', roomController.deleteRoom);

module.exports = router;

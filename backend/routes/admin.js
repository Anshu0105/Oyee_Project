const express = require('express');
const router = express.Router();
const { getAllUsers, getStats } = require('../controllers/adminController');
const { isAdmin } = require('../middleware/auth');

router.get('/users', isAdmin, getAllUsers);
router.get('/stats', isAdmin, getStats);

module.exports = router;

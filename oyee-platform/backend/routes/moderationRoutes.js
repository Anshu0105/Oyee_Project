const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderationController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/violations', authenticate, moderationController.getViolations);
router.post('/violations', authenticate, moderationController.addViolation);

module.exports = router;
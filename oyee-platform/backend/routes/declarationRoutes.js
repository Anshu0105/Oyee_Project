const express = require('express');
const router = express.Router();
const declarationController = require('../controllers/declarationController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/declarations', authenticate, declarationController.getDeclarations);
router.post('/declarations', authenticate, declarationController.createDeclaration);

module.exports = router;
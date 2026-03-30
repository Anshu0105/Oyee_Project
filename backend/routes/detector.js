const express = require('express');
const ContentDetector = require('../utils/contentDetector');
const router = express.Router();

const detector = new ContentDetector();

/**
 * @route POST /api/detect
 * @desc Detect violations in a message
 * @access Public
 */
router.post('/detect', (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ isSafe: true, issues: [] });
  }

  const result = detector.analyzeContent(message);

  // LOGGING (Bonus Requirement)
  if (!result.isSafe) {
    console.warn(`[VIOLATION] [${new Date().toISOString()}] Flagged message: "${message}"`);
    console.warn(`[REASON] ${result.issues.join(', ')}`);
  }

  res.json({
    isSafe: result.isSafe,
    issues: result.issues
  });
});

module.exports = router;

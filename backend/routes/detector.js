const express = require('express');
const ContentDetector = require('../utils/contentDetector');
const router = express.Router();

const detector = ContentDetector;

/**
 * @route POST /api/detect
 * @desc Detect violations in a message
 * @access Public
 */
router.post('/detect', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ isSafe: true, issues: [] });
  }

  const result = await detector.analyze(message);

  // LOGGING (Migration)
  if (result.blocked || result.flagged) {
    console.warn(`[VIOLATION] [${new Date().toISOString()}] Flagged: "${message}" REASON: ${result.reason}`);
  }

  res.json({
    isSafe: !result.blocked,
    issues: result.reason ? [result.reason] : []
  });
});

module.exports = router;

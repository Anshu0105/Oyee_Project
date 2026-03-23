/**
 * Quick Integration Checklist for OYEE
 * Copy & paste these additions to your index.html
 */

/*
============================================================
STEP 1: Add these files before closing </head>
============================================================
*/

// Add to your <head> section:
/*
  <link rel="stylesheet" href="oyee-moderation-styles.css">
*/

// Add before </body>:
/*
  <script src="content-detector.js"></script>
  <script src="detector-integration.js"></script>
  <script src="oyee-moderation-ui.js"></script>
*/

/*
============================================================
STEP 2: CSS Additions (oyee-moderation-styles.css)
============================================================
*/

`
/* Moderation UI Styles for OYEE */

/* Violation message styling */
.violation-msg {
  background: rgba(196, 40, 80, 0.08);
  border: 1px solid rgba(196, 40, 80, 0.4);
  padding: 12px 18px;
  font-family: var(--fm);
  font-size: 11px;
  color: var(--wine3);
  letter-spacing: 2px;
  animation: shake 0.4s ease;
  font-weight: 700;
  margin: 10px 0 0 0;
  border-radius: 3px;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
  50% { transform: translateX(5px); }
}

/* Real-time detection warning inline */
.detection-warning {
  padding: 10px 16px;
  background: rgba(196, 40, 80, 0.1);
  border-left: 3px solid var(--wine3);
  margin: 10px 0;
  font-size: 12px;
  color: var(--w3);
  animation: slideUp 0.3s ease;
  border-radius: 3px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--fm);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced warning modal background */
.warning-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

/* Flagged messages - subtle indicator */
.msg-bubble.flagged {
  border-left-width: 4px;
  border-left-color: var(--wine3);
  background: rgba(140, 26, 48, 0.15);
}

.msg-bubble.flagged.critical {
  border-left-color: #d43a60;
  background: rgba(212, 58, 96, 0.15);
}

/* Input field when detecting issues */
.chat-input.violation-detected {
  border-color: var(--wine3);
  box-shadow: 0 0 8px rgba(196, 40, 80, 0.2);
}

.chat-input.violation-critical {
  border-color: #d43a60;
  box-shadow: 0 0 12px rgba(212, 58, 96, 0.3);
}

/* Moderation indicator badge */
.mod-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: rgba(196, 40, 80, 0.15);
  border: 1px solid rgba(196, 40, 80, 0.3);
  border-radius: 3px;
  font-size: 10px;
  color: var(--wine3);
  font-family: var(--fm);
  font-weight: 700;
}

.mod-badge.critical {
  background: rgba(212, 58, 96, 0.2);
  border-color: rgba(212, 58, 96, 0.5);
  color: #d43a60;
}

/* Risk indicator bar */
.risk-indicator {
  height: 3px;
  background: var(--gray2);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
}

.risk-fill {
  height: 100%;
  transition: width 0.3s ease, background 0.3s ease;
  background: linear-gradient(90deg, var(--wine), var(--wine3));
}

.risk-fill.low { width: 25%; background: green; }
.risk-fill.medium { width: 50%; background: #f0d080; }
.risk-fill.high { width: 75%; background: #c42850; }
.risk-fill.critical { width: 100%; background: #d43a60; }
`;

/*
============================================================
STEP 3: How to use in your existing code
============================================================
*/

// Example: In your message send handler
function handleChatSend() {
  // Get message from input (your code)
  const messageText = document.querySelector('.chat-input').value.trim();

  // Use detector to validate (NEW)
  const detector = new ContentDetector();
  const analysis = detector.analyzeContent(messageText);

  // Handle violations
  if (!analysis.isClean) {
    if (analysis.severity === 'critical') {
      // BLOCK critical content
      alert('Cannot send: ' + analysis.violations[0].message);
      return;
    }
    
    // Show warning
    showWarning(analysis.violations[0].message);
  }

  // Send message (your existing code)
  // this.sendMessage(messageText);
}

/*
============================================================
STEP 4: Option - Use API endpoint for server validation
============================================================
*/

// Create a backend endpoint (Node.js example):
/*
const ContentDetector = require('./content-detector.js');
const detector = new ContentDetector();

app.post('/api/messages', (req, res) => {
  const { text, userId, roomId } = req.body;
  
  // Server-side validation (most important!)
  const analysis = detector.analyzeContent(text);
  
  // Block critical violations
  if (analysis.severity === 'CRITICAL') {
    return res.status(400).json({
      success: false,
      error: 'Message contains prohibited content',
      violations: analysis.violations
    });
  }
  
  // Log violations for moderation
  if (!analysis.isClean) {
    logViolation(userId, analysis);
  }
  
  // Save message
  const message = {
    id: Date.now(),
    text: text,
    userId: userId,
    roomId: roomId,
    timestamp: new Date(),
    analysisMetadata: {
      violations: analysis.violations,
      riskScore: analysis.riskScore
    }
  };
  
  saveMessage(message);
  broadcastMessage(message);
  
  res.json({ success: true, message });
});
*/

/*
============================================================
STEP 5: Testing in browser console
============================================================
*/

// After any of the scripts load, test with:
/*
// Create detector and test
const detector = new ContentDetector();

// Test 1: Clean message
detector.analyzeContent("Hello everyone!");
// → { isClean: true, violations: [], ... }

// Test 2: Phone number
detector.analyzeContent("Call me at 555-123-4567");
// → { isClean: false, severity: 'critical', ... }

// Test 3: Offensive content
detector.analyzeContent("I HATE THIS!!!!!!");
// → { isClean: false, severity: 'high', ... }

// Get stats
detector.getStats();

// See console output for results
*/

/*
============================================================
STEP 6: Customization Examples
============================================================
*/

// Add Indian phone number detection:
/*
addCustomPatterns('indianPhone', /\b[6-9]\d{9}\b/g);

// Add Aadhaar detection:
addCustomPatterns('aadhaar', /\b\d{4}\s\d{4}\s\d{4}\b/g);

// Add PAN card detection:
addCustomPatterns('pan', /[A-Z]{5}[0-9]{4}[A-Z]{1}/g);

// Add custom offensive words for your community:
addCustomOffensiveWords([
  'your_custom_word_1',
  'your_custom_word_2',
  'community_specific_term'
]);
*/

/*
============================================================
STEP 7: Full HTML Integration Example
============================================================
*/

/*
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>OYEE — Open Anonymous Chat</title>
  <!-- Your existing styles -->
  <link href="styles.css" rel="stylesheet">
  <!-- Add moderation styles -->
  <link href="oyee-moderation-styles.css" rel="stylesheet">
</head>
<body>
  <!-- Your existing HTML ---->
  
  <!-- Your existing scripts -->
  <script src="your-chat.js"></script>
  
  <!-- ADD THESE: Moderation system -->
  <script src="content-detector.js"></script>
  <script src="detector-integration.js"></script>
  <script src="oyee-moderation-ui.js"></script>
  
  <!-- Initialize moderation (optional, oyee-moderation-ui.js does this automatically) -->
  <script>
    console.log('Moderation system loaded');
    console.log(window.OyeeModeration); // Available for testing
  </script>
</body>
</html>
*/

/*
============================================================
STEP 8: Monitoring violations in real-time
============================================================
*/

// Track user violations
/*
const tracker = new UserViolationTracker();

// When violation detected:
tracker.recordViolation(userId, violation);

// Get user stats:
const stats = tracker.getViolationStats(userId);
console.log(stats);
// {
//   totalViolations: 5,
//   byType: { PHONE_NUMBER: 2, OFFENSIVE_CONTENT: 3 },
//   bySeverity: { CRITICAL: 2, HIGH: 3 }
// }

// Check if user should be warned:
if (stats.totalViolations > 3) {
  showUserWarning(userId);
}

if (stats.totalViolations > 10) {
  suspendUser(userId);
}
*/

/*
============================================================
STEP 9: Exporting for server-side use
============================================================
*/

// If using Node.js backend, add to content-detector.js:
/*
// At the end of the file:
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ContentDetector;
}
*/

// Then in Node.js:
/*
const ContentDetector = require('./content-detector.js');
const detector = new ContentDetector();

// Use on backend
const analysis = detector.analyzeContent(userMessage);
*/

export default {
  setupGuide: `
    # OYEE Content Detection - Setup Guide
    
    1. Add content-detector.js to project
    2. Add detector-integration.js to project
    3. Add oyee-moderation-ui.js to project
    4. Add oyee-moderation-styles.css to project
    5. Load scripts in HTML before closing body tag
    6. Test with: detector = new ContentDetector()
    
    That's it! Detection happens automatically.
  `,

  files: {
    detector: 'content-detector.js',
    integration: 'detector-integration.js',
    ui: 'oyee-moderation-ui.js',
    styles: 'oyee-moderation-styles.css',
    guide: 'IMPLEMENTATION.md'
  },

  features: {
    detection: [
      'Phone numbers (10-14 digits)',
      'Email addresses',
      'Credit card numbers',
      'IP addresses',
      'Social Security Numbers',
      'Sensitive keywords',
      'Offensive content',
      'External URLs',
      'Spam patterns'
    ],

    severityLevels: [
      'CRITICAL - Block message (contact info, financial data)',
      'HIGH - Warn user (offensive content)',
      'MEDIUM - Advisory (suspicious patterns)',
      'LOW - Informational (caps, spam)'
    ],

    integrations: [
      'Real-time as-user-types validation',
      'Pre-send client-side validation',
      'Server-side validation (recommended)',
      'Violation tracking & analytics',
      'User suspension logic',
      'Moderation queue'
    ]
  },

  testCases: [
    {
      input: "Hey there!",
      expected: "CLEAN"
    },
    {
      input: "Call me at 555-123-4567",
      expected: "CRITICAL - Phone number detected"
    },
    {
      input: "Email: test@example.com",
      expected: "CRITICAL - Email detected"
    },
    {
      input: "I HATE YOU!!!!!!",
      expected: "HIGH - Offensive content + spam pattern"
    },
    {
      input: "Visit http://suspicious.com",
      expected: "MEDIUM - External URL"
    }
  ]
};

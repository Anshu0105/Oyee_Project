/**
 * Integration Guide - How to use ContentDetector in OYEE Chat
 */

// ============================================================
// 1. INITIALIZE DETECTOR IN YOUR APP
// ============================================================

const detector = new ContentDetector();

// ============================================================
// 2. CLIENT-SIDE VALIDATION (Show warnings before sending)
// ============================================================

function validateBeforeSending(messageText) {
  // Analyze the message
  const analysis = detector.analyzeContent(messageText);

  if (!analysis.isClean) {
    // Show violation warning to user
    showViolationWarning(analysis);
    
    // Return analysis result
    return analysis;
  }

  return { isClean: true };
}

/**
 * Display warning to user with violation details
 */
function showViolationWarning(analysis) {
  const violationMsg = document.querySelector('.violation-msg') || createViolationElement();
  
  // Build warning message
  let warningHTML = '<strong>⚠️ Content Warning:</strong> ';
  analysis.violations.forEach(v => {
    warningHTML += `<div>${v.message}</div>`;
  });

  violationMsg.innerHTML = warningHTML;
  violationMsg.style.display = 'block';

  // Add severity-based styling
  if (analysis.severity === 'critical') {
    violationMsg.style.borderLeftColor = '#d43a60';
    violationMsg.style.background = 'rgba(212, 58, 96, 0.15)';
  } else if (analysis.severity === 'high') {
    violationMsg.style.borderLeftColor = '#c42850';
  }

  // Auto-hide after 5 seconds or on message change
  setTimeout(() => {
    violationMsg.style.display = 'none';
  }, 5000);
}

function createViolationElement() {
  const elem = document.createElement('div');
  elem.className = 'violation-msg';
  elem.style.display = 'none';
  document.querySelector('.chat-input-row').appendChild(elem);
  return elem;
}

// ============================================================
// 3. HOOK INTO SEND BUTTON
// ============================================================

document.querySelector('.send-btn').addEventListener('click', function() {
  const messageInput = document.querySelector('.chat-input');
  const messageText = messageInput.value.trim();

  // Validate before sending
  const validation = validateBeforeSending(messageText);

  // Allow sending, but flag if violations exist
  if (validation.isClean) {
    // Safe to send
    sendMessage(messageText);
  } else {
    // Show warning but allow user to choose
    console.warn('Content violations detected:', validation);
    
    // Only block CRITICAL severity messages
    if (validation.severity === 'critical') {
      alert('Cannot send message - critical content violations detected. ' + 
            validation.violations.map(v => v.message).join('\n'));
      return;
    }
    
    // For HIGH/MEDIUM, show warning but allow resend
    const shouldSend = confirm(
      'Your message contains: ' + validation.violations.map(v => v.type).join(', ') +
      '\n\nSend anyway?'
    );

    if (shouldSend) {
      sendMessage(messageText);
    }
  }
});

// ============================================================
// 4. REAL-TIME VALIDATION AS USER TYPES
// ============================================================

document.querySelector('.chat-input').addEventListener('input', function(e) {
  const text = e.target.value;

  if (text.length > 5) {
    const analysis = detector.analyzeContent(text);
    
    // Show live feedback
    if (!analysis.isClean) {
      // Add subtle border color change
      e.target.style.borderColor = analysis.severity === 'critical' 
        ? '#d43a60' : '#c42850';

      // Show quick preview
      showQuickWarning(analysis.violations[0]);
    } else {
      e.target.style.borderColor = 'var(--gray2)';
    }
  }
});

function showQuickWarning(violation) {
  // Show a small tooltip or inline warning
  console.log('⚠️ Warning:', violation.message);
}

// ============================================================
// 5. SERVER-SIDE VALIDATION (Node.js/Express Example)
// ============================================================

/*
// Backend validation (much more secure!)
app.post('/api/send-message', (req, res) => {
  const { message } = req.body;
  const detector = new ContentDetector();
  
  // Analyze on server side
  const analysis = detector.analyzeContent(message);

  // CRITICAL violations - BLOCK the message
  if (analysis.severity === 'CRITICAL') {
    return res.status(400).json({
      success: false,
      error: 'Message blocked due to critical content violations',
      violations: analysis.violations
    });
  }

  // Log violations for moderation
  if (!analysis.isClean) {
    console.log('Violation detected:', {
      userId: req.user.id,
      messageId: Date.now(),
      violations: analysis.violations,
      riskScore: analysis.riskScore
    });

    // Could flag for human review or apply penalties
    if (analysis.riskScore > 70) {
      // Flag user account for review
      flagUserForReview(req.user.id, analysis);
    }
  }

  // Save message with analysis metadata
  const messageData = {
    text: message,
    userId: req.user.id,
    analysis: {
      violations: analysis.violations,
      riskScore: analysis.riskScore,
      timestamp: new Date()
    }
  };

  return res.json({ success: true, message: messageData });
});
*/

// ============================================================
// 6. BATCH MESSAGE PROCESSING (For moderation)
// ============================================================

async function processMessagesForModeration(messages) {
  const flaggedMessages = [];

  messages.forEach(msg => {
    const analysis = detector.analyzeContent(msg.text);

    if (!analysis.isClean) {
      flaggedMessages.push({
        messageId: msg.id,
        text: msg.text,
        analysis: analysis,
        flaggedAt: new Date(),
        requiresReview: analysis.severity === 'critical' || analysis.riskScore > 80
      });
    }
  });

  return flaggedMessages;
}

// ============================================================
// 7. USER STATISTICS AND MONITORING
// ============================================================

class UserViolationTracker {
  constructor() {
    this.violationHistory = new Map();
  }

  recordViolation(userId, violation) {
    if (!this.violationHistory.has(userId)) {
      this.violationHistory.set(userId, []);
    }

    this.violationHistory.get(userId).push({
      type: violation.type,
      severity: violation.severity,
      timestamp: new Date()
    });

    // Check if user should be warned or suspended
    this.checkUserStatus(userId);
  }

  checkUserStatus(userId) {
    const violations = this.violationHistory.get(userId) || [];
    const recentViolations = violations.filter(v => 
      new Date() - v.timestamp < 3600000 // Last hour
    );

    if (recentViolations.length > 5) {
      console.warn(`User ${userId} has ${recentViolations.length} violations in 1 hour`);
      // Could trigger: warning, account suspension, etc.
    }
  }

  getViolationStats(userId) {
    const violations = this.violationHistory.get(userId) || [];
    return {
      totalViolations: violations.length,
      byType: violations.reduce((acc, v) => {
        acc[v.type] = (acc[v.type] || 0) + 1;
        return acc;
      }, {}),
      bySeverity: violations.reduce((acc, v) => {
        acc[v.severity] = (acc[v.severity] || 0) + 1;
        return acc;
      }, {})
    };
  }
}

const tracker = new UserViolationTracker();

// ============================================================
// 8. CUSTOM DETECTION FOR YOUR COMMUNITY
// ============================================================

// Add more offensive words specific to your community
function addCustomOffensiveWords(words) {
  words.forEach(word => detector.offensiveWords.add(word.toLowerCase()));
}

// Add patterns specific to your region
function addCustomPatterns(patternName, regex) {
  detector.contactPatterns[patternName] = regex;
}

// Example usage:
// addCustomOffensiveWords(['word1', 'word2', 'word3']);
// addCustomPatterns('indianPhone', /\b[6-9]\d{9}\b/g);

// ============================================================
// 9. TESTING THE DETECTOR
// ============================================================

function testDetector() {
  const testCases = [
    "Hey! How are you?",  // Clean
    "Call me at 555-123-4567",  // Phone number (CRITICAL)
    "Email me: john@example.com",  // Email (CRITICAL)
    "I HATE THIS!!!!!!",  // Offensive + spam (HIGH)
    "Password: mySecure123",  // Sensitive data (HIGH)
    "Visit http://malicious.com",  // Suspicious link (MEDIUM)
    "HELLO FRIEND",  // Excessive caps (LOW)
  ];

  console.log('Testing ContentDetector...\n');
  testCases.forEach(test => {
    const result = detector.analyzeContent(test);
    console.log(`Message: "${test}"`);
    console.log(`Result:`, result);
    console.log('---');
  });
}

// Run tests in console
// testDetector();

// ============================================================
// 10. ENABLING/DISABLING DETECTION RULES
// ============================================================

class ContentDetectorConfig {
  constructor() {
    this.rulesEnabled = {
      phone: true,
      email: true,
      creditCard: true,
      offensive: true,
      urls: true,
      caps: false, // Usually too aggressive
      spam: true
    };
  }

  toggleRule(ruleName, enabled) {
    this.rulesEnabled[ruleName] = enabled;
  }

  getActiveRules() {
    return Object.keys(this.rulesEnabled).filter(r => this.rulesEnabled[r]);
  }
}

const config = new ContentDetectorConfig();

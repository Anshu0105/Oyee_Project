# OYEE Content Detection System - Implementation Guide

## Overview
Complete AI-powered content detection system for OYEE chat to detect:
- **Contact Information** (phone numbers, emails, addresses, financial data)
- **Sensitive Data** (passwords, API keys, social security numbers, IP addresses)
- **Offensive Content** (profanity, hate speech, harassment)

---

## 📁 Files Included

1. **content-detector.js** - Core detection engine
2. **detector-integration.js** - Integration examples and usage patterns
3. **IMPLEMENTATION.md** - Detailed setup guide (this file)

---

## 🚀 Quick Start

### Step 1: Add to Your HTML
```html
<script src="content-detector.js"></script>
<script src="detector-integration.js"></script>
```

### Step 2: Initialize
```javascript
const detector = new ContentDetector();

// Test it
const analysis = detector.analyzeContent("Call me at 555-123-4567");
console.log(analysis);
// Output: 
// {
//   isClean: false,
//   violations: [...],
//   severity: "critical",
//   riskScore: 95
// }
```

### Step 3: Implement Validation
```javascript
// Client-side validation before sending
document.querySelector('.send-btn').addEventListener('click', function() {
  const message = document.querySelector('.chat-input').value;
  const validation = validateBeforeSending(message);
  
  if (validation.isClean) {
    sendMessage(message);
  } else {
    showViolationWarning(validation);
  }
});
```

---

## 🎯 Implementation Patterns

### Pattern 1: Warn Before Send
User sees warning but can still send. Good for false positives.
```javascript
function handleMessageSend(text) {
  const analysis = detector.analyzeContent(text);
  
  if (!analysis.isClean) {
    if (analysis.severity === 'critical') {
      // Block completely
      alert('Cannot send - critical violations detected');
      return;
    }
    // Warn but allow user choice
    const proceed = confirm(analysis.violations[0].message + '\n\nSend anyway?');
    if (!proceed) return;
  }
  
  sendMessage(text);
}
```

### Pattern 2: Real-Time As-You-Type Feedback
```javascript
const input = document.querySelector('.chat-input');

input.addEventListener('input', function(e) {
  const analysis = detector.analyzeContent(e.target.value);
  
  // Visual feedback
  if (!analysis.isClean) {
    e.target.style.borderColor = '#d43a60'; // Red
  } else {
    e.target.style.borderColor = 'var(--gray2)';
  }
});
```

### Pattern 3: Server-Side Validation (Recommended)
Most secure - server can't be bypassed
```javascript
// Frontend sends message
async function sendMessage(text) {
  const response = await fetch('/api/send-message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: text })
  });

  const result = await response.json();
  
  if (!result.success) {
    showError(result.violations);
    return;
  }
  
  // Message sent successfully
  displayMessage(result.message);
}
```

```javascript
// Backend (Node.js/Express)
const ContentDetector = require('./content-detector.js');
const detector = new ContentDetector();

app.post('/api/send-message', (req, res) => {
  const { message } = req.body;
  const analysis = detector.analyzeContent(message);

  // CRITICAL = BLOCK
  if (analysis.severity === 'CRITICAL') {
    return res.status(400).json({
      success: false,
      error: 'Message blocked',
      violations: analysis.violations
    });
  }

  // Save and broadcast
  saveMessage(req.user.id, message, analysis);
  broadcastMessage(message);

  res.json({ success: true, message });
});
```

---

## 🔍 Detection Types Reference

### CRITICAL Violations (Block message)
| Type | Pattern | Example |
|------|---------|---------|
| PHONE_NUMBER | 10-14 digit patterns | 555-123-4567, +1234567890 |
| EMAIL_ADDRESS | user@domain.com | john@example.com |
| CREDIT_CARD | Card number patterns | 4532-1234-5678-9010 |
| IP_ADDRESS | 0.0.0.0 format | 192.168.1.1 |
| SSN | Social Security Number | 123-45-6789 |

### HIGH Violations (Warn user)
| Type | Description |
|------|-------------|
| OFFENSIVE_CONTENT | Profanity, hate speech |
| SENSITIVE_KEYWORDS | "password", "api key", "banking" |

### MEDIUM Violations (Advisory)
| Type | Example |
|------|---------|
| EXTERNAL_LINK | http://..., https://... |
| SPAM_PATTERN | "hhhhheeeeeelloooo" (repetition) |

### LOW Violations (Informational)
| Type | Example |
|------|---------|
| EXCESSIVE_CAPS | "HELLO FRIEND" (>50% caps) |

---

## ⚙️ Configuration

### Add Custom Offensive Words
```javascript
// Add words specific to your community
addCustomOffensiveWords([
  'custom_offensive_word_1',
  'custom_offensive_word_2'
]);
```

### Add Regional Patterns
```javascript
// India: Detect Aadhaar number
addCustomPatterns('aadhaar', /\b\d{4}\s\d{4}\s\d{4}\b/g);

// India: Detect PAN
addCustomPatterns('pan', /[A-Z]{5}[0-9]{4}[A-Z]{1}/g);
```

### Toggle Detection Rules
```javascript
const config = new ContentDetectorConfig();

// Disable excessive caps detection (too aggressive)
config.toggleRule('caps', false);

// Disable URLs (spam filtering)
// config.toggleRule('urls', false);
```

---

## 📊 Monitoring & Analytics

### Track User Violations
```javascript
const tracker = new UserViolationTracker();

// Record when user violates
tracker.recordViolation(userId, violation);

// Check user status
const stats = tracker.getViolationStats(userId);
console.log(stats);
// {
//   totalViolations: 5,
//   byType: { OFFENSIVE_CONTENT: 3, PHONE_NUMBER: 2 },
//   bySeverity: { HIGH: 3, CRITICAL: 2 }
// }
```

### Batch Processing (Content Moderation)
```javascript
// Check multiple messages for violations
const messages = await getMessageHistory(roomId);
const flagged = await processMessagesForModeration(messages);

// Review flagged messages
flagged.forEach(msg => {
  if (msg.requiresReview) {
    addToModerationQueue(msg);
  }
});
```

---

## 🛡️ Security Best Practices

### ✅ DO:
1. **Use server-side validation** - Never trust client-side only
2. **Log violations** - Track patterns for moderation
3. **Block CRITICAL violations** - Phone numbers, emails, etc.
4. **Implement rate limiting** - Prevent spam detection bypass
5. **Store analysis metadata** - For audit trails
6. **Update offensive word list** - Keep current with community
7. **Use HTTPS** - Secure transmission of messages

### ❌ DON'T:
1. Only validate on client-side
2. Log user messages with sensitive data
3. Allow CRITICAL violations through
4. Publicly show what was blocked (prevents learnings)
5. Use generic default lists only
6. Forget GDPR compliance for EU users
7. Store raw messages if flagged

---

## 🚨 Risk Scoring Explained

**0-25**: Low risk (minor caps, links)
**26-50**: Medium risk (suspicious patterns, spam)
**51-75**: High risk (offensive content, sensitive keywords)
**76-100**: Critical risk (contact info, financial data)

---

## 📡 Advanced: Using Third-Party APIs (Recommended for Production)

For more advanced detection, consider:

### 1. **Perspective API** (Google) - Offensive Content
```javascript
async function checkToxicity(text) {
  const response = await fetch('https://commentanalyzer.googleapis.com/v1/comments:analyzeComment', {
    method: 'POST',
    body: JSON.stringify({
      comment: { text: text },
      languages: ['en'],
      requestedAttributes: {
        TOXICITY: {},
        SEVERE_TOXICITY: {},
        PROFANITY: {},
        HATE_SPEECH: {}
      }
    })
  });
}
```

### 2. **OpenAI Moderation API** - Content Safety
```javascript
async function checkWithOpenAI(text) {
  const response = await fetch('https://api.openai.com/v1/moderations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ input: text })
  });
  
  const data = await response.json();
  return data.results[0].flagged;
}
```

### 3. **AWS Rekognition** - Content Classification
### 4. **Clarifai** - AI content moderation
### 5. **TensorFlow.js** - Local ML model (no backend needed)

---

## 🧪 Testing

### Run Built-in Tests
```javascript
testDetector();

// Console output example:
// Testing ContentDetector...
// Message: "Hey! How are you?"
// Result: { isClean: true, violations: [], severity: null, riskScore: 0 }
// ---
// Message: "Call me at 555-123-4567"
// Result: { isClean: false, violations: [...], severity: "critical", riskScore: 95 }
```

### Unit Test Examples
```javascript
// Custom tests
function runCustomTests() {
  const tests = [
    { input: "Clean message", expectClean: true },
    { input: "Email: test@mail.com", expectClean: false },
    { input: "I hate you!!!", expectClean: false },
  ];

  tests.forEach(test => {
    const result = detector.analyzeContent(test.input);
    const pass = result.isClean === test.expectClean;
    console.log(`${pass ? '✅' : '❌'} ${test.input}`);
  });
}
```

---

## 🔄 Workflow Diagram

```
User Types Message
        ↓
Real-time Validation (Input event)
        ↓
Visual Feedback (Border color, tooltip)
        ↓
User Clicks Send
        ↓
Client-side Full Validation
        ↓
↳ CRITICAL → Block + Show Error
↳ HIGH → Warn + Ask Confirmation
↳ MEDIUM/LOW → Allow with logging
        ↓
Server-side Re-validation (Server validates again!)
        ↓
↳ CRITICAL → Block + Log incident
↳ Else → Save + Broadcast
        ↓
Track User Violations
        ↓
Flag for Review if threshold exceeded
```

---

## 📝 Integration with Your Chat HTML

Add this to your **index.html** right before closing `</body>`:

```html
<!-- Content Detection System -->
<script src="content-detector.js"></script>
<script src="detector-integration.js"></script>

<script>
  // Initialize on page load
  document.addEventListener('DOMContentLoaded', function() {
    const detector = new ContentDetector();
    
    // Attach to send button
    const sendBtn = document.querySelector('.send-btn');
    sendBtn.addEventListener('click', function() {
      const messageInput = document.querySelector('.chat-input');
      const text = messageInput.value.trim();
      
      if (!text) return;
      
      // Validate
      const analysis = detector.analyzeContent(text);
      
      if (!analysis.isClean && analysis.severity === 'critical') {
        showViolationWarning(analysis);
        return;
      }
      
      // Send if clean or confirmed
      if (analysis.isClean) {
        sendMessage(text);
      }
    });
  });
</script>
```

---

## 🎓 Example: Complete Implementation

```javascript
// Complete working example
class ChatWithDetection {
  constructor() {
    this.detector = new ContentDetector();
    this.tracker = new UserViolationTracker();
  }

  async sendMessage(userId, text) {
    // Step 1: Client-side analysis
    const clientAnalysis = this.detector.analyzeContent(text);
    
    if (!clientAnalysis.isClean) {
      console.warn('Client detected violations:', clientAnalysis.violations);
      
      // For CRITICAL - don't even send
      if (clientAnalysis.severity === 'critical') {
        this.showError('Cannot send: ' + clientAnalysis.violations[0].message);
        return false;
      }
    }

    // Step 2: Send to server (server will re-validate)
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text,
          userId: userId,
          clientAnalysis: clientAnalysis
        })
      });

      const result = await response.json();

      if (result.success) {
        this.displayMessage(result.message);
        return true;
      } else {
        this.showError(result.error);
        this.tracker.recordViolation(userId, result.violations[0]);
        return false;
      }
    } catch (error) {
      console.error('Send failed:', error);
      return false;
    }
  }

  showError(message) {
    // Show error to user
    console.error(message);
  }

  displayMessage(message) {
    // Display in chat
    console.log('Message sent:', message);
  }
}

// Usage
const chat = new ChatWithDetection();
// await chat.sendMessage(userId, messageText);
```

---

## 📞 Support & Customization

For questions or custom implementations:
1. Expand the `offensiveWords` Set with your community's terms
2. Add regional patterns with `addCustomPatterns()`
3. Adjust severity thresholds for your moderation policy
4. Integrate with external APIs for enhanced detection
5. Add logging to track patterns over time

---

## 📄 License & Credits

Created for OYEE - Anonymous Chat Application
Built with vanilla JavaScript (no dependencies)

---

**Last Updated:** March 2026
**Version:** 1.0

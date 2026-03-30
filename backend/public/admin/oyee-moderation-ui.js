/**
 * OYEE Chat - Content Detection Integration (HTML/CSS specific)
 * This integrates with your existing OYEE HTML structure
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize detector
  const detector = new ContentDetector();
  
  // ============================================================
  // 1. ATTACH DETECTOR TO SEND BUTTON
  // ============================================================
  
  const sendBtn = document.querySelector('.send-btn');
  const chatInput = document.querySelector('.chat-input');
  const chatInputWrap = document.querySelector('.chat-input-wrap');

  sendBtn.addEventListener('click', handleSendMessage);
  
  // Also allow Enter to send
  chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  /**
   * Main message send handler with detection
   */
  function handleSendMessage() {
    const messageText = chatInput.value.trim();

    // Prevent empty messages
    if (!messageText) {
      return;
    }

    // Analyze content
    const analysis = detector.analyzeContent(messageText);

    // Handle based on severity
    if (!analysis.isClean) {
      handleViolations(analysis, messageText);
    } else {
      // Clean message - send it
      sendCleanMessage(messageText);
    }
  }

  /**
   * Handle content violations
   */
  function handleViolations(analysis, messageText) {
    const { violations, severity, riskScore } = analysis;

    // CRITICAL: Block completely
    if (severity === 'critical') {
      showBlockedMessage(violations, messageText);
      return;
    }

    // HIGH: Show confirmation dialog
    if (severity === 'high') {
      showWarningDialog(violations, messageText);
      return;
    }

    // MEDIUM/LOW: Show warning but allow
    showAdvisoryWarning(violations, messageText);
  }

  /**
   * Show blocked message notification
   */
  function showBlockedMessage(violations, messageText) {
    // Show violation message in chat area with shake animation
    const violationDiv = createViolationNotice('BLOCKED', violations);
    
    // Insert above chat input
    chatInputWrap.parentElement.insertBefore(violationDiv, chatInputWrap);
    
    // Add analytics
    logViolation('BLOCKED', violations, messageText);
    
    // Auto-remove after 4 seconds
    setTimeout(() => violationDiv.remove(), 4000);
  }

  /**
   * Show warning dialog with user confirmation
   */
  function showWarningDialog(violations, messageText) {
    // Custom warning modal instead of browser alert
    const modal = createWarningModal(violations);
    
    modal.onConfirm = function() {
      // User confirmed - send anyways
      sendCleanMessage(messageText);
      modal.remove();
    };

    modal.onCancel = function() {
      // User cancelled
      modal.remove();
    };

    document.body.appendChild(modal);
  }

  /**
   * Show advisory warning (allow message)
   */
  function showAdvisoryWarning(violations, messageText) {
    // Show inline warning above input
    showInlineWarning(violations);
    
    // Send message anyway (don't block)
    sendCleanMessage(messageText);
  }

  /**
   * Send the clean/approved message
   */
  function sendCleanMessage(messageText) {
    // Clear input
    chatInput.value = '';
    
    // Hide warning
    hideWarnings();
    
    // Create and display message in chat
    displayMessageInChat({
      text: messageText,
      userId: getCurrentUserId(),
      timestamp: new Date(),
      isOwn: true
    });

    // In production, also send to server
    sendToServer(messageText);
  }

  /**
   * Create violation notice element
   */
  function createViolationNotice(type, violations) {
    const div = document.createElement('div');
    div.className = 'violation-msg';
    
    // Build message
    let html = `<strong style="color: #d43a60;">⚠️ ${type}:</strong> `;
    html += violations.map(v => v.message).join(' | ');
    
    div.innerHTML = html;
    
    // Style based on type
    if (type === 'BLOCKED') {
      div.style.background = 'rgba(212, 58, 96, 0.2)';
      div.style.borderLeftColor = '#d43a60';
      div.style.color = '#d43a60';
    }
    
    return div;
  }

  /**
   * Create warning modal
   */
  function createWarningModal(violations) {
    const modal = document.createElement('div');
    modal.className = 'modal-over open';
    
    const box = document.createElement('div');
    box.className = 'modal-box';
    
    // Build violation list
    let violationHTML = '<div style="margin: 20px 0; color: var(--w3);">';
    violations.forEach((v, i) => {
      violationHTML += `<div style="margin: 8px 0;">
        <strong>${v.type}</strong> - ${v.message}
        <div style="font-size: 11px; color: var(--w3); margin-top: 4px;">
          Severity: <span style="color: var(--wine3);">${v.severity.toUpperCase()}</span>
        </div>
      </div>`;
    });
    violationHTML += '</div>';
    
    box.innerHTML = `
      <div class="modal-inner">
        <h2 style="color: var(--wine3); margin-bottom: 10px;">⚠️ Content Check</h2>
        <p style="color: var(--w3); margin-bottom: 20px;">
          Your message may contain inappropriate content. Review below:
        </p>
        
        ${violationHTML}
        
        <div style="margin-top: 30px; display: flex; gap: 10px;">
          <button id="confirm-send" style="flex: 1; padding: 10px; background: var(--wine3); color: white; border: none; cursor: pointer;">
            SEND ANYWAY
          </button>
          <button id="cancel-send" style="flex: 1; padding: 10px; background: rgba(250,245,239,.1); color: var(--w3); border: 1px solid var(--gray2); cursor: pointer;">
            CANCEL
          </button>
        </div>
      </div>
    `;
    
    modal.appendChild(box);
    
    // Add event handlers
    modal.onConfirm = null;
    modal.onCancel = null;
    
    box.querySelector('#confirm-send').addEventListener('click', () => {
      if (modal.onConfirm) modal.onConfirm();
    });
    
    box.querySelector('#cancel-send').addEventListener('click', () => {
      if (modal.onCancel) modal.onCancel();
    });
    
    return modal;
  }

  /**
   * Show inline warning above input (non-blocking)
   */
  function showInlineWarning(violations) {
    // Find or create warning container
    let warningDiv = document.querySelector('.detection-warning');
    
    if (!warningDiv) {
      warningDiv = document.createElement('div');
      warningDiv.className = 'detection-warning';
      warningDiv.style.cssText = `
        padding: 10px 16px;
        background: rgba(196, 40, 80, 0.1);
        border-left: 3px solid var(--wine3);
        margin: 10px 0;
        font-size: 12px;
        color: var(--w3);
        animation: slideUp 0.3s ease;
      `;
      chatInputWrap.parentElement.insertBefore(warningDiv, chatInputWrap);
    }
    
    // Update with current violations
    warningDiv.innerHTML = `
      <strong style="color: var(--wine3);">ℹ️ Note:</strong> 
      ${violations.map(v => v.message).join(' • ')}
    `;
    
    warningDiv.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      warningDiv.style.display = 'none';
    }, 5000);
  }

  /**
   * Hide all warnings
   */
  function hideWarnings() {
    const warnings = document.querySelectorAll('.detection-warning, .violation-msg');
    warnings.forEach(w => w.style.display = 'none');
  }

  /**
   * Display message in chat (your existing code)
   */
  function displayMessageInChat(messageData) {
    const chatMessages = document.querySelector('.chat-messages');
    
    const msgWrap = document.createElement('div');
    msgWrap.className = `msg-wrap ${messageData.isOwn ? 'own' : ''}`;
    
    msgWrap.innerHTML = `
      <div class="msg-hdr">
        <span class="msg-name ${messageData.isOwn ? 'own-n' : ''}">
          ${messageData.userId || 'Anonymous'}
        </span>
        <span class="msg-time">${formatTime(messageData.timestamp)}</span>
      </div>
      <div class="msg-bubble">${escapeHTML(messageData.text)}</div>
    `;
    
    chatMessages.appendChild(msgWrap);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  /**
   * Send message to server
   */
  async function sendToServer(messageText) {
    try {
      const response = await fetch('/api/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          roomId: getCurrentRoomId(),
          userId: getCurrentUserId()
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        console.error('Server rejected message:', result.error);
        showErrorMessage('Server error: ' + result.error);
      }
    } catch (error) {
      console.error('Send failed:', error);
    }
  }

  /**
   * Real-time validation as user types
   */
  chatInput.addEventListener('input', debounce(function(e) {
    const text = e.target.value;
    
    if (text.length < 5) {
      // Too short, don't analyze
      return;
    }

    const analysis = detector.analyzeContent(text);
    
    // Update input border color based on risk
    if (!analysis.isClean) {
      switch (analysis.severity) {
        case 'critical':
          chatInput.style.borderColor = '#d43a60';
          chatInput.style.boxShadow = '0 0 8px rgba(212, 58, 96, 0.2)';
          break;
        case 'high':
          chatInput.style.borderColor = '#c42850';
          chatInput.style.boxShadow = '0 0 8px rgba(196, 40, 80, 0.15)';
          break;
        default:
          chatInput.style.borderColor = 'var(--gray2)';
          chatInput.style.boxShadow = 'none';
      }
    } else {
      chatInput.style.borderColor = 'var(--gray2)';
      chatInput.style.boxShadow = 'none';
    }
  }, 500));

  // ============================================================
  // 2. EXISTING MESSAGE MODERATION
  // ============================================================

  /**
   * Scan existing messages in chat for violations
   */
  function scanChatHistory() {
    const messages = document.querySelectorAll('.msg-bubble');
    const flagged = [];

    messages.forEach((msg, index) => {
      const text = msg.textContent;
      const analysis = detector.analyzeContent(text);

      if (!analysis.isClean) {
        flagged.push({
          index: index,
          text: text,
          analysis: analysis
        });

        // Mark flagged messages with subtle indicator
        if (analysis.severity === 'critical') {
          msg.style.borderLeftColor = '#d43a60';
          msg.style.borderLeftWidth = '4px';
        }
      }
    });

    console.log('Scanned history - Flagged:', flagged.length);
    return flagged;
  }

  // ============================================================
  // 3. VIOLATION TRACKING & ANALYTICS
  // ============================================================

  const tracker = new UserViolationTracker();

  function logViolation(type, violations, messageText) {
    const userId = getCurrentUserId();
    const violation = violations[0]; // Main violation
    
    tracker.recordViolation(userId, violation);
    
    // Send to server for logging
    fetch('/api/log-violation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userId,
        violationType: violation.type,
        severity: violation.severity,
        messageLength: messageText.length,
        timestamp: new Date()
      })
    }).catch(e => console.error('Log failed:', e));
  }

  /**
   * Check if user should be warned/suspended
   */
  function checkUserViolationStatus() {
    const userId = getCurrentUserId();
    const stats = tracker.getViolationStats(userId);

    if (stats.totalViolations > 10) {
      console.warn(`User ${userId} has ${stats.totalViolations} violations`);
      // Could trigger warning or suspension
    }

    return stats;
  }

  // ============================================================
  // UTILITY FUNCTIONS
  // ============================================================

  function getCurrentUserId() {
    // Get from your app's user state
    return 'user-' + Math.random().toString(36).substr(2, 9);
  }

  function getCurrentRoomId() {
    // Get from your app's room state
    const roomName = document.querySelector('.chat-room-name');
    return roomName ? roomName.textContent : 'unknown';
  }

  function formatTime(date) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #d43a60;
      color: white;
      padding: 15px 20px;
      border-radius: 4px;
      z-index: 1001;
      animation: slideIn 0.3s ease;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);

    setTimeout(() => errorDiv.remove(), 4000);
  }

  // ============================================================
  // 4. EXPOSE FUNCTIONS FOR CONSOLE TESTING
  // ============================================================

  window.OyeeModeration = {
    analyzeText: (text) => detector.analyzeContent(text),
    getStats: () => detector.getStats(),
    scanHistory: scanChatHistory,
    getUserViolations: checkUserViolationStatus
  };

  // Usage in console:
  // OyeeModeration.analyzeText("Call me at 555-1234")
  // OyeeModeration.scanHistory()
  // OyeeModeration.getUserViolations()
});

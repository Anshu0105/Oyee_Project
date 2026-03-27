/**
 * OYEE Content Detection System
 * Detects: Contact Numbers, Sensitive Data, Offensive Content
 */

class ContentDetector {
  constructor() {
    // Contact number patterns (Phone, Email, etc.)
    this.contactPatterns = {
      // International phone numbers
      phone: /(\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}|(\+\d{1,3}[-.\s]?)?\d{6,14}/g,
      // Email addresses
      email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      // International phone codes
      intlPhone: /\+[1-9]\d{1,14}/g,
      // Indian phone numbers specifically
      indianPhone: /([0-9]{10})|([0-9]{3}[-.\s]?[0-9]{3}[-.\s]?[0-9]{4})/g,
      // Credit card format (basic)
      creditCard: /\b(?:\d[ -]*?){13,19}\b/g,
      // Social security numbers
      ssn: /\b[0-9]{3}-?[0-9]{2}-?[0-9]{4}\b/g,
      // IP addresses
      ipAddress: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
      // URLs
      url: /https?:\/\/[^\s]+/g,
      // Passwords
      password: /(?:password|pwd)\s*[:=]\s*[^\s]+/gi
    };

    // Sensitive keywords
    this.sensitiveKeywords = [
      'address', 'ssn', 'social security', 'credit card', 'card number',
      'password', 'pin code', 'api key', 'secret', 'token', 'key',
      'account', 'banking', 'route', 'swift', 'iban', 'bsb'
    ];

    // Offensive/Profane word list (expandable)
    // Using a basic list - consider using a dedicated API for comprehensive filtering
    this.offensiveWords = new Set([
      // Add words as needed
      'abuse', 'violence', 'hate', 'racist', 'sexist', 'discriminate'
      // In production, use a larger database or API
    ]);

    // Severity levels
    this.SEVERITY = {
      CRITICAL: 'critical',   // Contact info, financial data
      HIGH: 'high',           // Offensive content
      MEDIUM: 'medium',       // Suspicious patterns
      LOW: 'low'              // Warnings
    };
  }

  /**
   * Main detection function - analyzes content for violations
   * @param {string} text - Text to analyze
   * @returns {Object} Detection result with violations and severity
   */
  analyzeContent(text) {
    if (!text || typeof text !== 'string') {
      return { isClean: true, violations: [], severity: null };
    }

    const violations = [];
    let maxSeverity = null;

    // Check for contact information
    const contactViolations = this.detectContactInfo(text);
    violations.push(...contactViolations);

    // Check for sensitive data patterns
    const sensitiveViolations = this.detectSensitiveData(text);
    violations.push(...sensitiveViolations);

    // Check for offensive content (Disabled per user request)
    // const offensiveViolations = this.detectOffensiveContent(text);
    // violations.push(...offensiveViolations);

    // Check for numeric characters (block any numbers to prevent numeric messages/leaks)
    if (/\d/.test(text)) {
      violations.push({
        type: 'NUMERIC_CONTENT',
        severity: this.SEVERITY.HIGH,
        count: (text.match(/\d/g) || []).length,
        message: 'Numeric messages or characters are not allowed for security reasons.'
      });
    }

    // Determine maximum severity
    if (violations.length > 0) {
      const severities = [this.SEVERITY.CRITICAL, this.SEVERITY.HIGH, this.SEVERITY.MEDIUM, this.SEVERITY.LOW];
      maxSeverity = severities.find(s => violations.some(v => v.severity === s));
    }

    return {
      isClean: violations.length === 0,
      violations: violations,
      severity: maxSeverity,
      riskScore: this.calculateRiskScore(violations)
    };
  }

  /**
   * Detects contact information (phone, email, etc.)
   */
  detectContactInfo(text) {
    const violations = [];

    // Check phone numbers
    const phones = text.match(this.contactPatterns.phone);
    if (phones) {
      violations.push({
        type: 'PHONE_NUMBER',
        severity: this.SEVERITY.CRITICAL,
        count: phones.length,
        message: `Found ${phones.length} phone number(s). Please avoid sharing contact details.`
      });
    }

    // Check emails
    const emails = text.match(this.contactPatterns.email);
    if (emails) {
      violations.push({
        type: 'EMAIL_ADDRESS',
        severity: this.SEVERITY.CRITICAL,
        count: emails.length,
        message: `Found ${emails.length} email address(es). Please avoid sharing contact details.`
      });
    }

    // Check credit cards
    const cards = text.match(this.contactPatterns.creditCard);
    if (cards) {
      violations.push({
        type: 'CREDIT_CARD',
        severity: this.SEVERITY.CRITICAL,
        count: cards.length,
        message: 'Financial information detected. Never share card numbers!'
      });
    }

    return violations;
  }

  /**
   * Detects sensitive data patterns
   */
  detectSensitiveData(text) {
    const violations = [];
    const lowerText = text.toLowerCase();

    // Check for sensitive keywords
    const foundKeywords = this.sensitiveKeywords.filter(keyword => 
      lowerText.includes(keyword)
    );

    if (foundKeywords.length > 0) {
      violations.push({
        type: 'SENSITIVE_KEYWORDS',
        severity: this.SEVERITY.HIGH,
        count: foundKeywords.length,
        keywords: foundKeywords,
        message: `Sensitive information detected: ${foundKeywords.join(', ')}`
      });
    }

    // Check for URLs
    const urls = text.match(this.contactPatterns.url);
    if (urls) {
      violations.push({
        type: 'EXTERNAL_LINK',
        severity: this.SEVERITY.HIGH,
        count: urls.length,
        message: 'Links and URLs are strictly not allowed.'
      });
    }

    // Check for IP addresses
    const ips = text.match(this.contactPatterns.ipAddress);
    if (ips) {
      violations.push({
        type: 'IP_ADDRESS',
        severity: this.SEVERITY.HIGH,
        count: ips.length,
        message: 'IP address(es) detected. Avoid sharing network information.'
      });
    }

    return violations;
  }

  /**
   * Detects offensive and profane content
   */
  detectOffensiveContent(text) {
    const violations = [];
    const lowerText = text.toLowerCase();
    const foundOffensive = [];

    // Check offensive words
    this.offensiveWords.forEach(word => {
      if (lowerText.includes(word)) {
        foundOffensive.push(word);
      }
    });

    if (foundOffensive.length > 0) {
      violations.push({
        type: 'OFFENSIVE_CONTENT',
        severity: this.SEVERITY.HIGH,
        count: foundOffensive.length,
        message: 'Your message contains offensive language. Please keep chat respectful.'
      });
    }

    // Check for excessive caps (may indicate shouting/aggression)
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsRatio > 0.5 && text.length > 10) {
      violations.push({
        type: 'EXCESSIVE_CAPS',
        severity: this.SEVERITY.LOW,
        message: 'Excessive uppercase letters detected. Please maintain respectful tone.'
      });
    }

    // Check for repeated characters (spam)
    if (/(.)\1{4,}/.test(text)) {
      violations.push({
        type: 'SPAM_PATTERN',
        severity: this.SEVERITY.MEDIUM,
        message: 'Message appears to be spam. Please send valid content.'
      });
    }

    return violations;
  }

  /**
   * Calculate risk score (0-100)
   */
  calculateRiskScore(violations) {
    if (violations.length === 0) return 0;

    const severityWeights = {
      [this.SEVERITY.CRITICAL]: 100,
      [this.SEVERITY.HIGH]: 75,
      [this.SEVERITY.MEDIUM]: 50,
      [this.SEVERITY.LOW]: 25
    };

    const totalWeight = violations.reduce((sum, v) => 
      sum + (severityWeights[v.severity] || 0), 0
    );

    return Math.min(100, Math.round(totalWeight / violations.length));
  }

  /**
   * Flag message as violation (higher accuracy)
   * Use this for user reports and learning
   */
  flagMessage(messageId, violationType, details = {}) {
    return {
      messageId,
      violationType,
      timestamp: new Date().toISOString(),
      details
    };
  }

  /**
   * Get detection statistics
   */
  getStats() {
    return {
      patternsTracked: Object.keys(this.contactPatterns).length,
      sensitiveKeywords: this.sensitiveKeywords.length,
      offensiveWords: this.offensiveWords.size,
      severityLevels: Object.keys(this.SEVERITY).length
    };
  }
}

// Export for use
module.exports = ContentDetector;

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

    // Offensive/Profane word list
    this.offensiveWords = new Set([
      'abuse', 'violence', 'hate', 'racist', 'sexist', 'discriminate'
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
   */
  analyzeContent(text) {
    if (!text || typeof text !== 'string') {
      return { isSafe: true, issues: [] };
    }

    const violations = [];
    let maxSeverity = null;

    // Check for contact information
    const contactViolations = this.detectContactInfo(text);
    violations.push(...contactViolations);

    // Check for sensitive data patterns
    const sensitiveViolations = this.detectSensitiveData(text);
    violations.push(...sensitiveViolations);

    // Check for offensive content
    const offensiveViolations = this.detectOffensiveContent(text);
    violations.push(...offensiveViolations);

    // Determine return format as requested: { isSafe: boolean, issues: string[] }
    const isSafe = violations.length === 0;
    const issues = violations.map(v => v.message);

    return {
      isSafe,
      issues,
      violations // Keep violations for internal detailed logging
    };
  }

  detectContactInfo(text) {
    const violations = [];
    const phones = text.match(this.contactPatterns.phone);
    if (phones) {
      violations.push({
        type: 'PHONE_NUMBER',
        severity: this.SEVERITY.CRITICAL,
        message: `Restriction detected: phone number sharing is prohibited.`
      });
    }

    const emails = text.match(this.contactPatterns.email);
    if (emails) {
      violations.push({
        type: 'EMAIL_ADDRESS',
        severity: this.SEVERITY.CRITICAL,
        message: `Restriction detected: email sharing is prohibited.`
      });
    }

    const cards = text.match(this.contactPatterns.creditCard);
    if (cards) {
      violations.push({
        type: 'CREDIT_CARD',
        severity: this.SEVERITY.CRITICAL,
        message: 'Financial information detected. Do not share sensitive data!'
      });
    }

    return violations;
  }

  detectSensitiveData(text) {
    const violations = [];
    const lowerText = text.toLowerCase();

    const foundKeywords = this.sensitiveKeywords.filter(keyword => 
      lowerText.includes(keyword)
    );

    if (foundKeywords.length > 0) {
      violations.push({
        type: 'SENSITIVE_KEYWORDS',
        severity: this.SEVERITY.HIGH,
        message: `Sensitive content restriction: ${foundKeywords.join(', ')}`
      });
    }

    const urls = text.match(this.contactPatterns.url);
    if (urls) {
      violations.push({
        type: 'EXTERNAL_LINK',
        severity: this.SEVERITY.MEDIUM,
        message: 'External links are restricted in this room.'
      });
    }

    return violations;
  }

  detectOffensiveContent(text) {
    const violations = [];
    const lowerText = text.toLowerCase();
    const foundOffensive = [];

    this.offensiveWords.forEach(word => {
      if (lowerText.includes(word)) {
        foundOffensive.push(word);
      }
    });

    if (foundOffensive.length > 0) {
      violations.push({
        type: 'OFFENSIVE_CONTENT',
        severity: this.SEVERITY.HIGH,
        message: 'Offensive language detected. Please be respectful.'
      });
    }

    return violations;
  }
}

module.exports = ContentDetector;

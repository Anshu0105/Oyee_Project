const Filter = require('bad-words');
const filter = new Filter();

class ContentDetector {
  constructor() {
    this.normalizationMap = {
      '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '9': 'g', '@': 'a', '$': 's'
    };

    this.patterns = {
      identity: /\b(my name is|i am|i'm|call me|this is)\s+[A-Z][a-z]+/gi,
      phone: /(\+?\d[\d\s-().]{7,}\d)/g,
      email: /[\w.-]+@[\w.-]+\.\w+/g,
      url: /(https?:\/\/|www\.)[^\s]+/gi,
      ip: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g,
      alphanumeric: /\b[a-zA-Z]*\d+[a-zA-Z]+\d*\b/g,
      continuous: /[a-zA-Z0-9]{12,}/
    };

    this.sensitiveKeywords = ['password', 'api key', 'token', 'secret', 'ssn', 'credit card'];
  }

  normalize(text) {
    let normalized = text.toLowerCase();
    for (const [key, value] of Object.entries(this.normalizationMap)) {
      normalized = normalized.split(key).join(value);
    }
    // Remove all non-alphanumeric (removes spaces, symbols, etc.)
    return normalized.replace(/[^a-z0-9]/g, '');
  }

  isRandom(text) {
    if (text.length < 8) return false;
    const unique = new Set(text).size;
    return unique / text.length > 0.6;
  }

  getDigitRatio(text) {
    const digits = (text.match(/\d/g) || []).length;
    return digits / text.length;
  }

  async analyze(text) {
    if (!text || text.length < 2) return { blocked: false, flagged: false, severity: 'SAFE', reason: '' };

    // 1. BASELINE: Natural Language Profanity
    if (filter.isProfane(text)) {
      return { blocked: false, flagged: true, severity: 'WARNING', reason: 'Offensive language detected', source: 'toxicity' };
    }

    // 2. NORMALIZATION & CLEANING
    const cleanText = this.normalize(text);
    
    // 3. RANDOM STRING DETECTION (Entropy)
    if (this.isRandom(cleanText)) {
      return { blocked: true, flagged: false, severity: 'CRITICAL', reason: 'Suspicious encoded or random content', source: 'entropy' };
    }

    // 4. ALPHANUMERIC PATTERN DETECTION (Bypass prevention)
    if (this.patterns.continuous.test(cleanText)) {
        // Only block if it looks machine generated or low word quality
        if (this.getDigitRatio(cleanText) > 0.4 || this.isRandom(cleanText)) {
            return { blocked: true, flagged: false, severity: 'CRITICAL', reason: 'Automated/Encoded string detected', source: 'pattern' };
        }
    }

    // 5. SPACED BYPASS RE-DETECTION
    // If the original text had spaces but the clean text contains banned keywords
    if (text.includes(' ') && filter.isProfane(cleanText)) {
        return { blocked: true, flagged: false, severity: 'CRITICAL', reason: 'Spaced moderation bypass detected', source: 'bypass' };
    }

    // 6. IDENTITY & SENSITIVE DATA
    const checks = [text.toLowerCase(), cleanText];
    for (const content of checks) {
      if (this.patterns.identity.test(content)) {
        return { blocked: true, flagged: false, severity: 'CRITICAL', reason: 'Identity exposure detected', source: 'regex' };
      }
      if (this.patterns.phone.test(content) || this.patterns.email.test(content) || 
          this.patterns.url.test(content) || this.patterns.ip.test(content)) {
        return { blocked: true, flagged: false, severity: 'CRITICAL', reason: 'Personal/Contact info detected', source: 'regex' };
      }
    }

    // Caps Abuse
    const capsCount = (text.match(/[A-Z]/g) || []).length;
    if (text.length > 10 && capsCount / text.length > 0.7) {
      return { blocked: false, flagged: true, severity: 'WARNING', reason: 'Excessive caps detected', source: 'pattern' };
    }

    return { blocked: false, flagged: false, severity: 'SAFE', reason: '', source: 'none' };
  }
}

module.exports = new ContentDetector();

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
      alphanumeric: /[a-zA-Z]*\d+[a-zA-Z]+\d*/g
    };

    this.sensitiveKeywords = ['password', 'api key', 'token', 'secret', 'ssn', 'credit card'];
  }

  normalize(text) {
    let normalized = text.toLowerCase();
    for (const [key, value] of Object.entries(this.normalizationMap)) {
      normalized = normalized.split(key).join(value);
    }
    return normalized;
  }

  async analyze(text) {
    if (!text) return { blocked: false, flagged: false, severity: 'SAFE', reason: '' };

    const normalizedText = this.normalize(text);
    const checks = [text, normalizedText];

    // 1. Identity Check (BLOCK)
    for (const content of checks) {
      if (this.patterns.identity.test(content)) {
        return { blocked: true, flagged: false, severity: 'CRITICAL', reason: 'Identity exposure detected', source: 'regex' };
      }
    }

    // 2. Sensitive Data (BLOCK)
    for (const content of checks) {
      if (this.patterns.phone.test(content) || this.patterns.email.test(content) || 
          this.patterns.url.test(content) || this.patterns.ip.test(content)) {
        return { blocked: true, flagged: false, severity: 'CRITICAL', reason: 'Personal or contact info detected', source: 'regex' };
      }
      
      if (this.sensitiveKeywords.some(kw => content.includes(kw))) {
        return { blocked: true, flagged: false, severity: 'CRITICAL', reason: 'Sensitive keyword detected', source: 'regex' };
      }
    }

    // 3. Toxicity (bad-words)
    let isToxic = false;
    for (const content of checks) {
      if (filter.isProfane(content)) {
        isToxic = true;
        break;
      }
    }

    if (isToxic) {
      // We can decide to block or flag based on severity. 
      // For now, let's block strong toxicity and flag mild ones.
      // Since current lib doesn't give levels, we flag.
      return { blocked: false, flagged: true, severity: 'WARNING', reason: 'Offensive language detected', source: 'toxicity' };
    }

    // 4. Alphanumeric / Spam
    if (this.patterns.alphanumeric.test(text)) {
      return { blocked: false, flagged: true, severity: 'WARNING', reason: 'Suspicious alphanumeric pattern', source: 'regex' };
    }

    // Caps Abuse
    const capsCount = (text.match(/[A-Z]/g) || []).length;
    if (text.length > 10 && capsCount / text.length > 0.7) {
      return { blocked: false, flagged: true, severity: 'WARNING', reason: 'Excessive caps detected', source: 'pattern' };
    }

    // Repeated chars
    if (/(.)\1{5,}/.test(text)) {
      return { blocked: false, flagged: true, severity: 'WARNING', reason: 'Repeated characters detected', source: 'pattern' };
    }

    return { blocked: false, flagged: false, severity: 'SAFE', reason: '', source: 'none' };
  }
}

module.exports = new ContentDetector();

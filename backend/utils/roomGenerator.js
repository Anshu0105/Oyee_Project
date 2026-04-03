const crypto = require('crypto');

/**
 * Generates a unique 10-character alphanumeric room code.
 * (A-Z, a-z, 0-9)
 */
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  // crypto.randomBytes(10) generates 10 random bytes, we'll map them to the character set
  const randomValues = crypto.randomBytes(10);
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  return result;
}

module.exports = { generateRoomCode };

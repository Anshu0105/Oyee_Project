const User = require('../models/User');

/**
 * Modifies user aura with floor protection.
 * @param {string} userId 
 * @param {number} delta 
 * @returns {Promise<object>} Updated user
 */
const modifyAura = async (userId, delta) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Lifetime Aura always increases if delta is positive
  if (delta > 0) {
    user.lifetimeAura += delta;
    if (user.lifetimeAura > user.maxLifetimeAura) {
      user.maxLifetimeAura = user.lifetimeAura;
    }
    user.spendableAura += delta;
  } else {
    // Floor Protection: Aura never drops below 10% of lifetime MAX
    const floor = Math.floor(user.maxLifetimeAura * 0.1);
    const newBalance = user.spendableAura + delta;
    
    if (newBalance < floor) {
      user.spendableAura = floor;
    } else {
      user.spendableAura = newBalance;
    }
  }

  await user.save();
  return user;
};

module.exports = { modifyAura };

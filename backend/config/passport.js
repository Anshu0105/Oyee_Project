const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { generateAuraName } = require('../utils/nameGenerator');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
    proxy: true // Use if behind proxy (e.g. Render)
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        // Update user if needed
        if (user.provider !== 'google') {
          user.provider = 'google';
          user.providerId = profile.id;
        }
        user.avatarUrl = profile.photos[0].value;
        user.displayName = profile.displayName;
        await user.save();
        return done(null, user);
      }

      // Create new user
      const auraName = await generateAuraName();
      
      // Auto-generate username from profile
      let baseUsername = profile.displayName.replace(/\s+/g, '').toLowerCase().substring(0, 10);
      let username = baseUsername + Math.floor(Math.random() * 1000);
      
      // Check if username unique
      const existingUser = await User.findOne({ username });
      if (existingUser) username = baseUsername + Date.now().toString().slice(-4);

      user = new User({
        username,
        email: profile.emails[0].value,
        displayName: profile.displayName,
        avatarUrl: profile.photos[0].value,
        provider: 'google',
        providerId: profile.id,
        auraName,
        avatarEmoji: '⚡', // Static emoji for social users
        auraColor: '#FFD700', // Gold color for social users
        password: 'NO_PASSWORD_REQUIRED_SOCIAL_LOGIN'
      });

      await user.save();
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;

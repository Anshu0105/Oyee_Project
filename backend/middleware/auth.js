const jwt = require('jsonwebtoken');

// Secret key for JWT (should ideally be in .env)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_oyeee_key_for_development';

// 1. Verify Token Middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Token is not valid!' });
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json({ error: 'You are not authenticated!' });
  }
};

// 2. Verify Admin Role Middleware
const isAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Access Denied: Admin privileges required.' });
    }
  });
};

module.exports = { verifyToken, isAdmin, JWT_SECRET };

const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const HashTable = require('../dsa/HashTable');

// DSA: HashTable for O(1) session cache
const sessionCache = new HashTable(64);

const auth = async (req, res, next) => {
  try {
    const token = req.cookies?.sms_token;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // DSA: Check HashTable cache first (O(1) avg) before decoding JWT
    let userData = sessionCache.get(token);

    if (!userData) {
      // Cache miss — decode JWT and verify user exists
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (!user || user.status !== 'ACTIVE') {
        return res.status(401).json({ success: false, message: 'Invalid or expired session' });
      }
      userData = { id: user._id.toString(), email: user.email, role: user.role };
      sessionCache.set(token, userData); // Cache for next request
    }

    req.user = userData;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Optional auth — doesn't fail if no token, just doesn't set req.user
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.sms_token;
    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    }
  } catch (e) {}
  next();
};

const invalidateSession = (token) => {
  sessionCache.delete(token);
};

module.exports = { auth, optionalAuth, invalidateSession, sessionCache };

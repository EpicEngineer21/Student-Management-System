const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const ActivityLog = require('../models/ActivityLog');
const { invalidateSession } = require('../middleware/auth');

// In-memory rate limiter (DSA: uses Map — similar to our HashTable)
const loginAttempts = new Map();

function checkRateLimit(email) {
  const entry = loginAttempts.get(email);
  if (!entry) return { blocked: false };
  if (entry.lockedUntil && Date.now() < entry.lockedUntil) {
    const mins = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
    return { blocked: true, message: `Too many failed attempts. Try again in ${mins} minute(s).` };
  }
  return { blocked: false };
}

function recordFailedAttempt(email) {
  const entry = loginAttempts.get(email) || { count: 0 };
  entry.count++;
  if (entry.count >= config.rateLimit.maxAttempts) {
    entry.lockedUntil = Date.now() + config.rateLimit.lockoutMinutes * 60000;
  }
  loginAttempts.set(email, entry);
}

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const rateCheck = checkRateLimit(email);
    if (rateCheck.blocked) return res.status(429).json({ success: false, message: rateCheck.message });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) { recordFailedAttempt(email); return res.status(401).json({ success: false, message: 'Invalid email or password' }); }
    if (user.status !== 'ACTIVE') return res.status(401).json({ success: false, message: 'Account is inactive or suspended' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      recordFailedAttempt(email);
      user.loginAttempts += 1;
      await user.save();
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Success — clear rate limit, update last login
    loginAttempts.delete(email);
    user.loginAttempts = 0;
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Set httpOnly cookie
    res.cookie('sms_token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
      path: '/',
    });

    // Log activity
    await ActivityLog.create({
      user: user._id, userEmail: user.email, role: user.role,
      action: 'LOGIN', ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: { id: user._id, email: user.email, role: user.role },
    });
  } catch (err) { next(err); }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies?.sms_token;
    if (token) invalidateSession(token);

    await ActivityLog.create({
      user: req.user.id, userEmail: req.user.email, role: req.user.role,
      action: 'LOGOUT',
    });

    res.clearCookie('sms_token', { path: '/' });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let profile = null;
    if (user.role === 'STUDENT') {
      profile = await Student.findOne({ user: user._id })
        .populate('department', 'name code')
        .populate('course', 'name code');
    } else if (user.role === 'TEACHER') {
      profile = await Teacher.findOne({ user: user._id })
        .populate('department', 'name code');
    }

    res.json({
      success: true,
      data: {
        id: user._id, email: user.email, role: user.role, status: user.status,
        lastLogin: user.lastLogin, createdAt: user.createdAt,
        profile,
      },
    });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();

    // Invalidate current session
    const token = req.cookies?.sms_token;
    if (token) invalidateSession(token);

    res.json({ success: true, message: 'Password changed successfully. Please login again.' });
  } catch (err) { next(err); }
};

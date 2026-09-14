const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

/**
 * Role-based authorization middleware.
 * Usage: authorize('ADMIN', 'TEACHER')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

/**
 * Middleware: ensures the authenticated student can only access their own data.
 * Attaches req.studentId.
 */
const ownStudentOnly = async (req, res, next) => {
  try {
    if (req.user.role === 'ADMIN' || req.user.role === 'TEACHER') return next();
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
    req.studentId = student._id.toString();
    next();
  } catch (err) { next(err); }
};

/**
 * Middleware: attaches req.teacherId for teacher users.
 */
const ownTeacherOnly = async (req, res, next) => {
  try {
    if (req.user.role === 'ADMIN') return next();
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher profile not found' });
    req.teacherId = teacher._id.toString();
    next();
  } catch (err) { next(err); }
};

module.exports = { authorize, ownStudentOnly, ownTeacherOnly };

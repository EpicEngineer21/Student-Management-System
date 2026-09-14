const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash:  { type: String, required: true },
  role:          { type: String, required: true, enum: ['ADMIN', 'TEACHER', 'STUDENT'] },
  status:        { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] },
  lastLogin:     { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockedUntil:   { type: Date },
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);

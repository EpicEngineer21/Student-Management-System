const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category:    { type: String, required: true, enum: ['Academic', 'Examination', 'Holiday', 'Event', 'Fee', 'General', 'Emergency'] },
  priority:    { type: String, default: 'MEDIUM', enum: ['HIGH', 'MEDIUM', 'LOW'] },
  targetRole:  { type: String, default: 'ALL', enum: ['ALL', 'STUDENT', 'TEACHER', 'ADMIN'] },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  expiryDate:  { type: Date },
  status:      { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'EXPIRED', 'DRAFT'] },
}, { timestamps: true });

noticeSchema.index({ status: 1 });
noticeSchema.index({ priority: 1 });

module.exports = mongoose.model('Notice', noticeSchema);

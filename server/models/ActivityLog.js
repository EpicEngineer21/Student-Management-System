const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail:  { type: String },
  role:       { type: String },
  action:     { type: String, required: true },
  entityType: { type: String },
  entityId:   { type: mongoose.Schema.Types.ObjectId },
  details:    { type: mongoose.Schema.Types.Mixed },
  ipAddress:  { type: String },
}, { timestamps: true });

activityLogSchema.index({ user: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);

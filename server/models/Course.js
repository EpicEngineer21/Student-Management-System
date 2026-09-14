const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  code:           { type: String, required: true, unique: true, uppercase: true, trim: true },
  department:     { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  durationYears:  { type: Number, default: 4, min: 1, max: 6 },
  totalSemesters: { type: Number, default: 8, min: 1, max: 12 },
  description:    { type: String },
  status:         { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'] },
}, { timestamps: true });

courseSchema.index({ department: 1 });

module.exports = mongoose.model('Course', courseSchema);

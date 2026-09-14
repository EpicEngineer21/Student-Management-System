const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  type:         { type: String, required: true, enum: ['Mid Term', 'End Semester', 'Internal', 'Practical', 'Assignment'] },
  course:       { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  semester:     { type: Number, required: true, min: 1 },
  academicYear: { type: String, required: true },
  startDate:    { type: Date },
  endDate:      { type: Date },
  status:       { type: String, default: 'UPCOMING', enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'] },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

examSchema.index({ course: 1 });
examSchema.index({ status: 1 });

module.exports = mongoose.model('Exam', examSchema);

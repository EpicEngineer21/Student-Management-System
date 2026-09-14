const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String },
  subject:     { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacher:     { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  class:       { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  dueDate:     { type: Date, required: true },
  maxMarks:    { type: Number, default: 10, min: 1 },
  status:      { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'CLOSED', 'CANCELLED'] },
  submissions: [{
    student:      { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    submittedAt:  { type: Date, default: Date.now },
    marksObtained:{ type: Number, min: 0 },
    feedback:     { type: String },
    status:       { type: String, default: 'SUBMITTED', enum: ['SUBMITTED', 'GRADED', 'LATE'] },
  }],
}, { timestamps: true });

assignmentSchema.index({ subject: 1 });
assignmentSchema.index({ teacher: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);

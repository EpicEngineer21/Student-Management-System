const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  code:       { type: String, required: true, unique: true, uppercase: true, trim: true },
  name:       { type: String, required: true, trim: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  course:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  semester:   { type: Number, required: true, min: 1 },
  credits:    { type: Number, default: 3, min: 0 },
  type:       { type: String, default: 'Theory', enum: ['Theory', 'Practical', 'Project', 'Elective'] },
  teacher:    { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  maxMarks:   { type: Number, default: 100, min: 1 },
  passMarks:  { type: Number, default: 40, min: 0 },
  status:     { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE'] },
}, { timestamps: true });

subjectSchema.index({ department: 1 });
subjectSchema.index({ course: 1 });
subjectSchema.index({ teacher: 1 });

module.exports = mongoose.model('Subject', subjectSchema);

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  class:   { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  date:    { type: Date, required: true },
  status:  { type: String, required: true, enum: ['Present', 'Absent', 'Late', 'Leave'] },
  remarks: { type: String },
}, { timestamps: true });

attendanceSchema.index({ student: 1, subject: 1, date: 1 }, { unique: true });
attendanceSchema.index({ subject: 1 });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ teacher: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);

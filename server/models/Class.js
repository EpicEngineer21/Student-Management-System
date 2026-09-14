const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  course:       { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  department:   { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  semester:     { type: Number, required: true, min: 1 },
  section:      { type: String, default: 'A' },
  academicYear: { type: String, required: true },
  classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  roomNumber:   { type: String },
}, { timestamps: true });

classSchema.index({ course: 1, semester: 1, section: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Class', classSchema);

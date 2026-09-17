const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user:             { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  enrollmentNumber: { type: String, required: true, unique: true, trim: true },
  rollNumber:       { type: String, required: true, trim: true },
  firstName:        { type: String, required: true, trim: true },
  lastName:         { type: String, required: true, trim: true },
  dateOfBirth:      { type: Date },
  gender:           { type: String, enum: ['Male', 'Female', 'Other'] },
  phone:            { type: String },
  address:          { type: String },
  city:             { type: String },
  state:            { type: String },
  pincode:          { type: String },
  department:       { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  course:           { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  currentSemester:  { type: Number, default: 1, min: 1 },
  section:          { type: String, default: 'A' },
  academicYear:     { type: String, default: '2025-26' },
  admissionDate:    { type: Date },
  status:           { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'GRADUATED', 'DROPPED'] },
  profilePhoto:     { type: String },
}, { timestamps: true });

studentSchema.index({ department: 1 });
studentSchema.index({ course: 1 });
studentSchema.index({ rollNumber: 1, department: 1, course: 1, currentSemester: 1, section: 1 });

studentSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);

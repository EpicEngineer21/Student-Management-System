const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  student:         { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subject:         { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  exam:            { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  teacher:         { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  internalMarks:   { type: Number, default: 0, min: 0 },
  assignmentMarks: { type: Number, default: 0, min: 0 },
  midtermMarks:    { type: Number, default: 0, min: 0 },
  practicalMarks:  { type: Number, default: 0, min: 0 },
  endtermMarks:    { type: Number, default: 0, min: 0 },
  maxMarks:        { type: Number, default: 100, min: 1 },
  grade:           { type: String },
  gradePoint:      { type: Number },
  isPublished:     { type: Boolean, default: false },
}, { timestamps: true });

// Virtual: computed total marks
markSchema.virtual('totalMarks').get(function () {
  return this.internalMarks + this.assignmentMarks + this.midtermMarks + this.practicalMarks + this.endtermMarks;
});

markSchema.index({ student: 1, subject: 1, exam: 1 }, { unique: true });
markSchema.index({ student: 1 });
markSchema.index({ exam: 1 });

markSchema.set('toJSON', { virtuals: true });
markSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Mark', markSchema);

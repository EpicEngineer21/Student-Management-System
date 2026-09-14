const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  class:      { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subject:    { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacher:    { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  day:        { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
  startTime:  { type: String, required: true },
  endTime:    { type: String, required: true },
  roomNumber: { type: String },
}, { timestamps: true });

timetableSchema.index({ teacher: 1, day: 1, startTime: 1 }, { unique: true });
timetableSchema.index({ class: 1, day: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);

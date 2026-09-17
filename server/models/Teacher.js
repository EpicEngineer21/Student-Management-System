const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  employeeId:     { type: String, required: true, unique: true, trim: true },
  firstName:      { type: String, required: true, trim: true },
  lastName:       { type: String, required: true, trim: true },
  phone:          { type: String },
  department:     { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  designation:    { type: String, default: 'Assistant Professor' },
  qualification:  { type: String },
  specialization: { type: String },
  joiningDate:    { type: Date },
  status:         { type: String, default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'] },
}, { timestamps: true });

teacherSchema.index({ department: 1 });

teacherSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

teacherSchema.set('toJSON', { virtuals: true });
teacherSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Teacher', teacherSchema);

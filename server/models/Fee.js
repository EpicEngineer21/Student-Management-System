const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
  student:       { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  academicYear:  { type: String, required: true },
  semester:      { type: Number, required: true, min: 1 },
  feeType:       { type: String, default: 'Tuition', enum: ['Tuition', 'Hostel', 'Transport', 'Exam', 'Library', 'Other'] },
  totalAmount:   { type: Number, required: true, min: 0 },
  paidAmount:    { type: Number, default: 0, min: 0 },
  dueDate:       { type: Date },
  paymentDate:   { type: Date },
  paymentMode:   { type: String, enum: ['Cash', 'Online', 'Cheque', 'DD'] },
  receiptNumber: { type: String, unique: true, sparse: true },
  status:        { type: String, default: 'Pending', enum: ['Paid', 'Partially Paid', 'Pending', 'Overdue'] },
  remarks:       { type: String },
}, { timestamps: true });

feeSchema.index({ student: 1 });
feeSchema.index({ status: 1 });
feeSchema.index({ academicYear: 1 });

module.exports = mongoose.model('Fee', feeSchema);

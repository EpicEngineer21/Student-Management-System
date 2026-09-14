const Fee = require('../models/Fee');

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.student_id) filter.student = req.query.student_id;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.academic_year) filter.academicYear = req.query.academic_year;
    // For student users, filter to own fees
    if (req.user.role === 'STUDENT') {
      const Student = require('../models/Student');
      const student = await Student.findOne({ user: req.user.id });
      if (student) filter.student = student._id;
    }
    const data = await Fee.find(filter)
      .populate({ path: 'student', select: 'firstName lastName enrollmentNumber' })
      .sort({ createdAt: -1 }).lean();
    const fees = data.map(f => ({
      ...f,
      first_name: f.student?.firstName, last_name: f.student?.lastName,
      enrollment_number: f.student?.enrollmentNumber,
      fee_type: f.feeType, total_amount: f.totalAmount, paid_amount: f.paidAmount,
      due_date: f.dueDate, payment_date: f.paymentDate, payment_mode: f.paymentMode,
      receipt_number: f.receiptNumber, academic_year: f.academicYear,
    }));
    res.json({ success: true, data: fees });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { student_id, academic_year, semester, fee_type, total_amount, paid_amount, due_date, payment_mode, receipt_number, remarks } = req.body;
    if (!student_id || !total_amount) return res.status(400).json({ success: false, message: 'Student and total amount required' });
    const paid = parseFloat(paid_amount || 0);
    const total = parseFloat(total_amount);
    const status = paid >= total ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Pending';
    const fee = await Fee.create({
      student: student_id, academicYear: academic_year || '2025-26', semester: semester || 1,
      feeType: fee_type || 'Tuition', totalAmount: total, paidAmount: paid,
      dueDate: due_date, paymentMode: payment_mode || undefined, receiptNumber: receipt_number || undefined,
      status, remarks,
    });
    res.status(201).json({ success: true, message: 'Fee record created', data: fee });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.body.paid_amount !== undefined) fee.paidAmount = parseFloat(req.body.paid_amount);
    if (req.body.payment_mode) fee.paymentMode = req.body.payment_mode;
    if (req.body.receipt_number) fee.receiptNumber = req.body.receipt_number;
    if (req.body.remarks !== undefined) fee.remarks = req.body.remarks;
    if (req.body.due_date) fee.dueDate = req.body.due_date;
    // Auto-compute status
    fee.status = fee.paidAmount >= fee.totalAmount ? 'Paid' : fee.paidAmount > 0 ? 'Partially Paid' : 'Pending';
    if (fee.paidAmount >= fee.totalAmount) fee.paymentDate = new Date();
    await fee.save();
    res.json({ success: true, message: 'Fee updated', data: fee });
  } catch (err) { next(err); }
};

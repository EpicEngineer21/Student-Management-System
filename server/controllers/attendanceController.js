const Attendance = require('../models/Attendance');
const Teacher = require('../models/Teacher');

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.subject_id) filter.subject = req.query.subject_id;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date) filter.date = new Date(req.query.date);
    if (req.query.month) {
      const [year, month] = req.query.month.split('-');
      filter.date = { $gte: new Date(`${year}-${month}-01`), $lt: new Date(`${year}-${String(parseInt(month) + 1).padStart(2, '0')}-01`) };
    }
    const data = await Attendance.find(filter)
      .populate({ path: 'student', select: 'firstName lastName enrollmentNumber rollNumber' })
      .populate({ path: 'subject', select: 'name code' })
      .sort({ date: -1 })
      .limit(500)
      .lean();
    const records = data.map(a => ({
      ...a,
      first_name: a.student?.firstName, last_name: a.student?.lastName,
      enrollment_number: a.student?.enrollmentNumber,
      subject_name: a.subject?.name, subject_code: a.subject?.code,
      date: a.date?.toISOString().split('T')[0],
    }));
    res.json({ success: true, data: records });
  } catch (err) { next(err); }
};

exports.bulkMark = async (req, res, next) => {
  try {
    const { subject_id, date, records } = req.body;
    if (!subject_id || !date || !records?.length) return res.status(400).json({ success: false, message: 'Subject, date and records required' });
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher && req.user.role !== 'ADMIN') return res.status(403).json({ success: false, message: 'Teacher profile not found' });
    const teacherId = teacher?._id || req.user.id;
    let created = 0, updated = 0;
    for (const r of records) {
      const existing = await Attendance.findOne({ student: r.student_id, subject: subject_id, date: new Date(date) });
      if (existing) {
        existing.status = r.status;
        existing.remarks = r.remarks || existing.remarks;
        await existing.save();
        updated++;
      } else {
        await Attendance.create({ student: r.student_id, subject: subject_id, teacher: teacherId, date: new Date(date), status: r.status, remarks: r.remarks });
        created++;
      }
    }
    res.json({ success: true, message: `Attendance saved: ${created} created, ${updated} updated` });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const att = await Attendance.findByIdAndUpdate(req.params.id, { status: req.body.status, remarks: req.body.remarks }, { new: true });
    if (!att) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Updated', data: att });
  } catch (err) { next(err); }
};

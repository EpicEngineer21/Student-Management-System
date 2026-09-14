const Exam = require('../models/Exam');

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.course_id) filter.course = req.query.course_id;
    if (req.query.status) filter.status = req.query.status;
    const data = await Exam.find(filter).populate('course', 'name code').sort({ startDate: -1 }).lean();
    const exams = data.map(e => ({ ...e, course_name: e.course?.name, start_date: e.startDate, end_date: e.endDate, course_id: e.course?._id }));
    res.json({ success: true, data: exams });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, type, course_id, semester, academic_year, start_date, end_date, status } = req.body;
    if (!name || !type || !course_id || !semester) return res.status(400).json({ success: false, message: 'Required fields missing' });
    const exam = await Exam.create({ name, type, course: course_id, semester, academicYear: academic_year || '2025-26', startDate: start_date, endDate: end_date, status: status || 'UPCOMING', createdBy: req.user.id });
    res.status(201).json({ success: true, message: 'Exam created', data: exam });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const updates = {};
    const map = { course_id: 'course', academic_year: 'academicYear', start_date: 'startDate', end_date: 'endDate' };
    for (const [k, v] of Object.entries(map)) { if (req.body[k] !== undefined) updates[v] = req.body[k]; }
    for (const f of ['name', 'type', 'semester', 'status']) { if (req.body[f] !== undefined) updates[f] = req.body[f]; }
    const exam = await Exam.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!exam) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Updated', data: exam });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

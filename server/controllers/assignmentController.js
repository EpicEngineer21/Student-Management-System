const Assignment = require('../models/Assignment');
const Teacher = require('../models/Teacher');

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.subject_id) filter.subject = req.query.subject_id;
    if (req.query.status) filter.status = req.query.status;
    const data = await Assignment.find(filter)
      .populate('subject', 'name code')
      .populate('teacher', 'firstName lastName')
      .sort({ dueDate: -1 }).lean();
    const assignments = data.map(a => ({
      ...a,
      subject_name: a.subject?.name, subject_code: a.subject?.code,
      teacher_name: a.teacher ? `${a.teacher.firstName} ${a.teacher.lastName}` : null,
      due_date: a.dueDate, max_marks: a.maxMarks,
      submission_count: a.submissions?.length || 0,
    }));
    res.json({ success: true, data: assignments });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description, subject_id, due_date, max_marks } = req.body;
    if (!title || !subject_id || !due_date) return res.status(400).json({ success: false, message: 'Title, subject and due date required' });
    const teacher = await Teacher.findOne({ user: req.user.id });
    const assignment = await Assignment.create({
      title, description, subject: subject_id,
      teacher: teacher?._id || req.user.id,
      dueDate: due_date, maxMarks: max_marks || 10,
    });
    res.status(201).json({ success: true, message: 'Assignment created', data: assignment });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.title) updates.title = req.body.title;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.due_date) updates.dueDate = req.body.due_date;
    if (req.body.max_marks) updates.maxMarks = req.body.max_marks;
    if (req.body.status) updates.status = req.body.status;
    if (req.body.subject_id) updates.subject = req.body.subject_id;
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!assignment) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Updated', data: assignment });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const a = await Assignment.findByIdAndUpdate(req.params.id, { status: 'CANCELLED' }, { new: true });
    if (!a) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Cancelled' });
  } catch (err) { next(err); }
};

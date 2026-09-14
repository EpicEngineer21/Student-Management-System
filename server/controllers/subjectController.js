const Subject = require('../models/Subject');

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.department_id) filter.department = req.query.department_id;
    if (req.query.course_id) filter.course = req.query.course_id;
    if (req.query.semester) filter.semester = parseInt(req.query.semester);
    if (req.query.type) filter.type = req.query.type;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { code: { $regex: req.query.search, $options: 'i' } },
      ];
    }
    const data = await Subject.find(filter)
      .populate('department', 'name code')
      .populate('course', 'name code')
      .populate('teacher', 'firstName lastName')
      .sort({ code: 1 }).lean();
    const subjects = data.map(s => ({ ...s, course_name: s.course?.name, teacher_name: s.teacher ? `${s.teacher.firstName} ${s.teacher.lastName}` : null }));
    res.json({ success: true, data: subjects });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { code, name, department_id, course_id, semester, credits, type, teacher_id, max_marks } = req.body;
    if (!code || !name || !department_id || !course_id || !semester) return res.status(400).json({ success: false, message: 'Required fields missing' });
    const subject = await Subject.create({ code, name, department: department_id, course: course_id, semester, credits: credits || 3, type: type || 'Theory', teacher: teacher_id || undefined, maxMarks: max_marks || 100 });
    res.status(201).json({ success: true, message: 'Subject created', data: subject });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const updates = {};
    const map = { department_id: 'department', course_id: 'course', teacher_id: 'teacher', max_marks: 'maxMarks', pass_marks: 'passMarks' };
    for (const [k, v] of Object.entries(map)) { if (req.body[k] !== undefined) updates[v] = req.body[k] || undefined; }
    for (const f of ['name', 'code', 'semester', 'credits', 'type', 'status']) { if (req.body[f] !== undefined) updates[f] = req.body[f]; }
    const subject = await Subject.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!subject) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Updated', data: subject });
  } catch (err) { next(err); }
};

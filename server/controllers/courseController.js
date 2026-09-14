const Course = require('../models/Course');

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.department_id) filter.department = req.query.department_id;
    if (req.query.status) filter.status = req.query.status;
    const data = await Course.find(filter).populate('department', 'name code').sort({ name: 1 }).lean();
    const courses = data.map(c => ({ ...c, department_name: c.department?.name || null }));
    res.json({ success: true, data: courses });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, code, department_id, duration_years, total_semesters, description } = req.body;
    if (!name || !code || !department_id) return res.status(400).json({ success: false, message: 'Name, code and department required' });
    const course = await Course.create({ name, code, department: department_id, durationYears: duration_years || 4, totalSemesters: total_semesters || 8, description });
    res.status(201).json({ success: true, message: 'Course created', data: course });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.code) updates.code = req.body.code;
    if (req.body.department_id) updates.department = req.body.department_id;
    if (req.body.duration_years) updates.durationYears = req.body.duration_years;
    if (req.body.total_semesters) updates.totalSemesters = req.body.total_semesters;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.status) updates.status = req.body.status;
    const course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate('department', 'name code');
    if (!course) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Updated', data: course });
  } catch (err) { next(err); }
};

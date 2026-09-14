const Department = require('../models/Department');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');

exports.list = async (req, res, next) => {
  try {
    const depts = await Department.find().lean();
    // Aggregate counts
    for (const d of depts) {
      d.student_count = await Student.countDocuments({ department: d._id });
      d.teacher_count = await Teacher.countDocuments({ department: d._id });
      d.course_count = await Course.countDocuments({ department: d._id });
    }
    res.json({ success: true, data: depts });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, code, description, hod_name, status } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code required' });
    const dept = await Department.create({ name, code, description, hodName: hod_name, status });
    res.status(201).json({ success: true, message: 'Department created', data: dept });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.code) updates.code = req.body.code;
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.hod_name !== undefined) updates.hodName = req.body.hod_name;
    if (req.body.status) updates.status = req.body.status;
    const dept = await Department.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!dept) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Updated', data: dept });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
};

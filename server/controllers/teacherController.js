const Teacher = require('../models/Teacher');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, department_id, status } = req.query;
    const filter = {};
    if (department_id) filter.department = department_id;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await Teacher.countDocuments(filter);
    const data = await Teacher.find(filter)
      .populate('department', 'name code')
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .sort({ firstName: 1 })
      .lean();
    const teachers = data.map(t => ({ ...t, department_name: t.department?.name || null, email: null }));
    // Get emails
    const userIds = data.map(t => t.user);
    const users = await User.find({ _id: { $in: userIds } }).select('email').lean();
    const emailMap = {};
    users.forEach(u => { emailMap[u._id.toString()] = u.email; });
    teachers.forEach(t => { t.email = emailMap[t.user?.toString()] || ''; });
    res.json({ success: true, data: teachers, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate('department', 'name code').lean();
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    const user = await User.findById(teacher.user).select('email').lean();
    res.json({ success: true, data: { ...teacher, email: user?.email, department_name: teacher.department?.name } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { first_name, last_name, email, phone, employee_id, department_id, designation, qualification, specialization, joining_date } = req.body;
    if (!first_name || !last_name || !email || !employee_id) return res.status(400).json({ success: false, message: 'Required fields missing' });
    const passwordHash = await bcrypt.hash('Teacher@12345', 12);
    const user = await User.create({ email: email.toLowerCase(), passwordHash, role: 'TEACHER' });
    const teacher = await Teacher.create({ user: user._id, employeeId: employee_id, firstName: first_name, lastName: last_name, phone, department: department_id || undefined, designation: designation || 'Assistant Professor', qualification, specialization, joiningDate: joining_date || undefined });
    res.status(201).json({ success: true, message: 'Teacher created', data: teacher });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const updates = {};
    const map = { first_name: 'firstName', last_name: 'lastName', department_id: 'department', employee_id: 'employeeId', joining_date: 'joiningDate' };
    for (const [k, v] of Object.entries(map)) { if (req.body[k] !== undefined) updates[v] = req.body[k]; }
    for (const f of ['phone', 'designation', 'qualification', 'specialization', 'status']) { if (req.body[f] !== undefined) updates[f] = req.body[f]; }
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate('department', 'name code');
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    res.json({ success: true, message: 'Teacher updated', data: teacher });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, { status: 'INACTIVE' }, { new: true });
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
    await User.findByIdAndUpdate(teacher.user, { status: 'INACTIVE' });
    res.json({ success: true, message: 'Teacher deactivated' });
  } catch (err) { next(err); }
};

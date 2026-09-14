const Student = require('../models/Student');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const bcrypt = require('bcryptjs');
const { mergeSort, quickSort } = require('../dsa/Sort');
const { binarySearch } = require('../dsa/Search');
const HashTable = require('../dsa/HashTable');

// DSA: HashTable cache for recently accessed students
const studentCache = new HashTable(128);

exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, department_id, semester, status, sortBy = 'firstName', algorithm = 'mergesort' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = {};
    if (department_id) filter.department = department_id;
    if (semester) filter.currentSemester = parseInt(semester);
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { enrollmentNumber: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Student.countDocuments(filter);
    let students = await Student.find(filter)
      .populate('department', 'name code')
      .populate('course', 'name code')
      .lean();

    // DSA: Sort using our custom sorting algorithms instead of MongoDB sort
    const keyFn = (item) => (item[sortBy] || '').toString().toLowerCase();
    
    let sortResult;
    if (algorithm === 'quicksort') {
      sortResult = quickSort([...students], keyFn);
    } else {
      sortResult = mergeSort([...students], keyFn);
    }
    
    students = sortResult.sorted;
    const comparisons = sortResult.comparisons;

    // Paginate after sorting
    const paginated = students.slice(skip, skip + parseInt(limit));

    // Flatten populated fields for frontend
    const data = paginated.map(s => ({
      ...s,
      department_name: s.department?.name || null,
      course_name: s.course?.name || null,
    }));

    res.json({
      success: true,
      data,
      pagination: {
        page: parseInt(page), limit: parseInt(limit), total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
      algorithm: algorithm === 'quicksort' ? 'Quick Sort' : 'Merge Sort',
      comparisons,
    });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    // DSA: Check HashTable cache first
    let student = studentCache.get(req.params.id);
    if (!student) {
      student = await Student.findById(req.params.id)
        .populate('department', 'name code')
        .populate('course', 'name code')
        .lean();
      if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
      studentCache.set(req.params.id, student);
    }
    res.json({ success: true, data: { ...student, department_name: student.department?.name, course_name: student.course?.name } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { first_name, last_name, email, phone, enrollment_number, roll_number, department_id, course_id, current_semester, section, date_of_birth, gender, admission_date, address, city, state, status: studentStatus } = req.body;
    if (!first_name || !last_name || !email || !enrollment_number || !roll_number) {
      return res.status(400).json({ success: false, message: 'First name, last name, email, enrollment number, and roll number are required' });
    }

    // Create user account
    const passwordHash = await bcrypt.hash('Student@12345', 12);
    const user = await User.create({ email: email.toLowerCase(), passwordHash, role: 'STUDENT' });

    const student = await Student.create({
      user: user._id, firstName: first_name, lastName: last_name,
      enrollmentNumber: enrollment_number, rollNumber: roll_number,
      phone, department: department_id || undefined, course: course_id || undefined,
      currentSemester: current_semester || 1, section: section || 'A',
      dateOfBirth: date_of_birth || undefined, gender, admissionDate: admission_date || undefined,
      address, city, state, status: studentStatus || 'ACTIVE',
    });

    res.status(201).json({ success: true, message: 'Student created', data: student });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const updates = {};
    const fields = ['firstName', 'lastName', 'phone', 'department', 'course', 'currentSemester', 'section', 'dateOfBirth', 'gender', 'admissionDate', 'address', 'city', 'state', 'status', 'rollNumber', 'enrollmentNumber'];
    const bodyMap = { first_name: 'firstName', last_name: 'lastName', department_id: 'department', course_id: 'course', current_semester: 'currentSemester', date_of_birth: 'dateOfBirth', admission_date: 'admissionDate', roll_number: 'rollNumber', enrollment_number: 'enrollmentNumber' };

    for (const [bodyKey, modelKey] of Object.entries(bodyMap)) {
      if (req.body[bodyKey] !== undefined) updates[modelKey] = req.body[bodyKey];
    }
    // Direct field names
    for (const f of ['phone', 'gender', 'address', 'city', 'state', 'status', 'section']) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }

    const student = await Student.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('department', 'name code').populate('course', 'name code');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    studentCache.delete(req.params.id); // Invalidate cache
    res.json({ success: true, message: 'Student updated', data: student });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, { status: 'INACTIVE' }, { new: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    await User.findByIdAndUpdate(student.user, { status: 'INACTIVE' });
    studentCache.delete(req.params.id);
    res.json({ success: true, message: 'Student deactivated' });
  } catch (err) { next(err); }
};

exports.getAttendance = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const summary = await Attendance.aggregate([
      { $match: { student: student._id } },
      { $group: {
        _id: '$subject',
        total: { $sum: 1 },
        present: { $sum: { $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0] } },
      }},
      { $lookup: { from: 'subjects', localField: '_id', foreignField: '_id', as: 'subjectInfo' } },
      { $unwind: '$subjectInfo' },
      { $project: {
        subject_name: '$subjectInfo.name', subject_code: '$subjectInfo.code',
        total: 1, present: 1,
        percentage: { $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 1] },
      }},
    ]);

    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
};

exports.getMarks = async (req, res, next) => {
  try {
    const marks = await Mark.find({ student: req.params.id, isPublished: true })
      .populate('subject', 'name code credits')
      .populate('exam', 'name type')
      .lean();

    // Calculate CGPA
    const withGP = marks.filter(m => m.gradePoint != null);
    const cgpa = withGP.length > 0
      ? (withGP.reduce((sum, m) => sum + m.gradePoint, 0) / withGP.length).toFixed(2)
      : 0;

    res.json({ success: true, data: { marks, cgpa } });
  } catch (err) { next(err); }
};

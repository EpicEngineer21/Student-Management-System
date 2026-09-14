const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Department = require('../models/Department');
const Course = require('../models/Course');
const Subject = require('../models/Subject');
const Exam = require('../models/Exam');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const Fee = require('../models/Fee');
const Notice = require('../models/Notice');
const Assignment = require('../models/Assignment');
const Timetable = require('../models/Timetable');
const ActivityLog = require('../models/ActivityLog');

// DSA modules
const HashTable = require('../dsa/HashTable');
const Stack = require('../dsa/Stack');
const Queue = require('../dsa/Queue');
const PriorityQueue = require('../dsa/PriorityQueue');
const LinkedList = require('../dsa/LinkedList');
const { binarySearch, linearSearch } = require('../dsa/Search');
const { mergeSort, quickSort, bubbleSort } = require('../dsa/Sort');
const Graph = require('../dsa/Graph');

exports.admin = async (req, res, next) => {
  try {
    const [totalStudents, totalTeachers, totalDepts, totalCourses, totalSubjects, activeExams, pendingFees, recentNotices, recentActivity] = await Promise.all([
      Student.countDocuments({ status: 'ACTIVE' }),
      Teacher.countDocuments({ status: 'ACTIVE' }),
      Department.countDocuments({ status: 'ACTIVE' }),
      Course.countDocuments({ status: 'ACTIVE' }),
      Subject.countDocuments({ status: 'ACTIVE' }),
      Exam.countDocuments({ status: { $in: ['UPCOMING', 'ONGOING'] } }),
      Fee.countDocuments({ status: { $in: ['Pending', 'Overdue'] } }),
      Notice.find({ status: 'ACTIVE' }).sort({ createdAt: -1 }).limit(5).lean(),
      ActivityLog.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);

    // Department-wise student distribution
    const deptStats = await Student.aggregate([
      { $match: { status: 'ACTIVE' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { name: '$dept.name', count: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        stats: { totalStudents, totalTeachers, totalDepts, totalCourses, totalSubjects, activeExams, pendingFees },
        deptStats, recentNotices, recentActivity,
      },
    });
  } catch (err) { next(err); }
};

exports.teacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id }).populate('department', 'name').lean();
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher profile not found' });

    const mySubjects = await Subject.find({ teacher: teacher._id }).lean();
    const subjectIds = mySubjects.map(s => s._id);

    const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
    const todayClasses = await Timetable.find({ teacher: teacher._id, day: today })
      .populate('subject', 'name code').lean();

    const totalStudents = await Student.countDocuments({ department: teacher.department?._id, status: 'ACTIVE' });
    const pendingAssignments = await Assignment.countDocuments({ teacher: teacher._id, status: 'ACTIVE' });
    const recentNotices = await Notice.find({ status: 'ACTIVE' }).sort({ createdAt: -1 }).limit(5).lean();

    res.json({
      success: true,
      data: {
        teacher, mySubjects, todayClasses: todayClasses.map(c => ({
          ...c, subject_name: c.subject?.name, start_time: c.startTime, end_time: c.endTime, room_number: c.roomNumber,
        })),
        totalStudents, pendingMarks: 0, pendingAssignments, recentNotices,
      },
    });
  } catch (err) { next(err); }
};

exports.student = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id })
      .populate('department', 'name code')
      .populate('course', 'name code').lean();
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    // Attendance percentage
    const attData = await Attendance.aggregate([
      { $match: { student: student._id } },
      { $group: { _id: null, total: { $sum: 1 }, present: { $sum: { $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0] } } } },
    ]);
    const attendance = attData[0] ? { total: attData[0].total, present: attData[0].present, percentage: Math.round((attData[0].present / attData[0].total) * 100) } : { total: 0, present: 0, percentage: 0 };

    // CGPA
    const marks = await Mark.find({ student: student._id, isPublished: true }).lean();
    const graded = marks.filter(m => m.gradePoint != null);
    const cgpa = graded.length ? (graded.reduce((s, m) => s + m.gradePoint, 0) / graded.length).toFixed(2) : 0;

    const totalSubjects = await Subject.countDocuments({ course: student.course?._id, semester: student.currentSemester });
    const pendingAssignments = await Assignment.countDocuments({ status: 'ACTIVE' });
    const upcomingExams = await Exam.find({ status: { $in: ['UPCOMING', 'ONGOING'] } }).sort({ startDate: 1 }).limit(5).lean();
    const feeStatus = await Fee.find({ student: student._id }).sort({ createdAt: -1 }).limit(3).lean();
    const recentNotices = await Notice.find({ status: 'ACTIVE', targetRole: { $in: ['ALL', 'STUDENT'] } }).sort({ createdAt: -1 }).limit(5).lean();

    res.json({
      success: true,
      data: {
        student: { ...student, department_name: student.department?.name, course_name: student.course?.name },
        attendance, cgpa, totalSubjects, pendingAssignments,
        upcomingExams: upcomingExams.map(e => ({ ...e, start_date: e.startDate })),
        feeStatus: feeStatus.map(f => ({ ...f, fee_type: f.feeType, total_amount: f.totalAmount, due_date: f.dueDate })),
        recentNotices,
      },
    });
  } catch (err) { next(err); }
};

exports.dsaDemo = async (req, res, next) => {
  try {
    // ── Sorting Demo ──
    const students = await Student.find({ status: 'ACTIVE' }).select('firstName lastName enrollmentNumber').lean();
    const arr = students.map(s => ({ name: `${s.firstName} ${s.lastName}`, enrollment: s.enrollmentNumber }));

    const mergeRes = mergeSort([...arr], x => x.name);
    const mergeCmp = mergeRes.comparisons;
    
    const quickRes = quickSort([...arr], x => x.name);
    const quickCmp = quickRes.comparisons;
    
    const smallArr = arr.slice(0, 20);
    const bubbleRes = bubbleSort([...smallArr], x => x.name);
    const bubbleCmp = bubbleRes.comparisons;

    // ── Search Demo ──
    const sortedRes = mergeSort([...arr], x => x.enrollment);
    const sorted = sortedRes.sorted;
    const target = sorted[Math.floor(sorted.length / 2)]?.enrollment || '';
    const bsResult = binarySearch(sorted, target, x => x.enrollment);
    const lsResult = linearSearch(sorted, target, x => x.enrollment);

    // ── Graph Demo ──
    const graph = new Graph();
    const depts = await Department.find().lean();
    const courses = await Course.find().lean();
    const subjects = await Subject.find().lean();
    depts.forEach(d => { graph.addVertex(d.name); });
    courses.forEach(c => { const d = depts.find(x => x._id.toString() === c.department?.toString()); if (d) graph.addEdge(d.name, c.name); });
    subjects.forEach(s => { const c = courses.find(x => x._id.toString() === s.course?.toString()); if (c) graph.addEdge(c.name, s.name); });
    const bfsOrder = depts.length ? graph.bfs(depts[0].name) : [];
    const dfsOrder = depts.length ? graph.dfs(depts[0].name) : [];

    // ── HashTable Demo ──
    const ht = new HashTable(16);
    students.slice(0, 10).forEach(s => ht.set(s.enrollmentNumber, s.firstName));

    // ── Stack Demo ──
    const stack = new Stack();
    ['Login Page', 'Dashboard', 'Students', 'Student #42 Profile', 'Attendance'].forEach(p => stack.push(p));

    // ── Queue Demo ──
    const queue = new Queue();
    ['Process Attendance CSV', 'Generate Report Cards', 'Send Fee Reminders', 'Backup Database'].forEach(t => queue.enqueue(t));
    const processed = queue.dequeue();

    // ── PriorityQueue Demo ──
    const pq = new PriorityQueue();
    const notices = await Notice.find({ status: 'ACTIVE' }).limit(5).lean();
    const pMap = { HIGH: 1, MEDIUM: 2, LOW: 3 };
    notices.forEach(n => pq.enqueue(n.title, pMap[n.priority] || 2));

    // ── LinkedList Demo ──
    const ll = new LinkedList();
    const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(5).lean();
    logs.forEach(l => ll.append({ action: `${l.action} by ${l.userEmail || 'system'}`, time: l.createdAt }));

    res.json({
      success: true,
      data: {
        sorting: {
          mergeSort: { algorithm: 'Merge Sort', comparisons: mergeCmp, inputSize: arr.length, complexity: 'O(n log n)' },
          quickSort: { algorithm: 'Quick Sort', comparisons: quickCmp, inputSize: arr.length, complexity: 'O(n log n) avg' },
          bubbleSort: { algorithm: 'Bubble Sort', comparisons: bubbleCmp, inputSize: smallArr.length, complexity: 'O(n²)' },
        },
        searching: {
          binarySearch: { algorithm: 'Binary Search', steps: bsResult.steps, found: bsResult.found, complexity: 'O(log n)' },
          linearSearch: { algorithm: 'Linear Search', steps: lsResult.steps, found: lsResult.found, complexity: 'O(n)' },
        },
        graph: { vertices: graph.adjacencyList ? Object.keys(graph.adjacencyList).length : 0, bfsOrder, dfsOrder },
        hashTable: { stats: { buckets: ht.size || 16, entries: ht.count || 0, loadFactor: ht.count ? (ht.count / (ht.size || 16)).toFixed(2) : '0' } },
        stack: { top: stack.peek(), history: stack.toArray ? stack.toArray() : [], size: stack.length || 0 },
        queue: { processed, pending: queue.toArray ? queue.toArray() : [], size: queue.length || 0 },
        priorityQueue: { next: pq.peek ? pq.peek() : null },
        linkedList: { size: ll.size || ll.length || 0, activities: ll.toArray ? ll.toArray() : [] },
      },
    });
  } catch (err) { next(err); }
};

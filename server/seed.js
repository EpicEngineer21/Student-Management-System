const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./config/config');
const connectDB = require('./config/db');

// Models
const User = require('./models/User');
const Department = require('./models/Department');
const Course = require('./models/Course');
const Teacher = require('./models/Teacher');
const Student = require('./models/Student');
const Subject = require('./models/Subject');
const Class = require('./models/Class');
const Exam = require('./models/Exam');
const Notice = require('./models/Notice');
const Fee = require('./models/Fee');
const Attendance = require('./models/Attendance');
const Mark = require('./models/Mark');
const Timetable = require('./models/Timetable');
const ActivityLog = require('./models/ActivityLog');

async function seed() {
  await connectDB();
  console.log('🗑  Clearing existing data...');
  await Promise.all([
    User.deleteMany(), Department.deleteMany(), Course.deleteMany(), Teacher.deleteMany(),
    Student.deleteMany(), Subject.deleteMany(), Class.deleteMany(), Exam.deleteMany(),
    Notice.deleteMany(), Fee.deleteMany(), Attendance.deleteMany(), Mark.deleteMany(),
    Timetable.deleteMany(), ActivityLog.deleteMany(),
  ]);

  const hash = await bcrypt.hash('Admin@12345', 12);
  const hashT = await bcrypt.hash('Teacher@12345', 12);
  const hashS = await bcrypt.hash('Student@12345', 12);

  // ── Users ──
  console.log('👤 Creating users...');
  const adminUsers = await User.insertMany([
    { email: 'admin@sms.edu', passwordHash: hash, role: 'ADMIN' },
    { email: 'admin2@sms.edu', passwordHash: hash, role: 'ADMIN' },
    { email: 'admin3@sms.edu', passwordHash: hash, role: 'ADMIN' },
  ]);

  // ── Departments ──
  console.log('🏢 Creating departments...');
  const depts = await Department.insertMany([
    { name: 'Computer Science & Engineering', code: 'CSE', hodName: 'Dr. Rajesh Kumar' },
    { name: 'Electronics & Communication', code: 'ECE', hodName: 'Dr. Priya Singh' },
    { name: 'Mechanical Engineering', code: 'ME', hodName: 'Dr. Anil Sharma' },
    { name: 'Civil Engineering', code: 'CE', hodName: 'Dr. Sunita Verma' },
    { name: 'Information Technology', code: 'IT', hodName: 'Dr. Vikram Patel' },
  ]);

  // ── Courses ──
  console.log('📚 Creating courses...');
  const courses = await Course.insertMany([
    { name: 'B.Tech Computer Science', code: 'BTCS', department: depts[0]._id, durationYears: 4, totalSemesters: 8 },
    { name: 'B.Tech Electronics', code: 'BTEC', department: depts[1]._id, durationYears: 4, totalSemesters: 8 },
    { name: 'B.Tech Mechanical', code: 'BTME', department: depts[2]._id, durationYears: 4, totalSemesters: 8 },
    { name: 'B.Tech Civil', code: 'BTCE', department: depts[3]._id, durationYears: 4, totalSemesters: 8 },
    { name: 'B.Tech Information Technology', code: 'BTIT', department: depts[4]._id, durationYears: 4, totalSemesters: 8 },
  ]);

  // ── Teachers ──
  console.log('👨‍🏫 Creating teachers...');
  const teacherNames = [
    ['Amit', 'Verma'], ['Sneha', 'Gupta'], ['Rahul', 'Jain'], ['Pooja', 'Mehta'], ['Vikash', 'Singh'],
    ['Neha', 'Sharma'], ['Deepak', 'Kumar'], ['Anjali', 'Das'], ['Rohit', 'Pandey'], ['Kavita', 'Mishra'],
  ];
  const teacherUsers = await User.insertMany(teacherNames.map((n, i) => ({
    email: i === 0 ? 'teacher@sms.edu' : `teacher${i + 1}@sms.edu`,
    passwordHash: hashT, role: 'TEACHER',
  })));
  const teachers = await Teacher.insertMany(teacherNames.map((n, i) => ({
    user: teacherUsers[i]._id, employeeId: `EMP${String(1001 + i)}`,
    firstName: n[0], lastName: n[1], phone: `98${String(10000000 + i * 111)}`,
    department: depts[i % 5]._id,
    designation: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer'][i % 4],
    qualification: ['Ph.D', 'M.Tech', 'M.Sc', 'M.E'][i % 4],
    specialization: ['AI/ML', 'Data Science', 'VLSI', 'Thermodynamics', 'Structures'][i % 5],
    joiningDate: new Date(`${2015 + (i % 8)}-0${1 + (i % 9)}-15`),
  })));

  // ── Students ──
  console.log('👨‍🎓 Creating 100 students...');
  const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Krishna', 'Ishaan', 'Shaurya', 'Ananya', 'Diya', 'Myra', 'Sara', 'Aanya', 'Aadhya', 'Riya', 'Prisha', 'Navya', 'Kiara'];
  const lastNames = ['Sharma', 'Singh', 'Patel', 'Kumar', 'Gupta', 'Verma', 'Jain', 'Mehta', 'Das', 'Reddy'];
  const studentUsers = await User.insertMany(
    Array.from({ length: 100 }, (_, i) => ({
      email: i === 0 ? 'student@sms.edu' : `student${i + 1}@sms.edu`,
      passwordHash: hashS, role: 'STUDENT',
    }))
  );
  const students = await Student.insertMany(
    Array.from({ length: 100 }, (_, i) => ({
      user: studentUsers[i]._id,
      enrollmentNumber: `EN${String(2025001 + i)}`,
      rollNumber: `${String(101 + (i % 50))}`,
      firstName: firstNames[i % 20],
      lastName: lastNames[i % 10],
      dateOfBirth: new Date(`200${3 + (i % 4)}-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 28)).padStart(2, '0')}`),
      gender: i % 3 === 0 ? 'Female' : 'Male',
      phone: `97${String(10000000 + i * 99)}`,
      department: depts[i % 5]._id,
      course: courses[i % 5]._id,
      currentSemester: 1 + (i % 8),
      section: ['A', 'B', 'C'][i % 3],
      academicYear: '2025-26',
      admissionDate: new Date('2025-07-01'),
      city: ['Delhi', 'Mumbai', 'Pune', 'Jaipur', 'Hyderabad'][i % 5],
      state: ['Delhi', 'Maharashtra', 'Maharashtra', 'Rajasthan', 'Telangana'][i % 5],
    }))
  );

  // ── Subjects ──
  console.log('📖 Creating subjects...');
  const subjectData = [
    { code: 'CS101', name: 'Data Structures', deptIdx: 0, courseIdx: 0, sem: 3, credits: 4, type: 'Theory' },
    { code: 'CS102', name: 'Algorithms', deptIdx: 0, courseIdx: 0, sem: 4, credits: 4, type: 'Theory' },
    { code: 'CS103', name: 'Operating Systems', deptIdx: 0, courseIdx: 0, sem: 5, credits: 3, type: 'Theory' },
    { code: 'CS104', name: 'Database Management', deptIdx: 0, courseIdx: 0, sem: 4, credits: 4, type: 'Theory' },
    { code: 'CS105', name: 'Computer Networks', deptIdx: 0, courseIdx: 0, sem: 5, credits: 3, type: 'Theory' },
    { code: 'CS106', name: 'Web Development Lab', deptIdx: 0, courseIdx: 0, sem: 3, credits: 2, type: 'Practical' },
    { code: 'EC201', name: 'Digital Electronics', deptIdx: 1, courseIdx: 1, sem: 3, credits: 4, type: 'Theory' },
    { code: 'EC202', name: 'Signal Processing', deptIdx: 1, courseIdx: 1, sem: 4, credits: 3, type: 'Theory' },
    { code: 'EC203', name: 'VLSI Design', deptIdx: 1, courseIdx: 1, sem: 5, credits: 3, type: 'Theory' },
    { code: 'EC204', name: 'Microprocessors Lab', deptIdx: 1, courseIdx: 1, sem: 4, credits: 2, type: 'Practical' },
    { code: 'ME301', name: 'Thermodynamics', deptIdx: 2, courseIdx: 2, sem: 3, credits: 4, type: 'Theory' },
    { code: 'ME302', name: 'Fluid Mechanics', deptIdx: 2, courseIdx: 2, sem: 4, credits: 3, type: 'Theory' },
    { code: 'ME303', name: 'Manufacturing Processes', deptIdx: 2, courseIdx: 2, sem: 5, credits: 3, type: 'Theory' },
    { code: 'ME304', name: 'Workshop Practice', deptIdx: 2, courseIdx: 2, sem: 3, credits: 2, type: 'Practical' },
    { code: 'CE401', name: 'Structural Analysis', deptIdx: 3, courseIdx: 3, sem: 4, credits: 4, type: 'Theory' },
    { code: 'CE402', name: 'Geotechnical Engineering', deptIdx: 3, courseIdx: 3, sem: 5, credits: 3, type: 'Theory' },
    { code: 'CE403', name: 'Surveying Lab', deptIdx: 3, courseIdx: 3, sem: 3, credits: 2, type: 'Practical' },
    { code: 'IT501', name: 'Cloud Computing', deptIdx: 4, courseIdx: 4, sem: 6, credits: 3, type: 'Theory' },
    { code: 'IT502', name: 'Cybersecurity', deptIdx: 4, courseIdx: 4, sem: 6, credits: 3, type: 'Theory' },
    { code: 'IT503', name: 'Machine Learning', deptIdx: 4, courseIdx: 4, sem: 7, credits: 4, type: 'Theory' },
  ];
  const subjects = await Subject.insertMany(subjectData.map((s, i) => ({
    code: s.code, name: s.name, department: depts[s.deptIdx]._id, course: courses[s.courseIdx]._id,
    semester: s.sem, credits: s.credits, type: s.type,
    teacher: teachers[i % teachers.length]._id,
  })));

  // ── Classes ──
  console.log('🏫 Creating classes...');
  const classes = await Class.insertMany([
    { course: courses[0]._id, department: depts[0]._id, semester: 3, section: 'A', academicYear: '2025-26', classTeacher: teachers[0]._id, roomNumber: 'A-101' },
    { course: courses[0]._id, department: depts[0]._id, semester: 4, section: 'A', academicYear: '2025-26', classTeacher: teachers[1]._id, roomNumber: 'A-102' },
    { course: courses[1]._id, department: depts[1]._id, semester: 3, section: 'A', academicYear: '2025-26', classTeacher: teachers[2]._id, roomNumber: 'B-201' },
    { course: courses[2]._id, department: depts[2]._id, semester: 3, section: 'A', academicYear: '2025-26', classTeacher: teachers[4]._id, roomNumber: 'C-301' },
    { course: courses[3]._id, department: depts[3]._id, semester: 4, section: 'A', academicYear: '2025-26', classTeacher: teachers[6]._id, roomNumber: 'D-101' },
    { course: courses[4]._id, department: depts[4]._id, semester: 6, section: 'A', academicYear: '2025-26', classTeacher: teachers[8]._id, roomNumber: 'E-201' },
  ]);

  // ── Exams ──
  console.log('📝 Creating exams...');
  const exams = await Exam.insertMany([
    { name: 'Mid Semester Exam - Sem 3', type: 'Mid Term', course: courses[0]._id, semester: 3, academicYear: '2025-26', startDate: new Date('2025-10-15'), endDate: new Date('2025-10-22'), status: 'COMPLETED', createdBy: adminUsers[0]._id },
    { name: 'End Semester Exam - Sem 3', type: 'End Semester', course: courses[0]._id, semester: 3, academicYear: '2025-26', startDate: new Date('2025-12-01'), endDate: new Date('2025-12-15'), status: 'UPCOMING', createdBy: adminUsers[0]._id },
    { name: 'Internal Assessment 1', type: 'Internal', course: courses[0]._id, semester: 4, academicYear: '2025-26', startDate: new Date('2025-09-10'), status: 'COMPLETED', createdBy: adminUsers[0]._id },
    { name: 'Practical Exam - ECE Sem 4', type: 'Practical', course: courses[1]._id, semester: 4, academicYear: '2025-26', startDate: new Date('2025-11-20'), status: 'UPCOMING', createdBy: adminUsers[0]._id },
  ]);

  // ── Notices ──
  console.log('📢 Creating notices...');
  await Notice.insertMany([
    { title: 'Mid-Semester Exam Schedule Released', description: 'The mid-semester examination schedule for all departments has been released. Please check the exam portal for details.', category: 'Examination', priority: 'HIGH', targetRole: 'ALL', createdBy: adminUsers[0]._id },
    { title: 'Library Timings Extended', description: 'Library will remain open till 10 PM during exam weeks.', category: 'General', priority: 'MEDIUM', createdBy: adminUsers[0]._id },
    { title: 'Diwali Holiday Announcement', description: 'College will remain closed from Oct 28 to Nov 3 for Diwali festivities.', category: 'Holiday', priority: 'HIGH', targetRole: 'ALL', createdBy: adminUsers[0]._id },
    { title: 'Fee Payment Deadline', description: 'Last date for semester fee payment is September 30, 2025. Late fee of Rs. 500 will be charged after the deadline.', category: 'Fee', priority: 'HIGH', targetRole: 'STUDENT', createdBy: adminUsers[0]._id },
    { title: 'Annual Tech Fest — CodeStorm 2025', description: 'Registration open for CodeStorm 2025. Events include hackathon, coding contest, and paper presentation.', category: 'Event', priority: 'MEDIUM', targetRole: 'ALL', createdBy: adminUsers[0]._id },
  ]);

  // ── Attendance (sample) ──
  console.log('📋 Creating sample attendance...');
  const attRecords = [];
  const cseStudents = students.filter(s => s.department.toString() === depts[0]._id.toString()).slice(0, 10);
  for (let day = 1; day <= 5; day++) {
    for (const stu of cseStudents) {
      attRecords.push({
        student: stu._id, subject: subjects[0]._id, teacher: teachers[0]._id,
        class: classes[0]._id, date: new Date(`2025-09-${String(day).padStart(2, '0')}`),
        status: Math.random() > 0.2 ? 'Present' : 'Absent',
      });
    }
  }
  await Attendance.insertMany(attRecords);

  // ── Fees (sample) ──
  console.log('💰 Creating sample fees...');
  const feeRecords = students.slice(0, 30).map((s, i) => ({
    student: s._id, academicYear: '2025-26', semester: s.currentSemester,
    feeType: 'Tuition', totalAmount: 75000, paidAmount: i < 15 ? 75000 : i < 22 ? 40000 : 0,
    dueDate: new Date('2025-09-30'),
    status: i < 15 ? 'Paid' : i < 22 ? 'Partially Paid' : 'Pending',
    paymentMode: i < 15 ? 'Online' : i < 22 ? 'Cash' : undefined,
    receiptNumber: i < 22 ? `RCP${String(2025001 + i)}` : undefined,
  }));
  await Fee.insertMany(feeRecords);

  // ── Sample marks ──
  console.log('📊 Creating sample marks...');
  const markRecords = [];
  for (let i = 0; i < Math.min(cseStudents.length, 10); i++) {
    const internal = 15 + Math.floor(Math.random() * 10);
    const assignment = 5 + Math.floor(Math.random() * 5);
    const midterm = 20 + Math.floor(Math.random() * 10);
    const practical = 8 + Math.floor(Math.random() * 7);
    const endterm = 25 + Math.floor(Math.random() * 15);
    const total = internal + assignment + midterm + practical + endterm;
    const pct = (total / 100) * 100;
    let grade = 'F', gp = 0;
    for (const b of config.grading.boundaries) { if (pct >= b.min) { grade = b.grade; gp = b.point; break; } }
    markRecords.push({
      student: cseStudents[i]._id, subject: subjects[0]._id, exam: exams[0]._id,
      teacher: teachers[0]._id,
      internalMarks: internal, assignmentMarks: assignment, midtermMarks: midterm,
      practicalMarks: practical, endtermMarks: endterm,
      maxMarks: 100, grade, gradePoint: gp, isPublished: true,
    });
  }
  await Mark.insertMany(markRecords);

  // ── Timetable ──
  console.log('🕐 Creating timetable...');
  await Timetable.insertMany([
    { class: classes[0]._id, subject: subjects[0]._id, teacher: teachers[0]._id, day: 'Monday', startTime: '09:00', endTime: '10:00', roomNumber: 'A-101' },
    { class: classes[0]._id, subject: subjects[5]._id, teacher: teachers[0]._id, day: 'Monday', startTime: '10:00', endTime: '12:00', roomNumber: 'Lab-1' },
    { class: classes[0]._id, subject: subjects[0]._id, teacher: teachers[0]._id, day: 'Wednesday', startTime: '09:00', endTime: '10:00', roomNumber: 'A-101' },
    { class: classes[0]._id, subject: subjects[0]._id, teacher: teachers[0]._id, day: 'Friday', startTime: '09:00', endTime: '10:00', roomNumber: 'A-101' },
    { class: classes[1]._id, subject: subjects[1]._id, teacher: teachers[1]._id, day: 'Tuesday', startTime: '09:00', endTime: '10:00', roomNumber: 'A-102' },
    { class: classes[1]._id, subject: subjects[3]._id, teacher: teachers[1]._id, day: 'Thursday', startTime: '09:00', endTime: '10:00', roomNumber: 'A-102' },
    { class: classes[2]._id, subject: subjects[6]._id, teacher: teachers[2]._id, day: 'Monday', startTime: '11:00', endTime: '12:00', roomNumber: 'B-201' },
    { class: classes[3]._id, subject: subjects[10]._id, teacher: teachers[4]._id, day: 'Tuesday', startTime: '11:00', endTime: '12:00', roomNumber: 'C-301' },
  ]);

  console.log(`
✅ Seed complete!

  👤 Users:        ${await User.countDocuments()} (3 admin + 10 teachers + 100 students)
  🏢 Departments:  ${depts.length}
  📚 Courses:      ${courses.length}
  👨‍🏫 Teachers:     ${teachers.length}
  👨‍🎓 Students:     ${students.length}
  📖 Subjects:     ${subjects.length}
  🏫 Classes:      ${classes.length}
  📝 Exams:        ${exams.length}
  📋 Attendance:   ${attRecords.length}
  📊 Marks:        ${markRecords.length}
  💰 Fees:         ${feeRecords.length}

  Default credentials:
    Admin:   admin@sms.edu   / Admin@12345
    Teacher: teacher@sms.edu / Teacher@12345
    Student: student@sms.edu / Student@12345
  `);

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(err => { console.error('Seed error:', err); process.exit(1); });

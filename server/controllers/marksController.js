const Mark = require('../models/Mark');
const Teacher = require('../models/Teacher');
const config = require('../config/config');

function calculateGrade(totalMarks, maxMarks) {
  const pct = (totalMarks / maxMarks) * 100;
  for (const b of config.grading.boundaries) {
    if (pct >= b.min) return { grade: b.grade, gradePoint: b.point };
  }
  return { grade: 'F', gradePoint: 0 };
}

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.exam_id) filter.exam = req.query.exam_id;
    if (req.query.subject_id) filter.subject = req.query.subject_id;
    if (req.query.student_id) filter.student = req.query.student_id;
    const data = await Mark.find(filter)
      .populate({ path: 'student', select: 'firstName lastName enrollmentNumber' })
      .populate({ path: 'subject', select: 'name code credits' })
      .populate({ path: 'exam', select: 'name type' })
      .sort({ createdAt: -1 })
      .lean();
    const marks = data.map(m => ({
      ...m,
      first_name: m.student?.firstName, last_name: m.student?.lastName,
      enrollment_number: m.student?.enrollmentNumber,
      subject_name: m.subject?.name, subject_code: m.subject?.code,
      exam_name: m.exam?.name,
      total_marks: (m.internalMarks || 0) + (m.assignmentMarks || 0) + (m.midtermMarks || 0) + (m.practicalMarks || 0) + (m.endtermMarks || 0),
      internal_marks: m.internalMarks, assignment_marks: m.assignmentMarks,
      midterm_marks: m.midtermMarks, practical_marks: m.practicalMarks,
      endterm_marks: m.endtermMarks, max_marks: m.maxMarks,
      grade_point: m.gradePoint, is_published: m.isPublished,
    }));
    res.json({ success: true, data: marks });
  } catch (err) { next(err); }
};

exports.save = async (req, res, next) => {
  try {
    const { student_id, subject_id, exam_id, internal_marks, assignment_marks, midterm_marks, practical_marks, endterm_marks, max_marks, is_published } = req.body;
    if (!student_id || !subject_id || !exam_id) return res.status(400).json({ success: false, message: 'Student, subject and exam required' });
    const teacher = await Teacher.findOne({ user: req.user.id });
    const teacherId = teacher?._id || req.user.id;
    const totalMarks = parseFloat(internal_marks || 0) + parseFloat(assignment_marks || 0) + parseFloat(midterm_marks || 0) + parseFloat(practical_marks || 0) + parseFloat(endterm_marks || 0);
    const maxM = parseFloat(max_marks || 100);
    const { grade, gradePoint } = calculateGrade(totalMarks, maxM);
    const mark = await Mark.findOneAndUpdate(
      { student: student_id, subject: subject_id, exam: exam_id },
      { teacher: teacherId, internalMarks: internal_marks || 0, assignmentMarks: assignment_marks || 0, midtermMarks: midterm_marks || 0, practicalMarks: practical_marks || 0, endtermMarks: endterm_marks || 0, maxMarks: maxM, grade, gradePoint, isPublished: !!is_published },
      { upsert: true, new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Marks saved', data: { ...mark.toObject(), grade, grade_point: gradePoint, total_marks: totalMarks } });
  } catch (err) { next(err); }
};

exports.publishResults = async (req, res, next) => {
  try {
    const result = await Mark.updateMany({ exam: req.params.examId }, { isPublished: true });
    res.json({ success: true, message: `Published ${result.modifiedCount} results` });
  } catch (err) { next(err); }
};

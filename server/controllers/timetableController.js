const Timetable = require('../models/Timetable');

exports.list = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.day) filter.day = req.query.day;
    if (req.query.class_id) filter.class = req.query.class_id;
    if (req.query.teacher_id) filter.teacher = req.query.teacher_id;
    const data = await Timetable.find(filter)
      .populate({ path: 'class', populate: [{ path: 'course', select: 'name code' }, { path: 'department', select: 'name' }] })
      .populate('subject', 'name code')
      .populate('teacher', 'firstName lastName')
      .sort({ day: 1, startTime: 1 }).lean();
    const timetable = data.map(t => ({
      ...t,
      subject_name: t.subject?.name, subject_code: t.subject?.code,
      teacher_name: t.teacher ? `${t.teacher.firstName} ${t.teacher.lastName}` : null,
      course_name: t.class?.course?.name || '', semester: t.class?.semester,
      section: t.class?.section, room_number: t.roomNumber,
      start_time: t.startTime, end_time: t.endTime,
    }));
    res.json({ success: true, data: timetable });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { class_id, subject_id, teacher_id, day, start_time, end_time, room_number } = req.body;
    if (!class_id || !subject_id || !teacher_id || !day || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }
    // Conflict detection
    const teacherConflict = await Timetable.findOne({ teacher: teacher_id, day, startTime: start_time });
    if (teacherConflict) return res.status(409).json({ success: false, message: 'Teacher has a conflicting slot at this time' });
    const classConflict = await Timetable.findOne({ class: class_id, day, startTime: start_time });
    if (classConflict) return res.status(409).json({ success: false, message: 'Class has a conflicting slot at this time' });

    const entry = await Timetable.create({
      class: class_id, subject: subject_id, teacher: teacher_id,
      day, startTime: start_time, endTime: end_time, roomNumber: room_number,
    });
    res.status(201).json({ success: true, message: 'Timetable entry added', data: entry });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const entry = await Timetable.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Removed' });
  } catch (err) { next(err); }
};

const express = require('express');
const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Class = require('../models/Class');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

function getClassAliases(name) {
  const clean = (name || '').trim();
  const aliases = [clean];
  if (clean === 'حفظ') aliases.push('حفظ قرآن کریم');
  if (clean === 'حفظ قرآن کریم') aliases.push('حفظ');
  if (clean === 'ناظرہ') aliases.push('ناظرہ قرآن کریم');
  if (clean === 'ناظرہ قرآن کریم') aliases.push('ناظرہ');
  return aliases;
}

router.get('/search', protect, async (req, res) => {
  try {
    const { date, classId, className } = req.query;
    const filter = {};
    if (date) filter.date = date;

    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      filter.$or = [{ class: classId }];
      const cls = await Class.findById(classId);
      if (cls) {
        filter.$or.push({ className: { $in: getClassAliases(cls.name) } });
      }
    } else if (className) {
      filter.className = { $in: getClassAliases(className) };
    }

    const attendance = await Attendance.findOne(filter).populate('class', 'name year');
    res.json(attendance || null);
  } catch (error) {
    console.error('Attendance search error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

router.get('/today-present', protect, async (req, res) => {
  try {
    const targetDate = req.query.date || new Date().toISOString().split('T')[0];

    let attendanceDocs = await Attendance.find({ date: targetDate });

    let effectiveDate = targetDate;
    if (!attendanceDocs || attendanceDocs.length === 0) {
      const latest = await Attendance.findOne().sort('-date');
      if (latest) {
        effectiveDate = latest.date;
        attendanceDocs = await Attendance.find({ date: effectiveDate });
      }
    }

    const presentStudents = [];
    (attendanceDocs || []).forEach((doc) => {
      const className = doc.className || (doc.class && doc.class.name) || 'نامعلوم درجہ';
      (doc.records || []).forEach((r) => {
        if (r.status === 'present') {
          presentStudents.push({
            studentId: r.student,
            studentName: r.studentName || 'طالب علم',
            rollNumber: r.rollNumber || '-',
            className: className,
            date: doc.date,
            status: 'حاضر',
          });
        }
      });
    });

    res.json({
      date: effectiveDate,
      totalPresent: presentStudents.length,
      students: presentStudents,
    });
  } catch (error) {
    console.error('Today present fetch error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.date) filter.date = req.query.date;

    if (req.query.classId) {
      if (mongoose.Types.ObjectId.isValid(req.query.classId)) {
        filter.$or = [{ class: req.query.classId }];
        const cls = await Class.findById(req.query.classId);
        if (cls) {
          filter.$or.push({ className: { $in: getClassAliases(cls.name) } });
        }
      } else {
        filter.className = { $in: getClassAliases(req.query.classId) };
      }
    } else if (req.query.className) {
      filter.className = { $in: getClassAliases(req.query.className) };
    }

    const records = await Attendance.find(filter)
      .populate('class', 'name year')
      .sort('-date -createdAt');

    res.json(records);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const allRecords = await Attendance.find({
      'records.student': req.params.studentId,
    }).sort('-date');

    let totalDays = 0;
    let presentDays = 0;
    let absentDays = 0;
    let leaveDays = 0;

    allRecords.forEach((record) => {
      const studentRecord = record.records.find(
        (r) => r.student && r.student.toString() === req.params.studentId
      );
      if (studentRecord) {
        totalDays++;
        if (studentRecord.status === 'present') presentDays++;
        else if (studentRecord.status === 'absent') absentDays++;
        else if (studentRecord.status === 'leave') leaveDays++;
      }
    });

    const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    res.json({
      totalDays,
      presentDays,
      absentDays,
      leaveDays,
      percentage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

router.post('/', protect, authorize('teacher', 'master_admin'), async (req, res) => {
  try {
    const { date, classId, className, records } = req.body;

    if (!date || (!classId && !className) || !Array.isArray(records)) {
      return res.status(400).json({ message: 'تاریخ، درجہ اور حاضری کا ریکارڈ لازمی ہے' });
    }

    let resolvedClassId = classId && mongoose.Types.ObjectId.isValid(classId) ? classId : null;
    let resolvedClassName = (className || '').trim();

    if (!resolvedClassName && resolvedClassId) {
      const cls = await Class.findById(resolvedClassId);
      if (cls) resolvedClassName = cls.name;
    }
    if (!resolvedClassId && resolvedClassName) {
      const aliases = getClassAliases(resolvedClassName);
      const cls = await Class.findOne({ name: { $in: aliases } });
      if (cls) resolvedClassId = cls._id;
    }

    const sanitizedRecords = records.map((r) => ({
      student: r.student && mongoose.Types.ObjectId.isValid(r.student) ? r.student : undefined,
      studentName: r.studentName || r.name || 'طالب علم',
      rollNumber: String(r.rollNumber || '').trim(),
      status: ['present', 'absent', 'leave'].includes(r.status) ? r.status : 'present',
    }));

    const searchFilter = { date };
    if (resolvedClassId) {
      searchFilter.$or = [
        { class: resolvedClassId },
        { className: { $in: getClassAliases(resolvedClassName) } },
      ];
    } else {
      searchFilter.className = { $in: getClassAliases(resolvedClassName) };
    }

    let attendance = await Attendance.findOne(searchFilter);

    if (attendance) {
      const existingMap = new Map();
      attendance.records.forEach((r) => {
        const key = r.student ? r.student.toString() : r.rollNumber;
        existingMap.set(key, r);
      });

      sanitizedRecords.forEach((newR) => {
        const key = newR.student ? newR.student.toString() : newR.rollNumber;
        existingMap.set(key, newR);
      });

      attendance.records = Array.from(existingMap.values());
      if (resolvedClassId) attendance.class = resolvedClassId;
      if (resolvedClassName) attendance.className = resolvedClassName;
      if (req.user) {
        attendance.teacher = req.user._id;
        attendance.teacherName = req.user.name;
      }
      await attendance.save();
    } else {
      attendance = await Attendance.create({
        date,
        class: resolvedClassId || undefined,
        className: resolvedClassName,
        teacher: req.user ? req.user._id : undefined,
        teacherName: req.user ? req.user.name : undefined,
        records: sanitizedRecords,
      });
    }

    res.status(201).json({
      success: true,
      message: `${attendance.records.length} طلباء کی حاضری کامیابی سے محفوظ ہو گئی`,
      attendance,
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(400).json({ message: error.message || 'حاضری محفوظ کرنے میں خرابی ہوئی' });
  }
});

module.exports = router;

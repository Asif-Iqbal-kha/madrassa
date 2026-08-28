const express = require('express');
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/attendance
// @desc    Get attendance records (filter by classId, date)
// @access  Auth
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.classId) filter.class = req.query.classId;
    if (req.query.date) filter.date = req.query.date;

    const records = await Attendance.find(filter)
      .populate('class', 'name')
      .sort('-date');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/attendance/student/:studentId
// @desc    Get attendance summary for a student
// @access  Auth
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    // Find all attendance records containing this student
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
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/attendance
// @desc    Mark attendance
// @access  Teacher/Admin
router.post('/', protect, authorize('teacher', 'master_admin'), async (req, res) => {
  try {
    const { date, classId, className, records } = req.body;

    // Check if attendance already exists for this date and class
    let attendance = await Attendance.findOne({ date, class: classId });

    if (attendance) {
      // Update existing
      attendance.records = records;
      await attendance.save();
    } else {
      // Create new
      attendance = await Attendance.create({
        date,
        class: classId,
        className,
        records,
      });
    }

    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

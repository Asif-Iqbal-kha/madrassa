const express = require('express');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Donation = require('../models/Donation');
const AdmissionApplication = require('../models/AdmissionApplication');
const Attendance = require('../models/Attendance');

const router = express.Router();

// @route   GET /api/stats
// @desc    Get dashboard statistics directly from database with unified aggregations
// @access  Public
router.get('/', async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: { $in: ['active', null, ''] } });
    const graduatedStudents = await Student.countDocuments({ status: 'graduated' });
    const inactiveStudents = await Student.countDocuments({ status: 'inactive' });

    const totalTeachers = await Teacher.countDocuments({ isActive: true });
    const totalClasses = await Class.countDocuments({ isActive: true });
    const pendingDonations = await Donation.countDocuments({ status: 'pending' });
    const pendingAdmissions = await AdmissionApplication.countDocuments({
      status: { $in: ['pending', 'under_review'] },
    });

    // Attendance calculation: check today's attendance first; if none, check most recent attendance record
    const today = new Date().toISOString().split('T')[0];
    let attendanceDocs = await Attendance.find({ date: today });
    let attendanceDateUsed = today;

    if (!attendanceDocs || attendanceDocs.length === 0) {
      const latestDoc = await Attendance.findOne().sort('-date');
      if (latestDoc && latestDoc.date) {
        attendanceDocs = await Attendance.find({ date: latestDoc.date });
        attendanceDateUsed = latestDoc.date;
      }
    }

    let todayPresent = 0;
    let totalAttendanceRecorded = 0;

    (attendanceDocs || []).forEach((record) => {
      (record.records || []).forEach((r) => {
        totalAttendanceRecorded++;
        if (r.status === 'present') todayPresent++;
      });
    });

    const attendancePercentage = totalAttendanceRecorded > 0
      ? Math.round((todayPresent / totalAttendanceRecorded) * 100)
      : (activeStudents > 0 ? 100 : 0);

    res.json({
      totalStudents,
      activeStudents,
      graduatedStudents,
      inactiveStudents,
      totalTeachers,
      totalClasses,
      todayAttendance: todayPresent,
      totalAttendanceRecorded,
      attendancePercentage,
      attendanceDateUsed,
      pendingDonations,
      pendingAdmissions,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;

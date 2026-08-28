const express = require('express');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Donation = require('../models/Donation');
const AdmissionApplication = require('../models/AdmissionApplication');
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/stats
// @desc    Get dashboard statistics
// @access  Admin
router.get('/', protect, authorize('master_admin'), async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'active' });
    const totalTeachers = await Teacher.countDocuments();
    const totalClasses = await Class.countDocuments({ isActive: true });
    const pendingDonations = await Donation.countDocuments({ status: 'pending' });
    const pendingAdmissions = await AdmissionApplication.countDocuments({
      status: { $in: ['pending', 'under_review'] },
    });

    // Today's attendance
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await Attendance.find({ date: today });
    let todayPresent = 0;
    todayAttendance.forEach((record) => {
      record.records.forEach((r) => {
        if (r.status === 'present') todayPresent++;
      });
    });

    const attendancePercentage = totalStudents > 0
      ? Math.round((todayPresent / activeStudents) * 100)
      : 0;

    res.json({
      totalStudents,
      activeStudents,
      totalTeachers,
      totalClasses,
      todayAttendance: todayPresent,
      attendancePercentage,
      pendingDonations,
      pendingAdmissions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

const express = require('express');
const Result = require('../models/Result');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const defaultResults = [
  {
    examName: 'سالانہ امتحان 1446ھ',
    studentName: 'محمد احمد',
    rollNumber: '1001',
    className: 'درجہ سوم',
    year: '1446',
    marks: [
      { subject: 'قرآن مجید و تجوید', obtainedMarks: 95, totalMarks: 100 },
      { subject: 'حدیث شریف', obtainedMarks: 88, totalMarks: 100 },
      { subject: 'فقہ و اصول فقہ', obtainedMarks: 92, totalMarks: 100 },
      { subject: 'عربی گرائمر و ادب', obtainedMarks: 85, totalMarks: 100 },
      { subject: 'اردو و انشا', obtainedMarks: 90, totalMarks: 100 },
      { subject: 'ریاضی و حساب', obtainedMarks: 84, totalMarks: 100 },
    ],
    totalObtained: 534,
    totalMarks: 600,
    percentage: 89,
    grade: 'الف+ (ممتاز)',
  },
  {
    examName: 'سالانہ امتحان 1446ھ',
    studentName: 'عبداللہ',
    rollNumber: '1002',
    className: 'درجہ سوم',
    year: '1446',
    marks: [
      { subject: 'قرآن مجید و تجوید', obtainedMarks: 90, totalMarks: 100 },
      { subject: 'حدیث شریف', obtainedMarks: 82, totalMarks: 100 },
      { subject: 'فقہ و اصول فقہ', obtainedMarks: 85, totalMarks: 100 },
      { subject: 'عربی گرائمر و ادب', obtainedMarks: 78, totalMarks: 100 },
      { subject: 'اردو و انشا', obtainedMarks: 88, totalMarks: 100 },
      { subject: 'ریاضی و حساب', obtainedMarks: 80, totalMarks: 100 },
    ],
    totalObtained: 503,
    totalMarks: 600,
    percentage: 83.8,
    grade: 'الف (اعلیٰ)',
  },
  {
    examName: 'سالانہ امتحان 1446ھ',
    studentName: 'علی حسن',
    rollNumber: '1003',
    className: 'حفظ',
    year: '1446',
    marks: [
      { subject: 'حفظ القرآن الکریم', obtainedMarks: 98, totalMarks: 100 },
      { subject: 'تجوید و قراءت', obtainedMarks: 95, totalMarks: 100 },
      { subject: 'اسلامی تعلیمات', obtainedMarks: 90, totalMarks: 100 },
    ],
    totalObtained: 283,
    totalMarks: 300,
    percentage: 94.3,
    grade: 'الف+ (ممتاز)',
  },
];

// @route   GET /api/results/roll/:rollNumber
// @desc    Public search results by student roll number (No login required)
// @access  Public
router.get('/roll/:rollNumber', async (req, res) => {
  try {
    const rollNumber = req.params.rollNumber.trim();

    // Auto-seed default results if empty
    const count = await Result.countDocuments();
    if (count === 0) {
      try {
        await Result.insertMany(defaultResults);
      } catch (seedErr) {
        console.warn('Auto seed results warning:', seedErr.message);
      }
    }

    const results = await Result.find({ rollNumber }).sort('-year -createdAt');
    if (!results || results.length === 0) {
      return res.status(404).json({ message: `رول نمبر ${rollNumber} کا کوئی امتحانی نتیجہ نہیں ملا` });
    }
    res.json(results);
  } catch (error) {
    console.error('Search results error:', error);
    res.status(500).json({ message: 'سرور میں خرابی پیش آگئی' });
  }
});

// @route   GET /api/results
// @desc    Get results (filter by examId, studentId)
// @access  Auth
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.examId) filter.exam = req.query.examId;
    if (req.query.studentId) filter.student = req.query.studentId;

    const results = await Result.find(filter)
      .populate('exam', 'name year')
      .populate('student', 'name rollNumber')
      .sort('-year');
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/results/student/:studentId
// @desc    Get all results for a student
// @access  Auth
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const results = await Result.find({ student: req.params.studentId })
      .populate('exam', 'name year')
      .sort('-year');
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/results
// @desc    Upload results
// @access  Admin/Teacher
router.post('/', protect, authorize('master_admin', 'teacher'), async (req, res) => {
  try {
    const result = await Result.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   POST /api/results/bulk
// @desc    Upload multiple results at once
// @access  Admin/Teacher
router.post('/bulk', protect, authorize('master_admin', 'teacher'), async (req, res) => {
  try {
    const results = await Result.insertMany(req.body.results);
    res.status(201).json({ message: `${results.length} results uploaded`, results });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

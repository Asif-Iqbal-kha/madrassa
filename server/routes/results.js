const express = require('express');
const Result = require('../models/Result');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

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

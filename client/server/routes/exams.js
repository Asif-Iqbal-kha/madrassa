const express = require('express');
const Exam = require('../models/Exam');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/exams
// @desc    Get all exams (filter by classId)
// @access  Auth
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.classId) filter.class = req.query.classId;
    if (req.query.published === 'true') filter.isPublished = true;

    const exams = await Exam.find(filter).populate('class', 'name').sort('-year');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/exams
// @desc    Create exam
// @access  Admin/Teacher
router.post('/', protect, authorize('master_admin', 'teacher'), async (req, res) => {
  try {
    const exam = await Exam.create(req.body);
    res.status(201).json(exam);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/exams/:id
// @desc    Update exam
// @access  Admin/Teacher
router.put('/:id', protect, authorize('master_admin', 'teacher'), async (req, res) => {
  try {
    const updated = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Exam not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

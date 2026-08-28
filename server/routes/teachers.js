const express = require('express');
const Teacher = require('../models/Teacher');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/teachers
// @desc    Get all teachers
// @access  Public/Auth
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find().populate('classes', 'name').sort('name');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/teachers
// @desc    Create teacher
// @access  Admin
router.post('/', protect, authorize('master_admin'), async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);
    res.status(201).json(teacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/teachers/:id
// @desc    Update teacher
// @access  Admin
router.put('/:id', protect, authorize('master_admin'), async (req, res) => {
  try {
    const updated = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Teacher not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/teachers/:id
// @desc    Delete teacher
// @access  Admin
router.delete('/:id', protect, authorize('master_admin'), async (req, res) => {
  try {
    const deleted = await Teacher.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ message: 'Teacher deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

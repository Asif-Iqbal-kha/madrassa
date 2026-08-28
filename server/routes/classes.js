const express = require('express');
const Class = require('../models/Class');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/classes
// @desc    Get all classes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find().populate('teacher', 'name').sort('name');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/classes
// @desc    Create class
// @access  Admin
router.post('/', protect, authorize('master_admin'), async (req, res) => {
  try {
    const newClass = await Class.create(req.body);
    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/classes/:id
// @desc    Update class
// @access  Admin
router.put('/:id', protect, authorize('master_admin'), async (req, res) => {
  try {
    const updated = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Class not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/classes/:id
// @desc    Delete class
// @access  Admin
router.delete('/:id', protect, authorize('master_admin'), async (req, res) => {
  try {
    const deleted = await Class.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Class not found' });
    res.json({ message: 'Class deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

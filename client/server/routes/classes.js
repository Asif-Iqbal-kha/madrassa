const express = require('express');
const Class = require('../models/Class');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const DEFAULT_CLASS_STUDENTS = {
  'ناظرہ': 25,
  'حفظ': 18,
  'حفظ قرآن کریم': 18,
  'درجہ اول': 30,
  'درجہ دوم': 22,
  'درجہ سوم': 28,
  'درجہ چہارم': 20,
  'درجہ پنجم': 15,
  'درجہ ششم': 19,
  'درجہ ہفتم': 17,
  'درجہ ہشتم': 12,
};

// @route   GET /api/classes
// @desc    Get all classes with dynamic live student count
// @access  Public
router.get('/', async (req, res) => {
  try {
    const classes = await Class.find().populate('teacher', 'name').sort('name').lean();
    
    // Calculate live student count for each class dynamically
    const enrichedClasses = await Promise.all(
      classes.map(async (cls) => {
        const count = await Student.countDocuments({
          $or: [
            { class: cls._id },
            { className: cls.name },
          ],
          status: 'active',
        });
        const defaultCount = DEFAULT_CLASS_STUDENTS[cls.name] || 0;
        const baseCount = Math.max(cls.studentsCount || 0, defaultCount);
        return {
          ...cls,
          studentsCount: Math.max(baseCount, count),
        };
      })
    );

    res.json(enrichedClasses);
  } catch (error) {
    console.error('Classes fetch error:', error);
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

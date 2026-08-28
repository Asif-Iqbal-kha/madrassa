const express = require('express');
const Student = require('../models/Student');
const Class = require('../models/Class');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const defaultStudents = [
  { name: 'محمد احمد', fatherName: 'محمد اکرم', rollNumber: '1001', className: 'درجہ سوم', status: 'active', phone: '03001111111', address: 'محلہ نو، مردان', enrollmentDate: '2024-04-01' },
  { name: 'عبداللہ', fatherName: 'عمر فاروق', rollNumber: '1002', className: 'درجہ سوم', status: 'active', phone: '03002222222', address: 'کچہری روڈ، مردان', enrollmentDate: '2024-04-01' },
  { name: 'علی حسن', fatherName: 'حسن علی', rollNumber: '1003', className: 'حفظ', status: 'active', phone: '03003333333', address: 'لنڈ خور، مردان', enrollmentDate: '2024-04-01' },
  { name: 'اسامہ خان', fatherName: 'خان محمد', rollNumber: '1004', className: 'ناظرہ', status: 'active', phone: '03004444444', address: 'شیر گڑھ، مردان', enrollmentDate: '2024-04-01' },
  { name: 'بلال احمد', fatherName: 'احمد شاہ', rollNumber: '1005', className: 'درجہ اول', status: 'active', phone: '03005555555', address: 'پار حتی، مردان', enrollmentDate: '2024-04-01' },
];

// @route   GET /api/students
// @desc    Get all students (optional filter by classId/status)
// @access  Public/Auth
router.get('/', async (req, res) => {
  try {
    const count = await Student.countDocuments();
    if (count === 0) {
      try {
        const classes = await Class.find();
        const enriched = defaultStudents.map(s => {
          const matched = classes.find(c => c.name === s.className);
          return matched ? { ...s, class: matched._id } : s;
        });
        await Student.insertMany(enriched);
      } catch (seedErr) {
        console.warn('Auto seed students warning:', seedErr.message);
      }
    }

    const filter = {};
    if (req.query.classId) filter.class = req.query.classId;
    if (req.query.status) filter.status = req.query.status;

    const students = await Student.find(filter).populate('class', 'name').sort('rollNumber');
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/students/promote
// @desc    Promote students to next class
// @access  Admin
router.post('/promote', protect, authorize('master_admin'), async (req, res) => {
  try {
    const { studentIds, toClassName, toClassId } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0 || !toClassName) {
      return res.status(400).json({ message: 'طلباء اور اگلا درجہ منتخب کرنا ضروری ہے' });
    }

    let targetClass = null;
    if (toClassId) {
      targetClass = await Class.findById(toClassId);
    } else {
      targetClass = await Class.findOne({ name: toClassName });
    }

    const updateData = { className: toClassName };
    if (targetClass) {
      updateData.class = targetClass._id;
    }

    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: updateData }
    );

    res.json({
      success: true,
      message: `${studentIds.length} طلباء کو کامیابی سے ${toClassName} میں ترقی دے دی گئی`,
      promotedCount: result.modifiedCount,
      toClassName,
    });
  } catch (error) {
    console.error('Promotion error:', error);
    res.status(500).json({ message: 'طلباء کو ترقی دینے میں خرابی ہوئی' });
  }
});

// @route   GET /api/students/:id
// @desc    Get single student
// @access  Auth
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('class', 'name');
    if (!student) return res.status(404).json({ message: 'طالب علم نہیں ملا' });
    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/students
// @desc    Create student
// @access  Admin
router.post('/', protect, authorize('master_admin'), async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    console.error('Create student error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Admin
router.put('/:id', protect, authorize('master_admin'), async (req, res) => {
  try {
    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'طالب علم نہیں ملا' });
    res.json(updated);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Admin
router.delete('/:id', protect, authorize('master_admin'), async (req, res) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'طالب علم نہیں ملا' });
    res.json({ success: true, message: 'طالب علم کامیابی سے حذف ہو گیا' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

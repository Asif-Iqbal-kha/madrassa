const express = require('express');
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Class = require('../models/Class');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

function getClassAliases(name) {
  const clean = (name || '').trim();
  const aliases = [clean];
  if (clean === 'حفظ') aliases.push('حفظ قرآن کریم');
  if (clean === 'حفظ قرآن کریم') aliases.push('حفظ');
  if (clean === 'ناظرہ') aliases.push('ناظرہ قرآن کریم');
  if (clean === 'ناظرہ قرآن کریم') aliases.push('ناظرہ');
  return aliases;
}

router.get('/', async (req, res) => {
  try {
    const filter = {};

    if (req.query.status && req.query.status !== 'all') {
      if (req.query.status === 'active') {
        filter.status = { $in: ['active', null, ''] };
      } else {
        filter.status = req.query.status;
      }
    }

    if (req.query.classId) {
      if (mongoose.Types.ObjectId.isValid(req.query.classId)) {
        const cls = await Class.findById(req.query.classId);
        if (cls) {
          const aliases = getClassAliases(cls.name);
          filter.$or = [
            { class: cls._id },
            { className: { $in: aliases } },
          ];
        } else {
          filter.class = req.query.classId;
        }
      } else {
        const aliases = getClassAliases(req.query.classId);
        filter.className = { $in: aliases };
      }
    } else if (req.query.className) {
      const aliases = getClassAliases(req.query.className);
      filter.className = { $in: aliases };
    }

    const students = await Student.find(filter)
      .populate('class', 'name year')
      .sort({ rollNumber: 1 })
      .collation({ locale: 'en_US', numericOrdering: true });

    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

router.post('/promote', protect, authorize('master_admin'), async (req, res) => {
  try {
    const { studentIds, toClassName, toClassId, isGraduation } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0 || !toClassName) {
      return res.status(400).json({ message: 'طلباء اور اگلا درجہ منتخب کرنا ضروری ہے' });
    }

    const isGrad = isGraduation || 
      toClassName.includes('فارغ التحصیل') || 
      toClassName.includes('تکمیل') || 
      toClassName.toLowerCase().includes('graduat');

    if (isGrad) {
      const result = await Student.updateMany(
        { _id: { $in: studentIds } },
        {
          $set: {
            status: 'graduated',
          },
        }
      );

      return res.json({
        success: true,
        message: `${studentIds.length} طلباء کو کامیابی سے فارغ التحصیل قرار دے دیا گیا`,
        promotedCount: result.modifiedCount,
        toClassName: 'فارغ التحصیل',
        isGraduation: true,
      });
    }

    let targetClass = null;
    if (toClassId && mongoose.Types.ObjectId.isValid(toClassId)) {
      targetClass = await Class.findById(toClassId);
    }
    if (!targetClass) {
      const aliases = getClassAliases(toClassName);
      targetClass = await Class.findOne({ name: { $in: aliases } });
    }

    const updateData = {
      className: targetClass ? targetClass.name : toClassName.trim(),
      status: 'active',
    };
    if (targetClass) {
      updateData.class = targetClass._id;
    }

    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: updateData }
    );

    res.json({
      success: true,
      message: `${studentIds.length} طلباء کو کامیابی سے ${updateData.className} میں ترقی دے دی گئی`,
      promotedCount: result.modifiedCount,
      toClassName: updateData.className,
      isGraduation: false,
    });
  } catch (error) {
    console.error('Promotion error:', error);
    res.status(500).json({ message: 'طلباء کو ترقی دینے میں خرابی ہوئی: ' + error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('class', 'name year');
    if (!student) return res.status(404).json({ message: 'طالب علم نہیں ملا' });
    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', protect, authorize('master_admin'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.name || !data.fatherName) {
      return res.status(400).json({ message: 'طالب علم کا نام اور والد کا نام درج کرنا ضروری ہے' });
    }

    if (!data.rollNumber) {
      const existing = await Student.find({}, 'rollNumber').lean();
      const numbers = existing.map(s => parseInt(s.rollNumber, 10)).filter(n => !isNaN(n));
      const nextRoll = numbers.length > 0 ? Math.max(...numbers) + 1 : 1001;
      data.rollNumber = String(nextRoll);
    }

    if (!data.status) data.status = 'active';

    if (!data.class && data.className) {
      const aliases = getClassAliases(data.className);
      const matchedClass = await Class.findOne({ name: { $in: aliases } });
      if (matchedClass) {
        data.class = matchedClass._id;
        data.className = matchedClass.name;
      }
    }

    const student = await Student.create(data);
    res.status(201).json(student);
  } catch (error) {
    console.error('Create student error:', error);
    res.status(400).json({ message: error.message || 'طالب علم بنانے میں خرابی' });
  }
});

router.put('/:id', protect, authorize('master_admin'), async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.className && !data.class) {
      const aliases = getClassAliases(data.className);
      const matchedClass = await Class.findOne({ name: { $in: aliases } });
      if (matchedClass) {
        data.class = matchedClass._id;
        data.className = matchedClass.name;
      }
    }

    const updated = await Student.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    ).populate('class', 'name year');

    if (!updated) return res.status(404).json({ message: 'طالب علم نہیں ملا' });
    res.json(updated);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(400).json({ message: error.message });
  }
});

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

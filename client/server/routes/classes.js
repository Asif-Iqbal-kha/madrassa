const express = require('express');
const Class = require('../models/Class');
const Student = require('../models/Student');
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
    const classes = await Class.find().populate('teacher', 'name').sort('name').lean();
    
    const enrichedClasses = await Promise.all(
      classes.map(async (cls) => {
        const aliases = getClassAliases(cls.name);
        const count = await Student.countDocuments({
          status: { $in: ['active', null, ''] },
          $or: [
            { class: cls._id },
            { className: { $in: aliases } },
          ],
        });
        return {
          ...cls,
          studentsCount: count,
        };
      })
    );

    res.json(enrichedClasses);
  } catch (error) {
    console.error('Classes fetch error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

router.post('/', protect, authorize('master_admin'), async (req, res) => {
  try {
    const { name, year, teacher } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'درجہ کا نام لازمی ہے' });
    }

    const newClass = await Class.create({
      name: name.trim(),
      year: year || '1447',
      teacher: teacher || undefined,
      studentsCount: 0,
      isActive: true,
    });
    res.status(201).json(newClass);
  } catch (error) {
    res.status(400).json({ message: error.message || 'درجہ بنانے میں خرابی' });
  }
});

router.put('/:id', protect, authorize('master_admin'), async (req, res) => {
  try {
    const oldClass = await Class.findById(req.params.id);
    if (!oldClass) return res.status(404).json({ message: 'Class not found' });

    const updated = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (req.body.name && req.body.name.trim() !== oldClass.name) {
      await Student.updateMany(
        { $or: [{ class: oldClass._id }, { className: oldClass.name }] },
        { $set: { className: req.body.name.trim(), class: oldClass._id } }
      );
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('master_admin'), async (req, res) => {
  try {
    const deleted = await Class.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Class not found' });
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;

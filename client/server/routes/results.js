const express = require('express');
const mongoose = require('mongoose');
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
    status: 'کامیاب',
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
    status: 'کامیاب',
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
    status: 'کامیاب',
  },
];

// Helper to sanitize result document before upsert/create
function sanitizeResultData(item) {
  const data = { ...item };
  if (data.student && typeof data.student === 'string' && !mongoose.Types.ObjectId.isValid(data.student)) {
    delete data.student;
  }
  if (data.exam && typeof data.exam === 'string' && !mongoose.Types.ObjectId.isValid(data.exam)) {
    delete data.exam;
  }
  if (data.rollNumber) {
    data.rollNumber = String(data.rollNumber).trim();
  }
  if (data.examName) {
    data.examName = String(data.examName).trim();
  }
  if (!data.year) {
    data.year = '1447';
  }

  // Recalculate marks totals and percentage if marks provided
  if (Array.isArray(data.marks) && data.marks.length > 0) {
    const totalObtained = data.marks.reduce((sum, m) => sum + (Number(m.obtainedMarks) || 0), 0);
    const totalMarks = data.marks.reduce((sum, m) => sum + (Number(m.totalMarks) || 100), 0);
    const percentage = totalMarks > 0 ? Math.round((totalObtained / totalMarks) * 100 * 10) / 10 : 0;
    
    data.totalObtained = totalObtained;
    data.totalMarks = totalMarks;
    data.percentage = percentage;

    if (!data.grade) {
      if (percentage >= 80) data.grade = 'الف+ (ممتاز)';
      else if (percentage >= 70) data.grade = 'الف (اعلیٰ)';
      else if (percentage >= 60) data.grade = 'ب (جید)';
      else if (percentage >= 50) data.grade = 'ج (مقبول)';
      else data.grade = 'راسب (ناکام)';
    }

    if (!data.status) {
      data.status = percentage >= 50 ? 'کامیاب' : 'ناکام';
    }
  }

  return data;
}

// @route   GET /api/results/search
// @desc    Public search results by student roll number (query param)
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const rollNumber = (req.query.rollNumber || '').trim();
    if (!rollNumber) {
      return res.status(400).json({ message: 'رول نمبر فراہم کریں' });
    }

    // Auto-seed default results if empty
    const count = await Result.countDocuments();
    if (count === 0) {
      try {
        await Result.insertMany(defaultResults);
      } catch (seedErr) {
        console.warn('Auto seed results warning:', seedErr.message);
      }
    }

    const filter = { rollNumber };
    if (req.query.examType && req.query.examType !== 'all') {
      filter.examName = new RegExp(req.query.examType, 'i');
    }

    const results = await Result.find(filter).sort('-year -createdAt');
    if (!results || results.length === 0) {
      return res.status(404).json({ message: `رول نمبر ${rollNumber} کا کوئی امتحانی نتیجہ نہیں ملا` });
    }
    res.json(results);
  } catch (error) {
    console.error('Search results error:', error);
    res.status(500).json({ message: 'سرور میں خرابی پیش آگئی' });
  }
});

// @route   GET /api/results/roll/:rollNumber
// @desc    Public search results by student roll number (param)
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
// @desc    Get results (filter by className, examName, examId, studentId, rollNumber)
// @access  Auth
router.get('/', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.examId) filter.exam = req.query.examId;
    if (req.query.studentId) filter.student = req.query.studentId;
    if (req.query.className) filter.className = req.query.className;
    if (req.query.examName) filter.examName = new RegExp(req.query.examName, 'i');
    if (req.query.rollNumber) filter.rollNumber = req.query.rollNumber.trim();

    let query = Result.find(filter);
    if (req.query.studentId && mongoose.Types.ObjectId.isValid(req.query.studentId)) {
      query = query.populate('student', 'name rollNumber fatherName');
    }
    if (req.query.examId && mongoose.Types.ObjectId.isValid(req.query.examId)) {
      query = query.populate('exam', 'name year');
    }

    const results = await query.sort('-year -createdAt');
    res.json(results);
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/results/student/:studentId
// @desc    Get all results for a student
// @access  Auth
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const filter = {};
    if (mongoose.Types.ObjectId.isValid(req.params.studentId)) {
      filter.$or = [
        { student: req.params.studentId },
        { rollNumber: req.params.studentId },
      ];
    } else {
      filter.rollNumber = req.params.studentId;
    }

    const results = await Result.find(filter).sort('-year -createdAt');
    res.json(results);
  } catch (error) {
    console.error('Student results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/results
// @desc    Upload result (single or multiple) with upsert
// @access  Admin/Teacher
router.post('/', protect, authorize('master_admin', 'teacher'), async (req, res) => {
  try {
    const rawList = Array.isArray(req.body.results)
      ? req.body.results
      : Array.isArray(req.body)
      ? req.body
      : [req.body];

    const saved = [];
    for (const raw of rawList) {
      const data = sanitizeResultData(raw);
      if (!data.rollNumber) continue;

      const query = { rollNumber: data.rollNumber };
      if (data.examName) query.examName = data.examName;
      if (data.year) query.year = data.year;

      const doc = await Result.findOneAndUpdate(query, data, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      });
      saved.push(doc);
    }

    if (saved.length === 1 && !Array.isArray(req.body.results) && !Array.isArray(req.body)) {
      return res.status(201).json(saved[0]);
    }

    res.status(201).json({
      message: `${saved.length} نتائج کامیابی سے محفوظ ہو گئے`,
      results: saved,
    });
  } catch (error) {
    console.error('Upload result error:', error);
    res.status(400).json({ message: error.message || 'نتائج محفوظ کرنے میں خرابی پیش آئی' });
  }
});

// @route   POST /api/results/bulk
// @desc    Upload multiple results at once with upsert
// @access  Admin/Teacher
router.post('/bulk', protect, authorize('master_admin', 'teacher'), async (req, res) => {
  try {
    const rawList = Array.isArray(req.body.results) ? req.body.results : [req.body];
    const saved = [];

    for (const raw of rawList) {
      const data = sanitizeResultData(raw);
      if (!data.rollNumber) continue;

      const query = { rollNumber: data.rollNumber };
      if (data.examName) query.examName = data.examName;
      if (data.year) query.year = data.year;

      const doc = await Result.findOneAndUpdate(query, data, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      });
      saved.push(doc);
    }

    res.status(201).json({
      message: `${saved.length} نتائج کامیابی سے محفوظ ہو گئے`,
      results: saved,
    });
  } catch (error) {
    console.error('Bulk result upload error:', error);
    res.status(400).json({ message: error.message || 'نتائج محفوظ کرنے میں خرابی پیش آئی' });
  }
});

// @route   PUT /api/results/:id
// @desc    Update a specific result
// @access  Admin/Teacher
router.put('/:id', protect, authorize('master_admin', 'teacher'), async (req, res) => {
  try {
    const data = sanitizeResultData(req.body);
    const updated = await Result.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) {
      return res.status(404).json({ message: 'نتیجہ نہیں ملا' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Update result error:', error);
    res.status(400).json({ message: error.message || 'نتیجہ اپ ڈیٹ کرنے میں خرابی پیش آئی' });
  }
});

// @route   DELETE /api/results/:id
// @desc    Delete a result
// @access  Admin/Teacher
router.delete('/:id', protect, authorize('master_admin', 'teacher'), async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'نتیجہ نہیں ملا' });
    }
    res.json({ message: 'نتیجہ کامیابی سے حذف کر دیا گیا' });
  } catch (error) {
    console.error('Delete result error:', error);
    res.status(500).json({ message: 'نتیجہ حذف کرنے میں خرابی پیش آئی' });
  }
});

module.exports = router;

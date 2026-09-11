const express = require('express');
const Fatwa = require('../models/Fatwa');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/fatwa
// @desc    Get all published fatwas (public), with optional category filter & pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, page = 1, limit = 10, search } = req.query;
    const filter = { status: 'published' };
    if (category && category !== 'تمام') filter.category = category;
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: 'i' } },
        { answer: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Fatwa.countDocuments(filter);
    const fatwas = await Fatwa.find(filter)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    res.json({ fatwas, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/fatwa/admin/all
// @desc    Get all fatwas for admin (any status)
// @access  Admin
router.get('/admin/all', protect, authorize('master_admin'), async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: 'i' } },
        { askerName: { $regex: search, $options: 'i' } },
      ];
    }
    const fatwas = await Fatwa.find(filter).sort({ createdAt: -1 }).select('-__v');
    res.json(fatwas);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/fatwa/ask
// @desc    Submit a new question (public)
// @access  Public
router.post('/ask', async (req, res) => {
  try {
    const { question, category, askerName, askerCity } = req.body;
    if (!question || question.trim().length < 10) {
      return res.status(400).json({ message: 'سوال کم از کم ۱۰ حروف کا ہونا چاہیے' });
    }
    const fatwa = await Fatwa.create({
      question: question.trim(),
      category: category || 'متفرقات',
      askerName: askerName?.trim() || 'گمنام',
      askerCity: askerCity?.trim() || '',
      status: 'pending',
    });
    res.status(201).json({ message: 'آپ کا سوال موصول ہو گیا۔ جواب دینے پر آپ کو مطلع کیا جائے گا۔', id: fatwa._id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/fatwa/:id
// @desc    Get single fatwa by id (public — only published)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const fatwa = await Fatwa.findById(req.params.id).select('-__v');
    if (!fatwa || fatwa.status !== 'published') {
      return res.status(404).json({ message: 'فتویٰ نہیں ملا' });
    }
    // Increment view count
    fatwa.views = (fatwa.views || 0) + 1;
    await fatwa.save();
    res.json(fatwa);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/fatwa/admin/:id
// @desc    Update fatwa answer/status/category by admin
// @access  Admin
router.put('/admin/:id', protect, authorize('master_admin'), async (req, res) => {
  try {
    const { answer, status, category } = req.body;
    const update = {};
    if (answer !== undefined) update.answer = answer;
    if (status !== undefined) update.status = status;
    if (category !== undefined) update.category = category;
    if (status === 'published') update.publishedAt = new Date();

    const updated = await Fatwa.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'فتویٰ نہیں ملا' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/fatwa/admin/:id
// @desc    Delete a fatwa
// @access  Admin
router.delete('/admin/:id', protect, authorize('master_admin'), async (req, res) => {
  try {
    const deleted = await Fatwa.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'فتویٰ نہیں ملا' });
    res.json({ message: 'فتویٰ حذف کر دیا گیا' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

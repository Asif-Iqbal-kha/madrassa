const express = require('express');
const Gallery = require('../models/Gallery');
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/gallery
// @desc    Get all gallery images
// @access  Public
router.get('/', async (req, res) => {
  try {
    const items = await Gallery.find().sort('-createdAt');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/gallery
// @desc    Upload new gallery image
// @access  Admin
router.post('/', protect, authorize('master_admin'), upload.single('image'), async (req, res) => {
  try {
    const { title, category } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'تصویر کا عنوان ضروری ہے' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'تصویری فائل منتخب کریں' });
    }

    // Convert file buffer to Base64 data URL
    const imageDataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const item = await Gallery.create({
      title,
      category: category || 'عمارت',
      imagePath: imageDataUrl,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Gallery upload error:', error);
    res.status(400).json({ message: error.message || 'تصویر اپلوڈ نہیں ہو سکی' });
  }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete gallery image
// @access  Admin
router.delete('/:id', protect, authorize('master_admin'), async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'تصویر نہیں ملی' });

    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'تصویر کامیابی سے حذف ہو گئی' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

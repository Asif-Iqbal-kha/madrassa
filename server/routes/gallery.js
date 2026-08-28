const express = require('express');
const Gallery = require('../models/Gallery');
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

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

    const item = await Gallery.create({
      title,
      category: category || 'عمارت',
      imagePath: req.file.filename,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Gallery upload error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete gallery image
// @access  Admin
router.delete('/:id', protect, authorize('master_admin'), async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'تصویر نہیں ملی' });

    // Remove file from disk if exists
    if (item.imagePath) {
      const filePath = path.join(__dirname, '..', 'uploads', item.imagePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ message: 'تصویر کامیابی سے حذف ہو گئی' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

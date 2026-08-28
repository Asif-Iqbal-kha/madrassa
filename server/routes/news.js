const express = require('express');
const News = require('../models/News');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/news/popup
// @desc    Get active popup news (public)
// @access  Public
router.get('/popup', async (req, res) => {
  try {
    const popupNews = await News.find({ isPopup: true, isPublished: true }).sort('-publishDate').limit(1);
    res.json(popupNews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/news
// @desc    Get all published news (public) or all news (admin)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const filter = {};
    // If not admin, only show published
    if (req.query.published !== 'all') {
      filter.isPublished = true;
    }
    const news = await News.find(filter).sort('-publishDate');
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/news
// @desc    Create news
// @access  Admin
router.post('/', protect, authorize('master_admin'), async (req, res) => {
  try {
    const article = await News.create(req.body);
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/news/:id/popup
// @desc    Toggle popup status on a news item
// @access  Admin
router.put('/:id/popup', protect, authorize('master_admin'), async (req, res) => {
  try {
    const { isPopup } = req.body;
    // If enabling popup, disable all others first (only one popup at a time)
    if (isPopup) {
      await News.updateMany({ isPopup: true }, { isPopup: false });
    }
    const updated = await News.findByIdAndUpdate(
      req.params.id,
      { isPopup: !!isPopup },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'News not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/news/:id
// @desc    Update news
// @access  Admin
router.put('/:id', protect, authorize('master_admin'), async (req, res) => {
  try {
    const updated = await News.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'News not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/news/:id
// @desc    Delete news
// @access  Admin
router.delete('/:id', protect, authorize('master_admin'), async (req, res) => {
  try {
    const deleted = await News.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'News not found' });
    res.json({ message: 'News deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


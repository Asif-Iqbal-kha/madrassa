const express = require('express');
const mongoose = require('mongoose');
const Donation = require('../models/Donation');
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const defaultDonations = [
  { trackingNumber: 'DON-2026-0001', donorName: 'حاجی عبدالکریم', phone: '03011234567', amount: 50000, method: 'JazzCash', status: 'approved', date: '2026-08-20', adminNotes: 'رقم موصول ہوئی' },
  { trackingNumber: 'DON-2026-0002', donorName: 'محمد اکبر خان', phone: '03029876543', amount: 25000, method: 'EasyPaisa', status: 'pending', date: '2026-08-25' },
  { trackingNumber: 'DON-2026-0003', donorName: 'حافظ نور محمد', phone: '03034567890', amount: 100000, method: 'بینک ٹرانسفر', status: 'approved', date: '2026-08-22', adminNotes: 'بینک سے تصدیق ہو گئی' },
  { trackingNumber: 'DON-2026-0004', donorName: 'سید فضل الرحمٰن', phone: '03045678901', amount: 10000, method: 'JazzCash', status: 'rejected', date: '2026-08-26', adminNotes: 'اسکرین شاٹ واضح نہیں ہے' },
  { trackingNumber: 'DON-2026-0005', donorName: 'عبدالوہاب', phone: '03056789012', amount: 75000, method: 'EasyPaisa', status: 'pending', date: '2026-08-27' },
];

// @route   POST /api/donations
// @desc    Submit donation with optional screenshot
// @access  Public
router.post('/', (req, res, next) => {
  upload.single('screenshot')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'فائل اپلوڈ میں خرابی' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { donorName, phone, amount, method } = req.body;

    if (!donorName || !phone || !amount || !method) {
      return res.status(400).json({ message: 'تمام فیلڈز ضروری ہیں' });
    }

    const count = await Donation.countDocuments();
    const year = new Date().getFullYear();
    const trackingNumber = `DON-${year}-${String(count + 1).padStart(4, '0')}`;

    let screenshotData = '';
    let screenshotFilename = '';
    if (req.file) {
      screenshotData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      screenshotFilename = req.file.originalname || 'receipt.jpg';
    }

    const donation = await Donation.create({
      trackingNumber,
      donorName,
      phone,
      amount: Number(amount),
      method,
      screenshotPath: screenshotFilename,
      screenshotData,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
    });

    res.status(201).json({
      success: true,
      trackingNumber: donation.trackingNumber,
      message: 'عطیہ کامیابی سے جمع ہو گیا',
      donation,
    });
  } catch (error) {
    console.error('Donation submission error:', error);
    res.status(400).json({ message: error.message || 'عطیہ محفوظ کرنے میں خرابی ہوئی' });
  }
});

// @route   GET /api/donations/track/:trackingNumber
// @desc    Track donation by tracking number
// @access  Public
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const donation = await Donation.findOne({
      trackingNumber: req.params.trackingNumber.toUpperCase(),
    });

    if (!donation) {
      return res.status(404).json({ message: 'کوئی ریکارڈ نہیں ملا' });
    }

    res.json({
      trackingNumber: donation.trackingNumber,
      donorName: donation.donorName,
      phone: donation.phone,
      amount: donation.amount,
      method: donation.method,
      status: donation.status,
      date: donation.date,
      adminNotes: donation.adminNotes,
    });
  } catch (error) {
    console.error('Track donation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/donations
// @desc    Get all donations (admin)
// @access  Admin
router.get('/', protect, authorize('master_admin'), async (req, res) => {
  try {
    const count = await Donation.countDocuments();
    if (count === 0) {
      try {
        await Donation.insertMany(defaultDonations);
      } catch (seedErr) {
        console.warn('Auto seed donations warning:', seedErr.message);
      }
    }

    const filter = {};
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;

    const donations = await Donation.find(filter).sort('-createdAt');
    res.json(donations);
  } catch (error) {
    console.error('Get donations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/donations/:id/status
// @desc    Update donation status (approve/reject)
// @access  Admin
router.put('/:id/status', protect, authorize('master_admin'), async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    let donation = null;
    const targetId = req.params.id;

    // 1. Try finding by MongoDB ObjectId if valid
    if (mongoose.Types.ObjectId.isValid(targetId)) {
      donation = await Donation.findByIdAndUpdate(
        targetId,
        { status, adminNotes: adminNotes || '' },
        { new: true }
      );
    }

    // 2. Try finding by trackingNumber
    if (!donation) {
      donation = await Donation.findOneAndUpdate(
        {
          $or: [
            { trackingNumber: targetId },
            { trackingNumber: targetId.toUpperCase() },
          ],
        },
        { status, adminNotes: adminNotes || '' },
        { new: true }
      );
    }

    // 3. If not found in DB (e.g. initial mock data not yet in MongoDB), create it with the requested status
    if (!donation) {
      const mockItem = defaultDonations.find(
        (d) => d.trackingNumber === targetId || d.trackingNumber === targetId.toUpperCase()
      );
      if (mockItem) {
        donation = await Donation.create({
          ...mockItem,
          status,
          adminNotes: adminNotes || mockItem.adminNotes || '',
        });
      }
    }

    if (!donation) return res.status(404).json({ message: 'عطیہ نہیں ملا' });

    res.json(donation);
  } catch (error) {
    console.error('Update donation status error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;

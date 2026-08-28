const express = require('express');
const Donation = require('../models/Donation');
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/donations
// @desc    Submit donation with screenshot
// @access  Public
router.post('/', upload.single('screenshot'), async (req, res) => {
  try {
    const { donorName, phone, amount, method } = req.body;

    if (!donorName || !phone || !amount || !method) {
      return res.status(400).json({ message: 'تمام فیلڈز ضروری ہیں' });
    }

    // Generate tracking number
    const count = await Donation.countDocuments();
    const year = new Date().getFullYear();
    const trackingNumber = `DON-${year}-${String(count + 1).padStart(4, '0')}`;

    // Convert uploaded image buffer to Base64 data URL
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
      screenshotData: screenshotData,
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

    // Return info for public
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
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/donations
// @desc    Get all donations (admin)
// @access  Admin
router.get('/', protect, authorize('master_admin'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const donations = await Donation.find(filter).sort('-createdAt');
    res.json(donations);
  } catch (error) {
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

    const donation = await Donation.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes: adminNotes || '' },
      { new: true }
    );

    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    res.json(donation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

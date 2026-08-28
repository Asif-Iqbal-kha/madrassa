const express = require('express');
const AdmissionApplication = require('../models/AdmissionApplication');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/admissions
// @desc    Submit admission application
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { studentName, fatherName, phone, desiredClass } = req.body;

    if (!studentName || !fatherName || !phone || !desiredClass) {
      return res.status(400).json({ message: 'تمام ضروری فیلڈز پُر کریں' });
    }

    // Generate tracking number and queue position
    const count = await AdmissionApplication.countDocuments();
    const year = new Date().getFullYear();
    const trackingNumber = `ADM-${year}-${String(count + 1).padStart(4, '0')}`;

    const application = await AdmissionApplication.create({
      trackingNumber,
      studentName: req.body.studentName,
      fatherName: req.body.fatherName,
      cnic: req.body.cnic || '',
      phone: req.body.phone,
      desiredClass: req.body.desiredClass,
      previousEducation: req.body.previousEducation || '',
      address: req.body.address || '',
      dateOfBirth: req.body.dateOfBirth || '',
      status: 'pending',
      queuePosition: count + 1,
      date: new Date().toISOString().split('T')[0],
    });

    res.status(201).json({
      success: true,
      trackingNumber: application.trackingNumber,
      queuePosition: application.queuePosition,
      message: 'درخواست کامیابی سے جمع ہو گئی',
    });
  } catch (error) {
    console.error('Admission error:', error);
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/admissions/track/:trackingNumber
// @desc    Track admission by tracking number
// @access  Public
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const application = await AdmissionApplication.findOne({
      trackingNumber: req.params.trackingNumber.toUpperCase(),
    });

    if (!application) {
      return res.status(404).json({ message: 'کوئی ریکارڈ نہیں ملا' });
    }

    res.json({
      trackingNumber: application.trackingNumber,
      studentName: application.studentName,
      fatherName: application.fatherName,
      desiredClass: application.desiredClass,
      status: application.status,
      queuePosition: application.queuePosition,
      date: application.date,
      adminNotes: application.adminNotes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admissions
// @desc    Get all admission applications (admin)
// @access  Admin
router.get('/', protect, authorize('master_admin'), async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const applications = await AdmissionApplication.find(filter).sort('queuePosition');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admissions/:id/status
// @desc    Update admission status (approve/reject/review)
// @access  Admin
router.put('/:id/status', protect, authorize('master_admin'), async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!['pending', 'under_review', 'admitted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await AdmissionApplication.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes: adminNotes || '' },
      { new: true }
    );

    if (!application) return res.status(404).json({ message: 'Application not found' });

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

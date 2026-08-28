const express = require('express');
const mongoose = require('mongoose');
const AdmissionApplication = require('../models/AdmissionApplication');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const defaultAdmissions = [
  { trackingNumber: 'ADM-2026-0001', studentName: 'محمد یاسین', fatherName: 'محمد صدیق', cnic: '1234567890123', phone: '03011112222', desiredClass: 'ناظرہ', previousEducation: 'پرائمری پاس', address: 'محلہ قاضیان، مردان', dateOfBirth: '2014-05-10', status: 'admitted', queuePosition: 1, date: '2026-08-15', adminNotes: 'داخلہ منظور' },
  { trackingNumber: 'ADM-2026-0002', studentName: 'عبداللہ بن عمر', fatherName: 'عمر حیات', cnic: '1234567890124', phone: '03022223333', desiredClass: 'حفظ', previousEducation: 'ناظرہ مکمل', address: 'تحصیل روڈ، مردان', dateOfBirth: '2012-08-20', status: 'under_review', queuePosition: 2, date: '2026-08-18', adminNotes: 'ٹیسٹ باقی ہے' },
  { trackingNumber: 'ADM-2026-0003', studentName: 'حمزہ', fatherName: 'خالد محمود', cnic: '1234567890125', phone: '03033334444', desiredClass: 'درجہ اول', previousEducation: 'حفظ مکمل', address: 'شیر گڑھ، مردان', dateOfBirth: '2011-03-15', status: 'pending', queuePosition: 3, date: '2026-08-22' },
  { trackingNumber: 'ADM-2026-0004', studentName: 'ابوبکر', fatherName: 'عبدالستار', cnic: '1234567890126', phone: '03044445555', desiredClass: 'ناظرہ', previousEducation: 'کوئی نہیں', address: 'پار حتی، مردان', dateOfBirth: '2015-11-25', status: 'pending', queuePosition: 4, date: '2026-08-25' },
  { trackingNumber: 'ADM-2026-0005', studentName: 'عثمان غنی', fatherName: 'غنی الرحمٰن', cnic: '1234567890127', phone: '03055556666', desiredClass: 'درجہ سوم', previousEducation: 'درجہ دوم پاس', address: 'لنڈ خور، مردان', dateOfBirth: '2012-07-08', status: 'rejected', queuePosition: 5, date: '2026-08-20', adminNotes: 'عمر کم ہے' },
];

// @route   POST /api/admissions
// @desc    Submit admission application
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { studentName, fatherName, phone, desiredClass } = req.body;

    if (!studentName || !fatherName || !phone || !desiredClass) {
      return res.status(400).json({ message: 'تمام ضروری فیلڈز پُر کریں' });
    }

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
    const count = await AdmissionApplication.countDocuments();
    if (count === 0) {
      try {
        await AdmissionApplication.insertMany(defaultAdmissions);
      } catch (seedErr) {
        console.warn('Auto seed admissions warning:', seedErr.message);
      }
    }

    const filter = {};
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;

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

    let application = null;
    const targetId = req.params.id;

    if (mongoose.Types.ObjectId.isValid(targetId)) {
      application = await AdmissionApplication.findByIdAndUpdate(
        targetId,
        { status, adminNotes: adminNotes || '' },
        { new: true }
      );
    }

    if (!application) {
      application = await AdmissionApplication.findOneAndUpdate(
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

    if (!application) {
      const mockItem = defaultAdmissions.find(
        (a) => a.trackingNumber === targetId || a.trackingNumber === targetId.toUpperCase()
      );
      if (mockItem) {
        application = await AdmissionApplication.create({
          ...mockItem,
          status,
          adminNotes: adminNotes || mockItem.adminNotes || '',
        });
      }
    }

    if (!application) return res.status(404).json({ message: 'درخواست نہیں ملی' });

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;

const express = require('express');
const mongoose = require('mongoose');
const AdmissionApplication = require('../models/AdmissionApplication');
const Student = require('../models/Student');
const Class = require('../models/Class');
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const defaultAdmissions = [
  { trackingNumber: 'ADM-2026-0001', studentName: 'محمد یاسین', fatherName: 'محمد صدیق', cnic: '1234567890123', phone: '03011112222', desiredClass: 'ناظرہ', previousEducation: 'پرائمری پاس', address: 'محلہ قاضیان، مردان', dateOfBirth: '2014-05-10', admissionFee: 1000, paymentMethod: 'JazzCash', transactionId: 'TXN-98214', status: 'admitted', queuePosition: 1, date: '2026-08-15', adminNotes: 'داخلہ منظور، فیس موصول' },
  { trackingNumber: 'ADM-2026-0002', studentName: 'عبداللہ بن عمر', fatherName: 'عمر حیات', cnic: '1234567890124', phone: '03022223333', desiredClass: 'حفظ', previousEducation: 'ناظرہ مکمل', address: 'تحصیل روڈ، مردان', dateOfBirth: '2012-08-20', admissionFee: 1000, paymentMethod: 'EasyPaisa', transactionId: 'EP-54321', status: 'under_review', queuePosition: 2, date: '2026-08-18', adminNotes: 'ٹیسٹ باقی ہے، فیس تصدیق شدہ' },
  { trackingNumber: 'ADM-2026-0003', studentName: 'حمزہ', fatherName: 'خالد محمود', cnic: '1234567890125', phone: '03033334444', desiredClass: 'درجہ اول', previousEducation: 'حفظ مکمل', address: 'شیر گڑھ، مردان', dateOfBirth: '2011-03-15', admissionFee: 1000, paymentMethod: 'بینک ٹرانسفر', transactionId: 'MEZN-8812', status: 'pending', queuePosition: 3, date: '2026-08-22' },
  { trackingNumber: 'ADM-2026-0004', studentName: 'ابوبکر', fatherName: 'عبدالستار', cnic: '1234567890126', phone: '03044445555', desiredClass: 'ناظرہ', previousEducation: 'کوئی نہیں', address: 'پار حتی، مردان', dateOfBirth: '2015-11-25', admissionFee: 1000, paymentMethod: 'JazzCash', transactionId: 'JC-11223', status: 'pending', queuePosition: 4, date: '2026-08-25' },
  { trackingNumber: 'ADM-2026-0005', studentName: 'عثمان غنی', fatherName: 'غنی الرحمٰن', cnic: '1234567890127', phone: '03055556666', desiredClass: 'درجہ سوم', previousEducation: 'درجہ دوم پاس', address: 'لنڈ خور، مردان', dateOfBirth: '2012-07-08', admissionFee: 1000, paymentMethod: 'EasyPaisa', transactionId: 'EP-99881', status: 'rejected', queuePosition: 5, date: '2026-08-20', adminNotes: 'عمر کم ہے' },
];

// @route   POST /api/admissions
// @desc    Submit admission application with fee & payment proof
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
    const { studentName, fatherName, phone, desiredClass } = req.body;

    if (!studentName || !fatherName || !phone || !desiredClass) {
      return res.status(400).json({ message: 'تمام ضروری فیلڈز پُر کریں' });
    }

    const count = await AdmissionApplication.countDocuments();
    const year = new Date().getFullYear();
    const trackingNumber = `ADM-${year}-${String(count + 1).padStart(4, '0')}`;

    let screenshotData = req.body.screenshotData || '';
    let screenshotFilename = req.body.screenshotFilename || '';
    if (req.file) {
      screenshotData = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      screenshotFilename = req.file.originalname || 'payment_proof.jpg';
    }

    const application = await AdmissionApplication.create({
      trackingNumber,
      studentName: req.body.studentName,
      fatherName: req.body.fatherName,
      cnic: req.body.cnic || '',
      phone: req.body.phone,
      desiredClass: req.body.desiredClass,
      previousEducation: req.body.previousEducation || '',
      address: req.body.address || req.body.currentAddress || req.body.permanentAddress || '',
      dateOfBirth: req.body.dateOfBirth || '',
      identificationMark: req.body.identificationMark || '',
      maritalStatus: req.body.maritalStatus || 'مجرد',
      permanentAddress: req.body.permanentAddress || '',
      currentAddress: req.body.currentAddress || '',
      guardianName: req.body.guardianName || '',
      guardianFatherName: req.body.guardianFatherName || '',
      guardianRelation: req.body.guardianRelation || 'والد',
      guardianPhone: req.body.guardianPhone || '',
      guardianCnic: req.body.guardianCnic || '',
      guardianPermanentAddress: req.body.guardianPermanentAddress || '',
      guardianCurrentAddress: req.body.guardianCurrentAddress || '',
      mardanRelative: req.body.mardanRelative || '',
      studentPhotoData: req.body.studentPhotoData || '',
      admissionFee: Number(req.body.admissionFee) || 1000,
      paymentMethod: req.body.paymentMethod || 'JazzCash',
      transactionId: req.body.transactionId || '',
      screenshotPath: screenshotFilename,
      screenshotData,
      status: 'pending',
      queuePosition: count + 1,
      date: new Date().toISOString().split('T')[0],
    });

    res.status(201).json({
      success: true,
      trackingNumber: application.trackingNumber,
      queuePosition: application.queuePosition,
      admissionFee: application.admissionFee,
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
      admissionFee: application.admissionFee || 1000,
      paymentMethod: application.paymentMethod || 'JazzCash',
      transactionId: application.transactionId || '',
      screenshotData: application.screenshotData || '',
      screenshotPath: application.screenshotPath || '',
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
        (a) => a._id === targetId || a.trackingNumber === targetId || a.trackingNumber === targetId.toUpperCase()
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

    // Automatically create Student record in database when admission is confirmed (admitted)
    if (status === 'admitted' && application) {
      try {
        const existingStudent = await Student.findOne({
          $or: [
            { cnic: application.cnic && application.cnic.length > 5 ? application.cnic : 'NO_CNIC_MATCH' },
            { name: application.studentName, fatherName: application.fatherName },
          ],
        });

        if (!existingStudent) {
          const studentCount = await Student.countDocuments();
          const rollNumber = String(1000 + studentCount + 1);

          let targetClass = await Class.findOne({
            $or: [
              { name: application.desiredClass },
              { name: application.desiredClass === 'حفظ قرآن کریم' ? 'حفظ' : 'حفظ قرآن کریم' },
              { name: application.desiredClass === 'ناظرہ' ? 'ناظرہ قرآن کریم' : 'ناظرہ' },
            ],
          });

          if (targetClass) {
            await Class.findByIdAndUpdate(targetClass._id, { $inc: { studentsCount: 1 } });
          }

          await Student.create({
            name: application.studentName,
            fatherName: application.fatherName,
            rollNumber,
            class: targetClass ? targetClass._id : undefined,
            className: application.desiredClass,
            dateOfBirth: application.dateOfBirth || '',
            cnic: application.cnic || '',
            identificationMark: application.identificationMark || '',
            maritalStatus: application.maritalStatus || 'مجرد',
            phone: application.phone,
            address: application.address || application.currentAddress || application.permanentAddress || '',
            permanentAddress: application.permanentAddress || '',
            currentAddress: application.currentAddress || '',
            previousEducation: application.previousEducation || '',
            guardianName: application.guardianName || application.fatherName,
            guardianFatherName: application.guardianFatherName || '',
            guardianRelation: application.guardianRelation || 'والد',
            guardianPhone: application.guardianPhone || application.phone,
            guardianCnic: application.guardianCnic || '',
            guardianPermanentAddress: application.guardianPermanentAddress || '',
            guardianCurrentAddress: application.guardianCurrentAddress || '',
            mardanRelative: application.mardanRelative || '',
            studentPhotoData: application.studentPhotoData || '',
            admissionFee: application.admissionFee || 1000,
            paymentMethod: application.paymentMethod || 'JazzCash',
            transactionId: application.transactionId || '',
            screenshotData: application.screenshotData || '',
            status: 'active',
            enrollmentDate: new Date().toISOString().split('T')[0],
          });
        }
      } catch (stuErr) {
        console.error('Auto create student on admission approval error:', stuErr);
      }
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

module.exports = router;

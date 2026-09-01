const express = require('express');
const mongoose = require('mongoose');
const AdmissionApplication = require('../models/AdmissionApplication');
const Student = require('../models/Student');
const Class = require('../models/Class');
const upload = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper to get class name variants/aliases
function getClassAliases(name) {
  const clean = (name || '').trim();
  const aliases = [clean];
  if (clean === 'حفظ') aliases.push('حفظ قرآن کریم');
  if (clean === 'حفظ قرآن کریم') aliases.push('حفظ');
  if (clean === 'ناظرہ') aliases.push('ناظرہ قرآن کریم');
  if (clean === 'ناظرہ قرآن کریم') aliases.push('ناظرہ');
  return aliases;
}

// Multer flexible upload accepting screenshot, paymentProof, or studentPhoto
const admissionUpload = upload.fields([
  { name: 'screenshot', maxCount: 1 },
  { name: 'paymentProof', maxCount: 1 },
  { name: 'studentPhoto', maxCount: 1 },
]);

// @route   POST /api/admissions
// @desc    Submit admission application with fee & payment proof
// @access  Public
router.post('/', (req, res, next) => {
  admissionUpload(req, res, (err) => {
    if (err) {
      console.warn('Admission upload warning:', err.message);
      // Even if multer warnings occur on field names, proceed if body has data
    }
    next();
  });
}, async (req, res) => {
  try {
    const { studentName, fatherName, phone, desiredClass } = req.body;

    if (!studentName || !fatherName || !phone || !desiredClass) {
      return res.status(400).json({ message: 'تمام ضروری فیلڈز (نام، ولدیت، فون، مطلوبہ درجہ) پُر کریں' });
    }

    const year = new Date().getFullYear();
    const count = await AdmissionApplication.countDocuments();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const trackingNumber = `ADM-${year}-${String(count + 1).padStart(4, '0')}-${randomSuffix}`;

    // Extract screenshot file if provided via multer
    let screenshotData = req.body.screenshotData || '';
    let screenshotFilename = req.body.screenshotFilename || '';

    const uploadedProof = (req.files?.screenshot && req.files.screenshot[0]) || 
                          (req.files?.paymentProof && req.files.paymentProof[0]) ||
                          req.file;

    if (uploadedProof) {
      screenshotData = `data:${uploadedProof.mimetype};base64,${uploadedProof.buffer.toString('base64')}`;
      screenshotFilename = uploadedProof.originalname || 'payment_proof.jpg';
    }

    let studentPhotoData = req.body.studentPhotoData || '';
    if (req.files?.studentPhoto && req.files.studentPhoto[0]) {
      const p = req.files.studentPhoto[0];
      studentPhotoData = `data:${p.mimetype};base64,${p.buffer.toString('base64')}`;
    }

    const application = await AdmissionApplication.create({
      trackingNumber,
      studentName: req.body.studentName.trim(),
      fatherName: req.body.fatherName.trim(),
      cnic: req.body.cnic || '',
      phone: req.body.phone.trim(),
      desiredClass: req.body.desiredClass.trim(),
      previousEducation: req.body.previousEducation || '',
      address: req.body.address || req.body.currentAddress || req.body.permanentAddress || '',
      dateOfBirth: req.body.dateOfBirth || '',
      identificationMark: req.body.identificationMark || '',
      maritalStatus: req.body.maritalStatus || 'مجرد',
      permanentAddress: req.body.permanentAddress || '',
      currentAddress: req.body.currentAddress || '',
      guardianName: req.body.guardianName || req.body.fatherName,
      guardianFatherName: req.body.guardianFatherName || '',
      guardianRelation: req.body.guardianRelation || 'والد',
      guardianPhone: req.body.guardianPhone || req.body.phone,
      guardianCnic: req.body.guardianCnic || '',
      guardianPermanentAddress: req.body.guardianPermanentAddress || '',
      guardianCurrentAddress: req.body.guardianCurrentAddress || '',
      mardanRelative: req.body.mardanRelative || '',
      studentPhotoData,
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
    res.status(400).json({ message: error.message || 'درخواست جمع کرنے میں خرابی ہوئی' });
  }
});

// @route   GET /api/admissions/track/:trackingNumber
// @desc    Track admission by tracking number
// @access  Public
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const tracking = req.params.trackingNumber.trim();
    const application = await AdmissionApplication.findOne({
      $or: [
        { trackingNumber: tracking },
        { trackingNumber: tracking.toUpperCase() },
        { trackingNumber: new RegExp(`^${tracking}$`, 'i') },
      ],
    });

    if (!application) {
      return res.status(404).json({ message: 'کوئی ریکارڈ نہیں ملا' });
    }

    res.json(application);
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
    if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;

    const applications = await AdmissionApplication.find(filter).sort('-createdAt');
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
      return res.status(400).json({ message: 'درست حالت منتخب کریں' });
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

    if (!application) return res.status(404).json({ message: 'درخواست نہیں ملی' });

    // When status changes to 'admitted', create/verify Student record in database
    if (status === 'admitted' && application) {
      try {
        const existingStudent = await Student.findOne({
          $or: [
            { cnic: application.cnic && application.cnic.length > 5 ? application.cnic : 'NO_CNIC_MATCH' },
            { name: application.studentName, fatherName: application.fatherName },
          ],
        });

        if (!existingStudent) {
          // Generate unique numeric roll number
          const existingStudents = await Student.find({}, 'rollNumber').lean();
          const rollNumbers = existingStudents
            .map((s) => parseInt(s.rollNumber, 10))
            .filter((n) => !isNaN(n));
          const nextRoll = rollNumbers.length > 0 ? Math.max(...rollNumbers) + 1 : 1001;
          const rollNumber = String(nextRoll);

          // Find matching Class in database
          const aliases = getClassAliases(application.desiredClass);
          let targetClass = await Class.findOne({ name: { $in: aliases } });

          if (targetClass) {
            await Class.findByIdAndUpdate(targetClass._id, { $inc: { studentsCount: 1 } });
          }

          const createdStudent = await Student.create({
            name: application.studentName,
            fatherName: application.fatherName,
            rollNumber,
            class: targetClass ? targetClass._id : undefined,
            className: targetClass ? targetClass.name : application.desiredClass,
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

          console.log(`Auto-created student: ${createdStudent.name} (Roll: ${createdStudent.rollNumber}, Class: ${createdStudent.className})`);
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

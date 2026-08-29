const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
  },
  fatherName: {
    type: String,
    required: [true, 'Father name is required'],
    trim: true,
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
  className: {
    type: String,
    default: '',
  },
  dateOfBirth: {
    type: String,
    default: '',
  },
  cnic: {
    type: String,
    default: '',
  },
  identificationMark: {
    type: String,
    default: '',
  },
  maritalStatus: {
    type: String,
    default: 'مجرد',
  },
  phone: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  permanentAddress: {
    type: String,
    default: '',
  },
  currentAddress: {
    type: String,
    default: '',
  },
  previousEducation: {
    type: String,
    default: '',
  },
  // Guardian & Father detailed information
  guardianName: {
    type: String,
    default: '',
  },
  guardianFatherName: {
    type: String,
    default: '',
  },
  guardianRelation: {
    type: String,
    default: 'والد',
  },
  guardianPhone: {
    type: String,
    default: '',
  },
  guardianCnic: {
    type: String,
    default: '',
  },
  guardianPermanentAddress: {
    type: String,
    default: '',
  },
  guardianCurrentAddress: {
    type: String,
    default: '',
  },
  mardanRelative: {
    type: String,
    default: '',
  },
  studentPhotoData: {
    type: String,
    default: '',
  },
  admissionFee: {
    type: Number,
    default: 1000,
  },
  paymentMethod: {
    type: String,
    default: 'JazzCash',
  },
  transactionId: {
    type: String,
    default: '',
  },
  screenshotData: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'graduated'],
    default: 'active',
  },
  enrollmentDate: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Student', studentSchema);

const mongoose = require('mongoose');

const admissionApplicationSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    required: true,
    unique: true,
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
  },
  fatherName: {
    type: String,
    required: [true, 'Father name is required'],
    trim: true,
  },
  cnic: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
  },
  desiredClass: {
    type: String,
    required: [true, 'Desired class is required'],
  },
  previousEducation: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: '',
  },
  dateOfBirth: {
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
  screenshotPath: {
    type: String,
    default: '',
  },
  screenshotData: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'admitted', 'rejected'],
    default: 'pending',
  },
  queuePosition: {
    type: Number,
    default: 0,
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0],
  },
  adminNotes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Auto-generate tracking number before saving
admissionApplicationSchema.pre('save', async function (next) {
  if (!this.trackingNumber) {
    const count = await mongoose.model('AdmissionApplication').countDocuments();
    const year = new Date().getFullYear();
    this.trackingNumber = `ADM-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  if (!this.queuePosition) {
    const count = await mongoose.model('AdmissionApplication').countDocuments();
    this.queuePosition = count + 1;
  }
  next();
});

module.exports = mongoose.model('AdmissionApplication', admissionApplicationSchema);

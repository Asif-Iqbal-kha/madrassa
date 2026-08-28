const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    required: true,
    unique: true,
  },
  donorName: {
    type: String,
    required: [true, 'Donor name is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 1,
  },
  method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['JazzCash', 'EasyPaisa', 'بینک ٹرانسفر'],
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
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
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

module.exports = mongoose.model('Donation', donationSchema);

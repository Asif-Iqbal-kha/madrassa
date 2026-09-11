const mongoose = require('mongoose');

const fatwaSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'سوال درج کرنا ضروری ہے'],
    trim: true,
  },
  answer: {
    type: String,
    default: '',
    trim: true,
  },
  category: {
    type: String,
    enum: ['طہارت', 'نماز', 'زکوٰۃ', 'روزہ', 'حج', 'نکاح و طلاق', 'تجارت', 'کھانا پینا', 'متفرقات'],
    default: 'متفرقات',
  },
  askerName: {
    type: String,
    default: '',
    trim: true,
  },
  askerCity: {
    type: String,
    default: '',
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'answered', 'published'],
    default: 'pending',
  },
  views: {
    type: Number,
    default: 0,
  },
  publishedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Fatwa', fatwaSchema);

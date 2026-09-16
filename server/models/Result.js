const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  obtainedMarks: { type: Number, required: true },
  totalMarks: { type: Number, required: true, default: 100 },
}, { _id: false });

const resultSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Exam',
  },
  examName: { type: String, default: 'امتحان' },
  student: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'Student',
  },
  studentName: { type: String, default: '' },
  fatherName: { type: String, default: '' },
  rollNumber: { type: String, required: true },
  className: { type: String, default: '' },
  year: { type: String, default: '1447' },
  marks: [markSchema],
  totalObtained: {
    type: Number,
    default: 0,
  },
  totalMarks: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  grade: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'کامیاب',
  },
  position: {
    type: String,
    default: '',
  },
  remarks: {
    type: String,
    default: '',
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

resultSchema.index({ rollNumber: 1, isPublished: 1, year: -1 });
resultSchema.index({ className: 1, examName: 1, year: 1, isPublished: 1 });
resultSchema.index({ exam: 1, isPublished: 1 });
resultSchema.index({ student: 1 });

module.exports = mongoose.models.Result || mongoose.model('Result', resultSchema);

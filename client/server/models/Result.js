const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  obtainedMarks: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
}, { _id: false });

const resultSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
  },
  examName: String,
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
  studentName: String,
  rollNumber: String,
  className: String,
  year: String,
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
}, {
  timestamps: true,
});

module.exports = mongoose.model('Result', resultSchema);

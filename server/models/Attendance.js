const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
  studentName: String,
  rollNumber: String,
  status: {
    type: String,
    enum: ['present', 'absent', 'leave'],
    required: true,
  },
}, { _id: false });

const attendanceSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
  className: {
    type: String,
    default: '',
  },
  records: [attendanceRecordSchema],
}, {
  timestamps: true,
});

// Compound index to prevent duplicate attendance for same class on same date
attendanceSchema.index({ date: 1, class: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);

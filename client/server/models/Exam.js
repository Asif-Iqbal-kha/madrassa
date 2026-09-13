const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exam name is required'],
    trim: true,
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
  },
  className: {
    type: String,
    default: '',
  },
  year: {
    type: String,
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

examSchema.index({ class: 1, isPublished: 1 });
examSchema.index({ year: -1 });

module.exports = mongoose.model('Exam', examSchema);

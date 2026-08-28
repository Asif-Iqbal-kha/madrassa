const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  category: {
    type: String,
    enum: ['announcement', 'news', 'event'],
    default: 'news',
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  publishDate: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: null,
  },
  isPopup: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('News', newsSchema);


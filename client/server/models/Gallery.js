const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'عنوان ضروری ہے'],
      trim: true,
    },
    category: {
      type: String,
      default: 'عمارت',
    },
    imagePath: {
      type: String,
      required: [true, 'تصویر ضروری ہے'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Gallery', gallerySchema);

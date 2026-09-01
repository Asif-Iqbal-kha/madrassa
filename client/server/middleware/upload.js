const multer = require('multer');

// Memory storage for serverless, cloud, and local compatibility
const storage = multer.memoryStorage();

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('صرف تصویری فائلز (JPG, PNG, WebP) منتخب کریں'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB max file
    fieldSize: 25 * 1024 * 1024, // 25MB max text field (for base64 data URIs)
  },
});

module.exports = upload;

const multer = require('multer');

const storage = multer.memoryStorage();

// ── Image-only filter (profile photo) ─────────────────────────────────────────
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// ── General file filter (portfolio images, proposal attachments, job submission files) ──
const docFileFilter = (req, file, cb) => {
  // Allow all file types for generic message/file uploads.
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// New: general-purpose uploader for portfolio / proposals / job submissions
const uploadDoc = multer({
  storage,
  fileFilter: docFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = upload;
module.exports.uploadDoc = uploadDoc;

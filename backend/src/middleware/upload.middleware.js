const multer = require('multer');
const env = require('../config/environment');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  const allowedExts = ['.pdf', '.docx', '.txt'];
  const ext = (file.originalname.substring(file.originalname.lastIndexOf('.')) || '').toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.originalname}. Only PDF, DOCX, and TXT are allowed.`), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: env.maxResumeFileSizeMB * 1024 * 1024
  },
  fileFilter
});

module.exports = upload;

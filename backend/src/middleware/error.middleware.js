const multer = require('multer');
const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]:', err.message || err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'File size exceeds maximum allowed limit of 10MB', 413, 'FILE_TOO_LARGE');
    }
    return sendError(res, err.message, 400, 'BAD_REQUEST');
  }

  if (err.message && err.message.startsWith('Unsupported file type')) {
    return sendError(res, err.message, 415, 'UNSUPPORTED_FILE_TYPE');
  }

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected internal error occurred';
  const details = err.details || [];

  return sendError(res, message, statusCode, code, details);
};

module.exports = errorHandler;

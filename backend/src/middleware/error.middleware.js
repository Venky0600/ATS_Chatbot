const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('[Error Middleware]:', err);

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected internal error occurred';
  const details = err.details || [];

  return sendError(res, message, statusCode, code, details);
};

module.exports = errorHandler;

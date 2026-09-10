const sendSuccess = (res, data = null, message = 'Request successful', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message
  });
};

const sendError = (res, message = 'An error occurred', statusCode = 500, code = 'INTERNAL_ERROR', details = []) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details
    }
  });
};

module.exports = {
  sendSuccess,
  sendError
};

const { sendError } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.code === 'P2002') {
    return sendError(res, 'Duplicate entry', 409);
  }

  if (err.code === 'P2025') {
    return sendError(res, 'Record not found', 404);
  }

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'File too large. Max 5MB', 400);
    }
    return sendError(res, err.message, 400);
  }

  return sendError(res, err.message || 'Internal Server Error', err.statusCode || 500);
};

const notFoundHandler = (req, res) => {
  return sendError(res, 'Route not found', 404);
};

module.exports = { errorHandler, notFoundHandler };
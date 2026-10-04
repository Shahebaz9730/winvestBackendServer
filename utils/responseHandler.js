/**
 * Standard API Response Helper
 */

const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  if (meta !== null && meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

const sendError = (res, statusCode = 500, message = 'An error occurred', errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors !== null && errors !== undefined && errors.length > 0) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError
};

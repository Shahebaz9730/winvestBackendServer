const jwt = require('jsonwebtoken');

/**
 * Generate signed JWT token for authenticated user
 * @param {Object} payload - { userId, username, role }
 * @returns {String} JWT token
 */
const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured in environment variables');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, {
    expiresIn
  });
};

module.exports = generateToken;

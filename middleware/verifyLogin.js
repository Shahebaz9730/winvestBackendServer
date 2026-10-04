const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/responseHandler');

/**
 * Middleware to verify User JWT authentication token
 */
const verifyLogin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header is provided
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Token not provided');
    }

    // Extract Bearer token
    const token = authHeader.split(' ')[1];

    if (!token || token.trim() === '') {
      return sendError(res, 401, 'Token not provided');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[Auth Error] JWT_SECRET is not configured');
      return sendError(res, 500, 'Internal server authentication error');
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Token expired');
      }
      return sendError(res, 401, 'Invalid token');
    }

    // Extract user ID from token
    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return sendError(res, 401, 'Invalid token');
    }

    // Verify user exists in database
    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 401, 'Invalid token: user no longer exists');
    }

    // Attach authenticated user to request object
    req.user = {
      id: user._id.toString(),
      userId: user._id.toString(),
      username: user.username,
      role: user.role
    };

    next();
  } catch (error) {
    return sendError(res, 401, 'Authentication failed');
  }
};

module.exports = verifyLogin;

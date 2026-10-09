const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/responseHandler');

const verifyLogin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Token not provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token || token.trim() === '') {
      return sendError(res, 401, 'Token not provided');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return sendError(res, 500, 'Internal server authentication error');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Token expired');
      }
      return sendError(res, 401, 'Invalid token');
    }

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return sendError(res, 401, 'Invalid token');
    }

    const user = await User.findById(userId);
    if (!user) {
      return sendError(res, 401, 'Invalid token: user no longer exists');
    }

    // --- INACTIVITY TIMEOUT LOGIC ---
    const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 Minutes (Aap apne hisab se change kar sakte hain)
    
    if (user.lastActive) {
      const inactiveTime = Date.now() - new Date(user.lastActive).getTime();
      if (inactiveTime > INACTIVITY_LIMIT_MS) {
        return sendError(res, 401, 'Session expired due to inactivity. Please login again.');
      }
    }

    // Update lastActive timestamp for current request (Asynchronously to avoid blocking response)
    User.updateOne({ _id: user._id }, { lastActive: Date.now() }).exec().catch(err => {
      console.error('Error updating lastActive:', err);
    });
    // --------------------------------

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



// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const { sendError } = require('../utils/responseHandler');

// /**
//  * Middleware to verify User JWT authentication token
//  */
// const verifyLogin = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     // Check if Authorization header is provided
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return sendError(res, 401, 'Token not provided');
//     }

//     // Extract Bearer token
//     const token = authHeader.split(' ')[1];

//     if (!token || token.trim() === '') {
//       return sendError(res, 401, 'Token not provided');
//     }

//     const secret = process.env.JWT_SECRET;
//     if (!secret) {
//       console.error('[Auth Error] JWT_SECRET is not configured');
//       return sendError(res, 500, 'Internal server authentication error');
//     }

//     // Verify token
//     let decoded;
//     try {
//       decoded = jwt.verify(token, secret);
//     } catch (jwtErr) {
//       if (jwtErr.name === 'TokenExpiredError') {
//         return sendError(res, 401, 'Token expired');
//       }
//       return sendError(res, 401, 'Invalid token');
//     }

//     // Extract user ID from token
//     const userId = decoded.userId || decoded.id;
//     if (!userId) {
//       return sendError(res, 401, 'Invalid token');
//     }

//     // Verify user exists in database
//     const user = await User.findById(userId);
//     if (!user) {
//       return sendError(res, 401, 'Invalid token: user no longer exists');
//     }

//     // Attach authenticated user to request object
//     req.user = {
//       id: user._id.toString(),
//       userId: user._id.toString(),
//       username: user.username,
//       role: user.role
//     };

//     next();
//   } catch (error) {
//     return sendError(res, 401, 'Authentication failed');
//   }
// };

// module.exports = verifyLogin;

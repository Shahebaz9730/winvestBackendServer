const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Authenticate User & generate JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Authenticate User & generate JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find user by username and explicitly select password
    const user = await User.findOne({ username: username.toLowerCase().trim() }).select('+password');

    // Generic error message for security
    if (!user || !(await user.comparePassword(password))) {
      return sendError(res, 401, 'Invalid username or password');
    }

    // --- UPDATE LAST ACTIVE ON LOGIN ---
    user.lastActive = Date.now();
    await user.save({ validateBeforeSave: false });
    // -----------------------------------

    // Generate JWT token with user information
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      role: user.role
    });

    const responseData = {
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role
      },
      token
    };

    return sendSuccess(res, 200, 'Login successful', responseData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get currently authenticated User profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const userId = req.user.userId || req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, 200, 'Authenticated user fetched successfully', {
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users list
 * @route   GET /api/auth/users
 * @access  Private (Admin)
 */
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'Users fetched successfully', { users });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new user / admin
 * @route   POST /api/auth/users
 * @access  Private (Admin)
 */
const createUser = async (req, res, next) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return sendError(res, 400, 'Username and password are required');
    }

    const cleanUsername = username.toLowerCase().trim();
    if (cleanUsername.length < 3) {
      return sendError(res, 400, 'Username must be at least 3 characters long');
    }

    if (password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters long');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return sendError(res, 400, 'Username already exists. Please choose a different username.');
    }

    const newUser = await User.create({
      username: cleanUsername,
      password,
      role: role || 'admin'
    });

    return sendSuccess(res, 201, 'New user account created successfully', {
      user: {
        id: newUser._id.toString(),
        username: newUser.username,
        role: newUser.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password for currently logged-in user
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId || req.user.id;

    if (!currentPassword || !newPassword) {
      return sendError(res, 400, 'Current password and new password are required');
    }

    if (newPassword.length < 6) {
      return sendError(res, 400, 'New password must be at least 6 characters long');
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 400, 'Current password does not match. Please verify and try again.');
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password of an existing user (Admin Reset)
 * @route   PUT /api/auth/users/:id/password
 * @access  Private (Admin)
 */
const changeUserPasswordByAdmin = async (req, res, next) => {
  try {
    const { newPassword } = req.body;
    const { id } = req.params;

    if (!newPassword || newPassword.length < 6) {
      return sendError(res, 400, 'New password must be at least 6 characters long');
    }

    const user = await User.findById(id).select('+password');
    if (!user) {
      return sendError(res, 404, 'Target user not found');
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, 200, `Password updated successfully for ${user.username}`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/auth/users/:id
 * @access  Private (Admin)
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.userId || req.user.id;

    if (id === currentUserId) {
      return sendError(res, 400, 'You cannot delete your own active account.');
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, 200, `User ${user.username} deleted successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout current user
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = async (req, res, next) => {
  try {
    // JWT is stateless — actual invalidation is done on the client side
    // Server simply confirms logout
    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};


module.exports = {
  login,
  getMe,
  getUsers,
  createUser,
  changePassword,
  changeUserPasswordByAdmin,
  deleteUser,
  logout
};

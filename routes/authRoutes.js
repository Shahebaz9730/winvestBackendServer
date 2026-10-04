const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin } = require('../middleware/validatorMiddleware');
const verifyLogin = require('../middleware/verifyLogin');

// @route   POST /api/auth/login
// @desc    User login (username & password)
// @access  Public
router.post('/login', validateLogin, authController.login);

// Protected routes (Requires Bearer token)
router.use(verifyLogin);

// @route   GET /api/auth/me
// @desc    Get logged in user info
router.get('/me', authController.getMe);

// @route   POST /api/auth/logout
// @desc    Logout current user
router.post('/logout', authController.logout);

// @route   PUT /api/auth/change-password
// @desc    Change password for logged in user
router.put('/change-password', authController.changePassword);

// @route   GET /api/auth/users
// @desc    Get all users
router.get('/users', authController.getUsers);

// @route   POST /api/auth/users
// @desc    Create a new user / admin
router.post('/users', authController.createUser);

// @route   PUT /api/auth/users/:id/password
// @desc    Admin reset user password
router.put('/users/:id/password', authController.changeUserPasswordByAdmin);

// @route   DELETE /api/auth/users/:id
// @desc    Delete user account
router.delete('/users/:id', authController.deleteUser);

module.exports = router;

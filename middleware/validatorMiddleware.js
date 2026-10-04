const { body, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { sendError } = require('../utils/responseHandler');

/**
 * Common handler to return express-validator errors formatted cleanly
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return sendError(res, 400, formattedErrors[0].message, formattedErrors);
  }
  next();
};

/**
 * Validation rules for User Login
 */
const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Validation rules for Creating a Recommendation
 */
const validateCreateRecommendation = [
  body('stockName')
    .trim()
    .notEmpty()
    .withMessage('Stock name is required')
    .isLength({ max: 150 })
    .withMessage('Stock name cannot exceed 150 characters'),

  body('symbol')
    .trim()
    .notEmpty()
    .withMessage('Stock symbol is required')
    .isLength({ max: 20 })
    .withMessage('Stock symbol cannot exceed 20 characters'),

  body('action')
    .trim()
    .notEmpty()
    .withMessage('Action is required')
    .toUpperCase()
    .isIn(['BUY', 'SELL', 'HOLD'])
    .withMessage('Action must be BUY, SELL, or HOLD'),

  body('exchange')
    .optional()
    .trim()
    .toUpperCase()
    .isIn(['NSE', 'BSE'])
    .withMessage('Exchange must be NSE or BSE'),

  body('entryPrice')
    .notEmpty()
    .withMessage('Entry price is required')
    .isFloat({ min: 0 })
    .withMessage('Entry price must be a positive number'),

  body('targetPrice')
    .notEmpty()
    .withMessage('Target price is required')
    .isFloat({ min: 0 })
    .withMessage('Target price must be a positive number'),

  body('stopLoss')
    .notEmpty()
    .withMessage('Stop loss is required')
    .isFloat({ min: 0 })
    .withMessage('Stop loss must be a positive number'),

  body('currentPrice')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Current price must be a positive number'),

  body('recommendationDate')
    .optional({ nullable: true })
    .isISO8601()
    .toDate()
    .withMessage('Invalid recommendation date format'),

  body('validTill')
    .optional({ nullable: true })
    .isISO8601()
    .toDate()
    .withMessage('Invalid validTill date format'),

  body('status')
    .optional()
    .trim()
    .toUpperCase()
    .isIn(['ACTIVE', 'NONACTIVE', 'HOLD'])
    .withMessage('Status must be ACTIVE, NONACTIVE, or HOLD'),


  body('researchReason')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Research reason cannot exceed 2000 characters'),

  handleValidationErrors
];

/**
 * Validation rules for Updating a Recommendation
 */
const validateUpdateRecommendation = [
  param('id')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid recommendation ID format'),

  body('stockName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Stock name cannot be empty')
    .isLength({ max: 150 })
    .withMessage('Stock name cannot exceed 150 characters'),

  body('symbol')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Stock symbol cannot be empty')
    .isLength({ max: 20 })
    .withMessage('Stock symbol cannot exceed 20 characters'),

  body('action')
    .optional()
    .trim()
    .toUpperCase()
    .isIn(['BUY', 'SELL', 'HOLD'])
    .withMessage('Action must be BUY, SELL, or HOLD'),

  body('exchange')
    .optional()
    .trim()
    .toUpperCase()
    .isIn(['NSE', 'BSE'])
    .withMessage('Exchange must be NSE or BSE'),

  body('entryPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Entry price must be a positive number'),

  body('targetPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Target price must be a positive number'),

  body('stopLoss')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Stop loss must be a positive number'),

  body('currentPrice')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Current price must be a positive number'),

  body('recommendationDate')
    .optional({ nullable: true })
    .isISO8601()
    .toDate()
    .withMessage('Invalid recommendation date format'),

  body('validTill')
    .optional({ nullable: true })
    .isISO8601()
    .toDate()
    .withMessage('Invalid validTill date format'),

  body('status')
    .optional()
    .trim()
    .toUpperCase()
    // .isIn(['ACTIVE', 'CLOSED', 'EXPIRED'])
    // .withMessage('Status must be ACTIVE, CLOSED, or EXPIRED'),

    .isIn(['ACTIVE', 'NONACTIVE', 'HOLD'])
    .withMessage('Status must be ACTIVE, NONACTIVE, or HOLD'),


  body('researchReason')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Research reason cannot exceed 2000 characters'),

  handleValidationErrors
];

/**
 * Validation for MongoDB ObjectId parameter
 */
const validateObjectId = [
  param('id')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid recommendation ID format'),
  handleValidationErrors
];

/**
 * Validation rules for Creating an Advertisement
 */
const validateCreateAdvertisement = [
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Advertisement type is required')
    .toUpperCase()
    .isIn(['LEFT', 'RIGHT'])
    .withMessage('Type must be LEFT or RIGHT'),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),

  body('subtitles')
    .optional()
    .isArray()
    .withMessage('Subtitles must be an array'),

  body('subtitles.*')
    .optional()
    .isString()
    .withMessage('Each subtitle must be a string')
    .trim()
    .isLength({ max: 200 })
    .withMessage('Each subtitle cannot exceed 200 characters'),

  body('personName')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 100 })
    .withMessage('Person name cannot exceed 100 characters'),

  body('contactNumber')
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 20 })
    .withMessage('Contact number cannot exceed 20 characters'),

  body('link')
    .optional({ nullable: true })
    .trim()
    .isURL({ require_protocol: true })
    .withMessage('Link must be a valid URL (include http:// or https://)'),

  body('personImage')
    .optional({ nullable: true })
    .isString()
    .withMessage('Person image must be a string'),

  handleValidationErrors
];

/**
 * Validation for Advertisement MongoDB ObjectId parameter
 */
const validateAdvertisementId = [
  param('id')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid advertisement ID format'),
  handleValidationErrors
];


module.exports = {
  validateLogin,
  validateCreateRecommendation,
  validateUpdateRecommendation,
  validateObjectId,
  validateCreateAdvertisement,
  validateAdvertisementId
};

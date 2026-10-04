const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const verifyLogin = require('../middleware/verifyLogin');
const {
  validateCreateRecommendation,
  validateUpdateRecommendation,
  validateObjectId
} = require('../middleware/validatorMiddleware');

// Public routes (Admin)
// @route   GET /api/recommendations
// @desc    Get all recommendations with filters & pagination
// @access  Private (Admin)
router.get('/', recommendationController.getRecommendations);

// Protect all recommendation routes with JWT verification
router.use(verifyLogin);

// @route   POST /api/recommendations
// @desc    Create a new recommendation
// @access  Private (Admin)
router.post('/', validateCreateRecommendation, recommendationController.createRecommendation);

// @route   GET /api/recommendations/:id
// @desc    Get single recommendation by ID
// @access  Private (Admin)
router.get('/:id', validateObjectId, recommendationController.getRecommendationById);

// @route   PUT /api/recommendations/:id
// @desc    Update recommendation
// @access  Private (Admin)
router.put('/:id', validateUpdateRecommendation, recommendationController.updateRecommendation);

// @route   DELETE /api/recommendations/:id
// @desc    Delete recommendation
// @access  Private (Admin)
router.delete('/:id', validateObjectId, recommendationController.deleteRecommendation);

module.exports = router;

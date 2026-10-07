const express = require('express');
const router = express.Router();
const advertisementController = require('../controllers/advertisementController');
const verifyLogin = require('../middleware/verifyLogin');
const { validateCreateAdvertisement, validateAdvertisementId } = require('../middleware/validatorMiddleware');

// All advertisement routes are protected

// @route   GET /api/advertisements
// @desc    Get all advertisements (optional ?type=LEFT or ?type=RIGHT)
// @access  Public
router.get('/', advertisementController.getAdvertisements);

// @route   POST /api/advertisements
// @desc    Create a new advertisement
// @access  Private (Admin)
router.post('/', verifyLogin, validateCreateAdvertisement, advertisementController.createAdvertisement);

// @route   PUT /api/advertisements/:id
// @desc    Update an advertisement
// @access  Private (Admin)
// router.put('/:id', verifyLogin, validateAdvertisementId, advertisementController.updateAdvertisement);
    
// @route   DELETE /api/advertisements/:id
// @desc    Delete an advertisement
// @access  Private (Admin)
router.delete('/:id', verifyLogin, validateAdvertisementId, advertisementController.deleteAdvertisement);

// isme put ka logic add karna baki hai

module.exports = router;

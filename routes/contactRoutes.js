const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const verifyLogin = require('../middleware/verifyLogin');

// Public route to submit contact inquiry
router.post('/', contactController.createContactInquiry);

// Protected routes (Admin only)
router.use(verifyLogin);
router.get('/', contactController.getContactInquiries);
router.get('/:id', contactController.getContactInquiryById);
router.put('/:id', contactController.updateContactStatus);
router.delete('/:id', contactController.deleteContactInquiry);

module.exports = router;

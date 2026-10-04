const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const verifyLogin = require('../middleware/verifyLogin');

// Public route to submit a complaint
router.post('/', complaintController.createComplaint);

// Protected routes (Admin only)
router.use(verifyLogin);
router.get('/', complaintController.getComplaints);
router.get('/:id', complaintController.getComplaintById);
router.put('/:id', complaintController.updateComplaint);
router.delete('/:id', complaintController.deleteComplaint);

module.exports = router;

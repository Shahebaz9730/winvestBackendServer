const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const verifyLogin = require('../middleware/verifyLogin');

// Protect dashboard stats with JWT
router.use(verifyLogin);
router.get('/stats', dashboardController.getDashboardStats);

module.exports = router;

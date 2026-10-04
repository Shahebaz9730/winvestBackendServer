const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// Routes for stocks
router.get('/', stockController.getStocks);
router.post('/', stockController.createStock);

module.exports = router;

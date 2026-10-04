const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// Routes for symbols
router.get('/', stockController.getSymbols);

module.exports = router;

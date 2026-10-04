const express = require('express');
const router = express.Router();
const controller = require('../controllers/investorCharterController');
// const controller = require('./investorCharterController');
// const controller = require('../controllers/investorCharterController');

// 1. Data of Month Ending
router.get('/monthending', controller.getMonthEnding);
router.put('/monthending', controller.updateMonthEnding);

// 2. Investor Charter
router.post('/charter', controller.addCharter);
router.get('/charter', controller.getCharter);
router.put('/charter/:id', controller.updateCharter);
router.delete('/charter/:id', controller.deleteCharter);

// 3. Trend of Annual Disposal
router.post('/trend', controller.addTrend);
router.get('/trend', controller.getTrend);
router.put('/trend/:id', controller.updateTrend);
router.delete('/trend/:id', controller.deleteTrend);

module.exports = router;


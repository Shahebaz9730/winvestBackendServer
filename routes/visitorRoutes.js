const express = require('express');
const router = express.Router();
const { trackVisitor } = require('../controllers/visitorController');

router.post('/track', trackVisitor);

visitorRoutes = router;
module.exports = visitorRoutes;
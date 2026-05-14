const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const scanRoutes = require('./scans');
const bookingRoutes = require('./bookings');
const pricingRoutes = require('./pricing');
const knowledgeRoutes = require('./knowledge');
const { getMetadata } = require('../controllers/dataController');

router.use('/auth', authRoutes);
router.use('/scans', scanRoutes);
router.use('/bookings', bookingRoutes);
router.use('/pricing', pricingRoutes);
router.use('/knowledge', knowledgeRoutes);
router.get('/metadata', getMetadata);

module.exports = router;

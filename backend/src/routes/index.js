const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const scanRoutes = require('./scans');
const bookingRoutes = require('./bookings');
const { getMetadata } = require('../controllers/dataController');

router.use('/auth', authRoutes);
router.use('/scans', scanRoutes);
router.use('/bookings', bookingRoutes);
router.get('/metadata', getMetadata);

module.exports = router;

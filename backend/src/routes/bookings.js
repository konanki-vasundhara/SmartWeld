const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Booking = require('../models/Booking');

router.get('/', authenticate, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const bookingData = req.body;
    const booking = await Booking.create({
      ...bookingData,
      userId: req.user.id,
      bookingId: `bk_${Date.now()}`
    });
    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

module.exports = router;

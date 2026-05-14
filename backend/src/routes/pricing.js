const express = require('express');
const router = express.Router();
const Pricing = require('../models/Pricing');

// Get all pricing
router.get('/', async (req, res) => {
  try {
    const prices = await Pricing.findAll();
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pricing' });
  }
});

// Get pricing by category
router.get('/category/:category', async (req, res) => {
  try {
    const prices = await Pricing.findAll({
      where: { category: req.params.category }
    });
    res.json(prices);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pricing' });
  }
});

module.exports = router;

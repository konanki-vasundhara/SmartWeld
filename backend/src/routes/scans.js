const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const Scan = require('../models/Scan');

router.get('/', authenticate, async (req, res) => {
  try {
    const scans = await Scan.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(scans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scans' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const scanData = req.body;
    const scan = await Scan.create({
      ...scanData,
      userId: req.user.id,
      scanId: `scan_${Date.now()}`
    });
    res.status(201).json(scan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save scan' });
  }
});

module.exports = router;

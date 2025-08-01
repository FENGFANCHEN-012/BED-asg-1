const express = require('express');
const { fetchMyEvents } = require('../services/eventbrite');
const router = express.Router();

router.get('/api/events', async (req, res) => {
  try {
    const events = await fetchMyEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
});

module.exports = router;
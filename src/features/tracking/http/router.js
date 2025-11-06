const express = require('express');
const handlers = require('./handlers');

const router = express.Router();

// Get tracking information for a specific delivery
router.get('/deliveries/:id', handlers.getDeliveryTracking);

// Get deliveries by status
router.get('/deliveries', handlers.getDeliveriesByStatus);

// Get active deliveries for a driver
router.get('/drivers/:driverId/deliveries', handlers.getDriverActiveDeliveries);

// Update delivery position (POST for tracking updates)
router.post('/deliveries/:id', handlers.updateDeliveryPosition);

module.exports = router;

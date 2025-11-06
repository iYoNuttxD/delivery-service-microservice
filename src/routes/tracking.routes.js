const express = require('express');
const router = express.Router();
const TrackingController = require('../infra/http/express/TrackingController');

// Get tracking information for a specific delivery
router.get('/deliveries/:id', TrackingController.getDeliveryTracking);

// Get deliveries by status
router.get('/deliveries', TrackingController.getDeliveriesByStatus);

// Get active deliveries for a driver
router.get('/drivers/:driverId/deliveries', TrackingController.getDriverActiveDeliveries);

// Update delivery position (POST for tracking updates)
router.post('/deliveries/:id', TrackingController.updateDeliveryPosition);

module.exports = router;

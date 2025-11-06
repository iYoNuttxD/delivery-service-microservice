const express = require('express');
const entregadoresRoutes = require('../features/drivers/http/router');
const veiculosRoutes = require('../features/vehicles/http/router');
const alugueisRoutes = require('../features/rentals/http/router');
const entregasRoutes = require('../features/deliveries/http/router');
const trackingRoutes = require('../features/tracking/http/router');
const container = require('../main/container');
const metrics = require('../utils/metrics');

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  const natsStatus = container.messageBus.getStatus();
  const opaStatus = container.policyClient.getStatus();
  const mapStatus = container.mapService.getStatus();
  
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Delivery Service',
    version: '1.0.0',
    integrations: {
      nats: natsStatus,
      opa: opaStatus,
      map: mapStatus
    }
  });
});

// Metrics endpoint
router.get('/metrics', async (req, res) => {
  try {
    const metricsData = await metrics.getMetrics();
    res.set('Content-Type', metrics.getContentType());
    res.send(metricsData);
  } catch (error) {
    res.status(500).json({ error: 'Error collecting metrics' });
  }
});

// Rotas principais
router.use('/entregadores', entregadoresRoutes);
router.use('/veiculos', veiculosRoutes);
router.use('/alugueis', alugueisRoutes);
router.use('/entregas', entregasRoutes);
router.use('/tracking', trackingRoutes);

module.exports = router;
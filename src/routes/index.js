const express = require('express');
const entregadoresRoutes = require('./entregadores.routes');
const veiculosRoutes = require('./veiculos.routes');
const alugueisRoutes = require('./alugueis.routes');
const entregasRoutes = require('./entregas.routes');
const trackingRoutes = require('./tracking.routes');
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
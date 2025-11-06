const express = require('express');
const entregadoresRoutes = require('./entregadores.routes');
const veiculosRoutes = require('./veiculos.routes');
const alugueisRoutes = require('./alugueis.routes');
const entregasRoutes = require('./entregas.routes');
const trackingRoutes = require('./tracking.routes');
const opaAuthorization = require('../middlewares/opaAuthorization');

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Delivery Service',
    version: '1.0.0'
  });
});

// Rotas principais
router.use('/entregadores', entregadoresRoutes);
router.use('/veiculos', veiculosRoutes);
router.use('/alugueis', alugueisRoutes);
router.use('/entregas', entregasRoutes);
router.use('/tracking', trackingRoutes);

module.exports = router;
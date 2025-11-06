const express = require('express');
const router = express.Router();
const TrackingController = require('../controllers/TrackingController');
const opaAuthorization = require('../middlewares/opaAuthorization');

/**
 * @route GET /api/v1/tracking/:deliveryId
 * @desc Obter posição de rastreamento de uma entrega
 */
router.get('/:deliveryId', TrackingController.getPosition);

/**
 * @route POST /api/v1/tracking/:deliveryId
 * @desc Atualizar posição de rastreamento de uma entrega
 */
router.post('/:deliveryId', opaAuthorization({ resource: 'tracking', action: 'update' }), TrackingController.updatePosition);

module.exports = router;

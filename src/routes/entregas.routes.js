const express = require('express');
const { body, param } = require('express-validator');
const EntregaController = require('../controllers/EntregaController');
const validate = require('../middlewares/validator');

const router = express.Router();

const createValidation = [
  body('pedidoId').notEmpty().withMessage('ID do pedido é obrigatório'),
  body('entregadorId').isInt().withMessage('ID do entregador inválido'),
  body('aluguelId').isInt().withMessage('ID do aluguel inválido'),
  body('enderecoColeta').notEmpty().withMessage('Endereço de coleta é obrigatório'),
  body('enderecoEntrega').notEmpty().withMessage('Endereço de entrega é obrigatório'),
  body('taxaEntrega').isFloat({ min: 0 }).withMessage('Taxa de entrega inválida'),
  validate
];

const statusValidation = [
  body('status').isIn(['PENDENTE', 'ATRIBUIDA', 'COLETADA', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADA']),
  validate
];

const idValidation = [
  param('id').isInt().withMessage('ID deve ser um número inteiro'),
  validate
];

router.get('/', EntregaController.getAll);
router.get('/:id', idValidation, EntregaController.getById);
router.post('/', createValidation, EntregaController.create);
router.patch('/:id/status', [...idValidation, ...statusValidation], EntregaController.updateStatus);

module.exports = router;
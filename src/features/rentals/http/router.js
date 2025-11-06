const express = require('express');
const { body, param } = require('express-validator');
const handlers = require('./handlers');
const validate = require('../../../middlewares/validator');

const router = express.Router();

const createValidation = [
  body('dataInicio').isDate().withMessage('Data de início inválida'),
  body('entregadorId').isInt().withMessage('ID do entregador inválido'),
  body('veiculoId').isInt().withMessage('ID do veículo inválido'),
  validate
];

const finalizeValidation = [
  body('dataFim').isDate().withMessage('Data de fim inválida'),
  validate
];

const idValidation = [
  param('id').isInt().withMessage('ID deve ser um número inteiro'),
  validate
];

router.get('/', handlers.getAll);
router.get('/:id', idValidation, handlers.getById);
router.post('/', createValidation, handlers.create);
router.patch('/:id/finalizar', [...idValidation, ...finalizeValidation], handlers.finalize);
router.patch('/:id/cancelar', idValidation, handlers.cancel);


module.exports = router;

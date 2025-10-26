aconst express = require('express');
const { body, param } = require('express-validator');
const AluguelController = require('../controllers/AluguelController');
const validate = require('../middlewares/validator');

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

router.get('/', AluguelController.getAll);
router.get('/:id', idValidation, AluguelController.getById);
router.post('/', createValidation, AluguelController.create);
router.patch('/:id/finalizar', [...idValidation, ...finalizeValidation], AluguelController.finalize);
router.patch('/:id/cancelar', idValidation, AluguelController.cancel);

module.exports = router;
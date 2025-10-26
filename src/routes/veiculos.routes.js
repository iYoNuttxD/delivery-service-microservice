const express = require('express');
const { body, param } = require('express-validator');
const VeiculoController = require('../controllers/VeiculoController');
const validate = require('../middlewares/validator');

const router = express.Router();

const createValidation = [
  body('tipo').isIn(['MOTOCICLETA', 'CARRO', 'BICICLETA']).withMessage('Tipo inválido'),
  body('placa').notEmpty().withMessage('Placa é obrigatória'),
  body('modelo').notEmpty().withMessage('Modelo é obrigatório'),
  body('marca').notEmpty().withMessage('Marca é obrigatória'),
  body('ano').isInt({ min: 1900 }).withMessage('Ano inválido'),
  body('precoDiaria').isFloat({ min: 0 }).withMessage('Preço da diária inválido'),
  body('locadorId').isInt().withMessage('ID do locador inválido'),
  validate
];

const updateValidation = [
  body('status').optional().isIn(['DISPONIVEL', 'ALUGADO', 'MANUTENCAO']),
  body('precoDiaria').optional().isFloat({ min: 0 }),
  validate
];

const idValidation = [
  param('id').isInt().withMessage('ID deve ser um número inteiro'),
  validate
];

router.get('/', VeiculoController.getAll);
router.get('/:id', idValidation, VeiculoController.getById);
router.post('/', createValidation, VeiculoController.create);
router.put('/:id', [...idValidation, ...updateValidation], VeiculoController.update);
router.delete('/:id', idValidation, VeiculoController.delete);

module.exports = router;
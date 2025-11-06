const express = require('express');
const { body, param } = require('express-validator');
const handlers = require('./handlers');
const validate = require('../../../middlewares/validator');

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

router.get('/', handlers.getAll);
router.get('/:id', idValidation, handlers.getById);
router.post('/', createValidation, handlers.create);
router.put('/:id', [...idValidation, ...updateValidation], handlers.update);
router.delete('/:id', idValidation, handlers.delete);

module.exports = router;

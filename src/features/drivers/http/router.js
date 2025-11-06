const express = require('express');
const { body, param } = require('express-validator');
const handlers = require('./handlers');
const validate = require('../../../middlewares/validator');

const router = express.Router();

// Validações
const createValidation = [
  body('nome').notEmpty().withMessage('Nome é obrigatório'),
  body('documento').isLength({ min: 11, max: 11 }).withMessage('CPF deve ter 11 dígitos'),
  body('cnh').notEmpty().withMessage('CNH é obrigatória'),
  body('cnhCategoria').notEmpty().withMessage('Categoria da CNH é obrigatória'),
  body('email').isEmail().withMessage('Email inválido'),
  body('telefone').notEmpty().withMessage('Telefone é obrigatório'),
  body('dataNascimento').isDate().withMessage('Data de nascimento inválida'),
  validate
];

const updateValidation = [
  body('nome').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('telefone').optional().notEmpty(),
  body('status').optional().isIn(['ATIVO', 'INATIVO', 'BLOQUEADO']),
  validate
];

const idValidation = [
  param('id').isInt().withMessage('ID deve ser um número inteiro'),
  validate
];

// Rotas
router.get('/', handlers.getAll);
router.get('/:id', idValidation, handlers.getById);
router.post('/', createValidation, handlers.create);
router.put('/:id', [...idValidation, ...updateValidation], handlers.update);
router.delete('/:id', idValidation, handlers.delete);

module.exports = router;

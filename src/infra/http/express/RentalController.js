const container = require('../../../main/container');

class RentalController {
  async getAll(req, res, next) {
    try {
      const { entregadorId, veiculoId, status } = req.query;
      const filters = {};

      if (entregadorId) filters.entregadorId = parseInt(entregadorId);
      if (veiculoId) filters.veiculoId = parseInt(veiculoId);
      if (status) filters.status = status;

      const rentals = await container.rentalUseCases.getAll(filters);

      res.status(200).json({
        success: true,
        data: rentals,
        total: rentals.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const rental = await container.rentalUseCases.getById(parseInt(id));

      res.status(200).json({
        success: true,
        data: rental
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const data = {
        entregadorId: req.body.entregadorId,
        veiculoId: req.body.veiculoId,
        dataInicio: req.body.dataInicio || new Date(),
        valorDiaria: req.body.valorDiaria
      };

      const rental = await container.rentalUseCases.create(data);

      res.status(201).json({
        success: true,
        message: 'Aluguel criado com sucesso',
        data: rental
      });
    } catch (error) {
      next(error);
    }
  }

  async finalize(req, res, next) {
    try {
      const { id } = req.params;
      const rental = await container.rentalUseCases.finalize(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Aluguel finalizado com sucesso',
        data: rental
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const rental = await container.rentalUseCases.cancel(parseInt(id));

      res.status(200).json({
        success: true,
        message: 'Aluguel cancelado com sucesso',
        data: rental
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RentalController();

const container = require('../../../main/container');

class VehicleController {
  async getAll(req, res, next) {
    try {
      const { status, tipo } = req.query;
      const filters = {};
      if (status) filters.status = status;
      if (tipo) filters.tipo = tipo;

      const vehicles = await container.vehicleUseCases.getAll(filters);

      res.status(200).json({
        success: true,
        data: vehicles,
        total: vehicles.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const vehicle = await container.vehicleUseCases.getById(parseInt(id));

      res.status(200).json({
        success: true,
        data: vehicle
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const vehicle = await container.vehicleUseCases.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Veículo criado com sucesso',
        data: vehicle
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const vehicle = await container.vehicleUseCases.update(parseInt(id), req.body);

      res.status(200).json({
        success: true,
        message: 'Veículo atualizado com sucesso',
        data: vehicle
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await container.vehicleUseCases.delete(parseInt(id));

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VehicleController();

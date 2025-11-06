const container = require('../../../main/container');

class DriverController {
  async getAll(req, res, next) {
    try {
      const { status } = req.query;
      const filters = status ? { status } : {};

      const drivers = await container.driverUseCases.getAll(filters);

      res.status(200).json({
        success: true,
        data: drivers,
        total: drivers.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const driver = await container.driverUseCases.getById(parseInt(id));

      res.status(200).json({
        success: true,
        data: driver
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const driver = await container.driverUseCases.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Entregador criado com sucesso',
        data: driver
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const driver = await container.driverUseCases.update(parseInt(id), req.body);

      res.status(200).json({
        success: true,
        message: 'Entregador atualizado com sucesso',
        data: driver
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await container.driverUseCases.delete(parseInt(id));

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DriverController();

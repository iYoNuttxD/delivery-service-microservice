const EntregadorService = require('../services/EntregadorService');

class EntregadorController {
  async getAll(req, res, next) {
    try {
      const { status } = req.query;
      const entregadores = await EntregadorService.getAllEntregadores(status);
      
      res.json({
        success: true,
        data: entregadores,
        total: entregadores.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const entregador = await EntregadorService.getEntregadorById(parseInt(id));
      
      res.json({
        success: true,
        data: entregador
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const entregador = await EntregadorService.createEntregador(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Entregador criado com sucesso',
        data: entregador
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const entregador = await EntregadorService.updateEntregador(parseInt(id), req.body);
      
      res.json({
        success: true,
        message: 'Entregador atualizado com sucesso',
        data: entregador
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await EntregadorService.deleteEntregador(parseInt(id));
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EntregadorController();
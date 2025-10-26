const EntregaService = require('../services/EntregaService');

class EntregaController {
  async getAll(req, res, next) {
    try {
      const { entregadorId, status, pedidoId } = req.query;
      const entregas = await EntregaService.getAllEntregas({ 
        entregadorId: entregadorId ? parseInt(entregadorId) : null, 
        status,
        pedidoId
      });
      
      res.json({
        success: true,
        data: entregas,
        total: entregas.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const entrega = await EntregaService.getEntregaById(parseInt(id));
      
      res.json({
        success: true,
        data: entrega
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const entrega = await EntregaService.createEntrega(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Entrega criada com sucesso',
        data: entrega
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const entrega = await EntregaService.updateEntregaStatus(parseInt(id), status);
      
      res.json({
        success: true,
        message: 'Status da entrega atualizado com sucesso',
        data: entrega
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EntregaController();
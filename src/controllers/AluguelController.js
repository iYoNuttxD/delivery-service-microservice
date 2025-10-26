const AluguelService = require('../services/AluguelService');

class AluguelController {
  async getAll(req, res, next) {
    try {
      const { entregadorId, status } = req.query;
      const alugueis = await AluguelService.getAllAlugueis({ 
        entregadorId: entregadorId ? parseInt(entregadorId) : null, 
        status 
      });
      
      res.json({
        success: true,
        data: alugueis,
        total: alugueis.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const aluguel = await AluguelService.getAluguelById(parseInt(id));
      
      res.json({
        success: true,
        data: aluguel
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const aluguel = await AluguelService.createAluguel(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Aluguel criado com sucesso',
        data: aluguel
      });
    } catch (error) {
      next(error);
    }
  }

  async finalize(req, res, next) {
    try {
      const { id } = req.params;
      const { dataFim } = req.body;
      
      const aluguel = await AluguelService.finalizeAluguel(parseInt(id), dataFim);
      
      res.json({
        success: true,
        message: 'Aluguel finalizado com sucesso',
        data: aluguel
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const aluguel = await AluguelService.cancelAluguel(parseInt(id));
      
      res.json({
        success: true,
        message: 'Aluguel cancelado com sucesso',
        data: aluguel
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AluguelController();
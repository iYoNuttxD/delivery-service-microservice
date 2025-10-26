const VeiculoService = require('../services/VeiculoService');

class VeiculoController {
  async getAll(req, res, next) {
    try {
      const { status, tipo } = req.query;
      const veiculos = await VeiculoService.getAllVeiculos({ status, tipo });
      
      res.json({
        success: true,
        data: veiculos,
        total: veiculos.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const veiculo = await VeiculoService.getVeiculoById(parseInt(id));
      
      res.json({
        success: true,
        data: veiculo
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const veiculo = await VeiculoService.createVeiculo(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Veículo criado com sucesso',
        data: veiculo
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const veiculo = await VeiculoService.updateVeiculo(parseInt(id), req.body);
      
      res.json({
        success: true,
        message: 'Veículo atualizado com sucesso',
        data: veiculo
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await VeiculoService.deleteVeiculo(parseInt(id));
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VeiculoController();
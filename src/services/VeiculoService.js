const VeiculoRepository = require('../repositories/VeiculoRepository');
const logger = require('../utils/logger');

class VeiculoService {
  async getAllVeiculos(filters = {}) {
    try {
      logger.info('Buscando todos os veículos', { filters });
      const veiculos = await VeiculoRepository.findAll(filters);
      return veiculos;
    } catch (error) {
      logger.error('Erro ao buscar veículos', { error: error.message });
      throw error;
    }
  }

  async getVeiculoById(id) {
    try {
      logger.info('Buscando veículo por ID', { id });
      const veiculo = await VeiculoRepository.findById(id);
      
      if (!veiculo) {
        const error = new Error('Veículo não encontrado');
        error.statusCode = 404;
        throw error;
      }
      
      return veiculo;
    } catch (error) {
      logger.error('Erro ao buscar veículo', { id, error: error.message });
      throw error;
    }
  }

  async createVeiculo(data) {
    try {
      logger.info('Criando novo veículo', { placa: data.placa });
      
      // Validar se placa já existe
      const existingPlaca = await VeiculoRepository.findByPlaca(data.placa);
      if (existingPlaca) {
        const error = new Error('Placa já cadastrada');
        error.statusCode = 409;
        throw error;
      }
      
      // Validar ano do veículo
      const currentYear = new Date().getFullYear();
      if (data.ano > currentYear + 1 || data.ano < 1900) {
        const error = new Error('Ano do veículo inválido');
        error.statusCode = 400;
        throw error;
      }
      
      const veiculo = await VeiculoRepository.create(data);
      logger.info('Veículo criado com sucesso', { id: veiculo.Id });
      
      return veiculo;
    } catch (error) {
      logger.error('Erro ao criar veículo', { error: error.message });
      throw error;
    }
  }

  async updateVeiculo(id, data) {
    try {
      logger.info('Atualizando veículo', { id });
      
      // Verificar se existe
      await this.getVeiculoById(id);
      
      const veiculo = await VeiculoRepository.update(id, data);
      logger.info('Veículo atualizado com sucesso', { id });
      
      return veiculo;
    } catch (error) {
      logger.error('Erro ao atualizar veículo', { id, error: error.message });
      throw error;
    }
  }

  async deleteVeiculo(id) {
    try {
      logger.info('Deletando veículo', { id });
      
      // Verificar se existe
      await this.getVeiculoById(id);
      
      const deleted = await VeiculoRepository.delete(id);
      
      if (!deleted) {
        const error = new Error('Não foi possível deletar o veículo');
        error.statusCode = 500;
        throw error;
      }
      
      logger.info('Veículo deletado com sucesso', { id });
      return { message: 'Veículo deletado com sucesso' };
    } catch (error) {
      logger.error('Erro ao deletar veículo', { id, error: error.message });
      throw error;
    }
  }

  async checkAvailability(id) {
    try {
      const veiculo = await this.getVeiculoById(id);
      return veiculo.Status === 'DISPONIVEL';
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new VeiculoService();
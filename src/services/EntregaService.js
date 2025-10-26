const EntregaRepository = require('../repositories/EntregaRepository');
const AluguelRepository = require('../repositories/AluguelRepository');
const logger = require('../utils/logger');

class EntregaService {
  async getAllEntregas(filters = {}) {
    try {
      logger.info('Buscando todas as entregas', { filters });
      const entregas = await EntregaRepository.findAll(filters);
      return entregas;
    } catch (error) {
      logger.error('Erro ao buscar entregas', { error: error.message });
      throw error;
    }
  }

  async getEntregaById(id) {
    try {
      logger.info('Buscando entrega por ID', { id });
      const entrega = await EntregaRepository.findById(id);
      
      if (!entrega) {
        const error = new Error('Entrega não encontrada');
        error.statusCode = 404;
        throw error;
      }
      
      return entrega;
    } catch (error) {
      logger.error('Erro ao buscar entrega', { id, error: error.message });
      throw error;
    }
  }

  async createEntrega(data) {
    try {
      logger.info('Criando nova entrega', data);
      
      // Verificar se aluguel existe e está ativo
      const aluguel = await AluguelRepository.findById(data.aluguelId);
      if (!aluguel) {
        const error = new Error('Aluguel não encontrado');
        error.statusCode = 404;
        throw error;
      }
      
      if (aluguel.Status !== 'ATIVO') {
        const error = new Error('Aluguel não está ativo');
        error.statusCode = 400;
        throw error;
      }
      
      const entrega = await EntregaRepository.create(data);
      logger.info('Entrega criada com sucesso', { id: entrega.Id });
      
      return entrega;
    } catch (error) {
      logger.error('Erro ao criar entrega', { error: error.message });
      throw error;
    }
  }

  async updateEntregaStatus(id, status) {
    try {
      logger.info('Atualizando status da entrega', { id, status });
      
      const entrega = await this.getEntregaById(id);
      
      // Validar transições de status
      const validTransitions = {
        'PENDENTE': ['ATRIBUIDA', 'CANCELADA'],
        'ATRIBUIDA': ['COLETADA', 'CANCELADA'],
        'COLETADA': ['EM_TRANSITO', 'CANCELADA'],
        'EM_TRANSITO': ['ENTREGUE', 'CANCELADA'],
        'ENTREGUE': [],
        'CANCELADA': []
      };
      
      if (!validTransitions[entrega.Status].includes(status)) {
        const error = new Error(`Transição inválida de ${entrega.Status} para ${status}`);
        error.statusCode = 400;
        throw error;
      }
      
      // Adicionar timestamps automáticos
      const additionalData = {};
      if (status === 'COLETADA') {
        additionalData.horaColeta = new Date();
      }
      if (status === 'ENTREGUE') {
        additionalData.horaEntrega = new Date();
      }
      
      const entregaAtualizada = await EntregaRepository.updateStatus(id, status, additionalData);
      logger.info('Status da entrega atualizado com sucesso', { id, status });
      
      return entregaAtualizada;
    } catch (error) {
      logger.error('Erro ao atualizar status da entrega', { id, error: error.message });
      throw error;
    }
  }
}

module.exports = new EntregaService();
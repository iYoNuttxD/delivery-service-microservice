const EntregadorRepository = require('../repositories/EntregadorRepository');
const logger = require('../utils/logger');

class EntregadorService {
  async getAllEntregadores(status = null) {
    try {
      logger.info('Buscando todos os entregadores', { status });
      const entregadores = await EntregadorRepository.findAll(status);
      return entregadores;
    } catch (error) {
      logger.error('Erro ao buscar entregadores', { error: error.message });
      throw error;
    }
  }

  async getEntregadorById(id) {
    try {
      logger.info('Buscando entregador por ID', { id });
      const entregador = await EntregadorRepository.findById(id);
      
      if (!entregador) {
        const error = new Error('Entregador não encontrado');
        error.statusCode = 404;
        throw error;
      }
      
      return entregador;
    } catch (error) {
      logger.error('Erro ao buscar entregador', { id, error: error.message });
      throw error;
    }
  }

  async createEntregador(data) {
    try {
      logger.info('Criando novo entregador', { documento: data.documento });
      
      // Validar se CPF já existe
      const existingDoc = await EntregadorRepository.findByDocumento(data.documento);
      if (existingDoc) {
        const error = new Error('CPF já cadastrado');
        error.statusCode = 409;
        throw error;
      }
      
      // Validar idade mínima (18 anos)
      const birthDate = new Date(data.dataNascimento);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18) {
        const error = new Error('Entregador deve ter no mínimo 18 anos');
        error.statusCode = 400;
        throw error;
      }
      
      const entregador = await EntregadorRepository.create(data);
      logger.info('Entregador criado com sucesso', { id: entregador.Id });
      
      return entregador;
    } catch (error) {
      logger.error('Erro ao criar entregador', { error: error.message });
      throw error;
    }
  }

  async updateEntregador(id, data) {
    try {
      logger.info('Atualizando entregador', { id });
      
      // Verificar se existe
      await this.getEntregadorById(id);
      
      const entregador = await EntregadorRepository.update(id, data);
      logger.info('Entregador atualizado com sucesso', { id });
      
      return entregador;
    } catch (error) {
      logger.error('Erro ao atualizar entregador', { id, error: error.message });
      throw error;
    }
  }

  async deleteEntregador(id) {
    try {
      logger.info('Deletando entregador', { id });
      
      // Verificar se existe
      await this.getEntregadorById(id);
      
      const deleted = await EntregadorRepository.delete(id);
      
      if (!deleted) {
        const error = new Error('Não foi possível deletar o entregador');
        error.statusCode = 500;
        throw error;
      }
      
      logger.info('Entregador deletado com sucesso', { id });
      return { message: 'Entregador deletado com sucesso' };
    } catch (error) {
      logger.error('Erro ao deletar entregador', { id, error: error.message });
      throw error;
    }
  }
}

module.exports = new EntregadorService();
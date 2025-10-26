const AluguelRepository = require('../repositories/AluguelRepository');
const VeiculoRepository = require('../repositories/VeiculoRepository');
const EntregadorRepository = require('../repositories/EntregadorRepository');
const logger = require('../utils/logger');

class AluguelService {
  async getAllAlugueis(filters = {}) {
    try {
      logger.info('Buscando todos os aluguéis', { filters });
      const alugueis = await AluguelRepository.findAll(filters);
      return alugueis;
    } catch (error) {
      logger.error('Erro ao buscar aluguéis', { error: error.message });
      throw error;
    }
  }

  async getAluguelById(id) {
    try {
      logger.info('Buscando aluguel por ID', { id });
      const aluguel = await AluguelRepository.findById(id);
      
      if (!aluguel) {
        const error = new Error('Aluguel não encontrado');
        error.statusCode = 404;
        throw error;
      }
      
      return aluguel;
    } catch (error) {
      logger.error('Erro ao buscar aluguel', { id, error: error.message });
      throw error;
    }
  }

  async createAluguel(data) {
    try {
      logger.info('Criando novo aluguel', data);
      
      // Verificar se entregador existe e está ativo
      const entregador = await EntregadorRepository.findById(data.entregadorId);
      if (!entregador) {
        const error = new Error('Entregador não encontrado');
        error.statusCode = 404;
        throw error;
      }
      
      if (entregador.Status !== 'ATIVO') {
        const error = new Error('Entregador não está ativo');
        error.statusCode = 400;
        throw error;
      }
      
      // Verificar se veículo existe e está disponível
      const veiculo = await VeiculoRepository.findById(data.veiculoId);
      if (!veiculo) {
        const error = new Error('Veículo não encontrado');
        error.statusCode = 404;
        throw error;
      }
      
      if (veiculo.Status !== 'DISPONIVEL') {
        const error = new Error('Veículo não está disponível');
        error.statusCode = 400;
        throw error;
      }
      
      // Criar aluguel
      const aluguel = await AluguelRepository.create(data);
      
      // Atualizar status do veículo para ALUGADO
      await VeiculoRepository.update(data.veiculoId, { status: 'ALUGADO' });
      
      logger.info('Aluguel criado com sucesso', { id: aluguel.Id });
      
      return aluguel;
    } catch (error) {
      logger.error('Erro ao criar aluguel', { error: error.message });
      throw error;
    }
  }

  async finalizeAluguel(id, dataFim) {
    try {
      logger.info('Finalizando aluguel', { id, dataFim });
      
      const aluguel = await this.getAluguelById(id);
      
      if (aluguel.Status !== 'ATIVO') {
        const error = new Error('Aluguel já foi finalizado ou cancelado');
        error.statusCode = 400;
        throw error;
      }
      
      // Calcular valor total
      const veiculo = await VeiculoRepository.findById(aluguel.VeiculoId);
      const dataInicio = new Date(aluguel.DataInicio);
      const dataFinal = new Date(dataFim);
      const dias = Math.ceil((dataFinal - dataInicio) / (1000 * 60 * 60 * 24));
      const valorTotal = dias * veiculo.PrecoDiaria;
      
      // Finalizar aluguel
      const aluguelFinalizado = await AluguelRepository.finalize(id, dataFim, valorTotal);
      
      // Atualizar status do veículo para DISPONIVEL
      await VeiculoRepository.update(aluguel.VeiculoId, { status: 'DISPONIVEL' });
      
      logger.info('Aluguel finalizado com sucesso', { id, valorTotal });
      
      return aluguelFinalizado;
    } catch (error) {
      logger.error('Erro ao finalizar aluguel', { id, error: error.message });
      throw error;
    }
  }

  async cancelAluguel(id) {
    try {
      logger.info('Cancelando aluguel', { id });
      
      const aluguel = await this.getAluguelById(id);
      
      if (aluguel.Status !== 'ATIVO') {
        const error = new Error('Aluguel já foi finalizado ou cancelado');
        error.statusCode = 400;
        throw error;
      }
      
      // Cancelar aluguel
      const aluguelCancelado = await AluguelRepository.cancel(id);
      
      // Atualizar status do veículo para DISPONIVEL
      await VeiculoRepository.update(aluguel.VeiculoId, { status: 'DISPONIVEL' });
      
      logger.info('Aluguel cancelado com sucesso', { id });
      
      return aluguelCancelado;
    } catch (error) {
      logger.error('Erro ao cancelar aluguel', { id, error: error.message });
      throw error;
    }
  }
}

module.exports = new AluguelService();
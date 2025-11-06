const EntregaRepository = require('../repositories/EntregaRepository');
const logger = require('../utils/logger');

class TrackingService {
  async getDeliveryTracking(deliveryId) {
    try {
      logger.info('Buscando rastreamento da entrega', { deliveryId });
      
      const delivery = await EntregaRepository.findById(deliveryId);
      
      if (!delivery) {
        const error = new Error('Entrega não encontrada');
        error.statusCode = 404;
        throw error;
      }

      // Build tracking information
      const tracking = {
        deliveryId: delivery.Id,
        pedidoId: delivery.PedidoId,
        status: delivery.Status,
        currentLocation: null, // Will be populated by MapIntegrationAdapter
        timeline: this.buildTimeline(delivery),
        estimatedDeliveryTime: this.calculateEstimatedDeliveryTime(delivery),
        driver: {
          id: delivery.EntregadorId,
          name: delivery.EntregadorNome
        }
      };

      logger.info('Rastreamento recuperado com sucesso', { deliveryId });
      return tracking;
    } catch (error) {
      logger.error('Erro ao buscar rastreamento', { 
        deliveryId, 
        error: error.message 
      });
      throw error;
    }
  }

  async getDeliveriesByStatus(status) {
    try {
      logger.info('Buscando entregas por status', { status });
      
      const deliveries = await EntregaRepository.findAll({ status });
      
      return deliveries.map(delivery => ({
        deliveryId: delivery.Id,
        pedidoId: delivery.PedidoId,
        status: delivery.Status,
        entregadorId: delivery.EntregadorId,
        entregadorNome: delivery.EntregadorNome,
        createdAt: delivery.CreatedAt
      }));
    } catch (error) {
      logger.error('Erro ao buscar entregas por status', { 
        status, 
        error: error.message 
      });
      throw error;
    }
  }

  async getDriverActiveDeliveries(driverId) {
    try {
      logger.info('Buscando entregas ativas do entregador', { driverId });
      
      const activeStatuses = ['ATRIBUIDA', 'COLETADA', 'EM_TRANSITO'];
      const deliveries = await EntregaRepository.findAll({ 
        entregadorId: driverId 
      });
      
      return deliveries
        .filter(d => activeStatuses.includes(d.Status))
        .map(delivery => ({
          deliveryId: delivery.Id,
          pedidoId: delivery.PedidoId,
          status: delivery.Status,
          enderecoColeta: delivery.EnderecoColeta,
          enderecoEntrega: delivery.EnderecoEntrega,
          horaColeta: delivery.HoraColeta
        }));
    } catch (error) {
      logger.error('Erro ao buscar entregas ativas do entregador', { 
        driverId, 
        error: error.message 
      });
      throw error;
    }
  }

  buildTimeline(delivery) {
    const timeline = [];

    timeline.push({
      status: 'PENDENTE',
      timestamp: delivery.CreatedAt,
      description: 'Entrega criada'
    });

    if (delivery.Status !== 'PENDENTE') {
      timeline.push({
        status: 'ATRIBUIDA',
        timestamp: delivery.UpdatedAt,
        description: 'Entrega atribuída ao entregador'
      });
    }

    if (delivery.HoraColeta) {
      timeline.push({
        status: 'COLETADA',
        timestamp: delivery.HoraColeta,
        description: 'Pedido coletado'
      });
    }

    if (delivery.Status === 'EM_TRANSITO') {
      timeline.push({
        status: 'EM_TRANSITO',
        timestamp: delivery.UpdatedAt,
        description: 'Em rota de entrega'
      });
    }

    if (delivery.HoraEntrega) {
      timeline.push({
        status: 'ENTREGUE',
        timestamp: delivery.HoraEntrega,
        description: 'Entrega concluída'
      });
    }

    if (delivery.Status === 'CANCELADA') {
      timeline.push({
        status: 'CANCELADA',
        timestamp: delivery.UpdatedAt,
        description: 'Entrega cancelada'
      });
    }

    return timeline;
  }

  calculateEstimatedDeliveryTime(delivery) {
    // This is a simple implementation
    // In a real scenario, you would use the MapIntegrationAdapter
    // to calculate more accurate ETAs based on traffic, distance, etc.
    
    if (delivery.Status === 'ENTREGUE') {
      return delivery.HoraEntrega;
    }

    if (delivery.Status === 'CANCELADA') {
      return null;
    }

    // Simple estimation: 1 hour from collection
    if (delivery.HoraColeta) {
      const estimatedTime = new Date(delivery.HoraColeta);
      estimatedTime.setHours(estimatedTime.getHours() + 1);
      return estimatedTime;
    }

    // If not collected yet, estimate 2 hours from now
    const estimatedTime = new Date();
    estimatedTime.setHours(estimatedTime.getHours() + 2);
    return estimatedTime;
  }
}

module.exports = new TrackingService();

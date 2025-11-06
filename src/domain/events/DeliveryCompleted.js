// Domain Event: DeliveryCompleted
class DeliveryCompleted {
  constructor(delivery) {
    this.deliveryId = delivery.id;
    this.pedidoId = delivery.pedidoId;
    this.entregadorId = delivery.entregadorId;
    this.horaEntrega = delivery.horaEntrega;
    this.timestamp = new Date().toISOString();
  }

  toPayload() {
    return {
      deliveryId: this.deliveryId,
      pedidoId: this.pedidoId,
      entregadorId: this.entregadorId,
      horaEntrega: this.horaEntrega,
      timestamp: this.timestamp
    };
  }
}

module.exports = DeliveryCompleted;

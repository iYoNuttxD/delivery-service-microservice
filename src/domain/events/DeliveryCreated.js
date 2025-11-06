// Domain Event: DeliveryCreated
class DeliveryCreated {
  constructor(delivery) {
    this.deliveryId = delivery.id;
    this.pedidoId = delivery.pedidoId;
    this.entregadorId = delivery.entregadorId;
    this.status = delivery.status;
    this.timestamp = new Date().toISOString();
  }

  toPayload() {
    return {
      deliveryId: this.deliveryId,
      pedidoId: this.pedidoId,
      entregadorId: this.entregadorId,
      status: this.status,
      timestamp: this.timestamp
    };
  }
}

module.exports = DeliveryCreated;

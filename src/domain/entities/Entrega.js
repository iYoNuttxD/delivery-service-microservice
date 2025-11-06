// Domain Entity: Entrega (Delivery)
class Entrega {
  constructor({
    id,
    pedidoId,
    entregadorId,
    aluguelId,
    enderecoColeta,
    enderecoEntrega,
    taxaEntrega,
    status = 'PENDENTE',
    horaColeta = null,
    horaEntrega = null,
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.pedidoId = pedidoId;
    this.entregadorId = entregadorId;
    this.aluguelId = aluguelId;
    this.enderecoColeta = enderecoColeta;
    this.enderecoEntrega = enderecoEntrega;
    this.taxaEntrega = taxaEntrega;
    this.status = status;
    this.horaColeta = horaColeta;
    this.horaEntrega = horaEntrega;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Business logic: validate status transitions
  canTransitionTo(newStatus) {
    const validTransitions = {
      'PENDENTE': ['ATRIBUIDA', 'CANCELADA'],
      'ATRIBUIDA': ['COLETADA', 'CANCELADA'],
      'COLETADA': ['EM_TRANSITO', 'CANCELADA'],
      'EM_TRANSITO': ['ENTREGUE', 'CANCELADA'],
      'ENTREGUE': [],
      'CANCELADA': []
    };

    return validTransitions[this.status]?.includes(newStatus) || false;
  }

  updateStatus(newStatus) {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(`Transição inválida de ${this.status} para ${newStatus}`);
    }

    this.status = newStatus;
    this.updatedAt = new Date();

    // Set timestamps based on status
    if (newStatus === 'COLETADA') {
      this.horaColeta = new Date();
    }
    if (newStatus === 'ENTREGUE') {
      this.horaEntrega = new Date();
    }
  }

  isCompleted() {
    return this.status === 'ENTREGUE';
  }

  isCancelled() {
    return this.status === 'CANCELADA';
  }

  isActive() {
    return ['ATRIBUIDA', 'COLETADA', 'EM_TRANSITO'].includes(this.status);
  }
}

module.exports = Entrega;

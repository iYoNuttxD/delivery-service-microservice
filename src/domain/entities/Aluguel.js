// Domain Entity: Aluguel (Rental)
class Aluguel {
  constructor({
    id,
    entregadorId,
    veiculoId,
    dataInicio,
    dataFim = null,
    valorDiaria,
    valorTotal = null,
    status = 'ATIVO',
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.entregadorId = entregadorId;
    this.veiculoId = veiculoId;
    this.dataInicio = dataInicio;
    this.dataFim = dataFim;
    this.valorDiaria = valorDiaria;
    this.valorTotal = valorTotal;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isActive() {
    return this.status === 'ATIVO';
  }

  finalize(dataFim = new Date()) {
    if (this.status !== 'ATIVO') {
      throw new Error('Apenas aluguéis ativos podem ser finalizados');
    }

    this.dataFim = dataFim;
    this.status = 'FINALIZADO';
    this.updatedAt = new Date();

    // Calculate total value based on days
    const days = this.calculateDays(this.dataInicio, this.dataFim);
    this.valorTotal = days * this.valorDiaria;
  }

  cancel() {
    if (this.status === 'FINALIZADO') {
      throw new Error('Aluguel já finalizado não pode ser cancelado');
    }

    this.status = 'CANCELADO';
    this.updatedAt = new Date();
  }

  calculateDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(diffDays, 1); // Minimum 1 day
  }
}

module.exports = Aluguel;

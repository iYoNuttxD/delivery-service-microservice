// Domain Entity: Veiculo (Vehicle)
class Veiculo {
  constructor({
    id,
    placa,
    tipo,
    marca,
    modelo,
    ano,
    status = 'DISPONIVEL',
    createdAt = new Date(),
    updatedAt = new Date()
  }) {
    this.id = id;
    this.placa = placa;
    this.tipo = tipo;
    this.marca = marca;
    this.modelo = modelo;
    this.ano = ano;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isAvailable() {
    return this.status === 'DISPONIVEL';
  }

  isRented() {
    return this.status === 'ALUGADO';
  }

  markAsRented() {
    this.status = 'ALUGADO';
    this.updatedAt = new Date();
  }

  markAsAvailable() {
    this.status = 'DISPONIVEL';
    this.updatedAt = new Date();
  }

  markForMaintenance() {
    this.status = 'MANUTENCAO';
    this.updatedAt = new Date();
  }
}

module.exports = Veiculo;

// Port: RentalRepository (Interface)
class RentalRepository {
  async findAll(filters = {}) {
    throw new Error('Method findAll() must be implemented');
  }

  async findById(id) {
    throw new Error('Method findById() must be implemented');
  }

  async findActiveByEntregador(entregadorId) {
    throw new Error('Method findActiveByEntregador() must be implemented');
  }

  async findActiveByVeiculo(veiculoId) {
    throw new Error('Method findActiveByVeiculo() must be implemented');
  }

  async create(data) {
    throw new Error('Method create() must be implemented');
  }

  async update(id, data) {
    throw new Error('Method update() must be implemented');
  }

  async updateStatus(id, status, additionalData = {}) {
    throw new Error('Method updateStatus() must be implemented');
  }
}

module.exports = RentalRepository;

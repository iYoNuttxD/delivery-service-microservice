// Port: VehicleRepository (Interface)
class VehicleRepository {
  async findAll(filters = {}) {
    throw new Error('Method findAll() must be implemented');
  }

  async findById(id) {
    throw new Error('Method findById() must be implemented');
  }

  async findByPlaca(placa) {
    throw new Error('Method findByPlaca() must be implemented');
  }

  async create(data) {
    throw new Error('Method create() must be implemented');
  }

  async update(id, data) {
    throw new Error('Method update() must be implemented');
  }

  async updateStatus(id, status) {
    throw new Error('Method updateStatus() must be implemented');
  }

  async delete(id) {
    throw new Error('Method delete() must be implemented');
  }
}

module.exports = VehicleRepository;

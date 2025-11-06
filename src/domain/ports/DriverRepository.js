// Port: DriverRepository (Interface)
class DriverRepository {
  async findAll(filters = {}) {
    throw new Error('Method findAll() must be implemented');
  }

  async findById(id) {
    throw new Error('Method findById() must be implemented');
  }

  async findByDocumento(documento) {
    throw new Error('Method findByDocumento() must be implemented');
  }

  async findByCnh(cnh) {
    throw new Error('Method findByCnh() must be implemented');
  }

  async create(data) {
    throw new Error('Method create() must be implemented');
  }

  async update(id, data) {
    throw new Error('Method update() must be implemented');
  }

  async delete(id) {
    throw new Error('Method delete() must be implemented');
  }
}

module.exports = DriverRepository;

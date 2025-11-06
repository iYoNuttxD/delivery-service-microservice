// Port: DeliveryRepository (Interface)
// Implementations should be in infra layer
class DeliveryRepository {
  async findAll(filters = {}) {
    throw new Error('Method findAll() must be implemented');
  }

  async findById(id) {
    throw new Error('Method findById() must be implemented');
  }

  async create(data) {
    throw new Error('Method create() must be implemented');
  }

  async updateStatus(id, status, additionalData = {}) {
    throw new Error('Method updateStatus() must be implemented');
  }
}

module.exports = DeliveryRepository;

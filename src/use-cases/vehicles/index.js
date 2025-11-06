// Vehicle use cases - simplified for CRUD operations
const Veiculo = require('../../domain/entities/Veiculo');

class VehicleUseCases {
  constructor(vehicleRepository, logger) {
    this.vehicleRepository = vehicleRepository;
    this.logger = logger;
  }

  async create(data) {
    this.logger.info('Creating new vehicle', { placa: data.placa });

    const existing = await this.vehicleRepository.findByPlaca(data.placa);
    if (existing) {
      const error = new Error('Placa já cadastrada');
      error.statusCode = 409;
      throw error;
    }

    const result = await this.vehicleRepository.create(data);
    this.logger.info('Vehicle created successfully', { id: result.Id });
    return result;
  }

  async getAll(filters = {}) {
    return this.vehicleRepository.findAll(filters);
  }

  async getById(id) {
    const vehicle = await this.vehicleRepository.findById(id);
    if (!vehicle) {
      const error = new Error('Veículo não encontrado');
      error.statusCode = 404;
      throw error;
    }
    return vehicle;
  }

  async update(id, data) {
    await this.getById(id); // Verify exists
    const result = await this.vehicleRepository.update(id, data);
    this.logger.info('Vehicle updated successfully', { id });
    return result;
  }

  async delete(id) {
    await this.getById(id); // Verify exists
    await this.vehicleRepository.delete(id);
    this.logger.info('Vehicle deleted successfully', { id });
  }
}

module.exports = VehicleUseCases;

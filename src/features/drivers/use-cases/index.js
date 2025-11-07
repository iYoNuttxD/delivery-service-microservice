// Driver use cases - simplified for CRUD operations
const Entregador = require('../../../domain/entities/Entregador');

class DriverUseCases {
  constructor(driverRepository, logger) {
    this.driverRepository = driverRepository;
    this.logger = logger;
  }

  async create(data) {
    this.logger.info('Creating new driver', { documento: data.documento });

    const driver = new Entregador({
      nome: data.nome,
      documento: data.documento,
      cnh: data.cnh,
      dataNascimento: data.dataNascimento,
      status: data.status || 'ATIVO'
    });

    if (!driver.isOldEnough(18)) {
      const error = new Error('Entregador deve ter no mínimo 18 anos');
      error.statusCode = 400;
      throw error;
    }

    const existing = await this.driverRepository.findByDocumento(data.documento);
    if (existing) {
      const error = new Error('CPF já cadastrado');
      error.statusCode = 409;
      throw error;
    }

    const result = await this.driverRepository.create(data);
    this.logger.info('Driver created successfully', { id: result.Id });
    return result;
  }

  async getAll(filters = {}) {
    return this.driverRepository.findAll(filters);
  }

  async getById(id) {
    const driver = await this.driverRepository.findById(id);
    if (!driver) {
      const error = new Error('Entregador não encontrado');
      error.statusCode = 404;
      throw error;
    }
    return driver;
  }

  async update(id, data) {
    await this.getById(id); // Verify exists
    const result = await this.driverRepository.update(id, data);
    this.logger.info('Driver updated successfully', { id });
    return result;
  }

  async delete(id) {
    await this.getById(id); // Verify exists
    await this.driverRepository.delete(id);
    this.logger.info('Driver deleted successfully', { id });
  }
}

module.exports = DriverUseCases;

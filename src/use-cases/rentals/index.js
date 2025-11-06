// Rental use cases
const Aluguel = require('../../domain/entities/Aluguel');

class RentalUseCases {
  constructor(rentalRepository, driverRepository, vehicleRepository, logger) {
    this.rentalRepository = rentalRepository;
    this.driverRepository = driverRepository;
    this.vehicleRepository = vehicleRepository;
    this.logger = logger;
  }

  async create(data) {
    this.logger.info('Creating new rental', data);

    // Verify driver exists and is active
    const driver = await this.driverRepository.findById(data.entregadorId);
    if (!driver || driver.Status !== 'ATIVO') {
      const error = new Error('Entregador não encontrado ou inativo');
      error.statusCode = 400;
      throw error;
    }

    // Verify vehicle exists and is available
    const vehicle = await this.vehicleRepository.findById(data.veiculoId);
    if (!vehicle) {
      const error = new Error('Veículo não encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (vehicle.Status !== 'DISPONIVEL') {
      const error = new Error('Veículo não está disponível');
      error.statusCode = 400;
      throw error;
    }

    // Check for active rentals
    const activeRental = await this.rentalRepository.findActiveByVeiculo(data.veiculoId);
    if (activeRental) {
      const error = new Error('Veículo já está alugado');
      error.statusCode = 400;
      throw error;
    }

    // Create rental and update vehicle status
    const result = await this.rentalRepository.create(data);
    await this.vehicleRepository.updateStatus(data.veiculoId, 'ALUGADO');

    this.logger.info('Rental created successfully', { id: result.Id });
    return result;
  }

  async getAll(filters = {}) {
    return this.rentalRepository.findAll(filters);
  }

  async getById(id) {
    const rental = await this.rentalRepository.findById(id);
    if (!rental) {
      const error = new Error('Aluguel não encontrado');
      error.statusCode = 404;
      throw error;
    }
    return rental;
  }

  async finalize(id) {
    const rental = await this.getById(id);

    if (rental.Status !== 'ATIVO') {
      const error = new Error('Apenas aluguéis ativos podem ser finalizados');
      error.statusCode = 400;
      throw error;
    }

    const dataFim = new Date();
    const rentalEntity = new Aluguel({
      id: rental.Id,
      entregadorId: rental.EntregadorId,
      veiculoId: rental.VeiculoId,
      dataInicio: rental.DataInicio,
      valorDiaria: rental.ValorDiaria,
      status: rental.Status
    });

    rentalEntity.finalize(dataFim);

    const result = await this.rentalRepository.updateStatus(id, 'FINALIZADO', {
      dataFim: dataFim,
      valorTotal: rentalEntity.valorTotal
    });

    await this.vehicleRepository.updateStatus(rental.VeiculoId, 'DISPONIVEL');

    this.logger.info('Rental finalized successfully', { id });
    return result;
  }

  async cancel(id) {
    const rental = await this.getById(id);

    if (rental.Status === 'FINALIZADO') {
      const error = new Error('Aluguel já finalizado não pode ser cancelado');
      error.statusCode = 400;
      throw error;
    }

    const result = await this.rentalRepository.updateStatus(id, 'CANCELADO');
    await this.vehicleRepository.updateStatus(rental.VeiculoId, 'DISPONIVEL');

    this.logger.info('Rental cancelled successfully', { id });
    return result;
  }
}

module.exports = RentalUseCases;

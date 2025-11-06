// Dependency Injection Container
const logger = require('../utils/logger');
const metrics = require('../utils/metrics');

// Infra - Repositories
const EntregaRepository = require('../infra/repositories/sqlserver/EntregaRepository');
const EntregadorRepository = require('../infra/repositories/sqlserver/EntregadorRepository');
const VeiculoRepository = require('../infra/repositories/sqlserver/VeiculoRepository');
const AluguelRepository = require('../infra/repositories/sqlserver/AluguelRepository');

// Infra - Adapters
const NatsMessageBus = require('../infra/adapters/NatsMessageBus');
const MapServiceAdapter = require('../infra/adapters/MapServiceAdapter');
const OPAPolicyClient = require('../infra/adapters/OPAPolicyClient');

// Use Cases - Deliveries
const CreateDelivery = require('../use-cases/deliveries/CreateDelivery');
const GetDelivery = require('../use-cases/deliveries/GetDelivery');
const ListDeliveries = require('../use-cases/deliveries/ListDeliveries');
const UpdateDeliveryStatus = require('../use-cases/deliveries/UpdateDeliveryStatus');

// Use Cases - Tracking
const GetDeliveryTracking = require('../use-cases/tracking/GetDeliveryTracking');
const UpdateDeliveryTrackingPosition = require('../use-cases/tracking/UpdateDeliveryTrackingPosition');
const ListDeliveriesByStatus = require('../use-cases/tracking/ListDeliveriesByStatus');

// Use Cases - Others
const DriverUseCases = require('../use-cases/drivers');
const VehicleUseCases = require('../use-cases/vehicles');
const RentalUseCases = require('../use-cases/rentals');

class Container {
  constructor() {
    this._instances = {};
    this._initializeRepositories();
    this._initializeAdapters();
    this._initializeUseCases();
  }

  _initializeRepositories() {
    this._instances.entregaRepository = EntregaRepository;
    this._instances.entregadorRepository = EntregadorRepository;
    this._instances.veiculoRepository = VeiculoRepository;
    this._instances.aluguelRepository = AluguelRepository;
  }

  _initializeAdapters() {
    this._instances.messageBus = NatsMessageBus;
    this._instances.mapService = MapServiceAdapter;
    this._instances.policyClient = OPAPolicyClient;
  }

  _initializeUseCases() {
    // Deliveries
    this._instances.createDelivery = new CreateDelivery(
      this._instances.entregaRepository,
      this._instances.aluguelRepository,
      this._instances.messageBus,
      logger,
      metrics
    );

    this._instances.getDelivery = new GetDelivery(
      this._instances.entregaRepository,
      logger
    );

    this._instances.listDeliveries = new ListDeliveries(
      this._instances.entregaRepository,
      logger
    );

    this._instances.updateDeliveryStatus = new UpdateDeliveryStatus(
      this._instances.entregaRepository,
      this._instances.messageBus,
      logger,
      metrics
    );

    // Tracking
    this._instances.getDeliveryTracking = new GetDeliveryTracking(
      this._instances.entregaRepository,
      logger
    );

    this._instances.updateDeliveryTrackingPosition = new UpdateDeliveryTrackingPosition(
      this._instances.entregaRepository,
      logger
    );

    this._instances.listDeliveriesByStatus = new ListDeliveriesByStatus(
      this._instances.entregaRepository,
      logger
    );

    // Drivers
    this._instances.driverUseCases = new DriverUseCases(
      this._instances.entregadorRepository,
      logger
    );

    // Vehicles
    this._instances.vehicleUseCases = new VehicleUseCases(
      this._instances.veiculoRepository,
      logger
    );

    // Rentals
    this._instances.rentalUseCases = new RentalUseCases(
      this._instances.aluguelRepository,
      this._instances.entregadorRepository,
      this._instances.veiculoRepository,
      logger
    );
  }

  // Getters for use cases
  get deliveryUseCases() {
    return {
      create: this._instances.createDelivery,
      getById: this._instances.getDelivery,
      list: this._instances.listDeliveries,
      updateStatus: this._instances.updateDeliveryStatus
    };
  }

  get trackingUseCases() {
    return {
      getTracking: this._instances.getDeliveryTracking,
      updatePosition: this._instances.updateDeliveryTrackingPosition,
      listByStatus: this._instances.listDeliveriesByStatus
    };
  }

  get driverUseCases() {
    return this._instances.driverUseCases;
  }

  get vehicleUseCases() {
    return this._instances.vehicleUseCases;
  }

  get rentalUseCases() {
    return this._instances.rentalUseCases;
  }

  // Getters for adapters (for health checks, etc.)
  get messageBus() {
    return this._instances.messageBus;
  }

  get mapService() {
    return this._instances.mapService;
  }

  get policyClient() {
    return this._instances.policyClient;
  }
}

// Singleton instance
module.exports = new Container();

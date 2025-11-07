// Dependency Injection Container
const logger = require('../utils/logger');
const metrics = require('../utils/metrics');

// Infra - Repositories
const EntregaRepositoryMod = require('../infra/repositories/sqlserver/EntregaRepository');
const EntregadorRepositoryMod = require('../infra/repositories/sqlserver/EntregadorRepository');
const VeiculoRepositoryMod = require('../infra/repositories/sqlserver/VeiculoRepository');
const AluguelRepositoryMod = require('../infra/repositories/sqlserver/AluguelRepository');

// Infra - Adapters
const NatsMessageBusMod = require('../infra/adapters/NatsMessageBus');
const MapServiceAdapterMod = require('../infra/adapters/MapServiceAdapter');
const OPAPolicyClientMod = require('../infra/adapters/OPAPolicyClient');

// Use Cases - Deliveries
const CreateDeliveryMod = require('../features/deliveries/use-cases/CreateDelivery');
const GetDeliveryMod = require('../features/deliveries/use-cases/GetDelivery');
const ListDeliveriesMod = require('../features/deliveries/use-cases/ListDeliveries');
const UpdateDeliveryStatusMod = require('../features/deliveries/use-cases/UpdateDeliveryStatus');

// Use Cases - Tracking
const GetDeliveryTrackingMod = require('../features/tracking/use-cases/GetDeliveryTracking');
const UpdateDeliveryTrackingPositionMod = require('../features/tracking/use-cases/UpdateDeliveryTrackingPosition');
const ListDeliveriesByStatusMod = require('../features/tracking/use-cases/ListDeliveriesByStatus');

// Use Cases - Others
const DriverUseCasesMod = require('../features/drivers/use-cases');
const VehicleUseCasesMod = require('../features/vehicles/use-cases');
const RentalUseCasesMod = require('../features/rentals/use-cases');

// Helpers para resolver default export e instanciar de forma resiliente
function resolveExport(mod) {
  if (mod && typeof mod === 'object' && 'default' in mod && mod.default) return mod.default;
  return mod;
}

function build(mod, ...args) {
  const exp = resolveExport(mod);
  if (typeof exp === 'function') {
    // Tenta como classe, cai para factory se necessário
    try {
      return new exp(...args);
    } catch {
      try {
        return exp(...args);
      } catch {
        return exp; // retorna a função caso seja usada como util direto
      }
    }
  }
  // Objeto já pronto (singleton)
  return exp;
}

class Container {
  constructor() {
    this._instances = {};
    this._initializeRepositories();
    this._initializeAdapters();
    this._initializeUseCases();
  }

  _initializeRepositories() {
    this._instances.entregaRepository = build(EntregaRepositoryMod);
    this._instances.entregadorRepository = build(EntregadorRepositoryMod);
    this._instances.veiculoRepository = build(VeiculoRepositoryMod);
    this._instances.aluguelRepository = build(AluguelRepositoryMod);
  }

  _initializeAdapters() {
    // Passe config no construtor se os adapters suportarem (ex.: logger, envs)
    this._instances.messageBus = build(NatsMessageBusMod);
    this._instances.mapService = build(MapServiceAdapterMod);
    this._instances.policyClient = build(OPAPolicyClientMod);
  }

  _initializeUseCases() {
    // Deliveries
    this._instances.createDelivery = build(
      CreateDeliveryMod,
      this._instances.entregaRepository,
      this._instances.aluguelRepository,
      this._instances.messageBus,
      logger,
      metrics
    );

    this._instances.getDelivery = build(
      GetDeliveryMod,
      this._instances.entregaRepository,
      logger
    );

    this._instances.listDeliveries = build(
      ListDeliveriesMod,
      this._instances.entregaRepository,
      logger
    );

    this._instances.updateDeliveryStatus = build(
      UpdateDeliveryStatusMod,
      this._instances.entregaRepository,
      this._instances.messageBus,
      logger,
      metrics
    );

    // Tracking
    this._instances.getDeliveryTracking = build(
      GetDeliveryTrackingMod,
      this._instances.entregaRepository,
      logger
    );

    this._instances.updateDeliveryTrackingPosition = build(
      UpdateDeliveryTrackingPositionMod,
      this._instances.entregaRepository,
      logger
    );

    this._instances.listDeliveriesByStatus = build(
      ListDeliveriesByStatusMod,
      this._instances.entregaRepository,
      logger
    );

    // Drivers
    this._instances.driverUseCases = build(
      DriverUseCasesMod,
      this._instances.entregadorRepository,
      logger
    );

    // Vehicles
    this._instances.vehicleUseCases = build(
      VehicleUseCasesMod,
      this._instances.veiculoRepository,
      logger
    );

    // Rentals
    this._instances.rentalUseCases = build(
      RentalUseCasesMod,
      this._instances.aluguelRepository,
      this._instances.entregadorRepository,
      this._instances.veiculoRepository,
      logger
    );
  }

  // Use cases por slice
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

  // Adapters (para health/etc.)
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

// Singleton
module.exports = new Container();

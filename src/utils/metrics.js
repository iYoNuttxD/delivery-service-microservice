const promClient = require('prom-client');
const logger = require('./logger');

class MetricsCollector {
  constructor() {
    // Metrics enabled by default, can be disabled by setting METRICS_ENABLED=false
    this.enabled = process.env.METRICS_ENABLED !== 'false';
    
    if (!this.enabled) {
      logger.info('Coleta de métricas desabilitada');
      return;
    }

    // Create a Registry to register metrics
    this.register = new promClient.Registry();

    // Add default metrics (CPU, memory, etc.)
    promClient.collectDefaultMetrics({ 
      register: this.register,
      prefix: 'delivery_service_'
    });

    // Custom metrics
    this.httpRequestDuration = new promClient.Histogram({
      name: 'delivery_service_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5]
    });

    this.httpRequestTotal = new promClient.Counter({
      name: 'delivery_service_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']
    });

    this.deliveryStatusChanges = new promClient.Counter({
      name: 'delivery_service_status_changes_total',
      help: 'Total number of delivery status changes',
      labelNames: ['from_status', 'to_status']
    });

    this.activeDeliveries = new promClient.Gauge({
      name: 'delivery_service_active_deliveries',
      help: 'Number of currently active deliveries',
      labelNames: ['status']
    });

    this.natsMessagesPublished = new promClient.Counter({
      name: 'delivery_service_nats_messages_published_total',
      help: 'Total number of NATS messages published',
      labelNames: ['subject', 'success']
    });

    this.natsMessagesReceived = new promClient.Counter({
      name: 'delivery_service_nats_messages_received_total',
      help: 'Total number of NATS messages received',
      labelNames: ['subject']
    });

    this.opaAuthChecks = new promClient.Counter({
      name: 'delivery_service_opa_auth_checks_total',
      help: 'Total number of OPA authorization checks',
      labelNames: ['action', 'allowed']
    });

    this.mapServiceRequests = new promClient.Counter({
      name: 'delivery_service_map_requests_total',
      help: 'Total number of map service requests',
      labelNames: ['operation', 'success']
    });

    // Register custom metrics
    this.register.registerMetric(this.httpRequestDuration);
    this.register.registerMetric(this.httpRequestTotal);
    this.register.registerMetric(this.deliveryStatusChanges);
    this.register.registerMetric(this.activeDeliveries);
    this.register.registerMetric(this.natsMessagesPublished);
    this.register.registerMetric(this.natsMessagesReceived);
    this.register.registerMetric(this.opaAuthChecks);
    this.register.registerMetric(this.mapServiceRequests);

    logger.info('Coleta de métricas inicializada');
  }

  recordHttpRequest(method, route, statusCode, duration) {
    if (!this.enabled) return;
    
    this.httpRequestDuration.observe(
      { method, route, status_code: statusCode },
      duration
    );
    this.httpRequestTotal.inc({ method, route, status_code: statusCode });
  }

  recordDeliveryStatusChange(fromStatus, toStatus) {
    if (!this.enabled) return;
    
    this.deliveryStatusChanges.inc({ from_status: fromStatus, to_status: toStatus });
  }

  setActiveDeliveries(status, count) {
    if (!this.enabled) return;
    
    this.activeDeliveries.set({ status }, count);
  }

  recordNatsMessagePublished(subject, success) {
    if (!this.enabled) return;
    
    this.natsMessagesPublished.inc({ 
      subject, 
      success: success ? 'true' : 'false' 
    });
  }

  recordNatsMessageReceived(subject) {
    if (!this.enabled) return;
    
    this.natsMessagesReceived.inc({ subject });
  }

  recordOpaAuthCheck(action, allowed) {
    if (!this.enabled) return;
    
    this.opaAuthChecks.inc({ 
      action, 
      allowed: allowed ? 'true' : 'false' 
    });
  }

  recordMapServiceRequest(operation, success) {
    if (!this.enabled) return;
    
    this.mapServiceRequests.inc({ 
      operation, 
      success: success ? 'true' : 'false' 
    });
  }

  async getMetrics() {
    if (!this.enabled) {
      return '# Metrics disabled\n';
    }
    
    return await this.register.metrics();
  }

  getContentType() {
    return this.register.contentType;
  }
}

module.exports = new MetricsCollector();

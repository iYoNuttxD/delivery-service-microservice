const promClient = require('prom-client');
const logger = require('../utils/logger');

// Create a Registry which registers the metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ 
  register,
  prefix: 'delivery_service_'
});

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'delivery_service_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new promClient.Counter({
  name: 'delivery_service_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

const deliveryStatusChanges = new promClient.Counter({
  name: 'delivery_service_status_changes_total',
  help: 'Total number of delivery status changes',
  labelNames: ['from_status', 'to_status']
});

const natsEventsPublished = new promClient.Counter({
  name: 'delivery_service_nats_events_published_total',
  help: 'Total number of NATS events published',
  labelNames: ['subject', 'status']
});

const natsEventsReceived = new promClient.Counter({
  name: 'delivery_service_nats_events_received_total',
  help: 'Total number of NATS events received',
  labelNames: ['subject']
});

const opaAuthorizationChecks = new promClient.Counter({
  name: 'delivery_service_opa_authorization_checks_total',
  help: 'Total number of OPA authorization checks',
  labelNames: ['resource', 'action', 'result']
});

const mapApiCalls = new promClient.Counter({
  name: 'delivery_service_map_api_calls_total',
  help: 'Total number of map API calls',
  labelNames: ['operation', 'status']
});

const trackingUpdates = new promClient.Counter({
  name: 'delivery_service_tracking_updates_total',
  help: 'Total number of tracking position updates'
});

const metricsErrors = new promClient.Counter({
  name: 'delivery_service_metrics_errors_total',
  help: 'Total number of errors generating metrics'
});

// Register custom metrics
register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestTotal);
register.registerMetric(deliveryStatusChanges);
register.registerMetric(natsEventsPublished);
register.registerMetric(natsEventsReceived);
register.registerMetric(opaAuthorizationChecks);
register.registerMetric(mapApiCalls);
register.registerMetric(trackingUpdates);
register.registerMetric(metricsErrors);

// Middleware to track HTTP requests
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestDuration.observe(
      {
        method: req.method,
        route: route,
        status_code: res.statusCode
      },
      duration
    );
    
    httpRequestTotal.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode
    });
  });
  
  next();
};

// Metrics endpoint handler
const metricsHandler = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    const metrics = await register.metrics();
    res.send(metrics);
  } catch (error) {
    logger.error('Erro ao gerar métricas', { error: error.message });
    metricsErrors.inc();
    res.status(500).send('Erro ao gerar métricas');
  }
};

module.exports = {
  register,
  metricsMiddleware,
  metricsHandler,
  metrics: {
    httpRequestDuration,
    httpRequestTotal,
    deliveryStatusChanges,
    natsEventsPublished,
    natsEventsReceived,
    opaAuthorizationChecks,
    mapApiCalls,
    trackingUpdates
  }
};

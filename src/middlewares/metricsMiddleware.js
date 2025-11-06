const metrics = require('../utils/metrics');

/**
 * Middleware to collect HTTP request metrics
 */
function metricsMiddleware(req, res, next) {
  const startTime = Date.now();

  // Capture response
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000; // Convert to seconds
    const route = req.route ? req.route.path : req.path;
    
    metrics.recordHttpRequest(
      req.method,
      route,
      res.statusCode,
      duration
    );
  });

  next();
}

module.exports = metricsMiddleware;

/**
 * Health Check Routes
 *
 * Kubernetes-ready health check endpoints:
 * - /health/live - Liveness probe
 * - /health/ready - Readiness probe
 * - /health/startup - Startup probe
 * - /health - Comprehensive health status
 */

const express = require('express');
const router = express.Router();
const healthCheckService = require('../services/healthCheckService');

/**
 * Helper to determine if request should include detailed info
 */
function shouldIncludeDetails(req) {
  const env = process.env.NODE_ENV || 'development';
  const detailParam = req.query.details === 'true';

  // In development, always show details unless explicitly disabled
  // In production, only show details if explicitly requested
  return env === 'development' || detailParam;
}

/**
 * GET /health/live
 * Liveness probe - Indicates if the server process is alive
 * Used by Kubernetes to determine if container should be restarted
 *
 * Returns:
 * - 200: Server is alive
 * - 500: Server is unhealthy (should restart)
 */
router.get('/live', async (req, res) => {
  try {
    const health = await healthCheckService.getLiveness();
    res.status(200).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * GET /health/ready
 * Readiness probe - Indicates if the server can handle requests
 * Used by Kubernetes to determine if traffic should be routed to this pod
 *
 * Query params:
 * - deep=true: Include deep health checks (Firestore, Auth, etc.)
 *
 * Returns:
 * - 200: Server is ready to handle traffic
 * - 503: Server is not ready (dependencies unavailable)
 */
router.get('/ready', async (req, res) => {
  try {
    const includeDeepChecks = req.query.deep === 'true';
    const health = await healthCheckService.getReadiness(includeDeepChecks);

    const statusCode = health.status === 'ready' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * GET /health/startup
 * Startup probe - Indicates if the application has finished starting up
 * Used by Kubernetes to know when to start liveness/readiness probes
 *
 * Returns:
 * - 200: Startup complete
 * - 503: Still starting up
 */
router.get('/startup', async (req, res) => {
  try {
    const health = await healthCheckService.getStartup();

    const statusCode = health.status === 'complete' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * GET /health
 * Comprehensive health check with all service statuses and metrics
 *
 * Query params:
 * - details=true: Include detailed metrics (default in development)
 * - metrics=false: Exclude system metrics
 *
 * Returns:
 * - 200: All services healthy or gracefully degraded
 * - 503: Critical services unhealthy
 */
router.get('/', async (req, res) => {
  try {
    const includeDetails = shouldIncludeDetails(req);
    const includeMetrics = req.query.metrics !== 'false';

    let health;

    if (includeDetails) {
      // Get scheduler service if available
      let schedulerService = null;
      try {
        schedulerService = require('../services/schedulerService');
      } catch (e) {
        // Scheduler service not available
      }

      health = await healthCheckService.getComprehensiveHealth(
        schedulerService,
        includeMetrics
      );
    } else {
      // Production mode - minimal details
      health = healthCheckService.getHealthSummary();
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

/**
 * GET /health/metrics
 * Prometheus-style metrics endpoint (for future monitoring integration)
 */
router.get('/metrics', async (req, res) => {
  try {
    let schedulerService = null;
    try {
      schedulerService = require('../services/schedulerService');
    } catch (e) {
      // Scheduler service not available
    }

    const health = await healthCheckService.getComprehensiveHealth(
      schedulerService,
      true
    );

    // Format as Prometheus metrics
    const metrics = [];

    // Service health (1 = healthy, 0 = unhealthy, -1 = not configured)
    Object.entries(health.services).forEach(([service, info]) => {
      const value = info.status === 'healthy' ? 1 :
                    info.status === 'not_configured' ? -1 : 0;
      metrics.push(`health_service_status{service="${service}"} ${value}`);

      if (info.responseTime) {
        metrics.push(`health_service_response_ms{service="${service}"} ${info.responseTime}`);
      }
    });

    // Request metrics
    if (health.metrics?.requests) {
      metrics.push(`health_requests_total ${health.metrics.requests.total}`);
      metrics.push(`health_requests_errors ${health.metrics.requests.errors}`);
      metrics.push(`health_requests_error_rate ${health.metrics.requests.errorRate}`);
      metrics.push(`health_requests_avg_response_ms ${health.metrics.requests.averageResponseTime}`);
    }

    // System metrics
    if (health.metrics?.system) {
      metrics.push(`health_uptime_seconds ${health.metrics.system.uptime}`);
      metrics.push(`health_memory_used_mb ${health.metrics.system.memory.used}`);
      metrics.push(`health_memory_heap_used_mb ${health.metrics.system.memory.heapUsed}`);
    }

    res.set('Content-Type', 'text/plain');
    res.send(metrics.join('\n') + '\n');
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;

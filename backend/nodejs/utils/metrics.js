/**
 * Application metrics collection utilities
 */
const { logger } = require('./logger');

class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        byMethod: {},
        byStatusCode: {},
      },
      performance: {
        responseTime: [],
        maxResponseTime: 0,
        avgResponseTime: 0,
      },
      firebase: {
        authRequests: 0,
        firestoreReads: 0,
        firestoreWrites: 0,
        errors: 0,
      },
      notifications: {
        sent: 0,
        failed: 0,
      },
      system: {
        startTime: Date.now(),
        uptime: 0,
      }
    };

    // Update system metrics every minute
    this.updateSystemMetrics();
    setInterval(() => this.updateSystemMetrics(), 60000);
  }

  /**
   * Record a HTTP request
   */
  recordRequest(req, res, responseTime) {
    this.metrics.requests.total++;
    
    // Record by method
    const method = req.method;
    this.metrics.requests.byMethod[method] = (this.metrics.requests.byMethod[method] || 0) + 1;
    
    // Record by status code
    const statusCode = res.statusCode;
    this.metrics.requests.byStatusCode[statusCode] = (this.metrics.requests.byStatusCode[statusCode] || 0) + 1;
    
    // Record success/error
    if (statusCode >= 200 && statusCode < 400) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.errors++;
    }
    
    // Record response time
    this.recordResponseTime(responseTime);
  }

  /**
   * Record response time
   */
  recordResponseTime(responseTime) {
    this.metrics.performance.responseTime.push(responseTime);
    
    // Keep only last 1000 response times
    if (this.metrics.performance.responseTime.length > 1000) {
      this.metrics.performance.responseTime = this.metrics.performance.responseTime.slice(-1000);
    }
    
    // Update max response time
    if (responseTime > this.metrics.performance.maxResponseTime) {
      this.metrics.performance.maxResponseTime = responseTime;
    }
    
    // Update average response time
    const times = this.metrics.performance.responseTime;
    this.metrics.performance.avgResponseTime = times.reduce((a, b) => a + b, 0) / times.length;
  }

  /**
   * Record Firebase operation
   */
  recordFirebaseOperation(operation, success = true) {
    switch (operation) {
      case 'auth':
        this.metrics.firebase.authRequests++;
        break;
      case 'firestore_read':
        this.metrics.firebase.firestoreReads++;
        break;
      case 'firestore_write':
        this.metrics.firebase.firestoreWrites++;
        break;
    }
    
    if (!success) {
      this.metrics.firebase.errors++;
    }
  }

  /**
   * Record notification
   */
  recordNotification(success = true) {
    if (success) {
      this.metrics.notifications.sent++;
    } else {
      this.metrics.notifications.failed++;
    }
  }

  /**
   * Update system metrics
   */
  updateSystemMetrics() {
    this.metrics.system.uptime = Date.now() - this.metrics.system.startTime;
    
    // Add memory usage
    const memUsage = process.memoryUsage();
    this.metrics.system.memory = {
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers,
    };
    
    // Add CPU usage (approximation using process.cpuUsage)
    if (!this.lastCpuUsage) {
      this.lastCpuUsage = process.cpuUsage();
      this.lastHrtime = process.hrtime();
    } else {
      const currentCpuUsage = process.cpuUsage(this.lastCpuUsage);
      const currentHrtime = process.hrtime(this.lastHrtime);
      
      const totalTime = currentHrtime[0] * 1000000 + currentHrtime[1] / 1000; // microseconds
      const cpuTime = currentCpuUsage.user + currentCpuUsage.system;
      
      this.metrics.system.cpu = {
        percent: Math.round((cpuTime / totalTime) * 100 * 100) / 100,
        user: currentCpuUsage.user,
        system: currentCpuUsage.system,
      };
      
      this.lastCpuUsage = process.cpuUsage();
      this.lastHrtime = process.hrtime();
    }
  }

  /**
   * Get all metrics
   */
  getMetrics() {
    this.updateSystemMetrics();
    
    return {
      timestamp: new Date().toISOString(),
      service: 'nodejs-backend',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      ...this.metrics,
      calculated: {
        errorRate: this.metrics.requests.total > 0 ? 
          Math.round((this.metrics.requests.errors / this.metrics.requests.total) * 100 * 100) / 100 : 0,
        successRate: this.metrics.requests.total > 0 ? 
          Math.round((this.metrics.requests.success / this.metrics.requests.total) * 100 * 100) / 100 : 0,
        notificationSuccessRate: (this.metrics.notifications.sent + this.metrics.notifications.failed) > 0 ?
          Math.round((this.metrics.notifications.sent / (this.metrics.notifications.sent + this.metrics.notifications.failed)) * 100 * 100) / 100 : 0,
        avgResponseTimeMs: Math.round(this.metrics.performance.avgResponseTime * 100) / 100,
        maxResponseTimeMs: this.metrics.performance.maxResponseTime,
        requestsPerMinute: this.calculateRequestsPerMinute(),
      }
    };
  }

  /**
   * Calculate requests per minute
   */
  calculateRequestsPerMinute() {
    const uptimeMinutes = this.metrics.system.uptime / (1000 * 60);
    return uptimeMinutes > 0 ? Math.round((this.metrics.requests.total / uptimeMinutes) * 100) / 100 : 0;
  }

  /**
   * Get Prometheus-formatted metrics
   */
  getPrometheusMetrics() {
    const metrics = this.getMetrics();
    
    const prometheusLines = [
      '# HELP nodejs_requests_total Total number of requests',
      '# TYPE nodejs_requests_total counter',
      `nodejs_requests_total ${metrics.requests.total}`,
      '',
      '# HELP nodejs_requests_success_total Total number of successful requests',
      '# TYPE nodejs_requests_success_total counter',
      `nodejs_requests_success_total ${metrics.requests.success}`,
      '',
      '# HELP nodejs_requests_errors_total Total number of failed requests',
      '# TYPE nodejs_requests_errors_total counter',
      `nodejs_requests_errors_total ${metrics.requests.errors}`,
      '',
      '# HELP nodejs_response_time_avg Average response time in milliseconds',
      '# TYPE nodejs_response_time_avg gauge',
      `nodejs_response_time_avg ${metrics.calculated.avgResponseTimeMs}`,
      '',
      '# HELP nodejs_response_time_max Maximum response time in milliseconds',
      '# TYPE nodejs_response_time_max gauge',
      `nodejs_response_time_max ${metrics.calculated.maxResponseTimeMs}`,
      '',
      '# HELP nodejs_memory_usage Memory usage in bytes',
      '# TYPE nodejs_memory_usage gauge',
      `nodejs_memory_usage{type="rss"} ${metrics.system.memory.rss}`,
      `nodejs_memory_usage{type="heap_total"} ${metrics.system.memory.heapTotal}`,
      `nodejs_memory_usage{type="heap_used"} ${metrics.system.memory.heapUsed}`,
      '',
      '# HELP nodejs_uptime_seconds Uptime in seconds',
      '# TYPE nodejs_uptime_seconds gauge',
      `nodejs_uptime_seconds ${Math.round(metrics.system.uptime / 1000)}`,
      '',
      '# HELP nodejs_firebase_operations_total Total Firebase operations',
      '# TYPE nodejs_firebase_operations_total counter',
      `nodejs_firebase_operations_total{operation="auth"} ${metrics.firebase.authRequests}`,
      `nodejs_firebase_operations_total{operation="firestore_read"} ${metrics.firebase.firestoreReads}`,
      `nodejs_firebase_operations_total{operation="firestore_write"} ${metrics.firebase.firestoreWrites}`,
      '',
      '# HELP nodejs_notifications_total Total notifications',
      '# TYPE nodejs_notifications_total counter',
      `nodejs_notifications_total{status="sent"} ${metrics.notifications.sent}`,
      `nodejs_notifications_total{status="failed"} ${metrics.notifications.failed}`,
    ];
    
    return prometheusLines.join('\n');
  }

  /**
   * Reset metrics
   */
  reset() {
    const startTime = this.metrics.system.startTime;
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        errors: 0,
        byMethod: {},
        byStatusCode: {},
      },
      performance: {
        responseTime: [],
        maxResponseTime: 0,
        avgResponseTime: 0,
      },
      firebase: {
        authRequests: 0,
        firestoreReads: 0,
        firestoreWrites: 0,
        errors: 0,
      },
      notifications: {
        sent: 0,
        failed: 0,
      },
      system: {
        startTime: startTime,
        uptime: 0,
      }
    };
    
    logger.info('Metrics reset');
  }
}

// Create singleton instance
const metricsCollector = new MetricsCollector();

/**
 * Express middleware for metrics collection
 */
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    metricsCollector.recordRequest(req, res, responseTime);
  });
  
  next();
};

module.exports = {
  metricsCollector,
  metricsMiddleware,
};
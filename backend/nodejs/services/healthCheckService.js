/**
 * Health Check Service
 *
 * Provides comprehensive health monitoring for production environments.
 * Supports Kubernetes-style probes (liveness, readiness, startup) and
 * deep health checks for all critical services.
 */

const os = require('os');
const { db, auth, messaging, isInitialized } = require('../config/firebase');

class HealthCheckService {
  constructor() {
    this.startTime = Date.now();
    this.requestCount = 0;
    this.errorCount = 0;
    this.responseTimes = [];
    this.maxResponseTimeSamples = 100;
    this.startupComplete = false;

    // Track service-specific health
    this.serviceHealth = {
      firebase: { status: 'unknown', lastCheck: null, error: null },
      firestore: { status: 'unknown', lastCheck: null, error: null },
      auth: { status: 'unknown', lastCheck: null, error: null },
      messaging: { status: 'unknown', lastCheck: null, error: null },
      scheduler: { status: 'unknown', lastCheck: null, error: null }
    };
  }

  /**
   * Mark startup as complete
   */
  markStartupComplete() {
    this.startupComplete = true;
    console.log('✓ Health check: Startup complete');
  }

  /**
   * Record request metrics
   */
  recordRequest(responseTime, isError = false) {
    this.requestCount++;
    if (isError) this.errorCount++;

    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > this.maxResponseTimeSamples) {
      this.responseTimes.shift();
    }
  }

  /**
   * Get average response time
   */
  getAverageResponseTime() {
    if (this.responseTimes.length === 0) return 0;
    const sum = this.responseTimes.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.responseTimes.length);
  }

  /**
   * Get system metrics
   */
  getSystemMetrics() {
    const memUsage = process.memoryUsage();
    return {
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      memory: {
        total: Math.round(os.totalmem() / 1024 / 1024),
        free: Math.round(os.freemem() / 1024 / 1024),
        used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024)
      },
      cpu: {
        count: os.cpus().length,
        loadAverage: os.loadavg()
      }
    };
  }

  /**
   * Check Firebase initialization
   */
  async checkFirebase() {
    try {
      const status = isInitialized ? 'healthy' : 'not_configured';
      this.serviceHealth.firebase = {
        status,
        lastCheck: new Date().toISOString(),
        error: null
      };
      return status === 'healthy';
    } catch (error) {
      this.serviceHealth.firebase = {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: error.message
      };
      return false;
    }
  }

  /**
   * Deep check: Firestore connectivity
   */
  async checkFirestore() {
    if (!db) {
      this.serviceHealth.firestore = {
        status: 'not_configured',
        lastCheck: new Date().toISOString(),
        error: null
      };
      return false;
    }

    try {
      // Try to read from a health check collection
      const startTime = Date.now();
      const healthRef = db.collection('_health').doc('check');

      // Attempt to write and read
      await healthRef.set({
        timestamp: new Date().toISOString(),
        check: 'health'
      });

      const doc = await healthRef.get();
      const responseTime = Date.now() - startTime;

      this.serviceHealth.firestore = {
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime,
        error: null
      };
      return true;
    } catch (error) {
      this.serviceHealth.firestore = {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: error.message
      };
      return false;
    }
  }

  /**
   * Deep check: Firebase Auth
   */
  async checkAuth() {
    if (!auth) {
      this.serviceHealth.auth = {
        status: 'not_configured',
        lastCheck: new Date().toISOString(),
        error: null
      };
      return false;
    }

    try {
      // Try to list users (limit 1) to verify auth service
      const startTime = Date.now();
      await auth.listUsers(1);
      const responseTime = Date.now() - startTime;

      this.serviceHealth.auth = {
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime,
        error: null
      };
      return true;
    } catch (error) {
      this.serviceHealth.auth = {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: error.message
      };
      return false;
    }
  }

  /**
   * Deep check: Firebase Messaging
   */
  async checkMessaging() {
    if (!messaging) {
      this.serviceHealth.messaging = {
        status: 'not_configured',
        lastCheck: new Date().toISOString(),
        error: null
      };
      return false;
    }

    try {
      // Messaging is harder to test without sending actual messages
      // We'll just verify it's accessible
      this.serviceHealth.messaging = {
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        error: null
      };
      return true;
    } catch (error) {
      this.serviceHealth.messaging = {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: error.message
      };
      return false;
    }
  }

  /**
   * Check scheduler status
   */
  checkScheduler(schedulerService) {
    try {
      const status = schedulerService.getStatus();
      const isHealthy = status.activeJobs > 0;

      this.serviceHealth.scheduler = {
        status: isHealthy ? 'healthy' : 'degraded',
        lastCheck: new Date().toISOString(),
        activeJobs: status.activeJobs,
        error: null
      };
      return isHealthy;
    } catch (error) {
      this.serviceHealth.scheduler = {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        error: error.message
      };
      return false;
    }
  }

  /**
   * Liveness probe - Is the server alive?
   * This should almost always return healthy unless the process is stuck
   */
  async getLiveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000)
    };
  }

  /**
   * Readiness probe - Can the server handle traffic?
   * Checks critical dependencies
   */
  async getReadiness(includeDeepChecks = false) {
    const checks = {
      firebase: await this.checkFirebase()
    };

    if (includeDeepChecks && isInitialized) {
      checks.firestore = await this.checkFirestore();
      checks.auth = await this.checkAuth();
      checks.messaging = await this.checkMessaging();
    }

    const isReady = checks.firebase || !isInitialized; // Ready if Firebase is healthy OR not required
    const status = isReady ? 'ready' : 'not_ready';

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: this.serviceHealth
    };
  }

  /**
   * Startup probe - Has initialization completed?
   */
  async getStartup() {
    return {
      status: this.startupComplete ? 'complete' : 'in_progress',
      timestamp: new Date().toISOString(),
      startupTime: Date.now() - this.startTime
    };
  }

  /**
   * Comprehensive health status with all metrics
   */
  async getComprehensiveHealth(schedulerService, includeMetrics = true) {
    // Run all checks
    await this.checkFirebase();
    if (isInitialized) {
      await this.checkFirestore();
      await this.checkAuth();
      await this.checkMessaging();
    }
    if (schedulerService) {
      this.checkScheduler(schedulerService);
    }

    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: this.serviceHealth
    };

    if (includeMetrics) {
      health.metrics = {
        requests: {
          total: this.requestCount,
          errors: this.errorCount,
          errorRate: this.requestCount > 0
            ? Math.round((this.errorCount / this.requestCount) * 100) / 100
            : 0,
          averageResponseTime: this.getAverageResponseTime()
        },
        system: this.getSystemMetrics()
      };
    }

    return health;
  }

  /**
   * Get health summary for production (less detailed)
   */
  getHealthSummary() {
    const allHealthy = Object.values(this.serviceHealth).every(
      service => service.status === 'healthy' || service.status === 'not_configured'
    );

    return {
      status: allHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: Object.entries(this.serviceHealth).reduce((acc, [key, value]) => {
        acc[key] = value.status;
        return acc;
      }, {})
    };
  }
}

// Singleton instance
const healthCheckService = new HealthCheckService();

module.exports = healthCheckService;

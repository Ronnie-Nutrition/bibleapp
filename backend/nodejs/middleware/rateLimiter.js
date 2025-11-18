/**
 * Rate Limiting Middleware
 *
 * Simple in-memory rate limiter for health check endpoints.
 * Prevents abuse while allowing legitimate health check traffic.
 */

class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minute default
    this.maxRequests = options.maxRequests || 60; // 60 requests per window
    this.message = options.message || 'Too many requests, please try again later';
    this.skipSuccessfulRequests = options.skipSuccessfulRequests || false;
    this.skipFailedRequests = options.skipFailedRequests || false;

    // Store request counts by IP
    this.requests = new Map();

    // Cleanup old entries periodically
    setInterval(() => this.cleanup(), this.windowMs);
  }

  /**
   * Cleanup expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [ip, data] of this.requests.entries()) {
      if (now - data.resetTime > this.windowMs) {
        this.requests.delete(ip);
      }
    }
  }

  /**
   * Get client IP address
   */
  getClientIp(req) {
    return req.ip ||
           req.headers['x-forwarded-for']?.split(',')[0].trim() ||
           req.headers['x-real-ip'] ||
           req.connection.remoteAddress ||
           'unknown';
  }

  /**
   * Express middleware function
   */
  middleware() {
    return (req, res, next) => {
      const ip = this.getClientIp(req);
      const now = Date.now();

      // Get or initialize request data for this IP
      if (!this.requests.has(ip)) {
        this.requests.set(ip, {
          count: 0,
          resetTime: now
        });
      }

      const requestData = this.requests.get(ip);

      // Reset if window has passed
      if (now - requestData.resetTime > this.windowMs) {
        requestData.count = 0;
        requestData.resetTime = now;
      }

      // Increment counter
      requestData.count++;

      // Set rate limit headers
      const remaining = Math.max(0, this.maxRequests - requestData.count);
      const resetTime = new Date(requestData.resetTime + this.windowMs);

      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', resetTime.toISOString());

      // Check if limit exceeded
      if (requestData.count > this.maxRequests) {
        res.setHeader('Retry-After', Math.ceil((requestData.resetTime + this.windowMs - now) / 1000));
        return res.status(429).json({
          error: this.message,
          retryAfter: resetTime.toISOString()
        });
      }

      next();
    };
  }
}

/**
 * Create rate limiter for health check endpoints
 * More permissive than API endpoints since these are called frequently by monitoring
 */
const healthCheckLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 120, // 2 requests per second average
  message: 'Too many health check requests'
});

/**
 * Create stricter rate limiter for detailed health checks
 */
const detailedHealthLimiter = new RateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 30, // More resource intensive
  message: 'Too many detailed health check requests'
});

module.exports = {
  RateLimiter,
  healthCheckLimiter: healthCheckLimiter.middleware(),
  detailedHealthLimiter: detailedHealthLimiter.middleware()
};

/**
 * Rate Limiting Middleware
 * Prevents API abuse with configurable rate limits
 * Supports both IP-based and user-based limiting
 */

/**
 * In-memory store for rate limiting (development)
 * For production, use Redis or another distributed store
 */
class RateLimitStore {
  constructor() {
    this.requests = {}; // { key: { count, resetTime } }
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Cleanup every minute
  }

  /**
   * Check if request is within rate limit
   */
  isWithinLimit(key, limit, windowMs) {
    const now = Date.now();
    const entry = this.requests[key];

    if (!entry || now > entry.resetTime) {
      // New window or expired entry
      this.requests[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return true;
    }

    if (entry.count < limit) {
      entry.count++;
      return true;
    }

    return false;
  }

  /**
   * Get current count and reset time
   */
  getStatus(key) {
    const entry = this.requests[key];
    if (!entry) return { count: 0, resetTime: null, remaining: null };

    const now = Date.now();
    if (now > entry.resetTime) {
      // Expired entry
      return { count: 0, resetTime: null, remaining: null };
    }

    return {
      count: entry.count,
      resetTime: entry.resetTime,
      remaining: Math.max(0, Math.floor((entry.resetTime - now) / 1000))
    };
  }

  /**
   * Reset limit for a key
   */
  reset(key) {
    delete this.requests[key];
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    Object.keys(this.requests).forEach(key => {
      if (now > this.requests[key].resetTime) {
        delete this.requests[key];
      }
    });
  }

  /**
   * Destroy interval on shutdown
   */
  destroy() {
    clearInterval(this.cleanupInterval);
  }
}

// Global store instance
const globalStore = new RateLimitStore();

/**
 * Rate limit configuration by endpoint type
 */
const defaultLimits = {
  // Authentication endpoints - stricter limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later'
  },

  // General API endpoints - moderate limits
  general: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Too many requests, please slow down'
  },

  // Search/read-heavy endpoints - higher limits
  read: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: 'Too many requests, please slow down'
  },

  // Heavy operations - very strict limits
  heavy: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    message: 'Too many requests for this operation, please try again later'
  }
};

/**
 * Generate rate limit key
 * Uses user ID if authenticated, IP address otherwise
 */
function generateLimitKey(req, keyPrefix = '') {
  // Prefer authenticated user ID
  if (req.user && req.user.uid) {
    return `${keyPrefix}:user:${req.user.uid}`;
  }

  // Fall back to IP address
  const ip = req.ip ||
             req.connection.remoteAddress ||
             req.socket.remoteAddress ||
             req.connection.socket?.remoteAddress ||
             'unknown';

  return `${keyPrefix}:ip:${ip}`;
}

/**
 * Main rate limiting middleware factory
 *
 * Usage:
 *   app.post('/register', rateLimit('auth'), handler);
 *   app.get('/lessons', rateLimit('read'), handler);
 */
function rateLimit(limitType = 'general', options = {}) {
  const config = { ...defaultLimits[limitType], ...options };
  const { windowMs, maxRequests, message } = config;
  const store = options.store || globalStore;
  const keyPrefix = options.keyPrefix || limitType;

  return (req, res, next) => {
    const key = generateLimitKey(req, keyPrefix);
    const isWithinLimit = store.isWithinLimit(key, maxRequests, windowMs);

    // Get current status for headers
    const status = store.getStatus(key);
    const remaining = Math.max(0, maxRequests - status.count + 1);
    const resetSeconds = status.remaining || 0;

    // Set rate limit headers (same as GitHub API)
    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': status.resetTime ? Math.ceil(status.resetTime / 1000).toString() : '0'
    });

    if (!isWithinLimit) {
      // Rate limit exceeded
      return res.status(429).json({
        error: message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: resetSeconds,
        limits: {
          limit: maxRequests,
          remaining: 0,
          reset: status.resetTime
        }
      });
    }

    next();
  };
}

/**
 * Create a custom rate limit configuration
 *
 * Example:
 *   const searchLimit = createRateLimit({
 *     windowMs: 5 * 60 * 1000,  // 5 minutes
 *     maxRequests: 20,
 *     message: 'Too many search requests'
 *   });
 *   app.get('/search', searchLimit, handler);
 */
function createRateLimit(options) {
  return (req, res, next) => {
    const store = options.store || globalStore;
    const keyPrefix = options.keyPrefix || 'custom';
    const { windowMs, maxRequests, message } = options;

    const key = generateLimitKey(req, keyPrefix);
    const isWithinLimit = store.isWithinLimit(key, maxRequests, windowMs);

    const status = store.getStatus(key);
    const remaining = Math.max(0, maxRequests - status.count + 1);

    res.set({
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': status.resetTime ? Math.ceil(status.resetTime / 1000).toString() : '0'
    });

    if (!isWithinLimit) {
      return res.status(429).json({
        error: message,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: status.remaining || 0,
        limits: {
          limit: maxRequests,
          remaining: 0,
          reset: status.resetTime
        }
      });
    }

    next();
  };
}

/**
 * Middleware to reset rate limit for admin users
 * Allows admins to bypass rate limiting
 */
function skipRateLimitForAdmin(req, res, next) {
  if (req.user && req.user.isAdmin) {
    // Skip rate limiting for admins
    res.locals.skipRateLimit = true;
  }
  next();
}

/**
 * Reset rate limit for a specific key (admin only)
 * Useful for testing or when rate limits are too strict
 */
function resetRateLimit(key) {
  globalStore.reset(key);
}

/**
 * Get rate limit status for all tracked keys
 * Useful for monitoring and debugging
 */
function getRateLimitStatus(pattern = null) {
  const results = {};

  Object.keys(globalStore.requests).forEach(key => {
    if (pattern && !key.includes(pattern)) return;
    results[key] = globalStore.getStatus(key);
  });

  return results;
}

/**
 * Predefined rate limit middleware for common endpoints
 */
const rateLimits = {
  // Authentication endpoints
  register: rateLimit('auth'),
  login: rateLimit('auth'),
  passwordReset: rateLimit('auth'),

  // API endpoints
  lessons: rateLimit('general'),
  progress: rateLimit('general'),
  favorites: rateLimit('general'),
  preferences: rateLimit('general'),

  // Read-heavy endpoints
  search: rateLimit('read'),
  getAll: rateLimit('read'),

  // Heavy operations
  bulkUpload: rateLimit('heavy'),
  export: rateLimit('heavy')
};

module.exports = {
  rateLimit,
  createRateLimit,
  skipRateLimitForAdmin,
  resetRateLimit,
  getRateLimitStatus,
  rateLimits,
  RateLimitStore,
  globalStore,
  defaultLimits
};

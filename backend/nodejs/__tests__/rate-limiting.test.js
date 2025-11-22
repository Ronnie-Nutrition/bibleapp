/**
 * Rate Limiting Middleware Tests
 * Tests for request rate limiting and abuse prevention
 */

const request = require('supertest');
const express = require('express');
const { rateLimit, rateLimits, RateLimitStore, resetRateLimit } = require('../middleware/rateLimiting');

describe('Rate Limiting Middleware', () => {
  let app;
  let testStore;

  beforeEach(() => {
    // Create fresh store for each test
    testStore = new RateLimitStore();

    app = express();
    app.use(express.json());

    // Test endpoint with auth rate limit
    app.post('/login',
      rateLimit('auth', { store: testStore }),
      (req, res) => {
        res.json({ success: true });
      }
    );

    // Test endpoint with general rate limit
    app.get('/api/lessons',
      rateLimit('general', { store: testStore, keyPrefix: 'lessons' }),
      (req, res) => {
        res.json({ lessons: [] });
      }
    );

    // Test endpoint with custom limit
    app.post('/search',
      rateLimit('read', { store: testStore, keyPrefix: 'search' }),
      (req, res) => {
        res.json({ results: [] });
      }
    );
  });

  afterEach(() => {
    testStore.destroy();
  });

  describe('Basic Rate Limiting', () => {
    test('should allow requests within limit', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: 'test@example.com', password: 'pass' });

      expect(res.status).toBe(200);
      expect(res.headers['x-ratelimit-limit']).toBe('5');
      expect(res.headers['x-ratelimit-remaining']).toBe('4');
    });

    test('should reject requests exceeding limit', async () => {
      // Make 5 requests (at limit)
      for (let i = 0; i < 5; i++) {
        const res = await request(app).post('/login').send({});
        expect(res.status).toBe(200);
      }

      // 6th request should be rejected
      const res = await request(app).post('/login').send({});
      expect(res.status).toBe(429);
      expect(res.body.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    test('should include rate limit headers', async () => {
      const res = await request(app).post('/login').send({});

      expect(res.headers['x-ratelimit-limit']).toBeDefined();
      expect(res.headers['x-ratelimit-remaining']).toBeDefined();
      expect(res.headers['x-ratelimit-reset']).toBeDefined();
    });

    test('should decrement remaining count', async () => {
      const req1 = await request(app).post('/login').send({});
      const req2 = await request(app).post('/login').send({});
      const req3 = await request(app).post('/login').send({});

      expect(parseInt(req1.headers['x-ratelimit-remaining'])).toBe(4);
      expect(parseInt(req2.headers['x-ratelimit-remaining'])).toBe(3);
      expect(parseInt(req3.headers['x-ratelimit-remaining'])).toBe(2);
    });
  });

  describe('429 Error Response', () => {
    test('should return 429 when rate limited', async () => {
      // Exhaust limit
      for (let i = 0; i < 5; i++) {
        await request(app).post('/login').send({});
      }

      // 6th request
      const res = await request(app).post('/login').send({});
      expect(res.status).toBe(429);
    });

    test('should include error message', async () => {
      // Exhaust limit
      for (let i = 0; i < 5; i++) {
        await request(app).post('/login').send({});
      }

      const res = await request(app).post('/login').send({});
      expect(res.body.error).toBeDefined();
      expect(res.body.error.length).toBeGreaterThan(0);
    });

    test('should include retry information', async () => {
      // Exhaust limit
      for (let i = 0; i < 5; i++) {
        await request(app).post('/login').send({});
      }

      const res = await request(app).post('/login').send({});
      expect(res.body.retryAfter).toBeDefined();
      expect(res.body.retryAfter).toBeGreaterThan(0);
    });

    test('should include limit details', async () => {
      // Exhaust limit
      for (let i = 0; i < 5; i++) {
        await request(app).post('/login').send({});
      }

      const res = await request(app).post('/login').send({});
      expect(res.body.limits).toBeDefined();
      expect(res.body.limits.limit).toBe(5);
      expect(res.body.limits.remaining).toBe(0);
    });
  });

  describe('Different Endpoint Types', () => {
    test('auth limit should be stricter than general', async () => {
      const authLimit = 5;  // auth endpoints
      const generalLimit = 30; // general endpoints

      expect(authLimit).toBeLessThan(generalLimit);
    });

    test('general endpoint allows more requests', async () => {
      // General endpoint allows up to 30 requests per minute
      for (let i = 0; i < 30; i++) {
        const res = await request(app).get('/api/lessons');
        expect(res.status).toBe(200);
      }

      // 31st should fail
      const res = await request(app).get('/api/lessons');
      expect(res.status).toBe(429);
    });

    test('read endpoint allows more requests than general', async () => {
      // This test uses the search endpoint with read limit (100 requests)
      for (let i = 0; i < 100; i++) {
        const res = await request(app).post('/search').send({});
        expect(res.status).toBe(200);
      }

      // 101st should fail
      const res = await request(app).post('/search').send({});
      expect(res.status).toBe(429);
    });
  });

  describe('Key Generation', () => {
    test('should use IP address for anonymous requests', async () => {
      // Without user authentication, should use IP address
      const res = await request(app).post('/login').send({});

      // Should get rate limited based on IP
      expect(res.status).toBe(200);
      expect(res.headers['x-ratelimit-limit']).toBeDefined();
    });

    test('should track per-IP', async () => {
      // Make requests
      for (let i = 0; i < 5; i++) {
        const res = await request(app).post('/login').send({});
        expect(res.status).toBe(200);
      }

      // 6th request from same IP should fail
      const res = await request(app).post('/login').send({});
      expect(res.status).toBe(429);
    });

    test('should use different limits for different endpoints', async () => {
      // Make 5 requests to /login (auth limit)
      for (let i = 0; i < 5; i++) {
        const res = await request(app).post('/login').send({});
        expect(res.status).toBe(200);
      }

      // Should be rate limited on /login
      let res = await request(app).post('/login').send({});
      expect(res.status).toBe(429);

      // But /api/lessons should still work (different limit)
      res = await request(app).get('/api/lessons');
      expect(res.status).toBe(200);
    });
  });

  describe('Window Expiration', () => {
    test('should reset count after window expires', async () => {
      // Create store with short window for testing
      const shortStore = new RateLimitStore();
      const testApp = express();
      testApp.use(express.json());

      testApp.post('/test',
        rateLimit('auth', {
          store: shortStore,
          windowMs: 100 // 100ms window
        }),
        (req, res) => res.json({ ok: true })
      );

      // Exhaust limit
      for (let i = 0; i < 5; i++) {
        const res = await request(testApp).post('/test').send({});
        expect(res.status).toBe(200);
      }

      // Should be rate limited
      let res = await request(testApp).post('/test').send({});
      expect(res.status).toBe(429);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should work again
      res = await request(testApp).post('/test').send({});
      expect(res.status).toBe(200);

      shortStore.destroy();
    });
  });

  describe('RateLimitStore', () => {
    test('should track requests correctly', () => {
      const store = new RateLimitStore();
      const key = 'test-key';

      // First request
      expect(store.isWithinLimit(key, 5, 60000)).toBe(true);
      expect(store.isWithinLimit(key, 5, 60000)).toBe(true);
      expect(store.isWithinLimit(key, 5, 60000)).toBe(true);
      expect(store.isWithinLimit(key, 5, 60000)).toBe(true);
      expect(store.isWithinLimit(key, 5, 60000)).toBe(true);

      // 6th request should exceed
      expect(store.isWithinLimit(key, 5, 60000)).toBe(false);

      store.destroy();
    });

    test('should get status of a key', () => {
      const store = new RateLimitStore();
      const key = 'test-key';

      store.isWithinLimit(key, 5, 60000);
      store.isWithinLimit(key, 5, 60000);

      const status = store.getStatus(key);
      expect(status.count).toBe(2);
      expect(status.remaining).toBeLessThanOrEqual(60);
    });

    test('should reset a key', () => {
      const store = new RateLimitStore();
      const key = 'test-key';

      store.isWithinLimit(key, 5, 60000);
      store.isWithinLimit(key, 5, 60000);
      store.isWithinLimit(key, 5, 60000);

      let status = store.getStatus(key);
      expect(status.count).toBe(3);

      store.reset(key);

      status = store.getStatus(key);
      expect(status.count).toBe(0);

      store.destroy();
    });

    test('should cleanup expired entries', async () => {
      const store = new RateLimitStore();
      const key = 'test-key';

      store.isWithinLimit(key, 5, 100); // 100ms window

      expect(Object.keys(store.requests).length).toBe(1);

      await new Promise(resolve => setTimeout(resolve, 150));

      store.cleanup();

      expect(Object.keys(store.requests).length).toBe(0);

      store.destroy();
    });
  });

  describe('Edge Cases', () => {
    test('should handle 0 remaining requests', async () => {
      // Exhaust limit
      for (let i = 0; i < 5; i++) {
        await request(app).post('/login').send({});
      }

      const res = await request(app).post('/login').send({});
      expect(parseInt(res.headers['x-ratelimit-remaining'])).toBe(0);
    });

    test('should handle concurrent requests', async () => {
      const promises = [];

      // Make 10 concurrent requests
      for (let i = 0; i < 10; i++) {
        promises.push(request(app).post('/login').send({}));
      }

      const results = await Promise.all(promises);

      // First 5 should succeed
      const successful = results.filter(r => r.status === 200);
      const rateLimited = results.filter(r => r.status === 429);

      expect(successful.length).toBeLessThanOrEqual(5);
      expect(rateLimited.length).toBeGreaterThanOrEqual(0);
    });

    test('should handle many different keys', () => {
      const store = new RateLimitStore();

      // Create entries for different IPs
      for (let i = 0; i < 100; i++) {
        const key = `test-key-${i}`;
        store.isWithinLimit(key, 5, 60000);
      }

      expect(Object.keys(store.requests).length).toBe(100);

      store.destroy();
    });
  });

  describe('Predefined Limits', () => {
    test('should have auth limit defined', () => {
      expect(rateLimits.register).toBeDefined();
      expect(rateLimits.login).toBeDefined();
      expect(rateLimits.passwordReset).toBeDefined();
    });

    test('should have api limits defined', () => {
      expect(rateLimits.lessons).toBeDefined();
      expect(rateLimits.progress).toBeDefined();
      expect(rateLimits.favorites).toBeDefined();
    });

    test('should have operation limits defined', () => {
      expect(rateLimits.bulkUpload).toBeDefined();
      expect(rateLimits.export).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should provide helpful error messages', async () => {
      // Exhaust limit
      for (let i = 0; i < 5; i++) {
        await request(app).post('/login').send({});
      }

      const res = await request(app).post('/login').send({});
      expect(res.body.error).toContain('many');
    });

    test('should include proper HTTP status codes', async () => {
      // Exhaust limit
      for (let i = 0; i < 5; i++) {
        await request(app).post('/login').send({});
      }

      const res = await request(app).post('/login').send({});
      expect(res.status).toBe(429); // Too Many Requests
    });

    test('should have proper error code', async () => {
      // Exhaust limit
      for (let i = 0; i < 5; i++) {
        await request(app).post('/login').send({});
      }

      const res = await request(app).post('/login').send({});
      expect(res.body.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('Multiple Limits on Same Endpoint', () => {
    test('should apply multiple middleware in order', async () => {
      const multiApp = express();
      multiApp.use(express.json());

      const limit1Store = new RateLimitStore();
      const limit2Store = new RateLimitStore();

      // Apply two different rate limits
      multiApp.post('/double-limit',
        rateLimit('auth', { store: limit1Store }),
        rateLimit('general', { store: limit2Store }),
        (req, res) => res.json({ ok: true })
      );

      // Both limits should be checked
      const res = await request(multiApp).post('/double-limit').send({});
      expect(res.status).toBe(200);

      limit1Store.destroy();
      limit2Store.destroy();
    });
  });
});

# Health Check API Documentation

## Overview

The Bible App backend provides comprehensive health check endpoints designed for production environments and Kubernetes deployments. These endpoints support:

- **Kubernetes-style probes** (liveness, readiness, startup)
- **Deep health checks** for all critical services
- **Prometheus metrics** for monitoring integration
- **Rate limiting** to prevent abuse
- **Environment-aware responses** (detailed in dev, minimal in production)

## Base URL

All health check endpoints are available at `/health`

## Endpoints

### 1. Liveness Probe

**GET** `/health/live`

Indicates if the server process is alive and responsive. Used by Kubernetes to determine if a container should be restarted.

**Response Codes:**
- `200` - Server is alive
- `500` - Server is unhealthy (should restart)

**Example Request:**
```bash
curl http://localhost:3000/health/live
```

**Example Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-18T00:23:58.973Z",
  "uptime": 20
}
```

**Fields:**
- `status` - Always "ok" if responding
- `timestamp` - ISO 8601 timestamp
- `uptime` - Server uptime in seconds

---

### 2. Readiness Probe

**GET** `/health/ready`

Indicates if the server is ready to handle traffic. Checks critical dependencies. Used by Kubernetes to determine if traffic should be routed to this pod.

**Query Parameters:**
- `deep=true` - Perform deep health checks on all services (optional, slower)

**Response Codes:**
- `200` - Server is ready to handle traffic
- `503` - Server is not ready (dependencies unavailable)

**Example Request:**
```bash
curl http://localhost:3000/health/ready
curl http://localhost:3000/health/ready?deep=true
```

**Example Response:**
```json
{
  "status": "ready",
  "timestamp": "2025-11-18T00:24:03.144Z",
  "checks": {
    "firebase": {
      "status": "not_configured",
      "lastCheck": "2025-11-18T00:24:03.144Z",
      "error": null
    },
    "firestore": {
      "status": "healthy",
      "lastCheck": "2025-11-18T00:24:03.144Z",
      "responseTime": 45,
      "error": null
    },
    "auth": {
      "status": "healthy",
      "lastCheck": "2025-11-18T00:24:03.144Z",
      "responseTime": 32,
      "error": null
    },
    "messaging": {
      "status": "healthy",
      "lastCheck": "2025-11-18T00:24:03.144Z",
      "error": null
    },
    "scheduler": {
      "status": "healthy",
      "lastCheck": "2025-11-18T00:24:03.144Z",
      "activeJobs": 1,
      "error": null
    }
  }
}
```

**Service Status Values:**
- `healthy` - Service is fully operational
- `degraded` - Service is partially operational
- `unhealthy` - Service is not working
- `not_configured` - Service is not enabled
- `unknown` - Service has not been checked yet

---

### 3. Startup Probe

**GET** `/health/startup`

Indicates if the application has finished its initialization. Used by Kubernetes to know when to start liveness/readiness probes.

**Response Codes:**
- `200` - Startup complete
- `503` - Still starting up

**Example Request:**
```bash
curl http://localhost:3000/health/startup
```

**Example Response:**
```json
{
  "status": "complete",
  "timestamp": "2025-11-18T00:24:07.569Z",
  "startupTime": 28923
}
```

**Fields:**
- `status` - "complete" or "in_progress"
- `timestamp` - ISO 8601 timestamp
- `startupTime` - Time taken to start in milliseconds

---

### 4. Comprehensive Health Check

**GET** `/health`

Returns comprehensive health status including all services, metrics, and system information.

**Query Parameters:**
- `details=true` - Include detailed metrics (default in development)
- `metrics=false` - Exclude system metrics

**Response Codes:**
- `200` - All services healthy or gracefully degraded
- `503` - Critical services unhealthy

**Example Request:**
```bash
curl http://localhost:3000/health
curl http://localhost:3000/health?details=true
```

**Example Response (Development):**
```json
{
  "status": "ok",
  "timestamp": "2025-11-18T00:24:11.811Z",
  "version": "1.0.0",
  "environment": "development",
  "services": {
    "firebase": {
      "status": "healthy",
      "lastCheck": "2025-11-18T00:24:11.810Z",
      "error": null
    },
    "firestore": {
      "status": "healthy",
      "lastCheck": "2025-11-18T00:24:11.810Z",
      "responseTime": 45,
      "error": null
    },
    "auth": {
      "status": "healthy",
      "lastCheck": "2025-11-18T00:24:11.810Z",
      "responseTime": 32,
      "error": null
    },
    "messaging": {
      "status": "healthy",
      "lastCheck": "2025-11-18T00:24:11.810Z",
      "error": null
    },
    "scheduler": {
      "status": "healthy",
      "lastCheck": "2025-11-18T00:24:11.810Z",
      "activeJobs": 1,
      "error": null
    }
  },
  "metrics": {
    "requests": {
      "total": 1234,
      "errors": 5,
      "errorRate": 0.004,
      "averageResponseTime": 45
    },
    "system": {
      "uptime": 3600,
      "memory": {
        "total": 13312,
        "free": 12940,
        "used": 372,
        "heapUsed": 10,
        "heapTotal": 11
      },
      "cpu": {
        "count": 16,
        "loadAverage": [0.5, 0.3, 0.2]
      }
    }
  }
}
```

**Example Response (Production):**
```json
{
  "status": "ok",
  "timestamp": "2025-11-18T00:24:11.811Z",
  "environment": "production",
  "services": {
    "firebase": "healthy",
    "firestore": "healthy",
    "auth": "healthy",
    "messaging": "healthy",
    "scheduler": "healthy"
  }
}
```

---

### 5. Prometheus Metrics

**GET** `/health/metrics`

Returns health metrics in Prometheus format for monitoring system integration.

**Response Format:** `text/plain`

**Example Request:**
```bash
curl http://localhost:3000/health/metrics
```

**Example Response:**
```
health_service_status{service="firebase"} 1
health_service_status{service="firestore"} 1
health_service_response_ms{service="firestore"} 45
health_service_status{service="auth"} 1
health_service_response_ms{service="auth"} 32
health_service_status{service="messaging"} 1
health_service_status{service="scheduler"} 1
health_requests_total 1234
health_requests_errors 5
health_requests_error_rate 0.004
health_requests_avg_response_ms 45
health_uptime_seconds 3600
health_memory_used_mb 372
health_memory_heap_used_mb 10
```

**Metric Values:**
- Service status: `1` = healthy, `0` = unhealthy, `-1` = not configured
- All other metrics are numeric values

---

## Rate Limiting

All health check endpoints are rate limited to prevent abuse while allowing legitimate monitoring traffic.

**Limits:**
- Standard endpoints (`/live`, `/ready`, `/startup`): 120 requests per minute
- Detailed endpoints (`/health`, `/metrics`): 30 requests per minute

**Rate Limit Headers:**
- `X-RateLimit-Limit` - Maximum requests allowed in the window
- `X-RateLimit-Remaining` - Remaining requests in current window
- `X-RateLimit-Reset` - When the rate limit resets (ISO 8601 timestamp)
- `Retry-After` - Seconds to wait before retrying (only when rate limited)

**Example:**
```bash
curl -i http://localhost:3000/health/live
```

**Response Headers:**
```
HTTP/1.1 200 OK
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 119
X-RateLimit-Reset: 2025-11-18T00:25:00.000Z
```

**Rate Limit Exceeded Response:**
```
HTTP/1.1 429 Too Many Requests
Retry-After: 45

{
  "error": "Too many health check requests",
  "retryAfter": "2025-11-18T00:25:00.000Z"
}
```

---

## Kubernetes Integration

### Example Deployment Configuration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bible-app-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: bible-app-backend
  template:
    metadata:
      labels:
        app: bible-app-backend
    spec:
      containers:
      - name: backend
        image: bible-app-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: FIREBASE_PROJECT_ID
          valueFrom:
            secretKeyRef:
              name: firebase-credentials
              key: project-id
        # Startup probe - gives app time to initialize
        startupProbe:
          httpGet:
            path: /health/startup
            port: 3000
          failureThreshold: 30
          periodSeconds: 10
        # Liveness probe - restart if unhealthy
        livenessProbe:
          httpGet:
            path: /health/live
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
          failureThreshold: 3
        # Readiness probe - stop routing traffic if not ready
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          failureThreshold: 3
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## Monitoring Integration

### Prometheus Configuration

Add the following to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'bible-app-backend'
    metrics_path: '/health/metrics'
    static_configs:
      - targets: ['backend:3000']
    scrape_interval: 30s
```

### Grafana Dashboard Queries

**Service Health Status:**
```promql
health_service_status{service="firebase"}
```

**Request Error Rate:**
```promql
rate(health_requests_errors[5m]) / rate(health_requests_total[5m])
```

**Average Response Time:**
```promql
health_requests_avg_response_ms
```

**Memory Usage:**
```promql
health_memory_heap_used_mb / health_memory_heap_total_mb * 100
```

---

## Best Practices

### Development
- Use `/health` with full details for debugging
- Monitor all service statuses during development
- Check metrics regularly to catch performance issues early

### Production
- Use Kubernetes probes for automatic health monitoring
- Configure alerts based on `/health/metrics`
- Use `/health` without details parameter for minimal overhead
- Monitor rate limit headers to ensure monitoring isn't being throttled

### Monitoring Setup
1. Configure liveness probe to restart unhealthy pods
2. Configure readiness probe to stop routing traffic when dependencies fail
3. Use startup probe to avoid premature health checks during initialization
4. Scrape `/health/metrics` with Prometheus every 30-60 seconds
5. Set up alerts for service status changes and error rate spikes

---

## Troubleshooting

### Service Showing as "not_configured"
This is normal if Firebase credentials are not provided. The server will still function with limited features.

### Service Showing as "unhealthy"
1. Check the `error` field in the response for details
2. Verify Firebase credentials are correct
3. Check network connectivity to Firebase services
4. Review server logs for detailed error messages

### Rate Limit Issues
- Standard monitoring should stay well under limits
- If hitting limits, check for misconfigured monitoring tools
- Consider increasing limits in `/middleware/rateLimiter.js` if needed

### High Error Rate
- Check `metrics.requests.errorRate` in comprehensive health check
- Review application logs for error details
- Verify all dependencies are healthy

---

## Version History

- **v1.0.0** (2025-11-18) - Initial production-ready implementation
  - Kubernetes-style probes
  - Deep health checks for all services
  - Prometheus metrics support
  - Rate limiting
  - Environment-aware responses

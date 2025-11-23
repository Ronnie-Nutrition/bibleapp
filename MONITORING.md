# Bible App Production Monitoring Guide

This document describes the comprehensive monitoring and observability setup for the Bible App production environment.

## 🏗️ Monitoring Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │    │   Prometheus    │    │     Grafana     │
│   Services      │────┤   (Metrics)     │────┤  (Dashboards)   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │      Loki       │    │  Alertmanager   │
         │              │   (Logs)        │    │   (Alerts)      │
         └──────────────└─────────────────┘    └─────────────────┘
```

## 📊 Components

### 1. Metrics Collection (Prometheus)
- **Purpose**: Collect and store time-series metrics
- **Port**: 9090
- **Scrape Interval**: 15-60 seconds depending on service
- **Retention**: 200 hours

### 2. Visualization (Grafana)
- **Purpose**: Create dashboards and visualizations
- **Port**: 3000
- **Default Credentials**: admin/admin (change in production)
- **Dashboards**: Pre-configured Bible App dashboard

### 3. Log Aggregation (Loki)
- **Purpose**: Collect and store structured logs
- **Port**: 3100
- **Integration**: Works with Grafana for log visualization

### 4. Alerting (Alertmanager)
- **Purpose**: Handle alerts and notifications
- **Port**: 9093
- **Integrations**: Email, webhooks

## 🚀 Getting Started

### 1. Start Monitoring Stack

```bash
# Start with monitoring services
docker-compose -f docker-compose.prod.yml up -d prometheus grafana alertmanager loki

# Verify services are running
docker-compose ps
```

### 2. Access Dashboards

- **Grafana**: http://localhost:3000 (admin/admin)
- **Prometheus**: http://localhost:9090
- **Alertmanager**: http://localhost:9093

### 3. Configure Grafana

1. Login to Grafana
2. Navigate to Dashboards → Browse
3. Open "Bible App Production Dashboard"
4. Verify data is flowing from Prometheus

## 📈 Available Metrics

### System Metrics

#### Django Backend
- `django_requests_total` - Total HTTP requests
- `django_request_duration_seconds` - Request response time
- `django_active_users` - Number of active users
- `django_total_lessons` - Total lessons in database
- `django_completed_lessons` - Number of completed lessons
- `django_database_queries_total` - Database query count
- `django_cache_hits_total` - Cache hits
- `django_cache_misses_total` - Cache misses

#### Node.js Backend
- `nodejs_requests_total` - Total HTTP requests
- `nodejs_requests_errors_total` - Failed requests
- `nodejs_response_time_avg` - Average response time
- `nodejs_response_time_max` - Maximum response time
- `nodejs_memory_usage` - Memory usage by type
- `nodejs_uptime_seconds` - Service uptime
- `nodejs_firebase_operations_total` - Firebase operations
- `nodejs_notifications_total` - Notification counts

### Business Metrics
- User registration rates
- Lesson completion rates
- Daily active users
- Notification delivery rates
- API usage patterns

## 📋 Health Checks

### Endpoints Available

#### Django
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system health
- `GET /metrics` - Prometheus metrics
- `GET /metrics/application` - Human-readable metrics

#### Node.js
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed system health
- `GET /metrics` - Prometheus metrics
- `GET /metrics/application` - Human-readable metrics

### Health Check Example

```bash
# Check Django health
curl http://localhost:8000/health

# Check Node.js health
curl http://localhost:3001/health

# Get detailed health information
curl http://localhost:8000/health/detailed
```

## 🚨 Alerting Rules

### Critical Alerts
- **Service Down**: Any service is unreachable for > 1 minute
- **High Error Rate**: Error rate > 10% for > 2 minutes
- **Database Issues**: Multiple database connection errors

### Warning Alerts
- **High Response Time**: Response time > 2 seconds for > 5 minutes
- **High Memory Usage**: Memory usage > 80% for > 5 minutes
- **Low Cache Hit Ratio**: Cache hit ratio < 70% for > 10 minutes

### Alert Configuration

Edit `monitoring/prometheus/alert_rules.yml` to modify alert thresholds:

```yaml
groups:
  - name: bible-app-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(django_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
```

## 📊 Structured Logging

### Log Formats

#### Production (JSON)
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "service": "django-backend",
  "message": "User authentication successful",
  "metadata": {
    "user_id": "123",
    "ip": "192.168.1.1",
    "endpoint": "/api/auth/login"
  }
}
```

#### Development (Human-readable)
```
INFO 2024-01-15 10:30:00 User authentication successful | {"user_id": "123"}
```

### Log Levels
- **ERROR**: System errors, exceptions
- **WARN**: Security events, performance issues
- **INFO**: User actions, system events
- **DEBUG**: Detailed debugging information

### Log Files
- `django.log` - General Django application logs
- `django_error.log` - Error logs only
- `security.log` - Security-related events
- `nodejs.log` - General Node.js application logs
- `nodejs_error.log` - Node.js error logs

## 🔧 Configuration

### Environment Variables

```bash
# Monitoring configuration
GRAFANA_ADMIN_PASSWORD=your-secure-password
PROMETHEUS_RETENTION_TIME=200h
ENABLE_MONITORING=true

# Logging levels
LOG_LEVEL=INFO
DJANGO_LOG_LEVEL=INFO
```

### Prometheus Configuration

Edit `monitoring/prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'bible-app-django'
    static_configs:
      - targets: ['django:8000']
    scrape_interval: 30s
```

### Grafana Dashboards

Custom dashboards are automatically provisioned from:
- `monitoring/grafana/provisioning/dashboards/`

To add new dashboards:
1. Create JSON dashboard file
2. Place in dashboards directory
3. Restart Grafana service

## 🛠️ Troubleshooting

### Common Issues

#### Metrics Not Appearing
```bash
# Check if services can reach metrics endpoints
curl http://localhost:8000/metrics
curl http://localhost:3001/metrics

# Check Prometheus targets
# Visit http://localhost:9090/targets
```

#### Grafana Dashboard Empty
1. Verify Prometheus data source configuration
2. Check Prometheus is scraping targets
3. Verify metric names in dashboard queries

#### Alerts Not Firing
```bash
# Check alerting rules syntax
docker-compose exec prometheus promtool check rules /etc/prometheus/alert_rules.yml

# Check Alertmanager configuration
docker-compose exec alertmanager amtool config show
```

### Log Investigation

```bash
# View application logs
docker-compose logs django
docker-compose logs nodejs

# View monitoring service logs
docker-compose logs prometheus
docker-compose logs grafana
```

## 📈 Performance Tuning

### Prometheus
- Adjust `scrape_interval` based on needs
- Configure `storage.tsdb.retention.time`
- Enable remote storage for long-term retention

### Grafana
- Use template variables for dynamic dashboards
- Configure data source timeouts
- Enable caching for better performance

### Loki
- Configure log retention policies
- Adjust chunk and index settings
- Use log stream labels efficiently

## 🔒 Security

### Access Control
- Change default Grafana admin password
- Restrict access to monitoring ports
- Use authentication for external access

### Sensitive Data
- Avoid logging sensitive information
- Use structured logging for compliance
- Implement log rotation and retention

## 📚 Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/)
- [Django Logging](https://docs.djangoproject.com/en/stable/topics/logging/)

---

**📝 Note**: This monitoring setup provides comprehensive observability for production environments. Regular review and tuning of metrics, alerts, and dashboards is recommended for optimal performance.
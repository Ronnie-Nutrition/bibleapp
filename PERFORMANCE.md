# Performance Optimization Guide

This document outlines the performance optimizations implemented in the Bible App and provides guidance for monitoring and improving performance.

## 🚀 Performance Features Implemented

### 1. Database Optimizations

#### Indexes Added
- **Authentication**: Firebase UID, email verification, password reset lookups
- **Lessons**: Category filtering, difficulty filtering, full-text search, featured lessons
- **User Progress**: User-specific queries, completion tracking, favorites
- **Statistics**: Streak calculations, leaderboard queries

#### Query Optimizations
- `select_related()` and `prefetch_related()` for reducing database hits
- Composite indexes for common filter combinations
- Full-text search using PostgreSQL's `tsvector`
- Connection pooling with 10-minute connection reuse

### 2. Caching Strategy

#### Redis Caching
- **Lesson Lists**: 15 minutes cache for filtered results
- **Lesson Details**: 30 minutes cache for individual lessons
- **User Progress**: 5 minutes cache for user-specific data
- **Categories**: 1 hour cache (rarely change)
- **Statistics**: 10 minutes cache with selective invalidation

#### Cache Invalidation
- Automatic cache invalidation on data updates
- Pattern-based cache clearing for related data
- Cache warming commands for deployment

### 3. CDN and Static File Optimization

#### AWS S3 + CloudFront
- Static files served from S3 with CloudFront CDN
- Gzip compression for CSS, JS, HTML files
- Cache headers for browser caching (1 day for assets)
- Versioned filenames for cache busting

#### Local Optimization (Fallback)
- WhiteNoise for compressed static file serving
- File compression and optimization
- Browser caching headers

### 4. API Optimizations

#### Response Optimization
- Paginated responses for large datasets
- Selective field serialization
- HTTP caching headers (`ETag`, `Last-Modified`)
- Compressed responses

#### Query Reduction
- Bulk operations where possible
- Efficient filtering and searching
- Optimized serializers

## 📊 Performance Monitoring

### Built-in Commands

#### Cache Warming
```bash
# Warm up caches after deployment
python manage.py warm_cache

# Clear and warm caches
python manage.py warm_cache --clear-first

# Show cache statistics
python manage.py warm_cache --stats
```

#### Performance Analysis
```bash
# Full performance analysis
python manage.py analyze_performance

# Analyze slow queries
python manage.py analyze_performance --slow-queries

# Check index usage
python manage.py analyze_performance --index-usage

# Analyze table sizes
python manage.py analyze_performance --table-sizes
```

### Database Monitoring

#### Key Metrics to Monitor
- Query response times
- Index usage efficiency
- Connection pool utilization
- Cache hit ratios
- Database size growth

#### PostgreSQL Queries for Monitoring
```sql
-- Check slow queries
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC LIMIT 10;

-- Check unused indexes
SELECT schemaname, tablename, indexname
FROM pg_stat_user_indexes 
WHERE idx_tup_read = 0;

-- Check table sizes
SELECT schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Cache Monitoring

#### Redis Monitoring
```bash
# Connect to Redis
docker-compose exec redis redis-cli

# Monitor cache statistics
INFO memory
INFO stats

# Check cache keys
KEYS bibleapp:*

# Monitor cache operations
MONITOR
```

## 🔧 Configuration

### Environment Variables

#### Database Performance
```bash
# Connection pooling
DB_MAX_CONNECTIONS=20
DB_CONN_MAX_AGE=600

# Query optimization
DB_OPTIONS_MAX_CONNS=20
```

#### Caching Configuration
```bash
# Redis configuration
REDIS_URL=redis://user:password@host:port/db
REDIS_MAX_CONNECTIONS=50
REDIS_SOCKET_TIMEOUT=5

# Cache timeouts (seconds)
CACHE_LESSON_LIST_TIMEOUT=900      # 15 minutes
CACHE_LESSON_DETAIL_TIMEOUT=1800   # 30 minutes
CACHE_USER_PROGRESS_TIMEOUT=300    # 5 minutes
CACHE_CATEGORIES_TIMEOUT=3600      # 1 hour
```

#### CDN Configuration
```bash
# AWS S3 + CloudFront
USE_S3_STATIC=true
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_STORAGE_BUCKET_NAME=your_bucket
AWS_S3_REGION_NAME=us-east-1
AWS_S3_CUSTOM_DOMAIN=your_cloudfront_domain.cloudfront.net
AWS_CLOUDFRONT_DISTRIBUTION_ID=your_distribution_id

# Static file optimization
ENABLE_STATIC_HASHING=true
ENABLE_STATIC_COMPRESSION=true
```

## 📈 Performance Benchmarks

### Target Metrics
- **API Response Time**: < 200ms (95th percentile)
- **Database Query Time**: < 50ms (average)
- **Cache Hit Ratio**: > 80%
- **Page Load Time**: < 2 seconds
- **CDN Cache Hit Ratio**: > 95%

### Load Testing
```bash
# Install testing tools
pip install locust

# Run load tests
locust -f tests/load_test.py --host=http://localhost:8000
```

## 🛠️ Optimization Strategies

### Database Optimization

#### Regular Maintenance
```bash
# Update table statistics
ANALYZE;

# Rebuild indexes if needed
REINDEX INDEX index_name;

# Check for bloated tables
SELECT schemaname, tablename,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public';
```

#### Query Optimization
- Use `EXPLAIN ANALYZE` to analyze query plans
- Add indexes for frequently filtered columns
- Use partial indexes for boolean filters
- Consider materialized views for complex aggregations

### Caching Strategies

#### Cache Key Design
- Use consistent key naming patterns
- Include version information in keys
- Use cache tags for bulk invalidation

#### Cache Invalidation
- Implement cache warming during deployments
- Use selective invalidation over full cache clears
- Monitor cache hit ratios and adjust timeouts

### CDN Optimization

#### Content Optimization
- Compress images and optimize formats
- Minify CSS and JavaScript
- Use appropriate cache headers
- Implement progressive loading

#### Cache Strategy
- Long cache times for versioned assets (1 year)
- Short cache times for dynamic content (5 minutes)
- Use cache invalidation for urgent updates

## 🚨 Performance Alerts

### Monitoring Setup
- Set up alerts for slow database queries (> 1 second)
- Monitor cache hit ratios (< 70% = alert)
- Track API response times (95th percentile > 500ms)
- Monitor database connection usage (> 80% = warning)

### Response Procedures

#### High Database Load
1. Check for slow queries using `pg_stat_statements`
2. Analyze query plans with `EXPLAIN ANALYZE`
3. Add missing indexes if needed
4. Scale database if persistent

#### Low Cache Hit Ratio
1. Check cache configuration and timeouts
2. Verify cache invalidation logic
3. Warm caches if they were cleared
4. Increase cache memory if needed

#### Slow API Responses
1. Check database query performance
2. Verify cache effectiveness
3. Analyze serializer efficiency
4. Check for N+1 query problems

## 📚 Additional Resources

### Tools
- **pgAdmin**: PostgreSQL administration
- **Redis Insight**: Redis monitoring and debugging
- **New Relic/DataDog**: Application performance monitoring
- **Locust**: Load testing
- **Django Debug Toolbar**: Development profiling

### Documentation
- [Django Performance Guide](https://docs.djangoproject.com/en/stable/topics/performance/)
- [PostgreSQL Performance Tuning](https://www.postgresql.org/docs/current/performance-tips.html)
- [Redis Best Practices](https://redis.io/docs/manual/patterns/)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)

---

**⚡ Performance is an ongoing process**. Regular monitoring, optimization, and testing ensure your application can scale with user growth.
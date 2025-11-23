# Bible App Deployment Guide

This guide covers the complete deployment process for the Bible App using Docker containers.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │    │  Django Backend │    │ Node.js Backend │
│   (Port 80/443) │────┤   (Port 8000)   │    │   (Port 3001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │   PostgreSQL    │    │      Redis      │
         │              │   (Port 5432)   │    │   (Port 6379)   │
         └──────────────└─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

### System Requirements
- **Server**: 2+ CPU cores, 4GB+ RAM, 50GB+ storage
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Docker-compatible Linux
- **Network**: Static IP with ports 80, 443 open

### Required Software
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

## 🚀 Deployment Process

### 1. Initial Setup

```bash
# Clone the repository
git clone https://github.com/Ronnie-Nutrition/bibleapp.git
cd bibleapp

# Copy environment file and configure
cp .env.example .env
nano .env  # Update with your values

# Create necessary directories
mkdir -p volumes/{postgres,redis} ssl backups
```

### 2. Environment Configuration

Update `.env` file with your production values:

```bash
# Generate secure secrets
DJANGO_SECRET_KEY=$(python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
JWT_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
```

### 3. SSL Certificate Setup

#### Option A: Let's Encrypt (Recommended)
```bash
# Install certbot
sudo apt-get install certbot

# Generate certificates
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy certificates to project
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
sudo chown $USER:$USER ssl/*.pem
```

#### Option B: Self-signed (Development)
```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes
```

### 4. Deploy Application

```bash
# Development deployment
./scripts/deploy.sh --env development

# Production deployment
./scripts/deploy.sh --env production --compose-file docker-compose.prod.yml
```

### 5. Post-deployment Setup

```bash
# Create Django superuser
docker-compose exec django python manage.py createsuperuser

# Load initial data (if any)
docker-compose exec django python manage.py loaddata initial_data.json

# Test the deployment
curl http://localhost/health
curl http://localhost/api/django/health
curl http://localhost/api/nodejs/health
```

## 🔧 Configuration Files

### Key Configuration Files
- `docker-compose.yml` - Development environment
- `docker-compose.prod.yml` - Production environment
- `nginx/nginx.conf` - Nginx main configuration
- `nginx/conf.d/bibleapp.conf` - App-specific routing
- `.env` - Environment variables

### Service URLs
- **Frontend Proxy**: `http://localhost` (port 80)
- **Django Admin**: `http://localhost/admin`
- **Django API**: `http://localhost/api/django/`
- **Node.js API**: `http://localhost/api/nodejs/`

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f django
docker-compose logs -f nodejs
docker-compose logs -f nginx

# Monitor resources
docker stats
```

### Database Operations
```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres bibleapp > backup_$(date +%Y%m%d).sql

# Restore database
docker-compose exec -T postgres psql -U postgres bibleapp < backup_file.sql

# Run migrations
docker-compose exec django python manage.py migrate
```

### Updates
```bash
# Update application
git pull origin main
./scripts/deploy.sh --env production

# Update Docker images
docker-compose pull
docker-compose up -d --force-recreate
```

## 🔒 Security Checklist

### Pre-deployment Security
- [ ] All default passwords changed
- [ ] Environment variables configured with secure values
- [ ] SSL certificates installed and configured
- [ ] Firewall rules configured (only 80, 443, 22 open)
- [ ] Database access restricted to backend only
- [ ] Redis password protected

### Post-deployment Security
- [ ] Security headers tested
- [ ] Rate limiting verified
- [ ] SSL configuration tested (SSL Labs)
- [ ] Backup procedures tested
- [ ] Log monitoring configured
- [ ] Update procedures documented

## 🆘 Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker-compose logs service_name

# Check configuration
docker-compose config

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### Database Connection Issues
```bash
# Check database status
docker-compose exec postgres pg_isready -U postgres

# Reset database (DESTRUCTIVE)
docker-compose down -v
docker-compose up -d postgres
docker-compose exec django python manage.py migrate
```

#### SSL/HTTPS Issues
```bash
# Test SSL configuration
openssl s_client -connect yourdomain.com:443

# Check Nginx configuration
docker-compose exec nginx nginx -t

# Reload Nginx configuration
docker-compose exec nginx nginx -s reload
```

### Performance Tuning

#### Database Optimization
```sql
-- Connect to database
docker-compose exec postgres psql -U postgres bibleapp

-- Check indexes
\d+ table_name

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM table_name WHERE condition;
```

#### Container Resource Limits
```yaml
# Add to docker-compose.prod.yml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.25'
```

## 📈 Scaling

### Horizontal Scaling
```yaml
# Add to docker-compose.prod.yml
django:
  deploy:
    replicas: 3
    
nodejs:
  deploy:
    replicas: 2
```

### Load Balancer Configuration
```nginx
# Add to nginx upstream
upstream django_backend {
    server django_1:8000;
    server django_2:8000;
    server django_3:8000;
    keepalive 32;
}
```

## 📞 Support

### Log Locations
- **Application Logs**: `./volumes/logs/`
- **Nginx Logs**: `docker-compose logs nginx`
- **Database Logs**: `docker-compose logs postgres`

### Backup Strategy
- **Automated**: Daily database backups via cron
- **Manual**: Use `./scripts/deploy.sh` backup functionality
- **Retention**: 30 days (configurable)

---

**🚨 IMPORTANT**: Always test deployments in a staging environment before applying to production. Keep backups and have a rollback plan ready.
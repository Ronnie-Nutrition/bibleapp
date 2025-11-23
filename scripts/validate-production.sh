#!/bin/bash

# Production Environment Validation Script
# This script validates that the production environment is properly configured

set -e

echo "🔍 Bible App Production Environment Validation"
echo "============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print status
print_status() {
    if [ "$1" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASSED++))
    elif [ "$1" = "FAIL" ]; then
        echo -e "${RED}✗${NC} $2"
        ((FAILED++))
    elif [ "$1" = "WARN" ]; then
        echo -e "${YELLOW}⚠${NC} $2"
        ((WARNINGS++))
    fi
}

# Check required commands
echo
echo "📋 Checking Required Commands"
echo "----------------------------"

if command_exists docker; then
    print_status "PASS" "Docker is installed"
else
    print_status "FAIL" "Docker is not installed"
fi

if command_exists docker-compose; then
    print_status "PASS" "Docker Compose is installed"
else
    print_status "FAIL" "Docker Compose is not installed"
fi

# Check environment files
echo
echo "📁 Checking Environment Configuration"
echo "------------------------------------"

if [ -f ".env" ]; then
    print_status "PASS" ".env file exists"
    
    # Check critical environment variables
    source .env
    
    if [ -n "$DJANGO_SECRET_KEY" ] && [ ${#DJANGO_SECRET_KEY} -ge 50 ]; then
        print_status "PASS" "Django secret key is properly configured"
    else
        print_status "FAIL" "Django secret key is missing or too short"
    fi
    
    if [ -n "$JWT_SECRET" ] && [ ${#JWT_SECRET} -ge 32 ]; then
        print_status "PASS" "JWT secret is properly configured"
    else
        print_status "FAIL" "JWT secret is missing or too short"
    fi
    
    if [ -n "$DB_PASSWORD" ] && [ ${#DB_PASSWORD} -ge 12 ]; then
        print_status "PASS" "Database password is strong"
    else
        print_status "WARN" "Database password should be at least 12 characters"
    fi
    
    if [ -n "$REDIS_PASSWORD" ] && [ ${#REDIS_PASSWORD} -ge 12 ]; then
        print_status "PASS" "Redis password is strong"
    else
        print_status "WARN" "Redis password should be at least 12 characters"
    fi
    
    if [ -n "$FIREBASE_PROJECT_ID" ]; then
        print_status "PASS" "Firebase project ID configured"
    else
        print_status "FAIL" "Firebase project ID is missing"
    fi
    
    if [ "$ENVIRONMENT" = "production" ]; then
        print_status "PASS" "Environment is set to production"
    else
        print_status "WARN" "Environment is not set to production"
    fi
    
else
    print_status "FAIL" ".env file does not exist"
fi

# Check SSL certificates
echo
echo "🔒 Checking SSL Configuration"
echo "----------------------------"

if [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
    print_status "PASS" "SSL certificates exist"
    
    # Check certificate validity
    if openssl x509 -in ssl/cert.pem -text -noout -checkend 2592000 >/dev/null 2>&1; then
        print_status "PASS" "SSL certificate is valid for at least 30 days"
    else
        print_status "WARN" "SSL certificate expires within 30 days or is invalid"
    fi
else
    print_status "WARN" "SSL certificates not found (using self-signed or Let's Encrypt)"
fi

# Check Docker configuration
echo
echo "🐳 Checking Docker Configuration"
echo "-------------------------------"

if [ -f "docker-compose.prod.yml" ]; then
    print_status "PASS" "Production Docker Compose file exists"
    
    # Validate Docker Compose file
    if docker-compose -f docker-compose.prod.yml config >/dev/null 2>&1; then
        print_status "PASS" "Docker Compose configuration is valid"
    else
        print_status "FAIL" "Docker Compose configuration is invalid"
    fi
else
    print_status "FAIL" "Production Docker Compose file does not exist"
fi

# Check network connectivity
echo
echo "🌐 Checking Network Connectivity"
echo "-------------------------------"

# Check if ports are available
check_port() {
    if nc -z localhost $1 2>/dev/null; then
        print_status "WARN" "Port $1 is already in use"
    else
        print_status "PASS" "Port $1 is available"
    fi
}

check_port 80
check_port 443
check_port 5432
check_port 6379

# Check file permissions
echo
echo "📝 Checking File Permissions"
echo "---------------------------"

if [ -r "scripts/deploy.sh" ]; then
    if [ -x "scripts/deploy.sh" ]; then
        print_status "PASS" "Deploy script is executable"
    else
        print_status "WARN" "Deploy script is not executable"
    fi
else
    print_status "FAIL" "Deploy script is not readable"
fi

# Check monitoring configuration
echo
echo "📊 Checking Monitoring Configuration"
echo "-----------------------------------"

if [ -d "monitoring" ]; then
    print_status "PASS" "Monitoring directory exists"
    
    if [ -f "monitoring/prometheus/prometheus.yml" ]; then
        print_status "PASS" "Prometheus configuration exists"
    else
        print_status "WARN" "Prometheus configuration missing"
    fi
    
    if [ -f "monitoring/grafana/provisioning/dashboards/bible-app-dashboard.json" ]; then
        print_status "PASS" "Grafana dashboard configuration exists"
    else
        print_status "WARN" "Grafana dashboard configuration missing"
    fi
else
    print_status "WARN" "Monitoring directory does not exist"
fi

# Check backup configuration
echo
echo "💾 Checking Backup Configuration"
echo "-------------------------------"

if [ -d "volumes" ]; then
    print_status "PASS" "Volumes directory exists for data persistence"
else
    print_status "WARN" "Volumes directory does not exist"
fi

# Security checks
echo
echo "🔐 Security Checks"
echo "-----------------"

if [ -f ".gitignore" ] && grep -q "\.env" .gitignore; then
    print_status "PASS" ".env files are in .gitignore"
else
    print_status "FAIL" ".env files should be in .gitignore"
fi

if [ -f ".gitignore" ] && grep -q "ssl/" .gitignore; then
    print_status "PASS" "SSL directory is in .gitignore"
else
    print_status "WARN" "SSL directory should be in .gitignore"
fi

# Performance checks
echo
echo "⚡ Performance Configuration"
echo "--------------------------"

if [ -f "backend/django/requirements.txt" ] && grep -q "gunicorn" backend/django/requirements.txt; then
    print_status "PASS" "Production WSGI server (Gunicorn) is configured"
else
    print_status "WARN" "Production WSGI server not found in requirements"
fi

if [ -f "nginx/nginx.conf" ]; then
    print_status "PASS" "Nginx configuration exists"
    
    if grep -q "gzip" nginx/nginx.conf; then
        print_status "PASS" "Gzip compression is enabled"
    else
        print_status "WARN" "Gzip compression not configured"
    fi
else
    print_status "WARN" "Nginx configuration not found"
fi

# Summary
echo
echo "📊 Validation Summary"
echo "===================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo
        echo -e "${GREEN}🎉 All checks passed! Your production environment is ready.${NC}"
        exit 0
    else
        echo
        echo -e "${YELLOW}⚠️ Environment is mostly ready, but please review warnings.${NC}"
        exit 1
    fi
else
    echo
    echo -e "${RED}❌ Critical issues found. Please fix failed checks before deploying.${NC}"
    exit 2
fi
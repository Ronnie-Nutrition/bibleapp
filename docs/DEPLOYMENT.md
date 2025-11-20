# Production Deployment Guide

## Overview

This guide covers deploying the Bible App backend to production using Docker and Kubernetes. The backend is containerized and ready for cloud deployment on AWS, GCP, Azure, or any Kubernetes cluster.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Setup](#firebase-setup)
3. [Local Docker Testing](#local-docker-testing)
4. [Kubernetes Deployment](#kubernetes-deployment)
5. [Environment Variables](#environment-variables)
6. [Monitoring & Logging](#monitoring--logging)
7. [Scaling](#scaling)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- **Docker** (v20.10+)
- **kubectl** (v1.24+)
- **A Kubernetes cluster** (EKS, GKE, AKS, or local minikube)
- **Firebase project** with Firestore enabled
- **Domain name** (for production HTTPS)

### Optional Tools

- **Helm** (for package management)
- **Prometheus** (for monitoring)
- **Grafana** (for dashboards)

---

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name your project (e.g., "bible-app-production")
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Firestore

1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **Production mode**
4. Select your region (choose closest to your users)
5. Click "Enable"

### 3. Create Collections

Create these Firestore collections:
- `lessons` - Biblical lessons
- `user_progress` - User progress tracking
- `lesson_notes` - Personal notes
- `_health` - Health check collection

### 4. Generate Service Account Key

1. Go to **Project Settings > Service Accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. **IMPORTANT**: Keep this file secure, never commit to Git!

The JSON file contains:
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

---

## Local Docker Testing

### 1. Create Environment File

Copy the example file:
```bash
cp .env.example .env
```

Edit `.env` with your Firebase credentials:
```bash
NODE_ENV=production
PORT=3000

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
```

**IMPORTANT**: The private key must be on a single line with `\n` for newlines.

### 2. Build Docker Image

```bash
docker build -t bible-app-backend:latest .
```

### 3. Run with Docker Compose

```bash
docker-compose up -d
```

### 4. Test Locally

```bash
# Health check
curl http://localhost:3000/health

# Detailed health check
curl http://localhost:3000/health?details=true

# Liveness probe
curl http://localhost:3000/health/live

# Readiness probe
curl http://localhost:3000/health/ready
```

### 5. View Logs

```bash
docker-compose logs -f backend
```

### 6. Stop Services

```bash
docker-compose down
```

---

## Kubernetes Deployment

### 1. Push Docker Image to Registry

#### Option A: Docker Hub

```bash
# Tag image
docker tag bible-app-backend:latest your-dockerhub-username/bible-app-backend:v1.0.0

# Login
docker login

# Push
docker push your-dockerhub-username/bible-app-backend:v1.0.0
```

#### Option B: AWS ECR

```bash
# Authenticate
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account-id.dkr.ecr.us-east-1.amazonaws.com

# Tag
docker tag bible-app-backend:latest your-account-id.dkr.ecr.us-east-1.amazonaws.com/bible-app-backend:v1.0.0

# Push
docker push your-account-id.dkr.ecr.us-east-1.amazonaws.com/bible-app-backend:v1.0.0
```

#### Option C: Google Container Registry

```bash
# Tag
docker tag bible-app-backend:latest gcr.io/your-project-id/bible-app-backend:v1.0.0

# Push
docker push gcr.io/your-project-id/bible-app-backend:v1.0.0
```

### 2. Create Kubernetes Secret

**Method 1: From Firebase JSON file**

```bash
kubectl create secret generic firebase-credentials \
  --from-file=service-account=./firebase-key.json \
  --dry-run=client -o yaml | kubectl apply -f -
```

Then extract individual fields:
```bash
kubectl create secret generic firebase-credentials \
  --from-literal=project-id=$(cat firebase-key.json | jq -r .project_id) \
  --from-literal=client-email=$(cat firebase-key.json | jq -r .client_email) \
  --from-literal=database-url=https://$(cat firebase-key.json | jq -r .project_id).firebaseio.com \
  --from-literal=private-key="$(cat firebase-key.json | jq -r .private_key)"
```

**Method 2: Manual creation**

```bash
kubectl create secret generic firebase-credentials \
  --from-literal=project-id=your-project-id \
  --from-literal=client-email=your-email@project.iam.gserviceaccount.com \
  --from-literal=database-url=https://your-project-id.firebaseio.com \
  --from-literal=private-key="$(cat private-key.pem)"
```

### 3. Update Deployment Image

Edit `k8s/deployment.yaml` and replace:
```yaml
image: your-registry/bible-app-backend:latest
```

With your actual image:
```yaml
image: your-dockerhub-username/bible-app-backend:v1.0.0
# OR
image: gcr.io/your-project-id/bible-app-backend:v1.0.0
```

### 4. Update Ingress Domain

Edit `k8s/ingress.yaml` and replace `api.yourdomain.com` with your actual domain.

### 5. Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/

# Or apply individually
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
```

### 6. Verify Deployment

```bash
# Check pods
kubectl get pods -l app=bible-app

# Check deployment
kubectl get deployment bible-app-backend

# Check service
kubectl get svc bible-app-backend

# Check ingress
kubectl get ingress bible-app-backend

# View logs
kubectl logs -l app=bible-app --tail=100 -f
```

### 7. Test Health Endpoints

```bash
# Port forward for testing
kubectl port-forward svc/bible-app-backend 3000:80

# Test in another terminal
curl http://localhost:3000/health
curl http://localhost:3000/health/live
curl http://localhost:3000/health/ready
```

---

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Server port | `3000` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `bible-app-prod` |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | `-----BEGIN PRIVATE KEY-----\n...` |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | `firebase-adminsdk@...` |
| `FIREBASE_DATABASE_URL` | Firestore URL | `https://project.firebaseio.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Logging level | `info` |
| `CORS_ORIGIN` | CORS allowed origin | `*` |

---

## Monitoring & Logging

### Prometheus Metrics

The backend exposes Prometheus metrics at `/health/metrics`:

```bash
curl http://your-api.com/health/metrics
```

Metrics include:
- `health_service_status` - Service health (1=healthy, 0=unhealthy)
- `health_requests_total` - Total requests
- `health_requests_errors` - Error count
- `health_uptime_seconds` - Uptime
- `health_memory_used_mb` - Memory usage

### Kubernetes Health Probes

The deployment uses three types of probes:

1. **Startup Probe** - `/health/startup`
   - Gives app 5 minutes to start (30 attempts × 10s)
   - Only runs at startup

2. **Liveness Probe** - `/health/live`
   - Checks if process is alive
   - Restarts pod if fails 3 times

3. **Readiness Probe** - `/health/ready`
   - Checks if app can handle traffic
   - Removes from load balancer if not ready

### Logging

View logs:
```bash
# All pods
kubectl logs -l app=bible-app -f

# Specific pod
kubectl logs pod/bible-app-backend-xxxxx -f

# Previous crashed pod
kubectl logs pod/bible-app-backend-xxxxx --previous
```

---

## Scaling

### Manual Scaling

```bash
# Scale to 5 replicas
kubectl scale deployment bible-app-backend --replicas=5

# Verify
kubectl get deployment bible-app-backend
```

### Autoscaling (HPA)

The Horizontal Pod Autoscaler is configured in `k8s/hpa.yaml`:

- **Min replicas**: 3
- **Max replicas**: 10
- **Triggers**: CPU > 70% or Memory > 80%

Monitor autoscaling:
```bash
# Watch HPA status
kubectl get hpa bible-app-backend --watch

# Describe HPA
kubectl describe hpa bible-app-backend
```

### Load Testing

Test autoscaling with load:
```bash
# Install Apache Bench
apt-get install apache2-utils

# Generate load
ab -n 10000 -c 100 http://your-api.com/health
```

---

## SSL/TLS Configuration

### Using cert-manager (Recommended)

1. Install cert-manager:
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

2. Create ClusterIssuer:
```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your-email@domain.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

3. Apply:
```bash
kubectl apply -f cluster-issuer.yaml
```

The Ingress will automatically request and renew certificates!

---

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -l app=bible-app

# Describe pod
kubectl describe pod bible-app-backend-xxxxx

# View logs
kubectl logs bible-app-backend-xxxxx

# Common issues:
# - Image pull errors: Check image name and registry access
# - Secrets not found: Verify firebase-credentials secret exists
# - Crash loop: Check logs for Firebase connection errors
```

### Health Checks Failing

```bash
# Check health directly
kubectl port-forward svc/bible-app-backend 3000:80
curl http://localhost:3000/health/ready?deep=true

# Common issues:
# - Firebase not connected: Check secrets
# - Startup too slow: Increase startupProbe failureThreshold
```

### High Memory Usage

```bash
# Check resource usage
kubectl top pods -l app=bible-app

# If memory limit exceeded:
# 1. Increase limits in deployment.yaml
# 2. Check for memory leaks in logs
# 3. Consider scaling horizontally instead
```

### Ingress Not Working

```bash
# Check ingress
kubectl describe ingress bible-app-backend

# Check ingress controller
kubectl get pods -n ingress-nginx

# Verify DNS
nslookup api.yourdomain.com

# Common issues:
# - DNS not pointing to LoadBalancer IP
# - Ingress controller not installed
# - Certificate not issued (check cert-manager logs)
```

---

## Production Checklist

Before going live:

- [ ] Firebase credentials properly configured as secrets
- [ ] Domain DNS pointing to cluster LoadBalancer
- [ ] SSL certificate issued and valid
- [ ] Health checks passing (startup, liveness, readiness)
- [ ] Autoscaling configured and tested
- [ ] Monitoring set up (Prometheus/Grafana)
- [ ] Logs aggregated (ELK/CloudWatch/Stackdriver)
- [ ] Backup strategy for Firestore
- [ ] Rate limiting configured in Ingress
- [ ] CORS configured for your iOS app domain
- [ ] Firebase security rules updated
- [ ] Load testing completed
- [ ] Rollback plan documented

---

## Cloud-Specific Notes

### AWS (EKS)

```bash
# Create EKS cluster
eksctl create cluster \
  --name bible-app-cluster \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.medium \
  --nodes 3 \
  --nodes-min 1 \
  --nodes-max 4

# Update kubeconfig
aws eks update-kubeconfig --name bible-app-cluster --region us-east-1
```

### Google Cloud (GKE)

```bash
# Create GKE cluster
gcloud container clusters create bible-app-cluster \
  --num-nodes=3 \
  --machine-type=n1-standard-1 \
  --region=us-central1

# Get credentials
gcloud container clusters get-credentials bible-app-cluster --region=us-central1
```

### Azure (AKS)

```bash
# Create AKS cluster
az aks create \
  --resource-group bible-app-rg \
  --name bible-app-cluster \
  --node-count 3 \
  --node-vm-size Standard_B2s

# Get credentials
az aks get-credentials --resource-group bible-app-rg --name bible-app-cluster
```

---

## Continuous Deployment

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Build Docker image
      run: docker build -t bible-app-backend:${{ github.sha }} .

    - name: Push to registry
      run: |
        echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
        docker tag bible-app-backend:${{ github.sha }} your-username/bible-app-backend:latest
        docker push your-username/bible-app-backend:latest

    - name: Deploy to Kubernetes
      uses: azure/k8s-deploy@v1
      with:
        manifests: |
          k8s/deployment.yaml
          k8s/service.yaml
        images: your-username/bible-app-backend:latest
```

---

## Support

For deployment issues:
- Check logs: `kubectl logs -l app=bible-app`
- Review health: `curl http://your-api.com/health?details=true`
- See metrics: `curl http://your-api.com/health/metrics`

---

## Version History

- **v1.0.0** (2025-11-18) - Initial production deployment
  - Docker containerization
  - Kubernetes manifests
  - Health check integration
  - Autoscaling support

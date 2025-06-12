# Smart File Vault - Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- Docker and Docker Compose
- Kubernetes (Minikube) for production deployment
- Git

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/smart-file-vault.git
cd smart-file-vault
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables in .env
MONGODB_URI=mongodb://localhost:27017/smart_file_vault
JWT_SECRET=your_jwt_secret
PORT=5000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure environment variables in .env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## Docker Setup

### 1. Build and Run with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop all services
docker-compose down
```

### 2. Individual Container Setup
```bash
# Backend
docker build -t smart-file-vault-backend ./backend
docker run -p 5000:5000 smart-file-vault-backend

# Frontend
docker build -t smart-file-vault-frontend ./frontend
docker run -p 3000:3000 smart-file-vault-frontend
```

## Kubernetes Setup

### 1. Start Minikube
```bash
# Start Minikube
minikube start

# Enable required addons
minikube addons enable ingress
minikube addons enable dashboard
```

### 2. Deploy to Kubernetes
```bash
# Create namespace
kubectl create namespace smart-file-vault

# Apply configurations
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/mongodb-deployment.yaml

# Verify deployments
kubectl get all -n smart-file-vault
```

### 3. Access the Application
```bash
# Get Minikube IP
minikube ip

# Access the application
# Frontend: http://<minikube-ip>:3000
# Backend: http://<minikube-ip>:5000
```

## Production Deployment

### 1. Environment Setup
```bash
# Create production environment files
cp .env.example .env.production

# Configure production environment variables
# Update with production values:
# - MongoDB connection string
# - JWT secret
# - API URLs
# - Other production settings
```

### 2. Build Production Images
```bash
# Build backend
docker build -t your-registry/smart-file-vault-backend:latest ./backend

# Build frontend
docker build -t your-registry/smart-file-vault-frontend:latest ./frontend

# Push to registry
docker push your-registry/smart-file-vault-backend:latest
docker push your-registry/smart-file-vault-frontend:latest
```

### 3. Deploy to Production
```bash
# Apply production configurations
kubectl apply -f k8s/production/

# Verify deployment
kubectl get all -n production
```

## Security Setup

### 1. SSL/TLS Configuration
```bash
# Generate SSL certificates
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout private.key -out certificate.crt

# Configure Kubernetes secrets
kubectl create secret tls smart-file-vault-tls \
  --key private.key \
  --cert certificate.crt
```

### 2. Database Security
```bash
# Create MongoDB user
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: ["root"]
})

# Update MongoDB connection string with credentials
```

## Monitoring Setup

### 1. Prometheus and Grafana
```bash
# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/prometheus

# Install Grafana
helm repo add grafana https://grafana.github.io/helm-charts
helm install grafana grafana/grafana
```

### 2. Logging Setup
```bash
# Install ELK Stack
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch
helm install kibana elastic/kibana
helm install filebeat elastic/filebeat
```

## Backup and Recovery

### 1. Database Backup
```bash
# Create backup script
#!/bin/bash
mongodump --uri="mongodb://localhost:27017/smart_file_vault" \
  --out="/backup/$(date +%Y%m%d)"

# Schedule backup (crontab)
0 0 * * * /path/to/backup.sh
```

### 2. File Storage Backup
```bash
# Backup uploaded files
rsync -av /path/to/uploads /backup/uploads

# Schedule backup (crontab)
0 1 * * * rsync -av /path/to/uploads /backup/uploads
```

## Troubleshooting

### Common Issues and Solutions

1. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB status
   systemctl status mongodb
   
   # Check logs
   tail -f /var/log/mongodb/mongodb.log
   ```

2. **Docker Issues**
   ```bash
   # Check container logs
   docker logs <container-id>
   
   # Check container status
   docker ps -a
   ```

3. **Kubernetes Issues**
   ```bash
   # Check pod status
   kubectl get pods -n smart-file-vault
   
   # Check pod logs
   kubectl logs <pod-name> -n smart-file-vault
   
   # Describe pod for details
   kubectl describe pod <pod-name> -n smart-file-vault
   ```

## Maintenance

### Regular Maintenance Tasks

1. **Update Dependencies**
   ```bash
   # Backend
   cd backend
   npm update
   
   # Frontend
   cd frontend
   npm update
   ```

2. **Database Maintenance**
   ```bash
   # Check database size
   mongosh
   db.stats()
   
   # Clean up old files
   db.files.deleteMany({ uploadDate: { $lt: new Date(Date.now() - 30*24*60*60*1000) } })
   ```

3. **Log Rotation**
   ```bash
   # Configure logrotate
   /var/log/smart-file-vault/*.log {
       daily
       rotate 7
       compress
       delaycompress
       missingok
       notifempty
   }
   ```

## Support and Resources

### Useful Commands
```bash
# Check application status
kubectl get all -n smart-file-vault

# View logs
kubectl logs -f deployment/backend -n smart-file-vault
kubectl logs -f deployment/frontend -n smart-file-vault

# Access MongoDB
kubectl exec -it <mongodb-pod> -n smart-file-vault -- mongosh
```

### Documentation
- [Project Documentation](notes.md)
- [DevOps Documentation](devops.md)
- [API Documentation](api.md)

### Support Channels
- GitHub Issues
- Project Wiki
- Team Communication Channel 
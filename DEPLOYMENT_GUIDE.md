# 🚀 Quantum Flow Terminal — Deployment Guide

## Prerequisites

- Docker & Docker Compose installed
- PostgreSQL 16+ (or use Docker)
- Redis 7+ (or use Docker)
- Node.js 18+ (for frontend build)
- Python 3.13+ (for backend)
- Domain name with SSL certificate

---

## 🏠 Local Development

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/quantum-flow-terminal.git
cd quantum-flow-terminal
cp .env.development .env
```

### 2. Start Services

```bash
docker-compose up -d
```

### 3. Initialize Database

```bash
docker-compose exec backend alembic upgrade head
```

### 4. Access Applications

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Database:** localhost:5432
- **Redis:** localhost:6379

---

## ☁️ Production Deployment

### Option 1: Docker Compose (Single Server)

#### 1. Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Clone Repository

```bash
cd /opt
sudo git clone https://github.com/yourusername/quantum-flow-terminal.git
cd quantum-flow-terminal
```

#### 3. Configure Environment

```bash
# Copy production template
sudo cp .env.production.example .env

# Edit with production values
sudo nano .env
```

**Required values:**
- `DATABASE_URL` — PostgreSQL connection
- `REDIS_URL` — Redis URL
- `SECRET_KEY` — Generate: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — From Google Console
- `SMTP_SERVER` / `SMTP_USER` / `SMTP_PASSWORD` — For email notifications
- `CORS_ORIGINS` — Your domain

#### 4. Start Services

```bash
# Build images
sudo docker-compose build

# Start in background
sudo docker-compose up -d

# Run migrations
sudo docker-compose exec backend alembic upgrade head

# Check logs
sudo docker-compose logs -f
```

#### 5. Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install -y nginx

# Create config
sudo nano /etc/nginx/sites-available/quantum-flow
```

```nginx
upstream backend {
    server localhost:8000;
}

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /api/ws/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_buffering off;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/quantum-flow /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 6. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

---

### Option 2: Kubernetes Deployment

#### 1. Create Namespace

```bash
kubectl create namespace quantum-flow
```

#### 2. Create Secrets

```bash
kubectl create secret generic quantum-flow-secrets \
  --from-literal=db-password=YOUR_DB_PASSWORD \
  --from-literal=secret-key=YOUR_SECRET_KEY \
  --from-literal=google-client-id=YOUR_GOOGLE_ID \
  --from-literal=google-client-secret=YOUR_GOOGLE_SECRET \
  --from-literal=smtp-password=YOUR_SMTP_PASSWORD \
  -n quantum-flow
```

#### 3. Deploy PostgreSQL

```bash
kubectl apply -f k8s/postgres.yaml -n quantum-flow
```

#### 4. Deploy Redis

```bash
kubectl apply -f k8s/redis.yaml -n quantum-flow
```

#### 5. Deploy Backend

```bash
kubectl apply -f k8s/backend.yaml -n quantum-flow
```

#### 6. Deploy Frontend

```bash
kubectl apply -f k8s/frontend.yaml -n quantum-flow
```

#### 7. Deploy Ingress

```bash
kubectl apply -f k8s/ingress.yaml -n quantum-flow
```

---

## 🔍 Monitoring & Logs

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Frontend
docker-compose logs -f frontend
```

### Health Checks

```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000

# Database
docker-compose exec postgres pg_isready
```

### Performance Monitoring

```bash
# Container stats
docker stats

# Database performance
docker-compose exec postgres psql -U qf_user -d quantum_flow -c "SELECT * FROM pg_stat_statements LIMIT 10;"
```

---

## 📦 Database Backups

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/quantum-flow"
DATE=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="qf-postgres"

mkdir -p $BACKUP_DIR

# Backup database
docker-compose exec -T $DB_CONTAINER pg_dump -U qf_user quantum_flow | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup Redis
docker-compose exec -T redis-cli --rdb /backups/dump_$DATE.rdb

# Upload to S3 (optional)
# aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://your-bucket/backups/

# Cleanup old backups (keep last 30 days)
find $BACKUP_DIR -type f -mtime +30 -delete
```

### Schedule with Cron

```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/quantum-flow-backup.log 2>&1
```

---

## 🔐 Security Checklist

- [ ] Generate new `SECRET_KEY`
- [ ] Change all default passwords
- [ ] Enable HTTPS with SSL certificate
- [ ] Configure firewall (allow 80, 443, SSH only)
- [ ] Set `DEBUG=False`
- [ ] Configure database encryption
- [ ] Enable automated backups
- [ ] Set up monitoring/alerts
- [ ] Configure fail2ban for SSH
- [ ] Regular security updates
- [ ] Enable 2FA for admin accounts
- [ ] Audit logs enabled

---

## 📈 Scaling

### Horizontal Scaling

```yaml
# docker-compose.yml
backend:
  deploy:
    replicas: 3
```

### Load Balancing

Use Nginx upstream with multiple backend instances:

```nginx
upstream backend {
    server backend:8000;
    server backend:8001;
    server backend:8002;
}
```

### Database Optimization

```sql
-- Create indexes
CREATE INDEX idx_trades_symbol ON trades(symbol);
CREATE INDEX idx_trades_event_time ON trades(event_time);
CREATE INDEX idx_orderbook_symbol ON orderbook_snapshots(symbol);
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :8000

# Kill process
kill -9 <PID>
```

### Database Connection Error

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Verify connection
docker-compose exec postgres psql -U qf_user -d quantum_flow -c "SELECT 1"
```

### Redis Connection Error

```bash
# Check Redis logs
docker-compose logs redis

# Test connection
docker-compose exec redis redis-cli ping
```

---

## 📞 Support

- GitHub Issues: https://github.com/yourusername/quantum-flow-terminal/issues
- Documentation: https://your-domain.com/docs
- Email: support@your-domain.com

# Mark Your Fish - Production Deployment Guide

## Overview
This guide covers deploying Mark Your Fish to production server **3.150.5.33** with domain **markyourfish.com**.

## Prerequisites
- Server with Ubuntu 20.04+ at IP 3.150.5.33
- Domain markyourfish.com pointed to 3.150.5.33
- SSH access to the server
- Git repository access

## Quick Start

### 1. Initial Server Setup (One-time)
```bash
# On your production server (3.150.5.33)
sudo apt update && sudo apt install -y git
git clone <your-repo-url> /opt/markyourfish
cd /opt/markyourfish
sudo ./setup-server.sh
```

### 2. Configure Environment Variables
Edit production environment files with your actual values:
```bash
# Server environment
sudo nano /opt/markyourfish/.env.production

# Client environment  
sudo nano /opt/markyourfish/client/.env.production
```

**Critical settings to update:**
- JWT secrets (generate secure random strings)
- Database passwords
- Stripe API keys (use live keys)
- AWS S3 credentials
- Email service API keys
- Weather API keys

### 3. Deploy Application
```bash
# From your local machine or CI/CD
./deploy.sh
```

## Deployment Scripts

### `setup-server.sh` - Initial Server Setup
**Purpose:** Sets up the production server from scratch

**What it does:**
- ✅ Installs Docker & Docker Compose
- ✅ Configures Nginx reverse proxy
- ✅ Sets up SSL certificates (Let's Encrypt)
- ✅ Configures firewall (UFW)
- ✅ Creates deployment directories
- ✅ Sets up automated backups
- ✅ Configures systemd services

**Usage:**
```bash
sudo ./setup-server.sh
```

### `deploy.sh` - Application Deployment
**Purpose:** Deploys latest code with zero downtime

**What it does:**
- ✅ **Always backs up database first** (your requirement!)
- ✅ Pulls latest code from git
- ✅ Builds Docker containers
- ✅ Performs health checks
- ✅ Rolls back on failure

**Usage:**
```bash
# Normal deployment
./deploy.sh

# Skip backup (not recommended)
./deploy.sh --no-backup

# Force deployment (ignore git checks)
./deploy.sh --force

# Rollback to previous backup
./deploy.sh --rollback
```

## Architecture

### Production Stack
```
Internet → Nginx (443/80) → Docker Network
                           ├── Frontend (Vue.js) :3000
                           ├── Backend (Node.js) :3001  
                           ├── Database (PostgreSQL) :5432
                           └── Cache (Redis) :6379
```

### Domain Configuration
- **Frontend:** https://markyourfish.com/
- **API:** https://markyourfish.com/api/
- **Health Check:** https://markyourfish.com/health
- **Uploads:** https://markyourfish.com/uploads/

### SSL/Security
- ✅ Let's Encrypt SSL certificates
- ✅ HTTPS redirect
- ✅ Security headers
- ✅ Rate limiting
- ✅ Firewall configuration

## Environment Files

### `.env.production` (Server)
```env
NODE_ENV=production
DATABASE_URL=postgresql://myf_user:myf_password@postgres:5432/markyourfish
CLIENT_URL=https://markyourfish.com
JWT_SECRET=<generate-secure-secret>
STRIPE_SECRET_KEY=sk_live_<your-live-key>
# ... other production values
```

### `client/.env.production` (Frontend)
```env
VITE_API_URL=https://markyourfish.com/api
VITE_STRIPE_PUBLIC_KEY=pk_live_<your-live-key>
# ... other production values
```

## Monitoring & Maintenance

### Logs
```bash
# Application logs
docker-compose -f /opt/markyourfish/docker-compose.production.yml logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u markyourfish.service -f
```

### Database Backups
```bash
# Manual backup
sudo systemctl start markyourfish-backup

# View backup files
ls -la /opt/backups/markyourfish/

# Restore from backup (emergency)
./deploy.sh --rollback
```

### Service Management
```bash
# Check status
sudo systemctl status markyourfish

# Restart application
sudo systemctl restart markyourfish

# View Docker containers
docker ps

# Update SSL certificates
sudo certbot renew
```

## Troubleshooting

### Common Issues

**1. SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew --force-renewal

# Restart nginx
sudo systemctl restart nginx
```

**2. Docker Issues**
```bash
# Check container status
docker-compose -f /opt/markyourfish/docker-compose.production.yml ps

# View container logs
docker-compose -f /opt/markyourfish/docker-compose.production.yml logs <service>

# Restart specific service
docker-compose -f /opt/markyourfish/docker-compose.production.yml restart <service>
```

**3. Database Connection Issues**
```bash
# Check PostgreSQL container
docker exec -it myf-postgres-prod psql -U myf_user -d markyourfish

# Check database connectivity from app
docker exec -it myf-server-prod npm run db:check
```

**4. Permission Issues**
```bash
# Fix deployment directory permissions
sudo chown -R root:root /opt/markyourfish
sudo chmod -R 755 /opt/markyourfish

# Fix nginx permissions
sudo nginx -t
sudo systemctl restart nginx
```

### Health Checks
```bash
# Test website
curl -I https://markyourfish.com

# Test API
curl -I https://markyourfish.com/api/health

# Test database connection
docker exec myf-postgres-prod pg_isready -U myf_user
```

## Security Considerations

### Production Secrets
- 🔒 Use strong, unique JWT secrets
- 🔒 Use live Stripe keys (not test keys)
- 🔒 Enable 2FA on all service accounts
- 🔒 Regularly rotate API keys
- 🔒 Monitor access logs

### Backup Strategy
- ✅ Daily automated database backups
- ✅ Keeps last 10 backups
- ✅ Compressed storage
- ✅ Pre-deployment backups
- ✅ Easy rollback capability

### Monitoring
- 📊 Server resource monitoring
- 📊 Application performance monitoring
- 📊 Database performance monitoring
- 📊 SSL certificate expiration alerts

## Support

### Emergency Contacts
- **Primary:** Your contact information
- **Backup:** Secondary contact
- **Hosting:** Server provider support

### Useful Resources
- [Docker Documentation](https://docs.docker.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Remember:** Always backup before making changes! 🎣
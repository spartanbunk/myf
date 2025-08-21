# 🎣 Mark Your Fish - Production Deployment

## Quick Deployment to markyourfish.com (3.150.5.33)

### 🚀 One-Command Deployment

```bash
# Deploy to production (automatically backs up database first)
./deploy.sh
```

### 🔧 First-Time Server Setup

```bash
# On production server (3.150.5.33) - run once
sudo ./setup-server.sh
```

## 📋 Pre-Deployment Checklist

### 1. Update Environment Variables
Edit these files with your production values:

**Server Environment (`.env.production`):**
```bash
nano .env.production
```
- ✏️ Change `JWT_SECRET` to a secure random string
- ✏️ Update `STRIPE_SECRET_KEY` to your live Stripe key
- ✏️ Add your AWS S3 credentials
- ✏️ Add your email service API key
- ✏️ Add your weather API key

**Client Environment (`client/.env.production`):**
```bash
nano client/.env.production
```
- ✏️ Update `VITE_STRIPE_PUBLIC_KEY` to your live Stripe public key
- ✏️ Add your production Firebase credentials (if using)
- ✏️ Add your Google Analytics ID

### 2. DNS Configuration
Ensure `markyourfish.com` points to `3.150.5.33`:
```bash
# Check DNS resolution
dig markyourfish.com
```

### 3. Test Configuration
```bash
# Run pre-deployment tests
./test-deployment.sh
```

## 🔄 Deployment Commands

### First-Time Deployment (Restore Your Data)
```bash
# List available backups in git
./list-backups.sh

# Deploy with your existing database backup
./deploy.sh --restore-from-git "./database_backup_20250820_221541.sql"
```

### Normal Deployment
```bash
./deploy.sh
```
**What it does:**
1. ✅ Backs up database automatically (your requirement!)
2. ✅ Pulls latest code from git
3. ✅ Builds Docker containers
4. ✅ Performs health checks
5. ✅ Rolls back on failure

### Advanced Options
```bash
# Skip database backup (not recommended)
./deploy.sh --no-backup

# Force deployment (ignore git status)
./deploy.sh --force

# Rollback to previous backup
./deploy.sh --rollback

# Restore from specific git backup file
./deploy.sh --restore-from-git "backups/db_backup_20250821_000137.sql"
```

## 🆘 Emergency Procedures

### Quick Rollback
```bash
./deploy.sh --rollback
```

### Check Application Status
```bash
# On production server
systemctl status markyourfish
docker ps
```

### View Logs
```bash
# Application logs
docker-compose -f docker-compose.production.yml logs

# Nginx logs  
tail -f /var/log/nginx/error.log
```

### Manual Database Backup
```bash
# On production server
systemctl start markyourfish-backup
```

## 🌐 URLs After Deployment

- **Website:** https://markyourfish.com
- **API:** https://markyourfish.com/api/health
- **Admin:** https://markyourfish.com/admin (admin users only)

## 📞 Support

If deployment fails, check:
1. DNS points to 3.150.5.33
2. Environment variables are set correctly
3. SSL certificates are valid
4. Docker containers are running

**Need help?** Check `/var/log/markyourfish-deploy.log` on the server.

---

**Remember:** The deployment script always backs up your database before making changes! 🎣
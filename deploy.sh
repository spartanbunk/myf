#!/bin/bash

# Mark Your Fish - Production Deployment Script
# Deploy to: 3.150.5.33 (markyourfish.com)
# Author: Auto-generated deployment script
# Usage: ./deploy.sh [--no-backup] [--rollback] [--force]

set -e  # Exit on any error

# Configuration
PRODUCTION_HOST="3.150.5.33"
PRODUCTION_USER="root"
DEPLOY_DIR="/opt/markyourfish"
BACKUP_DIR="/opt/backups/markyourfish"
LOG_FILE="/var/log/markyourfish-deploy.log"
MAX_BACKUPS=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
SKIP_BACKUP=false
ROLLBACK=false
FORCE_DEPLOY=false
RESTORE_FROM_GIT=false
GIT_BACKUP_FILE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --rollback)
            ROLLBACK=true
            shift
            ;;
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        --restore-from-git)
            RESTORE_FROM_GIT=true
            GIT_BACKUP_FILE="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--no-backup] [--rollback] [--force] [--restore-from-git <backup-file>]"
            exit 1
            ;;
    esac
done

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if we can connect to production server
check_server_connection() {
    log "Checking connection to production server..."
    
    if ! ssh -o ConnectTimeout=10 -o BatchMode=yes "$PRODUCTION_USER@$PRODUCTION_HOST" "echo 'Connected successfully'" &>/dev/null; then
        error "Cannot connect to production server $PRODUCTION_HOST. Please check SSH access."
    fi
    
    success "Successfully connected to production server"
}

# Restore database from git backup file
restore_from_git_backup() {
    if [ "$RESTORE_FROM_GIT" != true ]; then
        return
    fi

    log "Restoring database from git backup: $GIT_BACKUP_FILE"
    
    # Check if backup file exists locally
    if [ ! -f "$GIT_BACKUP_FILE" ]; then
        error "Backup file not found: $GIT_BACKUP_FILE"
    fi
    
    # Copy backup file to production server and restore
    scp "$GIT_BACKUP_FILE" "$PRODUCTION_USER@$PRODUCTION_HOST:/tmp/restore_backup.sql"
    
    ssh "$PRODUCTION_USER@$PRODUCTION_HOST" "
        set -e
        
        log 'Stopping application containers...'
        cd $DEPLOY_DIR
        docker-compose -f docker-compose.production.yml down || true
        
        log 'Starting PostgreSQL container...'
        docker-compose -f docker-compose.production.yml up -d postgres
        
        # Wait for PostgreSQL to be ready
        sleep 10
        
        log 'Dropping and recreating database...'
        docker exec myf-postgres-prod psql -U myf_user -d postgres -c 'DROP DATABASE IF EXISTS markyourfish;'
        docker exec myf-postgres-prod psql -U myf_user -d postgres -c 'CREATE DATABASE markyourfish;'
        
        log 'Restoring database from backup...'
        docker exec -i myf-postgres-prod psql -U myf_user -d markyourfish < /tmp/restore_backup.sql
        
        log 'Running database migrations...'
        docker-compose -f docker-compose.production.yml up -d server
        sleep 10
        docker exec myf-server-prod npm run migrate || echo 'No additional migrations to run'
        
        # Clean up temporary file
        rm -f /tmp/restore_backup.sql
        
        echo 'Database restore from git backup completed'
    "
    
    if [ $? -eq 0 ]; then
        success "Database restored from git backup: $GIT_BACKUP_FILE"
    else
        error "Database restore from git backup failed"
    fi
}

# Backup database on production server
backup_database() {
    if [ "$SKIP_BACKUP" = true ]; then
        warning "Skipping database backup (--no-backup flag used)"
        return
    fi

    log "Creating database backup on production server..."
    
    ssh "$PRODUCTION_USER@$PRODUCTION_HOST" "
        set -e
        
        # Create backup directory if it doesn't exist
        mkdir -p $BACKUP_DIR
        
        # Generate backup filename with timestamp
        BACKUP_FILE=\"$BACKUP_DIR/markyourfish_\$(date +%Y%m%d_%H%M%S).sql\"
        
        # Create database backup using docker
        if docker ps | grep -q myf-postgres-prod; then
            docker exec myf-postgres-prod pg_dump -U myf_user -d markyourfish > \"\$BACKUP_FILE\"
        else
            echo 'ERROR: PostgreSQL container not running'
            exit 1
        fi
        
        # Compress backup
        gzip \"\$BACKUP_FILE\"
        
        echo \"Database backup created: \$BACKUP_FILE.gz\"
        
        # Clean up old backups (keep last $MAX_BACKUPS)
        cd $BACKUP_DIR
        ls -t markyourfish_*.sql.gz | tail -n +\$((MAX_BACKUPS + 1)) | xargs -r rm
        
        echo \"Backup cleanup completed\"
    "
    
    if [ $? -eq 0 ]; then
        success "Database backup completed successfully"
    else
        error "Database backup failed"
    fi
}

# Deploy application
deploy_application() {
    log "Starting application deployment..."
    
    # Get current git commit hash for reference
    CURRENT_COMMIT=$(git rev-parse --short HEAD)
    
    ssh "$PRODUCTION_USER@$PRODUCTION_HOST" "
        set -e
        
        # Navigate to deployment directory
        cd $DEPLOY_DIR
        
        # Pull latest code from git
        echo 'Pulling latest code from repository...'
        git fetch origin
        git reset --hard origin/master
        
        # Show what changed
        echo 'Recent changes:'
        git log --oneline -5
        
        # Copy production environment files
        if [ ! -f .env.production ]; then
            echo 'ERROR: .env.production not found!'
            exit 1
        fi
        cp .env.production .env
        
        if [ ! -f client/.env.production ]; then
            echo 'ERROR: client/.env.production not found!'
            exit 1
        fi
        cp client/.env.production client/.env
        
        # Enable nginx site configuration
        ln -sf /etc/nginx/sites-available/markyourfish.com /etc/nginx/sites-enabled/
        
        # Test nginx configuration
        nginx -t || exit 1
        
        # Build and deploy with docker-compose
        echo 'Building and starting containers...'
        docker-compose -f docker-compose.production.yml down || true
        docker-compose -f docker-compose.production.yml build --no-cache
        docker-compose -f docker-compose.production.yml up -d
        
        # Wait for services to be ready
        echo 'Waiting for services to start...'
        sleep 30
        
        # Health check
        echo 'Performing health checks...'
        
        # Check if containers are running
        if ! docker-compose -f docker-compose.production.yml ps | grep -q 'Up'; then
            echo 'ERROR: Some containers failed to start'
            docker-compose -f docker-compose.production.yml logs
            exit 1
        fi
        
        # Check API health endpoint
        if ! curl -f http://localhost/health &>/dev/null; then
            echo 'ERROR: API health check failed'
            exit 1
        fi
        
        # Check frontend
        if ! curl -f http://localhost/ &>/dev/null; then
            echo 'ERROR: Frontend health check failed'
            exit 1
        fi
        
        echo 'Health checks passed'
        
        # Reload nginx
        nginx -s reload
        
        # Run database migrations if needed
        echo 'Running database migrations...'
        docker exec myf-server-prod npm run migrate || echo 'No migrations to run'
        
        echo 'Deployment completed successfully'
        echo 'Deployed commit: $CURRENT_COMMIT'
    "
    
    if [ $? -eq 0 ]; then
        success "Application deployment completed successfully"
        log "Deployed commit: $CURRENT_COMMIT"
    else
        error "Application deployment failed"
    fi
}

# Rollback to previous backup
rollback() {
    log "Starting rollback process..."
    
    ssh "$PRODUCTION_USER@$PRODUCTION_HOST" "
        set -e
        
        cd $BACKUP_DIR
        
        # Find latest backup
        LATEST_BACKUP=\$(ls -t markyourfish_*.sql.gz 2>/dev/null | head -n1)
        
        if [ -z \"\$LATEST_BACKUP\" ]; then
            echo 'ERROR: No backup files found for rollback'
            exit 1
        fi
        
        echo \"Rolling back to backup: \$LATEST_BACKUP\"
        
        # Stop containers
        cd $DEPLOY_DIR
        docker-compose -f docker-compose.production.yml down
        
        # Restore database
        gunzip -c \"$BACKUP_DIR/\$LATEST_BACKUP\" | docker exec -i myf-postgres-prod psql -U myf_user -d markyourfish
        
        # Restart containers
        docker-compose -f docker-compose.production.yml up -d
        
        echo 'Rollback completed'
    "
    
    if [ $? -eq 0 ]; then
        success "Rollback completed successfully"
    else
        error "Rollback failed"
    fi
}

# Pre-deployment checks
pre_deployment_checks() {
    log "Running pre-deployment checks..."
    
    # Check if git repo is clean
    if [ -n "$(git status --porcelain)" ] && [ "$FORCE_DEPLOY" = false ]; then
        error "Git repository has uncommitted changes. Commit changes or use --force flag."
    fi
    
    # Check if we're on master branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "master" ] && [ "$FORCE_DEPLOY" = false ]; then
        error "Not on master branch. Switch to master or use --force flag."
    fi
    
    # Check if production environment files exist
    if [ ! -f ".env.production" ]; then
        error "Production environment file (.env.production) not found"
    fi
    
    if [ ! -f "client/.env.production" ]; then
        error "Client production environment file (client/.env.production) not found"
    fi
    
    success "Pre-deployment checks passed"
}

# Post-deployment verification
post_deployment_verification() {
    log "Running post-deployment verification..."
    
    # Wait a bit for services to stabilize
    sleep 10
    
    # Test website availability
    if curl -f -s "https://markyourfish.com" > /dev/null; then
        success "Website is accessible at https://markyourfish.com"
    else
        warning "Website might not be accessible yet. Check DNS and SSL configuration."
    fi
    
    # Test API endpoint
    if curl -f -s "https://markyourfish.com/api/health" > /dev/null; then
        success "API is responding correctly"
    else
        warning "API health check failed"
    fi
}

# Main execution
main() {
    log "Starting Mark Your Fish deployment to $PRODUCTION_HOST"
    
    if [ "$ROLLBACK" = true ]; then
        rollback
        return
    fi
    
    pre_deployment_checks
    check_server_connection
    
    # Restore from git backup if requested (typically for initial deployment)
    restore_from_git_backup
    
    # Only backup current DB if we're not restoring from git
    if [ "$RESTORE_FROM_GIT" != true ]; then
        backup_database
    fi
    
    deploy_application
    post_deployment_verification
    
    success "🎣 Mark Your Fish deployment completed successfully!"
    log "Website: https://markyourfish.com"
    log "Deployment completed at $(date)"
}

# Run main function
main "$@"
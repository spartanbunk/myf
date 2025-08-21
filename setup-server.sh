#!/bin/bash

# Mark Your Fish - Production Server Setup Script
# Server IP: 3.150.5.33
# Domain: markyourfish.com
# This script sets up the production server from scratch

set -e  # Exit on any error

# Configuration
DOMAIN="markyourfish.com"
EMAIL="admin@markyourfish.com"  # Change this to your email
DEPLOY_DIR="/opt/markyourfish"
BACKUP_DIR="/opt/backups/markyourfish"
LOG_FILE="/var/log/markyourfish-setup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        error "This script must be run as root. Use: sudo $0"
    fi
}

# Update system packages
update_system() {
    log "Updating system packages..."
    
    apt update
    apt upgrade -y
    apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    
    success "System packages updated"
}

# Install Docker and Docker Compose
install_docker() {
    log "Installing Docker and Docker Compose..."
    
    # Remove old Docker installations
    apt-get remove -y docker docker-engine docker.io containerd runc || true
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Install Docker Compose (standalone)
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    # Add current user to docker group
    usermod -aG docker $SUDO_USER || true
    
    success "Docker and Docker Compose installed"
}

# Install and configure Nginx
install_nginx() {
    log "Installing and configuring Nginx..."
    
    apt install -y nginx
    
    # Enable and start Nginx
    systemctl enable nginx
    systemctl start nginx
    
    # Create nginx directories
    mkdir -p /etc/nginx/sites-available
    mkdir -p /etc/nginx/sites-enabled
    mkdir -p /etc/nginx/ssl
    
    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    success "Nginx installed and configured"
}

# Install Certbot for SSL certificates
install_certbot() {
    log "Installing Certbot for SSL certificates..."
    
    apt install -y certbot python3-certbot-nginx
    
    success "Certbot installed"
}

# Configure firewall
configure_firewall() {
    log "Configuring firewall..."
    
    # Install UFW if not installed
    apt install -y ufw
    
    # Reset UFW to defaults
    ufw --force reset
    
    # Default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH (important!)
    ufw allow ssh
    ufw allow 22/tcp
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow Docker daemon (if needed for remote access)
    # ufw allow 2376/tcp
    
    # Enable firewall
    ufw --force enable
    
    success "Firewall configured"
}

# Create deployment directory and clone repository
setup_deployment_directory() {
    log "Setting up deployment directory..."
    
    # Create directories
    mkdir -p "$DEPLOY_DIR"
    mkdir -p "$BACKUP_DIR"
    
    # Clone repository
    cd "$DEPLOY_DIR"
    
    # Check if .git directory exists
    if [ ! -d ".git" ]; then
        log "Cloning repository..."
        # You'll need to replace this with your actual repository URL
        read -p "Enter your git repository URL: " REPO_URL
        git clone "$REPO_URL" .
    else
        log "Repository already exists, pulling latest changes..."
        git pull origin master
    fi
    
    # Set proper permissions
    chown -R root:root "$DEPLOY_DIR"
    chmod -R 755 "$DEPLOY_DIR"
    
    # Create log directory
    mkdir -p /var/log/markyourfish
    
    success "Deployment directory set up"
}

# Generate SSL certificates
setup_ssl() {
    log "Setting up SSL certificates for $DOMAIN..."
    
    # Check if domain resolves to this server
    DOMAIN_IP=$(dig +short "$DOMAIN" | tail -n1)
    SERVER_IP=$(curl -s http://ifconfig.me)
    
    if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
        warning "Domain $DOMAIN does not resolve to this server IP ($SERVER_IP). Please update DNS records first."
        warning "Current domain IP: $DOMAIN_IP"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            return
        fi
    fi
    
    # Temporarily start Nginx with basic config for Certbot
    cat > /etc/nginx/sites-available/temp-ssl << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 200 'Server setup in progress...';
        add_header Content-Type text/plain;
    }
}
EOF
    
    ln -sf /etc/nginx/sites-available/temp-ssl /etc/nginx/sites-enabled/temp-ssl
    nginx -t && systemctl reload nginx
    
    # Obtain SSL certificate
    certbot certonly --nginx -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive
    
    if [ $? -eq 0 ]; then
        success "SSL certificates obtained successfully"
        
        # Copy certificates to nginx ssl directory
        mkdir -p /etc/nginx/ssl/$DOMAIN
        cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/nginx/ssl/$DOMAIN/
        cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /etc/nginx/ssl/$DOMAIN/
        cp /etc/letsencrypt/live/$DOMAIN/chain.pem /etc/nginx/ssl/$DOMAIN/
        
        # Set up auto-renewal
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --hook 'systemctl reload nginx'") | crontab -
        
    else
        warning "SSL certificate generation failed. You can try again later manually."
    fi
    
    # Remove temporary config
    rm -f /etc/nginx/sites-enabled/temp-ssl
}

# Configure systemd services
setup_systemd_services() {
    log "Setting up systemd services..."
    
    # Create systemd service for the application
    cat > /etc/systemd/system/markyourfish.service << EOF
[Unit]
Description=Mark Your Fish Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.production.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.production.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    
    # Create systemd timer for database backups
    cat > /etc/systemd/system/markyourfish-backup.service << EOF
[Unit]
Description=Mark Your Fish Database Backup
Requires=markyourfish.service
After=markyourfish.service

[Service]
Type=oneshot
User=root
WorkingDirectory=$DEPLOY_DIR
ExecStart=/bin/bash -c 'mkdir -p $BACKUP_DIR && docker exec myf-postgres-prod pg_dump -U myf_user -d markyourfish | gzip > $BACKUP_DIR/markyourfish_\$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz'
EOF
    
    cat > /etc/systemd/system/markyourfish-backup.timer << EOF
[Unit]
Description=Run Mark Your Fish backup daily
Requires=markyourfish-backup.service

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
EOF
    
    # Enable services
    systemctl daemon-reload
    systemctl enable markyourfish.service
    systemctl enable markyourfish-backup.timer
    systemctl start markyourfish-backup.timer
    
    success "Systemd services configured"
}

# Configure log rotation
setup_log_rotation() {
    log "Setting up log rotation..."
    
    cat > /etc/logrotate.d/markyourfish << EOF
/var/log/markyourfish/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}

/var/log/markyourfish-*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF
    
    success "Log rotation configured"
}

# Final setup instructions
show_final_instructions() {
    log "Server setup completed! Here are the next steps:"
    
    echo
    echo -e "${GREEN}🎣 Mark Your Fish Server Setup Complete!${NC}"
    echo
    echo -e "${BLUE}Next Steps:${NC}"
    echo "1. Update your DNS records to point $DOMAIN to this server (3.150.5.33)"
    echo "2. Update production environment files with your actual API keys:"
    echo "   - Edit $DEPLOY_DIR/.env.production"
    echo "   - Edit $DEPLOY_DIR/client/.env.production"
    echo "3. Run the deployment script: cd $DEPLOY_DIR && ./deploy.sh"
    echo
    echo -e "${BLUE}Important Files:${NC}"
    echo "- Application: $DEPLOY_DIR"
    echo "- Backups: $BACKUP_DIR"
    echo "- Logs: /var/log/markyourfish/"
    echo "- Nginx config: /etc/nginx/sites-available/markyourfish.com"
    echo "- SSL certificates: /etc/nginx/ssl/$DOMAIN/"
    echo
    echo -e "${BLUE}Useful Commands:${NC}"
    echo "- Deploy: cd $DEPLOY_DIR && ./deploy.sh"
    echo "- View logs: docker-compose -f $DEPLOY_DIR/docker-compose.production.yml logs"
    echo "- Restart app: systemctl restart markyourfish"
    echo "- Check status: systemctl status markyourfish"
    echo "- Manual backup: systemctl start markyourfish-backup"
    echo
    echo -e "${GREEN}Happy fishing! 🐟${NC}"
}

# Main execution
main() {
    log "Starting Mark Your Fish server setup..."
    
    check_root
    update_system
    install_docker
    install_nginx
    install_certbot
    configure_firewall
    setup_deployment_directory
    setup_ssl
    setup_systemd_services
    setup_log_rotation
    show_final_instructions
    
    success "Server setup completed successfully!"
}

# Run main function
main "$@"
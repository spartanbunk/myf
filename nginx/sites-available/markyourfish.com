# Mark Your Fish - Production Configuration
# Domain: markyourfish.com
# Server IP: 3.150.5.33

# Upstream backends
upstream api_backend {
    server myf-server-prod:3001;
    keepalive 32;
}

upstream client_backend {
    server myf-client-prod:3000;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name markyourfish.com www.markyourfish.com;
    
    # Let's Encrypt challenge location
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Redirect all HTTP to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS - Main Site
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name markyourfish.com www.markyourfish.com;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/markyourfish.com/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/markyourfish.com/privkey.pem;
    ssl_trusted_certificate /etc/nginx/ssl/markyourfish.com/chain.pem;

    # SSL Security Settings
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client Max Body Size (for file uploads)
    client_max_body_size 10M;

    # API Routes
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://api_backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Auth endpoints with stricter rate limiting
    location /api/auth/ {
        limit_req zone=login burst=5 nodelay;
        
        proxy_pass http://api_backend/auth/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://api_backend/health;
        access_log off;
    }

    # Static file uploads (with caching)
    location /uploads/ {
        proxy_pass http://api_backend/uploads/;
        proxy_cache_valid 200 1h;
        expires 1h;
        add_header Cache-Control "public, no-transform";
    }

    # Frontend Application (fallback to index.html for SPA)
    location / {
        proxy_pass http://client_backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # SPA fallback
        try_files $uri $uri/ @fallback;
    }

    # SPA fallback for Vue Router
    location @fallback {
        proxy_pass http://client_backend/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security - Block access to sensitive files
    location ~ /\.(htaccess|htpasswd|env) {
        deny all;
        return 404;
    }

    # Block access to backup and log files
    location ~ \.(bak|backup|log|sql|tar|gz)$ {
        deny all;
        return 404;
    }
}
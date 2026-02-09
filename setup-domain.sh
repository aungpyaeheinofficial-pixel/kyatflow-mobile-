#!/bin/bash

# Automated Domain Setup Script for KyatFlow
# Usage: sudo bash setup-domain.sh

set -e

DOMAIN="kyatflow.it.com"
VPS_IP="167.172.90.182"
FRONTEND_PATH="/var/www/kyatflow"
BACKEND_PATH="/var/www/html/kyatflow-mobile-/backend"
PROJECT_PATH="/var/www/html/kyatflow-mobile-"

echo "🌐 Setting up domain: $DOMAIN"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (use sudo)"
    exit 1
fi

# Step 1: Check DNS
echo "1️⃣ Checking DNS configuration..."
DNS_IP=$(dig +short $DOMAIN | tail -n1)

if [ -z "$DNS_IP" ]; then
    echo "⚠️  DNS not resolving yet. Please configure DNS first:"
    echo "   Add A record: $DOMAIN → $VPS_IP"
    echo "   Then wait 5-30 minutes and run this script again"
    exit 1
elif [ "$DNS_IP" != "$VPS_IP" ]; then
    echo "⚠️  DNS points to $DNS_IP, expected $VPS_IP"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ DNS correctly points to $VPS_IP"
fi

# Step 2: Install Nginx (if not installed)
echo ""
echo "2️⃣ Checking Nginx..."
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    apt update
    apt install -y nginx
else
    echo "✅ Nginx is installed"
fi

# Step 3: Configure Nginx
echo ""
echo "3️⃣ Configuring Nginx for domain..."
cat > /etc/nginx/sites-available/kyatflow <<'EOF'
server {
    listen 80;
    server_name kyatflow.it.com www.kyatflow.it.com;

    root /var/www/kyatflow;
    index index.html;

    # MIME types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Frontend routes - SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend
    location /api {
        proxy_pass http://localhost:9800/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/kyatflow /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload
if nginx -t; then
    systemctl reload nginx
    echo "✅ Nginx configured"
else
    echo "❌ Nginx configuration error!"
    exit 1
fi

# Step 4: Install SSL
echo ""
echo "4️⃣ Setting up SSL certificate..."
if ! command -v certbot &> /dev/null; then
    echo "Installing Certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

echo ""
read -p "Install SSL certificate? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --register-unsafely-without-email --redirect
    echo "✅ SSL certificate installed"
else
    echo "⏭️  Skipping SSL installation"
fi

# Step 5: Configure Firewall
echo ""
echo "5️⃣ Configuring firewall..."
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp
    ufw allow 443/tcp
    echo "✅ Firewall configured"
else
    echo "⚠️  UFW not installed, skipping firewall configuration"
fi

# Step 6: Update Frontend .env
echo ""
echo "6️⃣ Updating frontend environment..."
if [ -d "$PROJECT_PATH" ]; then
    cd "$PROJECT_PATH"
    
    # Detect protocol (https if SSL installed, http otherwise)
    PROTOCOL="https"
    if ! certbot certificates | grep -q "$DOMAIN"; then
        PROTOCOL="http"
    fi
    
    cat > .env <<EOF
VITE_API_URL=${PROTOCOL}://${DOMAIN}/api
VITE_APP_NAME=KyatFlow
EOF
    
    echo "✅ Frontend .env updated: VITE_API_URL=${PROTOCOL}://${DOMAIN}/api"
    echo ""
    read -p "Rebuild frontend now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Building frontend..."
        npm run build
        rm -rf "$FRONTEND_PATH"/*
        cp -r dist/* "$FRONTEND_PATH"/
        chown -R www-data:www-data "$FRONTEND_PATH"
        echo "✅ Frontend rebuilt and deployed"
    else
        echo "⏭️  Skipping rebuild. Run manually:"
        echo "   cd $PROJECT_PATH"
        echo "   npm run build"
        echo "   sudo cp -r dist/* $FRONTEND_PATH/"
    fi
else
    echo "⚠️  Frontend path not found: $PROJECT_PATH"
fi

# Step 7: Update Backend .env
echo ""
echo "7️⃣ Updating backend environment..."
if [ -d "$BACKEND_PATH" ]; then
    cd "$BACKEND_PATH"
    
    PROTOCOL="https"
    if ! certbot certificates | grep -q "$DOMAIN"; then
        PROTOCOL="http"
    fi
    
    # Update FRONTEND_URL
    if grep -q "FRONTEND_URL" .env 2>/dev/null; then
        sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=${PROTOCOL}://${DOMAIN}|" .env
    else
        echo "FRONTEND_URL=${PROTOCOL}://${DOMAIN}" >> .env
    fi
    
    # Update NODE_ENV if not set
    if ! grep -q "NODE_ENV=production" .env 2>/dev/null; then
        if grep -q "NODE_ENV" .env; then
            sed -i "s/NODE_ENV=.*/NODE_ENV=production/" .env
        else
            echo "NODE_ENV=production" >> .env
        fi
    fi
    
    echo "✅ Backend .env updated"
    echo ""
    read -p "Restart backend? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pm2 restart kyatflow-backend || echo "⚠️  Backend not running in PM2"
        echo "✅ Backend restarted"
    fi
else
    echo "⚠️  Backend path not found: $BACKEND_PATH"
fi

# Summary
echo ""
echo "✅ Domain setup complete!"
echo ""
echo "📋 Summary:"
echo "   Domain: $DOMAIN"
echo "   Frontend URL: ${PROTOCOL}://${DOMAIN}"
echo "   API URL: ${PROTOCOL}://${DOMAIN}/api"
echo ""
echo "🧪 Test commands:"
echo "   curl -I ${PROTOCOL}://${DOMAIN}"
echo "   curl ${PROTOCOL}://${DOMAIN}/api/health"
echo ""
echo "📝 Next steps:"
echo "   1. Wait for DNS propagation (if just changed)"
echo "   2. Visit: ${PROTOCOL}://${DOMAIN}"
echo "   3. Check browser console for errors"
echo "   4. Test login/registration"


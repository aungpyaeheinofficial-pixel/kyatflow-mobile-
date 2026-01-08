#!/bin/bash

# Quick fix for Nginx configuration syntax error

set -e

echo "🔧 Fixing Nginx Configuration..."

# Backup current config
if [ -f /etc/nginx/sites-available/kyatflow ]; then
    sudo cp /etc/nginx/sites-available/kyatflow /etc/nginx/sites-available/kyatflow.backup
    echo "✅ Backup created: kyatflow.backup"
fi

# Write correct configuration
sudo tee /etc/nginx/sites-available/kyatflow > /dev/null <<'EOF'
server {
    listen 3555;
    server_name _;  # Listen on all server names/IPs

    root /var/www/kyatflow;
    index index.html;
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Frontend routes - SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

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

echo "✅ Configuration file updated"

# Test configuration
echo "🧪 Testing Nginx configuration..."
if sudo nginx -t; then
    echo "✅ Configuration is valid"
    
    # Reload Nginx
    echo "🔄 Reloading Nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx reloaded successfully"
    
    # Check status
    echo "📊 Nginx status:"
    sudo systemctl status nginx --no-pager -l | head -15
    
    echo ""
    echo "✅ Fixed! Nginx should now be working correctly."
    echo "🌐 Test with: curl http://localhost:3555"
else
    echo "❌ Configuration still has errors!"
    echo "Please check the error message above."
    exit 1
fi


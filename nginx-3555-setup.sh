#!/bin/bash

# KyatFlow Frontend Nginx Setup Script for Port 3555
# Run with: sudo bash nginx-3555-setup.sh

set -e

echo "🚀 Setting up Nginx for KyatFlow Frontend on Port 3555..."

# 1. Install Nginx (if not installed)
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing Nginx..."
    sudo apt update
    sudo apt install -y nginx
    echo "✅ Nginx installed"
else
    echo "✅ Nginx is already installed"
fi

# 2. Create directory for frontend files
echo "📁 Creating directory for frontend files..."
sudo mkdir -p /var/www/kyatflow
sudo chown -R $USER:$USER /var/www/kyatflow
echo "✅ Directory created at /var/www/kyatflow"

# 3. Create Nginx configuration
echo "📝 Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/kyatflow > /dev/null <<'EOF'
server {
    listen 3555;
    server_name _;  # Listen on all server names/IPs (change to your IP if needed)

    root /var/www/kyatflow;
    index index.html;

    # MIME types (ensure CSS/JS are served with correct types)
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
echo "✅ Nginx configuration created"

# 4. Enable site
echo "🔗 Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/kyatflow /etc/nginx/sites-enabled/

# 5. Remove default site (optional)
read -p "Remove default Nginx site? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo rm -f /etc/nginx/sites-enabled/default
    echo "✅ Default site removed"
fi

# 6. Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
sudo nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
else
    echo "❌ Nginx configuration has errors!"
    exit 1
fi

# 7. Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx
echo "✅ Nginx reloaded"

# 8. Check Nginx status
echo "📊 Nginx status:"
sudo systemctl status nginx --no-pager -l

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Build your frontend: npm run build"
echo "2. Copy build files: sudo cp -r dist/* /var/www/kyatflow/"
echo "3. Set permissions: sudo chown -R www-data:www-data /var/www/kyatflow"
echo "4. Test: curl http://localhost:3555"
echo "5. Update frontend .env: VITE_API_URL=http://your-ip:9800/api"
echo ""
echo "🌐 Frontend will be available at: http://your-server-ip:3555"


#!/bin/bash

# Complete Frontend Deployment Script for Nginx Port 3555

set -e

echo "🚀 Deploying KyatFlow Frontend to Nginx (Port 3555)..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 1. Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Are you in the project root?${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found project root${NC}"

# 2. Install dependencies (if needed)
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# 3. Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist
echo -e "${GREEN}✅ Cleaned${NC}"

# 4. Build for production
echo "🔨 Building for production..."
npm run build

if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ Build failed! dist/index.html not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"

# 5. Check build output
echo ""
echo "📋 Build output:"
ls -lh dist/ | head -10
echo ""
if [ -d "dist/assets" ]; then
    echo "📦 Assets folder:"
    ls -lh dist/assets/ | head -5
else
    echo -e "${YELLOW}⚠️  Warning: dist/assets folder not found${NC}"
fi

# 6. Create Nginx directory
echo ""
echo "📁 Setting up Nginx directory..."
sudo mkdir -p /var/www/kyatflow
echo -e "${GREEN}✅ Directory created${NC}"

# 7. Copy files
echo "📋 Copying files to Nginx directory..."
sudo rm -rf /var/www/kyatflow/*
sudo cp -r dist/* /var/www/kyatflow/
echo -e "${GREEN}✅ Files copied${NC}"

# 8. Set permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data /var/www/kyatflow
sudo chmod -R 755 /var/www/kyatflow
sudo find /var/www/kyatflow -type f -exec chmod 644 {} \;
sudo find /var/www/kyatflow -type d -exec chmod 755 {} \;
echo -e "${GREEN}✅ Permissions set${NC}"

# 9. Verify files
echo ""
echo "✅ Verifying deployment..."
if [ -f "/var/www/kyatflow/index.html" ]; then
    echo -e "${GREEN}✅ index.html exists${NC}"
    echo "First few lines of index.html:"
    head -5 /var/www/kyatflow/index.html
else
    echo -e "${RED}❌ ERROR: index.html not found in /var/www/kyatflow/${NC}"
    exit 1
fi

# 10. Check/Update Nginx configuration
echo ""
echo "⚙️  Checking Nginx configuration..."
if [ ! -f "/etc/nginx/sites-available/kyatflow" ]; then
    echo "📝 Creating Nginx configuration..."
    sudo tee /etc/nginx/sites-available/kyatflow > /dev/null <<'EOF'
server {
    listen 3555;
    server_name _;

    root /var/www/kyatflow;
    index index.html;

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
    echo -e "${GREEN}✅ Nginx configuration created${NC}"
else
    echo -e "${GREEN}✅ Nginx configuration exists${NC}"
fi

# 11. Enable site
echo "🔗 Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/kyatflow /etc/nginx/sites-enabled/
echo -e "${GREEN}✅ Site enabled${NC}"

# 12. Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors!${NC}"
    sudo nginx -t
    exit 1
fi

# 13. Reload Nginx
echo "🔄 Reloading Nginx..."
sudo systemctl reload nginx
echo -e "${GREEN}✅ Nginx reloaded${NC}"

# 14. Check if port is listening
echo ""
echo "🔍 Checking port 3555..."
sleep 2
if sudo netstat -tlnp 2>/dev/null | grep :3555 > /dev/null || sudo ss -tlnp 2>/dev/null | grep :3555 > /dev/null; then
    echo -e "${GREEN}✅ Port 3555 is listening${NC}"
else
    echo -e "${YELLOW}⚠️  Port 3555 might not be listening yet${NC}"
fi

# 15. Test locally
echo ""
echo "🧪 Testing locally..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3555 || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Frontend is accessible (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Frontend returned HTTP $HTTP_CODE${NC}"
    echo "Checking response:"
    curl -I http://localhost:3555 2>&1 | head -10
fi

# 16. Show file count
echo ""
echo "📊 Deployment summary:"
echo "   Files in /var/www/kyatflow:"
FILE_COUNT=$(sudo find /var/www/kyatflow -type f | wc -l)
echo "   Total files: $FILE_COUNT"

echo ""
echo -e "${GREEN}✅ Frontend deployment complete!${NC}"
echo ""
echo "🌐 Access your frontend at:"
echo "   http://167.172.90.182:3555"
echo ""
echo "📋 Next steps:"
echo "   1. Check browser console (F12) for any JavaScript errors"
echo "   2. Verify .env file has: VITE_API_URL=http://167.172.90.182:9800/api"
echo "   3. Rebuild if you changed .env: npm run build && sudo bash deploy-frontend.sh"
echo ""
echo "🔍 Troubleshooting:"
echo "   - Check logs: sudo tail -f /var/log/nginx/error.log"
echo "   - Test: curl http://localhost:3555"
echo "   - Verify files: ls -la /var/www/kyatflow/"


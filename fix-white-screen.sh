#!/bin/bash

# Comprehensive White Screen Fix Script

set -e

echo "🔍 Diagnosing White Screen Issue..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd /var/www/html/kyatflow-mobile- || exit

# 1. Check if project exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Not in project directory${NC}"
    exit 1
fi

echo "1️⃣ Checking build status..."
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo -e "${YELLOW}⚠️  dist folder doesn't exist or is incomplete${NC}"
    echo "Building frontend..."
    npm run build
else
    echo -e "${GREEN}✅ Build exists${NC}"
fi

# 2. Check built index.html
echo ""
echo "2️⃣ Checking built index.html..."
if [ -f "dist/index.html" ]; then
    echo "First 50 lines of dist/index.html:"
    head -50 dist/index.html
    echo ""
    
    # Check if script tags are correct (should NOT have /src/main.tsx)
    if grep -q "/src/main.tsx" dist/index.html; then
        echo -e "${RED}❌ ERROR: Built index.html still has dev paths!${NC}"
        echo "This means the build didn't complete properly."
        echo "Rebuilding..."
        rm -rf dist
        npm run build
    else
        echo -e "${GREEN}✅ Built index.html looks correct${NC}"
    fi
    
    # Check if script tags exist
    if grep -q "<script" dist/index.html; then
        echo -e "${GREEN}✅ Script tags found in built HTML${NC}"
        echo "Script tags:"
        grep -o '<script[^>]*>' dist/index.html
    else
        echo -e "${RED}❌ ERROR: No script tags found!${NC}"
    fi
else
    echo -e "${RED}❌ dist/index.html not found!${NC}"
    exit 1
fi

# 3. Check assets
echo ""
echo "3️⃣ Checking assets..."
if [ -d "dist/assets" ]; then
    ASSET_COUNT=$(find dist/assets -type f | wc -l)
    echo -e "${GREEN}✅ Assets folder exists with $ASSET_COUNT files${NC}"
    echo "Sample assets:"
    ls -lh dist/assets/ | head -10
else
    echo -e "${RED}❌ Assets folder missing!${NC}"
fi

# 4. Deploy to Nginx
echo ""
echo "4️⃣ Deploying to Nginx..."
sudo mkdir -p /var/www/kyatflow
sudo rm -rf /var/www/kyatflow/*
sudo cp -r dist/* /var/www/kyatflow/
sudo chown -R www-data:www-data /var/www/kyatflow
sudo chmod -R 755 /var/www/kyatflow
echo -e "${GREEN}✅ Files deployed${NC}"

# 5. Verify deployed files
echo ""
echo "5️⃣ Verifying deployment..."
if [ -f "/var/www/kyatflow/index.html" ]; then
    echo -e "${GREEN}✅ index.html deployed${NC}"
    echo "Checking deployed index.html script tags:"
    grep -o '<script[^>]*>' /var/www/kyatflow/index.html || echo "No script tags found!"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    exit 1
fi

# 6. Check Nginx
echo ""
echo "6️⃣ Checking Nginx..."
if [ -f "/etc/nginx/sites-available/kyatflow" ]; then
    echo -e "${GREEN}✅ Nginx config exists${NC}"
    sudo nginx -t && echo -e "${GREEN}✅ Config is valid${NC}" || echo -e "${RED}❌ Config has errors${NC}"
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded${NC}"
else
    echo -e "${RED}❌ Nginx config missing!${NC}"
fi

# 7. Test
echo ""
echo "7️⃣ Testing..."
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3555 2>/dev/null || echo "000")
echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Server responding${NC}"
    echo ""
    echo "Testing HTML content:"
    curl -s http://localhost:3555 | head -30
else
    echo -e "${RED}❌ Server returned $HTTP_CODE${NC}"
    echo "Nginx error log:"
    sudo tail -20 /var/log/nginx/error.log
fi

echo ""
echo "📋 Diagnosis complete!"
echo ""
echo "🔧 Next steps if still white screen:"
echo "1. Open browser console (F12)"
echo "2. Check Console tab for JavaScript errors"
echo "3. Check Network tab - are JS/CSS files loading? (404 errors?)"
echo "4. Right-click page → View Page Source"
echo "5. Check if script tags point to correct asset paths"


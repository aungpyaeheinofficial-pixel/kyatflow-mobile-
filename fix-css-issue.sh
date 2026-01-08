#!/bin/bash

# Fix CSS Missing Issue - Comprehensive Fix Script

set -e

echo "🔧 Fixing CSS Missing Issue..."
echo ""

cd /var/www/html/kyatflow-mobile- || exit

# 1. Pull latest fixes
echo "1️⃣ Pulling latest fixes..."
git pull

# 2. Clean build
echo ""
echo "2️⃣ Cleaning old build..."
rm -rf dist node_modules/.vite

# 3. Rebuild
echo ""
echo "3️⃣ Rebuilding frontend..."
npm run build

# 4. Verify build output
echo ""
echo "4️⃣ Verifying build output..."
if [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed - index.html not found!"
    exit 1
fi

echo "Checking index.html for CSS link..."
if grep -q '<link.*stylesheet' dist/index.html; then
    echo "✅ CSS link found in index.html"
    grep '<link.*stylesheet' dist/index.html
elif grep -q '<style>' dist/index.html; then
    echo "⚠️  CSS is inline (style tag), checking if it has content..."
    STYLE_LENGTH=$(grep -o '<style>.*</style>' dist/index.html | wc -c)
    if [ "$STYLE_LENGTH" -lt 100 ]; then
        echo "❌ CSS seems to be empty or minimal!"
    else
        echo "✅ CSS is inline with content"
    fi
else
    echo "❌ NO CSS FOUND in index.html!"
    echo ""
    echo "Full index.html content:"
    cat dist/index.html
    exit 1
fi

# 5. Check CSS files
echo ""
echo "5️⃣ Checking CSS files..."
CSS_FILES=$(find dist/assets -name "*.css" 2>/dev/null | wc -l)
if [ "$CSS_FILES" -gt 0 ]; then
    echo "✅ Found $CSS_FILES CSS file(s):"
    find dist/assets -name "*.css" -exec ls -lh {} \;
else
    echo "⚠️  No separate CSS files found (might be inline)"
fi

# 6. Deploy to Nginx
echo ""
echo "6️⃣ Deploying to Nginx..."
sudo rm -rf /var/www/kyatflow/*
sudo cp -r dist/* /var/www/kyatflow/
sudo chown -R www-data:www-data /var/www/kyatflow
sudo find /var/www/kyatflow -type f -exec chmod 644 {} \;
sudo find /var/www/kyatflow -type d -exec chmod 755 {} \;
echo "✅ Files deployed"

# 7. Verify deployment
echo ""
echo "7️⃣ Verifying deployment..."
if [ -f "/var/www/kyatflow/index.html" ]; then
    echo "✅ index.html deployed"
    echo ""
    echo "Deployed index.html content:"
    sudo head -40 /var/www/kyatflow/index.html
else
    echo "❌ Deployment failed!"
    exit 1
fi

# 8. Test with curl
echo ""
echo "8️⃣ Testing HTTP response..."
sleep 2
HTTP_CODE=$(curl -s -o /tmp/kyatflow-test.html -w "%{http_code}" http://localhost:3555 2>/dev/null || echo "000")
echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Server responding"
    echo ""
    echo "First 50 lines of served HTML:"
    head -50 /tmp/kyatflow-test.html
    echo ""
    echo "Checking for CSS in served HTML:"
    if grep -q '<link.*stylesheet' /tmp/kyatflow-test.html; then
        echo "✅ CSS link found in served HTML"
        grep '<link.*stylesheet' /tmp/kyatflow-test.html
    elif grep -q '<style>' /tmp/kyatflow-test.html; then
        echo "✅ Inline CSS found in served HTML"
        grep -o '<style>.*</style>' /tmp/kyatflow-test.html | head -c 200
        echo "..."
    else
        echo "❌ NO CSS in served HTML!"
    fi
else
    echo "❌ Server returned $HTTP_CODE"
    echo "Nginx error log:"
    sudo tail -20 /var/log/nginx/error.log
fi

echo ""
echo "✅ Fix process complete!"
echo ""
echo "📋 If still showing white screen:"
echo "1. Check browser console (F12) for errors"
echo "2. Check Network tab - are CSS files loading?"
echo "3. Verify Nginx config: sudo nginx -t"
echo "4. Check Nginx access log: sudo tail -f /var/log/nginx/access.log"


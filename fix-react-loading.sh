#!/bin/bash

# Fix React Loading Order - Disable manual chunking to let Vite handle dependencies

set -e

echo "🔧 Fixing React Loading Issue..."
echo ""

cd /var/www/html/kyatflow-mobile- || exit

# 1. Pull latest fixes
echo "1️⃣ Pulling latest fixes..."
git pull

# 2. Clean everything
echo ""
echo "2️⃣ Cleaning old build and cache..."
rm -rf dist node_modules/.vite .vite

# 3. Rebuild with automatic chunking
echo ""
echo "3️⃣ Rebuilding with automatic dependency resolution..."
npm run build

# 4. Verify build
echo ""
echo "4️⃣ Verifying build..."
if [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Check if chunks were created
echo ""
echo "Checking build output..."
if [ -d "dist/assets/js" ]; then
    JS_COUNT=$(find dist/assets/js -type f | wc -l)
    echo "✅ Found $JS_COUNT JS file(s)"
    ls -lh dist/assets/js/ | head -10
fi

# 5. Check HTML for proper script ordering
echo ""
echo "5️⃣ Verifying script loading order..."
echo "Script tags in index.html:"
grep -o '<script[^>]*>' dist/index.html

# 6. Deploy
echo ""
echo "6️⃣ Deploying to Nginx..."
sudo rm -rf /var/www/kyatflow/*
sudo cp -r dist/* /var/www/kyatflow/
sudo chown -R www-data:www-data /var/www/kyatflow
sudo find /var/www/kyatflow -type f -exec chmod 644 {} \;
sudo find /var/www/kyatflow -type d -exec chmod 755 {} \;
echo "✅ Files deployed"

# 7. Test
echo ""
echo "7️⃣ Testing..."
sleep 2
HTTP_CODE=$(curl -s -o /tmp/kyatflow-test.html -w "%{http_code}" http://localhost:3555 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Server responding (HTTP $HTTP_CODE)"
    echo ""
    echo "📋 Next steps:"
    echo "1. Open http://your-ip:3555 in browser"
    echo "2. Open DevTools Console (F12)"
    echo "3. Check if React errors are gone"
    echo ""
    echo "If still errors, check:"
    echo "- Network tab: Are all chunks loading (200 status)?"
    echo "- Console: Any new error messages?"
else
    echo "❌ Server returned HTTP $HTTP_CODE"
    echo "Check Nginx logs: sudo tail -20 /var/log/nginx/error.log"
fi

echo ""
echo "✅ Fix complete!"


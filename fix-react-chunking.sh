#!/bin/bash

# Fix React Chunking Issue - Ensure React loads before other dependencies

set -e

echo "🔧 Fixing React Chunking Issue..."
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
echo "3️⃣ Rebuilding frontend with fixed chunking..."
npm run build

# 4. Verify build
echo ""
echo "4️⃣ Verifying build..."
if [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Check chunk files
echo ""
echo "Checking chunks..."
if [ -d "dist/assets/js" ]; then
    echo "✅ JS chunks created:"
    ls -lh dist/assets/js/ | grep -E "(vendor-react|vendor|index)"
    
    # Check if vendor-react exists (React must be in separate chunk)
    if ls dist/assets/js/vendor-react-*.js 1> /dev/null 2>&1; then
        echo "✅ vendor-react chunk exists (React is separated)"
    else
        echo "⚠️  vendor-react chunk not found - React might be in main bundle"
    fi
    
    # Check if there's a vendor chunk (should not conflict)
    if ls dist/assets/js/vendor-*.js 1> /dev/null 2>&1; then
        echo "✅ Vendor chunks found"
    fi
fi

# 5. Check HTML for script loading order
echo ""
echo "5️⃣ Checking script loading order in index.html..."
echo "Script tags in order:"
grep -o '<script[^>]*>' dist/index.html

# Vite should automatically order scripts correctly, but verify
VENDOR_REACT_LINE=$(grep -n 'vendor-react' dist/index.html | cut -d: -f1 || echo "")
INDEX_LINE=$(grep -n 'index-' dist/index.html | cut -d: -f1 || echo "")

if [ -n "$VENDOR_REACT_LINE" ] && [ -n "$INDEX_LINE" ]; then
    if [ "$VENDOR_REACT_LINE" -lt "$INDEX_LINE" ]; then
        echo "✅ React chunk loads before index (correct order)"
    else
        echo "⚠️  React chunk loads after index (might cause issues)"
    fi
fi

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
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3555 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Server responding (HTTP $HTTP_CODE)"
    echo ""
    echo "📋 Test in browser:"
    echo "1. Open http://your-ip:3555"
    echo "2. Open DevTools (F12)"
    echo "3. Check Console for errors"
    echo "4. Check Network tab - verify chunks load in order"
else
    echo "❌ Server returned HTTP $HTTP_CODE"
fi

echo ""
echo "✅ Fix complete!"
echo ""
echo "If still white screen, check browser console for:"
echo "- React errors"
echo "- Chunk loading errors"
echo "- Module not found errors"


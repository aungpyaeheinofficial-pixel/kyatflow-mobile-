#!/bin/bash

# Verify Build Script - Check if CSS and JS are properly built

set -e

cd /var/www/html/kyatflow-mobile- || exit

echo "🔍 Verifying Build Output..."
echo ""

# 1. Check if dist exists
if [ ! -d "dist" ]; then
    echo "❌ dist folder not found! Run 'npm run build' first"
    exit 1
fi

# 2. Check index.html
echo "1️⃣ Checking index.html..."
if [ -f "dist/index.html" ]; then
    echo "✅ index.html exists"
    echo ""
    echo "📄 Full index.html content:"
    cat dist/index.html
    echo ""
    echo ""
    
    # Check for CSS link
    if grep -q '<link.*stylesheet' dist/index.html; then
        echo "✅ CSS link tag found"
        grep '<link.*stylesheet' dist/index.html
    else
        echo "❌ CSS link tag NOT FOUND in index.html!"
        echo "This is the problem - CSS is not being included"
    fi
    
    # Check for script tag
    if grep -q '<script' dist/index.html; then
        echo "✅ Script tag found"
        grep '<script' dist/index.html
    else
        echo "❌ Script tag NOT FOUND!"
    fi
else
    echo "❌ dist/index.html not found!"
    exit 1
fi

# 3. Check CSS files
echo ""
echo "2️⃣ Checking CSS files..."
if [ -d "dist/assets/css" ]; then
    CSS_COUNT=$(find dist/assets/css -type f | wc -l)
    echo "✅ CSS folder exists with $CSS_COUNT files"
    ls -lh dist/assets/css/
elif [ -d "dist/assets" ]; then
    CSS_FILES=$(find dist/assets -name "*.css" | wc -l)
    if [ "$CSS_FILES" -gt 0 ]; then
        echo "✅ Found $CSS_FILES CSS file(s) in assets"
        find dist/assets -name "*.css" -exec ls -lh {} \;
    else
        echo "❌ No CSS files found in dist/assets/"
    fi
else
    echo "❌ dist/assets folder not found!"
fi

# 4. Check JS files
echo ""
echo "3️⃣ Checking JS files..."
if [ -d "dist/assets/js" ]; then
    JS_COUNT=$(find dist/assets/js -type f | wc -l)
    echo "✅ JS folder exists with $JS_COUNT files"
    ls -lh dist/assets/js/ | head -5
else
    echo "❌ dist/assets/js folder not found!"
fi

# 5. Check for inline CSS
echo ""
echo "4️⃣ Checking for inline CSS in index.html..."
if grep -q '<style>' dist/index.html; then
    echo "✅ Found inline CSS in index.html"
    grep -o '<style>.*</style>' dist/index.html | head -c 200
    echo "..."
else
    echo "⚠️  No inline CSS found (CSS should be in separate file or inline)"
fi

echo ""
echo "📋 Summary:"
echo "If CSS link is missing, the build might be inlining CSS or there's a build issue."
echo "Try rebuilding: npm run build"


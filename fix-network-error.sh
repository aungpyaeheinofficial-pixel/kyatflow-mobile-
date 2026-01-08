#!/bin/bash

# Fix Network Error - Check Backend Connection and Configuration

set -e

echo "🔍 Diagnosing Network Error..."
echo ""

cd /var/www/html/kyatflow-mobile- || exit

# 1. Check if backend is running
echo "1️⃣ Checking if backend is running..."
if pm2 list | grep -q "kyatflow-backend.*online"; then
    echo "✅ Backend is running"
    pm2 list | grep kyatflow-backend
else
    echo "❌ Backend is NOT running!"
    echo "Start it with: cd backend && pm2 start ecosystem.config.js"
    exit 1
fi

# 2. Test backend health endpoint
echo ""
echo "2️⃣ Testing backend health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://localhost:9800/health 2>/dev/null || echo "ERROR")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$HEALTH_RESPONSE" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Backend is responding (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
else
    echo "❌ Backend health check failed (HTTP $HTTP_CODE)"
    echo "Response: $BODY"
    echo ""
    echo "Check backend logs: pm2 logs kyatflow-backend"
    exit 1
fi

# 3. Check frontend .env file
echo ""
echo "3️⃣ Checking frontend .env file..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"
    if grep -q "VITE_API_URL" .env; then
        echo "✅ VITE_API_URL is set:"
        grep "VITE_API_URL" .env
        API_URL=$(grep "VITE_API_URL" .env | cut -d= -f2)
        echo ""
        echo "Testing API URL: $API_URL"
        
        # Test the API endpoint
        if [[ "$API_URL" == *"localhost"* ]] || [[ "$API_URL" == *"127.0.0.1"* ]]; then
            echo "⚠️  Using localhost - this won't work from browser!"
            echo "Change to your VPS IP: 167.172.90.182"
        fi
    else
        echo "❌ VITE_API_URL not found in .env!"
        echo "Add: VITE_API_URL=http://167.172.90.182:9800/api"
    fi
else
    echo "❌ .env file not found!"
    echo "Creating .env file..."
    cat > .env <<EOF
VITE_API_URL=http://167.172.90.182:9800/api
VITE_APP_NAME=KyatFlow
EOF
    echo "✅ Created .env file"
fi

# 4. Check backend CORS configuration
echo ""
echo "4️⃣ Checking backend CORS configuration..."
if [ -f "backend/.env" ]; then
    if grep -q "FRONTEND_URL" backend/.env; then
        echo "✅ FRONTEND_URL is set:"
        grep "FRONTEND_URL" backend/.env
        FRONTEND_URL=$(grep "FRONTEND_URL" backend/.env | cut -d= -f2)
        
        if [[ "$FRONTEND_URL" != *"167.172.90.182:3555"* ]] && [[ "$FRONTEND_URL" != *"localhost:3555"* ]]; then
            echo "⚠️  FRONTEND_URL might not match your frontend URL"
            echo "Should be: http://167.172.90.182:3555"
        fi
    else
        echo "❌ FRONTEND_URL not found in backend/.env!"
        echo "Add: FRONTEND_URL=http://167.172.90.182:3555"
    fi
else
    echo "⚠️  backend/.env not found"
fi

# 5. Test API endpoint directly
echo ""
echo "5️⃣ Testing API login endpoint..."
LOGIN_TEST=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:9800/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' 2>/dev/null || echo "ERROR")
LOGIN_HTTP=$(echo "$LOGIN_TEST" | grep "HTTP_CODE" | cut -d: -f2)
LOGIN_BODY=$(echo "$LOGIN_TEST" | grep -v "HTTP_CODE")

if [ "$LOGIN_HTTP" = "401" ] || [ "$LOGIN_HTTP" = "400" ]; then
    echo "✅ API endpoint is accessible (HTTP $LOGIN_HTTP - expected for invalid credentials)"
    echo "Response: $LOGIN_BODY"
elif [ "$LOGIN_HTTP" = "200" ]; then
    echo "✅ API endpoint is working (HTTP $LOGIN_HTTP)"
else
    echo "❌ API endpoint test failed (HTTP $LOGIN_HTTP)"
    echo "Response: $LOGIN_BODY"
fi

# 6. Check if frontend needs rebuild
echo ""
echo "6️⃣ Checking if frontend needs rebuild..."
if [ ! -f "dist/index.html" ]; then
    echo "⚠️  Frontend not built - need to rebuild after .env changes"
    REBUILD_NEEDED=true
else
    # Check if .env was modified after last build
    if [ ".env" -nt "dist/index.html" ]; then
        echo "⚠️  .env was modified after last build - need to rebuild"
        REBUILD_NEEDED=true
    else
        echo "✅ Frontend is built"
        REBUILD_NEEDED=false
    fi
fi

# 7. Summary and fixes
echo ""
echo "📋 Summary:"
echo "==========="

if [ "$REBUILD_NEEDED" = "true" ]; then
    echo ""
    echo "🔧 Fix: Rebuild frontend with updated .env"
    echo ""
    echo "Run these commands:"
    echo "  rm -rf dist"
    echo "  npm run build"
    echo "  sudo rm -rf /var/www/kyatflow/*"
    echo "  sudo cp -r dist/* /var/www/kyatflow/"
    echo "  sudo chown -R www-data:www-data /var/www/kyatflow"
else
    echo ""
    echo "✅ Configuration looks good!"
    echo ""
    echo "If still getting network error:"
    echo "1. Check browser console (F12) for CORS errors"
    echo "2. Check Network tab - what URL is being called?"
    echo "3. Verify backend is accessible: curl http://167.172.90.182:9800/health"
    echo "4. Check firewall: sudo ufw status"
fi

echo ""
echo "📝 Quick Fix Commands:"
echo "====================="
echo ""
echo "# Update frontend .env"
echo "echo 'VITE_API_URL=http://167.172.90.182:9800/api' > .env"
echo ""
echo "# Update backend .env"
echo "echo 'FRONTEND_URL=http://167.172.90.182:3555' >> backend/.env"
echo ""
echo "# Restart backend"
echo "pm2 restart kyatflow-backend"
echo ""
echo "# Rebuild frontend"
echo "npm run build && sudo cp -r dist/* /var/www/kyatflow/"


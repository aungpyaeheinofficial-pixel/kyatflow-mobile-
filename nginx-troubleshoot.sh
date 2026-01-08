#!/bin/bash

# KyatFlow Nginx Troubleshooting Script

echo "🔍 Troubleshooting KyatFlow Frontend on Port 3555..."
echo ""

# 1. Check if Nginx is running
echo "1. Checking Nginx status..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx is not running"
    echo "   Starting Nginx..."
    sudo systemctl start nginx
fi

# 2. Check if port 3555 is listening
echo ""
echo "2. Checking if port 3555 is listening..."
if sudo netstat -tlnp | grep :3555 > /dev/null || sudo ss -tlnp | grep :3555 > /dev/null; then
    echo "✅ Port 3555 is listening"
    sudo netstat -tlnp | grep :3555 || sudo ss -tlnp | grep :3555
else
    echo "❌ Port 3555 is NOT listening"
fi

# 3. Check if directory exists
echo ""
echo "3. Checking /var/www/kyatflow directory..."
if [ -d "/var/www/kyatflow" ]; then
    echo "✅ Directory exists"
    echo "   Files in directory:"
    ls -la /var/www/kyatflow/ | head -10
    echo ""
    if [ -f "/var/www/kyatflow/index.html" ]; then
        echo "✅ index.html exists"
    else
        echo "❌ index.html NOT found!"
    fi
else
    echo "❌ Directory /var/www/kyatflow does not exist"
fi

# 4. Check Nginx configuration
echo ""
echo "4. Checking Nginx configuration..."
if [ -f "/etc/nginx/sites-available/kyatflow" ]; then
    echo "✅ Configuration file exists"
    echo "   Configuration content:"
    cat /etc/nginx/sites-available/kyatflow
else
    echo "❌ Configuration file NOT found"
fi

# 5. Check if site is enabled
echo ""
echo "5. Checking if site is enabled..."
if [ -L "/etc/nginx/sites-enabled/kyatflow" ]; then
    echo "✅ Site is enabled"
else
    echo "❌ Site is NOT enabled"
    echo "   Run: sudo ln -s /etc/nginx/sites-available/kyatflow /etc/nginx/sites-enabled/"
fi

# 6. Test Nginx configuration
echo ""
echo "6. Testing Nginx configuration..."
sudo nginx -t

# 7. Check Nginx error logs
echo ""
echo "7. Recent Nginx error logs:"
sudo tail -20 /var/log/nginx/error.log

# 8. Check Nginx access logs
echo ""
echo "8. Recent Nginx access logs:"
sudo tail -10 /var/log/nginx/access.log

# 9. Check permissions
echo ""
echo "9. Checking permissions..."
ls -la /var/www/kyatflow/ | head -5

# 10. Test curl
echo ""
echo "10. Testing with curl..."
curl -I http://localhost:3555 2>&1 | head -10

echo ""
echo "✅ Troubleshooting complete!"


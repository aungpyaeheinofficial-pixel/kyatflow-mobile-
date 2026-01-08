# Quick Fix for White Screen - Step by Step

## Run These Commands on Your VPS (In Order)

```bash
cd /var/www/html/kyatflow-mobile-

# 1. Pull latest fixes
git pull

# 2. Make scripts executable
chmod +x fix-white-screen.sh deploy-frontend.sh

# 3. Run the comprehensive fix script
sudo bash fix-white-screen.sh
```

## If Script Doesn't Work - Manual Steps

### Step 1: Verify Build

```bash
cd /var/www/html/kyatflow-mobile-

# Clean and rebuild
rm -rf dist node_modules/.vite
npm run build

# Check what was built
ls -la dist/
cat dist/index.html | grep -E "(script|link)" | head -10
```

**Expected output:** You should see `<script>` tags pointing to `/assets/js/...` files, NOT `/src/main.tsx`

### Step 2: Check if Files Exist

```bash
# Check built files
ls -la dist/assets/js/ 2>/dev/null || echo "Assets folder missing!"

# Count files
find dist -type f | wc -l
```

**Should show:** Multiple JS and CSS files in `dist/assets/`

### Step 3: Deploy Files

```bash
# Remove old files
sudo rm -rf /var/www/kyatflow/*

# Copy new files
sudo cp -r dist/* /var/www/kyatflow/

# Set permissions
sudo chown -R www-data:www-data /var/www/kyatflow
sudo find /var/www/kyatflow -type f -exec chmod 644 {} \;
sudo find /var/www/kyatflow -type d -exec chmod 755 {} \;
```

### Step 4: Verify Deployment

```bash
# Check files are there
sudo ls -la /var/www/kyatflow/
sudo ls -la /var/www/kyatflow/assets/ 2>/dev/null || echo "Assets not deployed!"

# Check index.html content
sudo head -50 /var/www/kyatflow/index.html
```

### Step 5: Test Locally

```bash
# Test HTML is served
curl http://localhost:3555 | head -50

# Test if assets directory is accessible
curl -I http://localhost:3555/assets/

# Check what's actually being served
curl -v http://localhost:3555 2>&1 | grep -E "(HTTP|Content-Type|Location)"
```

## Browser Console Check

Open your browser (F12) and check:

1. **Console Tab:**
   - Any red error messages?
   - Look for: "Failed to load", "404", "CORS", "Module not found"

2. **Network Tab:**
   - Refresh the page
   - Look for files with status 404 (red)
   - Check if `index.html` loads (should be 200)
   - Check if JS/CSS files load (should be 200)

3. **Elements Tab:**
   - Check if `<div id="root"></div>` exists
   - Check if it's empty or has content

## Common Issues

### Issue: All files return 404

**Fix:** Nginx is not serving files correctly
```bash
# Check Nginx config
sudo cat /etc/nginx/sites-available/kyatflow

# Verify root path
sudo ls -la /var/www/kyatflow/

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

### Issue: index.html loads but JS files 404

**Fix:** Build didn't complete or files not copied
```bash
# Rebuild
npm run build

# Verify assets exist
ls -la dist/assets/js/

# Recopy
sudo cp -r dist/assets /var/www/kyatflow/
```

### Issue: CORS errors in console

**Fix:** Backend CORS configuration
```bash
# Check backend .env
cat backend/.env | grep FRONTEND_URL

# Should be:
# FRONTEND_URL=http://167.172.90.182:3555

# Restart backend
pm2 restart kyatflow-backend
```

### Issue: "Cannot GET /" or 404

**Fix:** Nginx SPA routing not working
```bash
# Check Nginx config has:
# location / {
#     try_files $uri $uri/ /index.html;
# }
```

## Complete Reset

If nothing works, try complete reset:

```bash
cd /var/www/html/kyatflow-mobile-

# 1. Clean everything
rm -rf dist node_modules/.vite
sudo rm -rf /var/www/kyatflow/*

# 2. Fresh install (if needed)
npm install

# 3. Build
npm run build

# 4. Verify build
ls -la dist/
cat dist/index.html | head -50

# 5. Deploy
sudo cp -r dist/* /var/www/kyatflow/
sudo chown -R www-data:www-data /var/www/kyatflow

# 6. Restart Nginx
sudo nginx -t
sudo systemctl reload nginx

# 7. Test
curl http://localhost:3555 | head -50
```

## Debug Output Needed

If still not working, run these and share output:

```bash
# 1. Check build
ls -la dist/ && echo "---" && cat dist/index.html | grep -E "script|link" | head -5

# 2. Check deployment
sudo ls -la /var/www/kyatflow/ | head -10

# 3. Check Nginx
sudo cat /etc/nginx/sites-available/kyatflow

# 4. Check Nginx logs
sudo tail -30 /var/log/nginx/error.log

# 5. Test response
curl -v http://localhost:3555 2>&1 | head -30
```


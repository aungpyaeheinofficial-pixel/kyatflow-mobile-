# Fix White Screen Issue - Troubleshooting Guide

## Quick Diagnosis Steps

### Step 1: Check if files are deployed

```bash
# Check if dist directory exists and has files
ls -la dist/

# Check if files were copied to Nginx directory
ls -la /var/www/kyatflow/
```

**Expected files:**
- `index.html`
- `assets/` directory with JS and CSS files

### Step 2: Check Nginx is serving files

```bash
# Check if Nginx can see the files
sudo ls -la /var/www/kyatflow/

# Test if Nginx can serve index.html
curl http://localhost:3555
```

### Step 3: Check browser console

Open browser developer tools (F12) and check:
- **Console tab**: Look for JavaScript errors
- **Network tab**: Check if files are loading (404 errors?)
- **Elements tab**: Check if `<div id="root"></div>` exists

## Common Fixes

### Fix 1: Rebuild and Deploy

```bash
cd /var/www/html/kyatflow-mobile-

# Clean previous build
rm -rf dist

# Rebuild
npm run build

# Check build output
ls -la dist/
ls -la dist/assets/

# Copy to Nginx directory
sudo rm -rf /var/www/kyatflow/*
sudo cp -r dist/* /var/www/kyatflow/
sudo chown -R www-data:www-data /var/www/kyatflow
sudo chmod -R 755 /var/www/kyatflow

# Restart Nginx
sudo systemctl reload nginx
```

### Fix 2: Check Nginx Configuration

Make sure `/etc/nginx/sites-available/kyatflow` has:

```nginx
server {
    listen 3555;
    server_name _;

    root /var/www/kyatflow;
    index index.html;

    # Important: SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # ... rest of config
}
```

### Fix 3: Check File Permissions

```bash
# Set correct permissions
sudo chown -R www-data:www-data /var/www/kyatflow
sudo chmod -R 755 /var/www/kyatflow
sudo find /var/www/kyatflow -type f -exec chmod 644 {} \;
sudo find /var/www/kyatflow -type d -exec chmod 755 {} \;
```

### Fix 4: Check if JavaScript files are loading

Open browser console (F12) and check Network tab:
- Look for 404 errors on `.js` files
- Check if files are being requested from correct path

### Fix 5: Base Path Issue

If JavaScript files aren't loading, check the build. The issue might be with base path.

```bash
# Rebuild with explicit base
npm run build

# Check the index.html in dist folder
cat dist/index.html
```

The script tags should have paths like:
```html
<script type="module" src="/assets/js/index-abc123.js"></script>
```

If paths are wrong, you may need to set base in vite.config.ts.

## Complete Reset and Deploy

```bash
# 1. Clean everything
cd /var/www/html/kyatflow-mobile-
rm -rf dist node_modules/.vite

# 2. Rebuild
npm run build

# 3. Verify build
ls -la dist/
cat dist/index.html | head -20

# 4. Clear Nginx directory
sudo rm -rf /var/www/kyatflow/*

# 5. Copy files
sudo cp -r dist/* /var/www/kyatflow/

# 6. Set permissions
sudo chown -R www-data:www-data /var/www/kyatflow
sudo chmod -R 755 /var/www/kyatflow

# 7. Verify files
sudo ls -la /var/www/kyatflow/
sudo cat /var/www/kyatflow/index.html | head -20

# 8. Test Nginx config
sudo nginx -t

# 9. Reload Nginx
sudo systemctl reload nginx

# 10. Test
curl -I http://localhost:3555
curl http://localhost:3555 | head -20
```

## Debug Checklist

- [ ] `dist/` folder exists and has files
- [ ] `dist/index.html` exists
- [ ] `dist/assets/` folder exists with JS/CSS files
- [ ] Files copied to `/var/www/kyatflow/`
- [ ] `index.html` exists in `/var/www/kyatflow/`
- [ ] Nginx configuration file exists
- [ ] Nginx site is enabled (symlink exists)
- [ ] Nginx configuration is valid (`nginx -t`)
- [ ] Nginx is running (`systemctl status nginx`)
- [ ] Port 3555 is listening (`netstat -tlnp | grep 3555`)
- [ ] Firewall allows port 3555
- [ ] File permissions are correct
- [ ] Browser console shows no JavaScript errors


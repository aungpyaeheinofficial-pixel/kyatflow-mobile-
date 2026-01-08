# Domain Setup Guide for KyatFlow on Digital Ocean VPS

This guide will help you connect `kyatflow.com` to your VPS at `167.172.90.182:3555`.

## Prerequisites

- ✅ Domain `kyatflow.com` registered
- ✅ Digital Ocean VPS running at `167.172.90.182`
- ✅ Root/sudo access to VPS
- ✅ Frontend running on port 3555
- ✅ Backend running on port 9800

## Step 1: Configure DNS Records

### Option A: Using Digital Ocean DNS (Recommended)

1. **Go to Digital Ocean Dashboard:**
   - Navigate to: https://cloud.digitalocean.com/networking/domains
   - Click "Add Domain"

2. **Add Your Domain:**
   - Domain name: `kyatflow.com`
   - IP Address: `167.172.90.182`
   - Click "Add Domain"

3. **DNS Records Will Be Created:**
   - `@` (A record) → `167.172.90.182`
   - `www` (CNAME) → `@` (optional)

### Option B: Using Your Domain Registrar

1. **Log into your domain registrar** (GoDaddy, Namecheap, etc.)

2. **Find DNS Management / Name Servers:**
   - Look for "DNS Settings" or "Name Servers"

3. **Add/Update DNS Records:**

   **If using registrar DNS:**
   ```
   Type: A
   Name: @ (or kyatflow.com)
   Value: 167.172.90.182
   TTL: 3600 (or default)

   Type: A
   Name: www
   Value: 167.172.90.182
   TTL: 3600
   ```

   **If using Digital Ocean Nameservers:**
   - Change nameservers to:
     ```
     ns1.digitalocean.com
     ns2.digitalocean.com
     ns3.digitalocean.com
     ```
   - Then add records in Digital Ocean as in Option A

### Verify DNS Propagation

```bash
# Check if DNS is resolving (wait 5-30 minutes after changes)
dig kyatflow.com
# OR
nslookup kyatflow.com

# Should show: 167.172.90.182
```

## Step 2: Configure Nginx for Domain

### Update Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/kyatflow
```

Replace with this configuration:

```nginx
server {
    listen 80;
    server_name kyatflow.com www.kyatflow.com;

    root /var/www/kyatflow;
    index index.html;

    # MIME types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Frontend routes - SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend
    location /api {
        proxy_pass http://localhost:9800/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers (if needed)
        add_header Access-Control-Allow-Origin * always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
        
        if ($request_method = OPTIONS) {
            return 204;
        }
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

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
```

### Test and Enable

```bash
# Test configuration
sudo nginx -t

# Enable site (if not already enabled)
sudo ln -sf /etc/nginx/sites-available/kyatflow /etc/nginx/sites-enabled/

# Remove default site (if exists)
sudo rm -f /etc/nginx/sites-enabled/default

# Reload Nginx
sudo systemctl reload nginx
```

### Keep Port 3555 Configuration (Optional)

If you want to keep port 3555 accessible, create a separate config:

```bash
sudo nano /etc/nginx/sites-available/kyatflow-port3555
```

```nginx
server {
    listen 3555;
    server_name _;

    root /var/www/kyatflow;
    index index.html;
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:9800/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -sf /etc/nginx/sites-available/kyatflow-port3555 /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Step 3: Install SSL Certificate (HTTPS)

### Install Certbot

```bash
# Update package list
sudo apt update

# Install certbot
sudo apt install -y certbot python3-certbot-nginx
```

### Get SSL Certificate

```bash
# Request certificate for your domain
sudo certbot --nginx -d kyatflow.com -d www.kyatflow.com

# Follow prompts:
# - Email: your@email.com
# - Agree to terms: Y
# - Share email: N (or Y)
# - Redirect HTTP to HTTPS: 2 (redirect)
```

Certbot will automatically:
- Get SSL certificate from Let's Encrypt
- Update Nginx configuration
- Set up auto-renewal

### Auto-Renewal Test

```bash
# Test auto-renewal
sudo certbot renew --dry-run
```

## Step 4: Update Environment Variables

### Frontend .env

```bash
cd /var/www/html/kyatflow-mobile-

# Update frontend .env
cat > .env <<EOF
VITE_API_URL=https://kyatflow.com/api
VITE_APP_NAME=KyatFlow
EOF

# Rebuild frontend
rm -rf dist
npm run build

# Deploy
sudo rm -rf /var/www/kyatflow/*
sudo cp -r dist/* /var/www/kyatflow/
sudo chown -R www-data:www-data /var/www/kyatflow
```

### Backend .env

```bash
cd /var/www/html/kyatflow-mobile-/backend

# Update backend .env
nano .env
```

Update these lines:
```env
FRONTEND_URL=https://kyatflow.com
NODE_ENV=production
```

```bash
# Restart backend
pm2 restart kyatflow-backend
```

## Step 5: Configure Firewall

```bash
# Allow HTTP (port 80)
sudo ufw allow 80/tcp

# Allow HTTPS (port 443)
sudo ufw allow 443/tcp

# Check firewall status
sudo ufw status
```

## Step 6: Update Backend CORS (If Using Direct API)

If your frontend calls `/api` directly through Nginx proxy, CORS should be handled by Nginx. But if you want backend to also handle it:

```bash
cd /var/www/html/kyatflow-mobile-/backend
nano .env
```

```env
FRONTEND_URL=https://kyatflow.com
```

Restart backend:
```bash
pm2 restart kyatflow-backend
```

## Step 7: Test Everything

### 1. Test Domain Resolution

```bash
# From your local machine
ping kyatflow.com
# Should resolve to 167.172.90.182
```

### 2. Test HTTP (should redirect to HTTPS)

```bash
curl -I http://kyatflow.com
# Should show redirect to https://
```

### 3. Test HTTPS

```bash
curl -I https://kyatflow.com
# Should return 200 OK
```

### 4. Test in Browser

- Open: `https://kyatflow.com`
- Should show login page
- No SSL warnings
- Check browser console (F12) for errors

### 5. Test API

```bash
# Test health endpoint
curl https://kyatflow.com/api/health

# Should return: {"status":"ok","timestamp":"..."}
```

## Step 8: Verify SSL Certificate

Visit: https://www.ssllabs.com/ssltest/analyze.html?d=kyatflow.com

Should show:
- ✅ A rating (A or A+)
- ✅ Certificate valid
- ✅ No vulnerabilities

## Troubleshooting

### DNS Not Resolving

```bash
# Check DNS propagation
dig kyatflow.com
nslookup kyatflow.com

# Wait up to 48 hours for full propagation
# Usually works within 30 minutes
```

### Nginx Not Serving Site

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t

# Check if site is enabled
ls -la /etc/nginx/sites-enabled/
```

### SSL Certificate Issues

```bash
# Check certificate
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check certificate expiration
sudo certbot certificates | grep Expiry
```

### Backend Not Accessible via /api

```bash
# Test backend directly
curl http://localhost:9800/health

# Test through Nginx
curl https://kyatflow.com/api/health

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Frontend Shows Network Error

1. Check browser console (F12)
2. Verify `VITE_API_URL` in built frontend:
   ```bash
   grep -r "VITE_API_URL" /var/www/kyatflow/
   # Should show: https://kyatflow.com/api
   ```
3. Rebuild frontend after changing .env
4. Check CORS in backend logs

## Final Checklist

- [ ] DNS records point to `167.172.90.182`
- [ ] `kyatflow.com` resolves to correct IP
- [ ] Nginx configured for domain (port 80/443)
- [ ] SSL certificate installed and valid
- [ ] Frontend .env updated with domain
- [ ] Frontend rebuilt and deployed
- [ ] Backend .env updated with domain
- [ ] Backend restarted
- [ ] Firewall allows ports 80 and 443
- [ ] `https://kyatflow.com` works
- [ ] `https://kyatflow.com/api/health` works
- [ ] Can login and use app

## Quick Commands Summary

```bash
# DNS Check
dig kyatflow.com

# Nginx Test & Reload
sudo nginx -t && sudo systemctl reload nginx

# SSL Certificate
sudo certbot --nginx -d kyatflow.com -d www.kyatflow.com

# Frontend Rebuild
cd /var/www/html/kyatflow-mobile-
npm run build && sudo cp -r dist/* /var/www/kyatflow/

# Backend Restart
pm2 restart kyatflow-backend

# Check Logs
sudo tail -f /var/log/nginx/error.log
pm2 logs kyatflow-backend
```

## Alternative: Subdomain Setup

If you want to keep main domain for something else:

**Setup `app.kyatflow.com`:**

1. Add DNS record:
   ```
   Type: A
   Name: app
   Value: 167.172.90.182
   ```

2. Update Nginx:
   ```nginx
   server_name app.kyatflow.com;
   ```

3. Update SSL:
   ```bash
   sudo certbot --nginx -d app.kyatflow.com
   ```

4. Update .env files to use `app.kyatflow.com`


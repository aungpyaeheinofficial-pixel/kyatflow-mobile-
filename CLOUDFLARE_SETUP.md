# Cloudflare Setup Guide for KyatFlow

Your domain `kyatflow.com` is using Cloudflare DNS. Follow these steps to configure it.

## Step 1: Update A Record in Cloudflare

1. **Go to Cloudflare Dashboard:**
   - Visit: https://dash.cloudflare.com
   - Login to your account
   - Select domain: `kyatflow.com`

2. **Navigate to DNS:**
   - Click "DNS" in the left sidebar
   - Or go to: https://dash.cloudflare.com → Select `kyatflow.com` → DNS

3. **Find and Edit A Record:**
   - Look for A record with:
     - Name: `@` or `kyatflow.com`
     - Currently pointing to: `185.230.63.107`

4. **Click Edit (pencil icon) or Edit button**

5. **Update the Record:**
   - **IPv4 address:** Change to `167.172.90.182`
   - **Proxy status:** Choose one:
     - **Orange cloud ☁️ (Proxied):** Uses Cloudflare CDN/proxy
     - **Gray cloud ☁️ (DNS only):** Direct connection to your VPS
   
   **Recommendation:**
   - For setup/testing: Use **Gray cloud** (DNS only) - easier SSL setup
   - For production: Use **Orange cloud** (Proxied) - better DDoS protection

6. **Save the record**

## Step 2: Choose Your Setup Method

### Option A: Gray Cloud (DNS Only) - Recommended for Setup

**Advantages:**
- Direct connection to VPS
- Standard SSL setup with Let's Encrypt
- Easier to debug

**Configuration:**
1. Make sure A record is **Gray cloud** (DNS only)
2. Wait 2-5 minutes for DNS to update
3. Run the setup script:
   ```bash
   sudo bash setup-domain.sh
   ```
4. This will install Let's Encrypt SSL certificate on your VPS

### Option B: Orange Cloud (Proxied) - Production Recommended

**Advantages:**
- DDoS protection
- CDN caching
- Better performance

**Configuration:**
1. Make sure A record is **Orange cloud** (Proxied)
2. Wait 2-5 minutes for DNS to update

3. **Configure SSL in Cloudflare:**
   - Go to: SSL/TLS → Overview
   - Set to: **"Full (strict)"** or **"Full"**
   - This encrypts browser → Cloudflare

4. **Install SSL on VPS:**
   You need an SSL certificate on your VPS. Two options:

   **Option B1: Cloudflare Origin Certificate (Easier)**
   ```bash
   # In Cloudflare Dashboard:
   # SSL/TLS → Origin Server → Create Certificate
   # Copy the certificate and key
   
   # On your VPS:
   sudo mkdir -p /etc/ssl/cloudflare
   sudo nano /etc/ssl/cloudflare/kyatflow.com.crt  # Paste certificate
   sudo nano /etc/ssl/cloudflare/kyatflow.com.key  # Paste key
   
   # Update Nginx to use this certificate
   ```

   **Option B2: Let's Encrypt (Works but requires DNS)**
   ```bash
   # Use DNS challenge instead of HTTP
   sudo certbot certonly --manual --preferred-challenges dns \
     -d kyatflow.com -d www.kyatflow.com
   ```

5. **Update Nginx configuration:**
   - Modify to use HTTPS on port 443
   - Use the Cloudflare origin certificate or Let's Encrypt cert

## Step 3: Verify DNS Update

After updating in Cloudflare, verify:

```bash
# Wait 2-5 minutes, then check
dig kyatflow.com +short

# Should show: 167.172.90.182
# (If using gray cloud)

# OR should show Cloudflare IP
# (If using orange cloud - this is normal!)
```

**Note:** If using Orange cloud (proxied), `dig` will show Cloudflare IPs, not your VPS IP. This is expected!

To check your actual VPS IP behind Cloudflare:
```bash
# Check HTTP headers
curl -I http://kyatflow.com | grep -i "cf-ray\|server"

# Or check from Cloudflare dashboard
# Analytics → DNS → Your records should show correct IP
```

## Step 4: Run Setup Script

### If Using Gray Cloud (DNS Only):

```bash
cd /var/www/html/kyatflow-mobile-

# Wait for DNS to update (check first)
dig kyatflow.com +short
# Should show: 167.172.90.182

# Run setup script
sudo bash setup-domain.sh
```

### If Using Orange Cloud (Proxied):

The setup script will detect Cloudflare and you'll need to handle SSL differently. You can either:

**Quick Method - Use Cloudflare SSL Only:**
1. Keep backend on HTTP (no SSL needed on VPS)
2. Cloudflare handles SSL between browser and Cloudflare
3. Set Cloudflare SSL mode to "Full" (not strict)
4. Update Nginx to only listen on HTTP (port 80)

**Or modify the setup script for Cloudflare origin certificate.**

## Step 5: Update Environment Variables

### Frontend .env

```bash
cd /var/www/html/kyatflow-mobile-

# For HTTPS (if SSL installed)
echo "VITE_API_URL=https://kyatflow.com/api" > .env

# OR for HTTP (if using Cloudflare proxy only)
echo "VITE_API_URL=https://kyatflow.com/api" > .env
# (Still use HTTPS because Cloudflare provides SSL)

# Rebuild
rm -rf dist
npm run build
sudo cp -r dist/* /var/www/kyatflow/
```

### Backend .env

```bash
cd /var/www/html/kyatflow-mobile-/backend

# Update FRONTEND_URL
sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=https://kyatflow.com|' .env

# Or add if not exists
grep -q "FRONTEND_URL" .env || echo "FRONTEND_URL=https://kyatflow.com" >> .env

# Restart backend
pm2 restart kyatflow-backend
```

## Step 6: Configure Cloudflare SSL (If Using Proxy)

1. **Go to SSL/TLS Settings:**
   - Dashboard → `kyatflow.com` → SSL/TLS → Overview

2. **Choose SSL Mode:**
   - **Full:** Cloudflare → VPS uses any certificate (even self-signed)
   - **Full (strict):** Cloudflare → VPS needs valid certificate (recommended)
   - **Flexible:** Only encrypts browser → Cloudflare (not recommended)

3. **For Full (strict) mode:**
   - You need a valid SSL certificate on your VPS
   - Use Cloudflare Origin Certificate (recommended)
   - Or Let's Encrypt certificate

## Quick Setup Script for Cloudflare

Save this as `setup-cloudflare.sh`:

```bash
#!/bin/bash
DOMAIN="kyatflow.com"
VPS_IP="167.172.90.182"

echo "☁️  Cloudflare Setup Helper"
echo ""
echo "Current DNS:"
dig $DOMAIN +short
echo ""
echo "Nameservers:"
dig $DOMAIN NS +short
echo ""
echo "📋 Instructions:"
echo "1. Go to: https://dash.cloudflare.com"
echo "2. Select domain: $DOMAIN"
echo "3. Go to DNS → Records"
echo "4. Edit A record (@ or $DOMAIN)"
echo "5. Set IPv4 address to: $VPS_IP"
echo "6. Choose proxy status:"
echo "   - Gray cloud (DNS only) = Direct connection"
echo "   - Orange cloud (Proxied) = Cloudflare proxy"
echo ""
echo "After updating, wait 2-5 minutes, then:"
echo "  dig $DOMAIN +short"
echo ""
echo "If using Gray cloud, should show: $VPS_IP"
echo "If using Orange cloud, will show Cloudflare IP (normal!)"
```

Run: `bash setup-cloudflare.sh`

## Testing After Setup

```bash
# Test domain resolution
curl -I https://kyatflow.com

# Test API
curl https://kyatflow.com/api/health

# Check SSL certificate
openssl s_client -connect kyatflow.com:443 -servername kyatflow.com < /dev/null
```

## Troubleshooting

### DNS Still Shows Old IP

- Wait 2-5 minutes (Cloudflare usually fast)
- Clear local DNS cache
- Check Cloudflare dashboard - make sure record was saved

### SSL Errors with Orange Cloud

- Set Cloudflare SSL mode to "Full (strict)"
- Install Cloudflare Origin Certificate on VPS
- Or use Let's Encrypt with DNS challenge

### Can't Access Site After Setup

1. Check Nginx is running: `sudo systemctl status nginx`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Check if port 80/443 is open: `sudo ufw status`
4. Test locally: `curl http://localhost`

### API Not Working

- Check backend is running: `pm2 status`
- Check backend logs: `pm2 logs kyatflow-backend`
- Test backend directly: `curl http://localhost:9800/health`
- Check Nginx proxy config for `/api` location

## Recommended Production Setup

For production, use:
- **Orange cloud** (Proxied) in Cloudflare
- **Full (strict)** SSL mode
- **Cloudflare Origin Certificate** on VPS
- **DDoS protection** enabled in Cloudflare
- **Caching rules** optimized in Cloudflare


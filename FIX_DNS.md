# Fix DNS Configuration for kyatflow.com

## Current Issue
DNS is pointing to: `185.230.63.107`  
Should point to: `167.172.90.182`

## Step 1: Identify Where Your DNS is Managed

The IP `185.230.63.107` suggests you might be using:
- **Cloudflare** (if using Cloudflare proxy)
- **Another CDN/proxy service**
- **Incorrect DNS record at your registrar**

### Check Current DNS Records

```bash
# Check all DNS records
dig kyatflow.com ANY

# Check specific record
dig kyatflow.com A

# Check nameservers
dig kyatflow.com NS
```

## Step 2: Update DNS Based on Your Setup

### Option A: Using Cloudflare (if using Cloudflare proxy)

If you're using Cloudflare:

1. **Go to Cloudflare Dashboard:**
   - https://dash.cloudflare.com
   - Select your domain `kyatflow.com`

2. **Check DNS Records:**
   - Go to DNS → Records
   - Find A record for `@` or `kyatflow.com`

3. **Two Options:**

   **Option 1: Use Cloudflare Proxy (Recommended for DDoS protection)**
   - Keep Cloudflare proxy ON (orange cloud ☁️)
   - Change IP to your VPS IP: `167.172.90.182`
   - Cloudflare will proxy requests to your VPS
   - **Note:** SSL will be handled by Cloudflare
   - **Note:** You may need to configure Cloudflare SSL settings

   **Option 2: Disable Cloudflare Proxy (Direct connection)**
   - Turn OFF proxy (gray cloud)
   - Change IP to: `167.172.90.182`
   - This gives direct connection to your VPS

### Option B: Using Domain Registrar DNS

1. **Log into your domain registrar** (GoDaddy, Namecheap, etc.)

2. **Find DNS Management:**
   - Look for "DNS Settings" or "Manage DNS"

3. **Update A Record:**
   ```
   Type: A
   Name: @ (or kyatflow.com)
   Value: 167.172.90.182
   TTL: 3600 (or Auto)
   ```

4. **Save and wait** 5-30 minutes for propagation

### Option C: Using Digital Ocean DNS

1. **Go to Digital Ocean:**
   - https://cloud.digitalocean.com/networking/domains

2. **Add/Update Domain:**
   - Add domain: `kyatflow.com`
   - IP: `167.172.90.182`

3. **Update Nameservers at Registrar:**
   - Go to your domain registrar
   - Change nameservers to:
     ```
     ns1.digitalocean.com
     ns2.digitalocean.com
     ns3.digitalocean.com
     ```

## Step 3: Wait for DNS Propagation

After updating DNS:

```bash
# Check if DNS updated (repeat until it shows correct IP)
dig kyatflow.com +short

# Should eventually show: 167.172.90.182
```

**Propagation time:**
- Usually: 5-30 minutes
- Sometimes: Up to 48 hours
- Cloudflare: Usually instant or a few minutes

## Step 4: Verify DNS is Correct

```bash
# Multiple ways to check
dig kyatflow.com
nslookup kyatflow.com
host kyatflow.com

# All should show: 167.172.90.182
```

## Step 5: Run Setup Script Again

Once DNS points to `167.172.90.182`:

```bash
cd /var/www/html/kyatflow-mobile-
sudo bash setup-domain.sh
```

## If Using Cloudflare Proxy

If you're keeping Cloudflare proxy enabled, you have two SSL options:

### Option 1: Cloudflare SSL (Flexible/Full)

1. **In Cloudflare Dashboard:**
   - SSL/TLS → Overview
   - Set to "Flexible" or "Full"
   - Cloudflare handles SSL between browser and Cloudflare
   - You still need SSL on VPS (or not, if using Flexible)

2. **On Your VPS:**
   - You can use HTTP (port 80) if Cloudflare is set to "Flexible"
   - OR use HTTPS with self-signed cert if Cloudflare is set to "Full (strict)"

### Option 2: Origin Certificate (Recommended)

1. **Create Origin Certificate in Cloudflare:**
   - SSL/TLS → Origin Server
   - Create Certificate
   - Download certificate and key

2. **Install on VPS:**
   ```bash
   # Save certificate files
   sudo nano /etc/ssl/kyatflow.com.crt  # Paste certificate
   sudo nano /etc/ssl/kyatflow.com.key  # Paste key
   
   # Update Nginx to use origin certificate
   # (Modify setup script or Nginx config)
   ```

## Quick Check Script

```bash
#!/bin/bash
echo "Checking DNS for kyatflow.com..."
echo ""

CURRENT_IP=$(dig +short kyatflow.com | tail -n1)
EXPECTED_IP="167.172.90.182"

echo "Current DNS IP: $CURRENT_IP"
echo "Expected IP: $EXPECTED_IP"
echo ""

if [ "$CURRENT_IP" = "$EXPECTED_IP" ]; then
    echo "✅ DNS is correct! Ready to run setup script."
else
    echo "❌ DNS doesn't match. Please update DNS first."
    echo ""
    echo "If using Cloudflare, you can keep the proxy enabled,"
    echo "but make sure the A record points to $EXPECTED_IP"
fi
```

Save as `check-dns.sh` and run: `bash check-dns.sh`

## Troubleshooting

### DNS Not Updating

1. **Clear DNS cache:**
   ```bash
   # On Linux
   sudo systemd-resolve --flush-caches
   
   # On Windows (run as admin)
   ipconfig /flushdns
   
   # On Mac
   sudo dscacheutil -flushcache
   ```

2. **Check from different locations:**
   ```bash
   # Use online tools
   # https://www.whatsmydns.net/#A/kyatflow.com
   ```

### Still Shows Wrong IP After Hours

1. Verify DNS record was saved correctly
2. Check if there are multiple DNS providers
3. Verify nameservers are correct
4. Wait up to 48 hours for full propagation

### Using Cloudflare - Need to Update?

If you want to use Cloudflare but need direct connection for setup:

1. **Disable Cloudflare proxy temporarily:**
   - Go to Cloudflare DNS
   - Click gray cloud to disable proxy
   - Update IP to `167.172.90.182`
   - Run setup script
   - Re-enable proxy after setup (optional)


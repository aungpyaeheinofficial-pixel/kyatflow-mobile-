# How to Buy Domain and Connect to VPS

## Step 1: Buy the Domain

### Recommended Domain Registrars

**Option A: Namecheap (Recommended)**
- Website: https://www.namecheap.com
- Price: ~$10-15/year for `.com` domains
- Easy DNS management
- Good support

**Option B: Cloudflare Registrar (Cheapest)**
- Website: https://www.cloudflare.com/products/registrar/
- Price: At-cost pricing (very cheap, ~$8-10/year)
- Built-in Cloudflare CDN
- Requires Cloudflare account

**Option C: Google Domains / Squarespace Domains**
- Website: https://domains.google or https://squarespace.com/domains
- Price: ~$12/year
- Simple interface

**Option D: GoDaddy**
- Website: https://www.godaddy.com
- Price: ~$12-15/year (often has promo codes)
- Very popular but sometimes more expensive

### How to Buy on Namecheap (Example)

1. **Go to Namecheap:**
   - Visit: https://www.namecheap.com

2. **Search for Domain:**
   - Search: `kyatflow.com`
   - Click "Add to Cart"

3. **Complete Purchase:**
   - Checkout
   - Enter your details
   - Pay with credit card/PayPal

4. **Access Domain Management:**
   - Go to: https://ap.www.namecheap.com/domains/list/
   - Click "Manage" next to `kyatflow.com`

## Step 2: Configure DNS After Purchase

### Option A: Use Your Registrar's DNS (Namecheap Example)

1. **In Namecheap Domain List:**
   - Click "Manage" next to `kyatflow.com`
   - Go to "Advanced DNS" tab

2. **Add A Record:**
   - Click "Add New Record"
   - Type: `A Record`
   - Host: `@` (or `kyatflow.com`)
   - Value: `167.172.90.182`
   - TTL: `Automatic` or `300`
   - Click Save

3. **Add www Record (Optional):**
   - Click "Add New Record"
   - Type: `A Record`
   - Host: `www`
   - Value: `167.172.90.182`
   - TTL: `Automatic`
   - Click Save

4. **Wait 5-30 minutes** for DNS to propagate

### Option B: Use Cloudflare (Recommended - Free CDN)

1. **Buy Domain on Any Registrar** (Namecheap, GoDaddy, etc.)

2. **Add Domain to Cloudflare:**
   - Go to: https://dash.cloudflare.com
   - Click "Add a Site"
   - Enter: `kyatflow.com`
   - Select Free plan
   - Cloudflare will scan your DNS records

3. **Update Nameservers:**
   - Cloudflare will show you 2 nameservers (e.g., `ada.ns.cloudflare.com`)
   - Copy these nameservers
   - Go to your domain registrar
   - Find "Nameservers" or "DNS" section
   - Replace with Cloudflare nameservers
   - Save

4. **Configure DNS in Cloudflare:**
   - Go back to Cloudflare dashboard
   - Select `kyatflow.com`
   - Go to "DNS" → "Records"
   - Add A record:
     - Type: `A`
     - Name: `@`
     - IPv4 address: `167.172.90.182`
     - Proxy status: Gray cloud (DNS only) for now
     - Save

5. **Wait 5-30 minutes** for nameserver propagation

### Option C: Use Digital Ocean DNS

1. **Buy Domain** from any registrar

2. **Add Domain to Digital Ocean:**
   - Go to: https://cloud.digitalocean.com/networking/domains
   - Click "Add Domain"
   - Domain: `kyatflow.com`
   - IP: `167.172.90.182`

3. **Update Nameservers at Registrar:**
   - Digital Ocean will show nameservers:
     - `ns1.digitalocean.com`
     - `ns2.digitalocean.com`
     - `ns3.digitalocean.com`
   - Go to your registrar
   - Update nameservers to Digital Ocean nameservers

## Step 3: Verify DNS

After configuring DNS, wait 5-30 minutes, then check:

```bash
# Check if DNS is resolving
dig kyatflow.com +short
# Should show: 167.172.90.182

# Or
nslookup kyatflow.com
# Should show: 167.172.90.182
```

## Step 4: Run Setup Script

Once DNS is working:

```bash
cd /var/www/html/kyatflow-mobile-
git pull
sudo bash setup-domain.sh
```

## Alternative: Test Without Domain First

While waiting to buy the domain, you can:

### Option 1: Use IP Address Directly

Your app is already accessible at:
- `http://167.172.90.182:3555`

Users can access it directly via IP (not ideal for production, but works for testing).

### Option 2: Use Free Subdomain Services

**Freenom (Free .tk, .ml, .ga domains):**
- Not recommended for production
- But useful for testing
- Website: https://www.freenom.com

**No-IP or DuckDNS:**
- Free dynamic DNS
- Get subdomain like `kyatflow.ddns.net`
- Update IP automatically

### Option 3: Use Hosts File (Local Testing Only)

On your local computer, you can test the domain before DNS is set up:

**Windows:**
```powershell
# Run as Administrator
notepad C:\Windows\System32\drivers\etc\hosts

# Add this line:
167.172.90.182    kyatflow.com www.kyatflow.com
```

**Linux/Mac:**
```bash
sudo nano /etc/hosts

# Add this line:
167.172.90.182    kyatflow.com www.kyatflow.com
```

**Note:** This only works on your local machine, not for other users.

## Cost Breakdown

### Domain Registration:
- `.com` domain: ~$8-15/year
- `.net` domain: ~$10-15/year
- `.org` domain: ~$10-15/year

### Hosting (You Already Have):
- Digital Ocean VPS: Already set up ✅

### SSL Certificate:
- Let's Encrypt: **Free** ✅

### Total Cost:
- **~$10-15/year** for the domain
- Everything else is free!

## Quick Setup After Domain Purchase

```bash
# 1. Configure DNS at your registrar
#    - Add A record: @ → 167.172.90.182
#    - Wait 5-30 minutes

# 2. Verify DNS
dig kyatflow.com +short
# Should show: 167.172.90.182

# 3. Run setup script
cd /var/www/html/kyatflow-mobile-
sudo bash setup-domain.sh

# 4. Done! Visit: https://kyatflow.com
```

## Recommended Setup

**Best Option for Production:**

1. **Buy domain** on Namecheap (~$10/year)
2. **Use Cloudflare** (free):
   - Add domain to Cloudflare
   - Update nameservers at Namecheap
   - Configure DNS in Cloudflare
   - Enable Orange cloud (proxied) for DDoS protection
3. **Benefits:**
   - Free CDN
   - Free DDoS protection
   - Free SSL via Cloudflare
   - Better performance

## Current Status

Until you buy the domain:
- ✅ App works at: `http://167.172.90.182:3555`
- ✅ Backend works at: `http://167.172.90.182:9800`
- ⏳ Need domain for: `https://kyatflow.com`

## Next Steps

1. **Buy domain** from Namecheap or Cloudflare Registrar
2. **Configure DNS** to point to `167.172.90.182`
3. **Wait 5-30 minutes** for DNS propagation
4. **Run setup script:** `sudo bash setup-domain.sh`
5. **Visit:** `https://kyatflow.com`

That's it! Your app will be live with SSL certificate.


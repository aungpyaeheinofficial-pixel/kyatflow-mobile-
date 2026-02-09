# Complete Guide: Namecheap + Cloudflare + Digital Ocean VPS

This guide covers the entire process of buying a domain on Namecheap, connecting it to Cloudflare for security (WAF), and hosting your app on Digital Ocean.

---

## Phase 1: Buy Domain & Connect to Cloudflare

### 1. Buy Domain on Namecheap
1.  Go to [namecheap.com](https://www.namecheap.com).
2.  Search for your meaningful domain name (e.g., `kyatflow.com`).
3.  Add to cart and complete the purchase.
4.  **Do not** buy additional SSL or hosting addons (we will get SSL for free).

### 2. Add Site to Cloudflare
1.  Log in to [dash.cloudflare.com](https://dash.cloudflare.com) (Sign up for free if needed).
2.  Click **"Add a Site"** (top right).
3.  Enter your domain name (e.g., `kyatflow.com`).
4.  Select the **Free Plan** (at the bottom) and click **Continue**.
5.  Cloudflare will scan for existing DNS records. Review them and click **Continue**.
6.  Cloudflare will provide **2 Nameservers** (e.g., `amy.ns.cloudflare.com` and `bob.ns.cloudflare.com`). **Copy these.**

### 3. Point Namecheap to Cloudflare
1.  Go to your **Namecheap Dashboard** → **Domain List**.
2.  Click **Manage** next to your domain.
3.  Find the **Nameservers** section.
4.  Change "Namecheap BasicDNS" to **"Custom DNS"**.
5.  Paste the **2 Cloudflare Nameservers** you copied in the previous step.
6.  Click the green checkmark ☑️ to save.

> ⏳ **Wait 10-30 minutes** for the nameservers to update. You will get an email from Cloudflare when your site is active.

---

## Phase 2: Point Cloudflare to Digital Ocean

Once your site is active in Cloudflare:

1.  **Get your VPS IP:**
    *   Login to Digital Ocean.
    *   Find your Droplet IP (e.g., `167.172.90.182`).

2.  **Configure DNS in Cloudflare:**
    *   Go to **Cloudflare Dashboard** → Select your domain.
    *   Go to **DNS** → **Records**.
    *   **Delete** any existing A records if they don't match your VPS IP.
    *   **Add New Record:**
        *   **Type:** `A`
        *   **Name:** `@` (Root)
        *   **IPv4 Address:** `YOUR_VPS_IP` (e.g., `167.172.90.182`)
        *   **Proxy Status:** ☁️ **Gray Cloud (DNS Only)** (Important for initial setup!)
    *   **Add Second Record (Optional):**
        *   Type: `A`, Name: `www`, IPv4: `YOUR_VPS_IP`, Proxy: ☁️ **Gray Cloud**

> **Why Gray Cloud first?** We need a direct connection to generate SSL certificates on the VPS. We will turn on the "Orange Cloud" later.

---

## Phase 3: Configure VPS

1.  **SSH into your VPS:**
    ```bash
    ssh root@YOUR_VPS_IP
    ```

2.  **Navigate to Project Directory:**
    ```bash
    cd /var/www/html/kyatflow-mobile-
    ```

3.  **Update Setup Script (If needed):**
    If your domain is NOT `kyatflow.com` or IP is NOT `167.172.90.182`, edit the script:
    ```bash
    nano setup-domain.sh
    ```
    *   Update `DOMAIN="yourdomain.com"`
    *   Update `VPS_IP="your_vps_ip"`
    *   Press `Ctrl+O`, `Enter`, `Ctrl+X` to save and exit.

4.  **Run the Setup Script:**
    ```bash
    sudo bash setup-domain.sh
    ```
    *   This script will install Nginx, configure the firewall, and generate **Let's Encrypt SSL certificates**.
    *   When asked, verify your email/domain details.

5.  **Verify Access:**
    *   Visit `https://yourdomain.com` in your browser.
    *   Ensure the site loads and shows the "Connection is secure" padlock.

---

## Phase 4: Enable Cloudflare WAF (Security)

Now that the site is running securely, let's enable Cloudflare's full protection.

### 1. Enable Proxy
1.  Go to **Cloudflare Dashboard** → **DNS**.
2.  Edit your A records (`@` and `www`).
3.  Change status to ☁️ **Orange Cloud (Proxied)**.
4.  Click **Save**.

### 2. Configure SSL Mode
1.  Go to **SSL/TLS** → **Overview**.
2.  Change encryption mode to **Full (Strict)**.
    *   *Note: "Full (Strict)" requires a valid certificate on the server, which we just installed in Phase 3.*

### 3. Enable Security Features
1.  **Always Use HTTPS:**
    *   Go to **SSL/TLS** → **Edge Certificates**.
    *   Toggle **"Always Use HTTPS"** to **On**.
2.  **Bot Fight Mode:**
    *   Go to **Security** → **Bots**.
    *   Toggle **"Bot Fight Mode"** to **On**.
3.  **Security Level:**
    *   Go to **Security** → **Settings**.
    *   Set Security Level to **Medium**.

---

## Troubleshooting

*   **"Too many redirects" Error:**
    *   Check Cloudflare SSL setting. If it's on "Flexible", change it to "Full" or "Full (Strict)".
*   **Site not loading:**
    *   Check if Nginx is running: `sudo systemctl status nginx`
    *   Check firewall: `sudo ufw status` (Ports 80 and 443 must be ALLOWED).
*   **Changes not showing:**
    *   Clear your browser cache.
    *   Purge Cloudflare Cache: **Caching** → **Configuration** → **Purge Everything**.

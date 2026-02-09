# How to Secure Admin Access and Login

This guide explains how to change the admin password, restrict access to the Admin Panel, and securely login via SSH Tunneling.

---

## Part 1: Update Admin Password on VPS

Since the database is on your VPS, you need to run the update script there.

1.  **SSH into your VPS**:
    ```bash
    ssh root@YOUR_VPS_IP
    ```

2.  **Navigate to Backend Directory**:
    ```bash
    cd /var/www/html/kyatflow-mobile-/backend
    ```

3.  **Run the Update Script**:
    I have prepared a script `run-admin-update.sh` for you.
    ```bash
    # Make it executable
    chmod +x run-admin-update.sh

    # Run it
    ./run-admin-update.sh
    ```
    *This will set the admin password to: `f+>2P5=6J+=N`*

---

## Part 2: Restrict Admin Access (Nginx)

We will configure Nginx to only allow access to `/admin` from `localhost` (127.0.0.1).

1.  **Edit Nginx Config on VPS**:
    ```bash
    nano /etc/nginx/sites-available/kyatflow
    ```

2.  **Add the Restriction Block**:
    Add this block inside the `server { ... }` block, preferably after `location / { ... }`:

    ```nginx
    # Restrict /admin access to localhost only
    location /admin {
        allow 127.0.0.1;
        deny all;
        try_files $uri $uri/ /index.html;
    }
    ```

3.  **Save and Exit**:
    *   Press `Ctrl+O`, `Enter` to save.
    *   Press `Ctrl+X` to exit.

4.  **Test and Reload Nginx**:
    ```bash
    nginx -t
    systemctl reload nginx
    ```

---

## Part 3: Access Admin via SSH Tunnel (Windows)

Now that `/admin` is blocked from the public internet, you must use an SSH Tunnel to access it. This makes your computer "pretend" to be localhost on the VPS.

### 1. Open PowerShell on Windows
Do not SSH yet. Run this command on your local Windows machine:

```powershell
ssh -L 8888:localhost:80 root@YOUR_VPS_IP
```

*   **-L 8888:localhost:80**: This forwards your local port `8888` to the VPS port `80` (where Nginx is listening).
*   Replace `YOUR_VPS_IP` with your actual VPS IP (e.g., `167.172.90.182`).

### 2. Login to Admin Panel
1.  Keep the PowerShell window open.
2.  Open your browser (Chrome/Edge).
3.  Go to: **http://localhost:8888/admin**
4.  Login with:
    *   **Email:** `admin@kyatflow.com`
    *   **Password:** `f+>2P5=6J+=N`

### 3. Close the Tunnel
When you are done, simply type `exit` in the PowerShell window or close it. The connection will be closed.

---

## Summary of Security

*   **Public Access:** `https://kyatflow.com/admin` -> **403 Forbidden** (Blocked)
*   **SSH Tunnel Access:** `http://localhost:8888/admin` -> **200 OK** (Allowed)
*   **Database:** Admin password is now updated securely.

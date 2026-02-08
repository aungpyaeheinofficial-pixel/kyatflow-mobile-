# Security Updates Deployment Guide

I have implemented several security hardening measures:
1.  **Rate Limiting**: Protects against Brute Force and DDoS attacks.
2.  **Stricter Password Policy**: Minimum 8 characters enforced on Register and Reset Password.
3.  **Input Validation**: Strict checks on critical endpoints.

## Deployment Steps

On your VPS:

### 1. Backend Update
Since we added a new package (`express-rate-limit`), you **MUST** run `npm install` again.

```bash
cd /var/www/html/kyatflow-mobile-/backend
git pull origin main
npm install  # <--- Critical Step
npm run build
pm2 restart kyatflow-backend
```

### 2. Frontend Update
No visual changes, but good to ensure everything is synced.
```bash
cd /var/www/html/kyatflow-mobile-
git pull origin main
# If you changed any frontend code (we added Forgot Password link earlier)
npm run build 
sudo cp -r dist/* /var/www/kyatflow/
```

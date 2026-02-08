# Forgot Password Feature Setup Guide

To enable the "Forgot Password" feature, you must configure your Zoho Mail credentials and update your database and application.

## 1. Configure SMTP (Zoho Mail)
On your VPS, edit the backend `.env` file:
```bash
nano /var/www/html/kyatflow-mobile-/backend/.env
```
Add or update these lines:
```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=465
SMTP_USER=your-zoho-email@example.com
SMTP_PASS=your-app-password
```
*(Use port 465 for SSL. If using port 587, set secure: false in code, but we defaulted to auto-detect based on port).*

## 2. Run Database Migration
You must run the migration to add `reset_token` and `reset_expires` columns.
```bash
cd /var/www/html/kyatflow-mobile-/backend
npx tsx src/db/migrate-v3.ts
```
*Expected Output: "Migration v3 completed successfully"*

## 3. Deploy Backend (New Endpoints)
```bash
git pull origin main
rm -rf dist
npm install
npm run build
pm2 restart kyatflow-backend
```

## 4. Deploy Frontend (New Pages)
```bash
cd /var/www/html/kyatflow-mobile-
git pull origin main
npm install
npm run build
sudo cp -r dist/* /var/www/kyatflow/
```

## 5. Verification
1.  Go to Login page.
2.  Click "Forgot Password?".
3.  Enter your email and check your inbox.
4.  Click the link in the email.
5.  Set a new password.
6.  Login with the new password.

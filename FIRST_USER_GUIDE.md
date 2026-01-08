# First User Setup Guide

## Current Status
✅ Database tables are created and ready
✅ Backend API is configured
✅ Frontend is connected to backend
⚠️ No users registered yet

## Step 1: Verify Backend is Running

```bash
# Check if backend is running
pm2 status

# If not running, start it
cd /var/www/html/kyatflow-mobile-/backend
pm2 start ecosystem.config.js

# Check backend logs
pm2 logs kyatflow-backend
```

## Step 2: Test Backend Health

```bash
# Test health endpoint
curl http://localhost:9800/health

# Should return: {"status":"ok","timestamp":"..."}
```

## Step 3: Fix Network Connection (If Still Getting Network Error)

### A. Update Frontend .env

```bash
cd /var/www/html/kyatflow-mobile-

# Create/update .env file
cat > .env <<EOF
VITE_API_URL=http://167.172.90.182:9800/api
VITE_APP_NAME=KyatFlow
EOF
```

### B. Rebuild Frontend (IMPORTANT!)

```bash
# Rebuild with new .env
rm -rf dist
npm run build

# Deploy
sudo rm -rf /var/www/kyatflow/*
sudo cp -r dist/* /var/www/kyatflow/
sudo chown -R www-data:www-data /var/www/kyatflow
```

### C. Update Backend CORS

```bash
cd /var/www/html/kyatflow-mobile-/backend

# Update .env
echo "FRONTEND_URL=http://167.172.90.182:3555" >> .env

# Restart backend
pm2 restart kyatflow-backend
```

## Step 4: Register Your First User

### Option A: Via Frontend (Recommended)

1. Open your browser: `http://167.172.90.182:3555`
2. If you see login page, look for "Register" or "Sign Up" link
3. Fill in registration form:
   - Email: `your@email.com`
   - Name: `Your Name`
   - Password: `your-secure-password`
4. Click Register/Sign Up

### Option B: Via API (If Frontend Registration Not Available)

```bash
# Register via curl
curl -X POST http://localhost:9800/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kyatflow.com",
    "password": "admin123",
    "name": "Admin User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "email": "admin@kyatflow.com",
    "name": "Admin User"
  }
}
```

## Step 5: Login with Your Account

1. Go to login page: `http://167.172.90.182:3555/login`
2. Enter your email and password
3. Click "Sign In"

## Step 6: Verify User Was Created in Database

```bash
# Connect to database
sudo -u postgres psql -d kyatflow

# Check users table
SELECT id, email, name, created_at FROM users;

# Should show your user
```

## Step 7: Create Test Data

After logging in:

1. **Create a Party:**
   - Go to Parties page
   - Click "Add Party" or "+" button
   - Fill in:
     - Name: `Test Customer`
     - Type: `Customer`
     - Phone: `09123456789`
   - Save

2. **Create a Transaction:**
   - Go to Transactions or Dashboard
   - Click "Add Transaction" or "+" button
   - Fill in:
     - Type: `Income` or `Expense`
     - Amount: `100000`
     - Category: `Sales` or `Office Supplies`
     - Date: Today
   - Save

## Step 8: Verify Data in Database

```bash
# Connect to database
sudo -u postgres psql -d kyatflow

# Check users (should have your user)
SELECT id, email, name FROM users;

# Check parties (should have test party)
SELECT id, user_id, name, type, balance FROM parties;

# Check transactions (should have test transaction)
SELECT id, user_id, type, amount, category, date FROM transactions;

# Check user_settings (should be created automatically)
SELECT user_id, currency, language FROM user_settings;
```

## Troubleshooting

### "Network Error" When Registering/Logging In

1. **Check Backend is Running:**
   ```bash
   pm2 status
   pm2 logs kyatflow-backend
   ```

2. **Check Backend Health:**
   ```bash
   curl http://localhost:9800/health
   ```

3. **Check Frontend .env:**
   ```bash
   cat .env
   # Should show: VITE_API_URL=http://167.172.90.182:9800/api
   ```

4. **Rebuild Frontend:**
   ```bash
   npm run build
   sudo cp -r dist/* /var/www/kyatflow/
   ```

5. **Check Browser Console (F12):**
   - Network tab: Look for API calls
   - Console tab: Check for errors
   - Check if API URL is correct in Network requests

### "CORS Error" in Browser

```bash
# Update backend .env
cd backend
echo "FRONTEND_URL=http://167.172.90.182:3555" >> .env

# Restart backend
pm2 restart kyatflow-backend
```

### "Invalid email or password" After Registration

- Make sure you're using the correct email/password
- Check if user was created in database:
  ```bash
  sudo -u postgres psql -d kyatflow -c "SELECT email FROM users;"
  ```

## Quick Test Script

Run this to test everything:

```bash
#!/bin/bash
echo "Testing Backend..."
curl -s http://localhost:9800/health | jq .

echo -e "\nRegistering test user..."
curl -X POST http://localhost:9800/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}' | jq .

echo -e "\nChecking database..."
sudo -u postgres psql -d kyatflow -c "SELECT email, name FROM users;"
```

## Next Steps

Once you have:
- ✅ Registered a user
- ✅ Logged in successfully
- ✅ Created a party
- ✅ Created a transaction

Then verify in database that data is saved:
```bash
sudo -u postgres psql -d kyatflow
```

You should see your data in the tables!


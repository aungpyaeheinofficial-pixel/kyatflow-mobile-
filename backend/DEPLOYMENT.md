# KyatFlow Backend Deployment Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- PM2 installed globally: `npm install -g pm2`

## Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kyatflow
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
PORT=9800
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3555

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d
```

**IMPORTANT:** Change `JWT_SECRET` to a secure random string in production!

### 3. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE kyatflow;

# Exit psql
\q
```

### 4. Run Database Migration

```bash
# Development mode (using tsx)
npm run migrate:dev

# Production mode (after build)
npm run build
npm run migrate
```

### 5. Build the Application

```bash
npm run build
```

### 6. Start with PM2

```bash
# Start the application
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs kyatflow-backend

# Save PM2 configuration (so it restarts on server reboot)
pm2 save
pm2 startup
```

### 7. Verify Deployment

```bash
# Health check
curl http://localhost:9800/health

# Should return: {"status":"ok","timestamp":"..."}
```

## API Endpoints

Base URL: `http://localhost:9800/api`

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction by ID
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Parties
- `GET /api/parties` - Get all parties
- `GET /api/parties/:id` - Get party by ID
- `POST /api/parties` - Create party
- `PUT /api/parties/:id` - Update party
- `DELETE /api/parties/:id` - Delete party
- `GET /api/parties/:id/transactions` - Get party transactions

### Analytics
- `GET /api/analytics/stats` - Get dashboard stats
- `GET /api/analytics/category-breakdown` - Get category breakdown
- `GET /api/analytics/daily-cashflow` - Get daily cash flow
- `GET /api/analytics/payment-method-breakdown` - Get payment method breakdown

## PM2 Commands

```bash
# Start
pm2 start ecosystem.config.js

# Stop
pm2 stop kyatflow-backend

# Restart
pm2 restart kyatflow-backend

# Reload (zero-downtime)
pm2 reload kyatflow-backend

# Delete
pm2 delete kyatflow-backend

# Monitor
pm2 monit

# Logs
pm2 logs kyatflow-backend
pm2 logs kyatflow-backend --lines 100  # Last 100 lines
```

## Troubleshooting

### Database Connection Issues

1. Check PostgreSQL is running: `sudo systemctl status postgresql`
2. Verify credentials in `.env`
3. Check database exists: `psql -U postgres -l`
4. Test connection: `psql -U postgres -d kyatflow`

### Port Already in Use

If port 9800 is already in use:
1. Change `PORT` in `.env`
2. Update `ecosystem.config.js`
3. Restart PM2: `pm2 restart kyatflow-backend`

### JWT Token Issues

1. Verify `JWT_SECRET` is set in `.env`
2. Check token expiry: default is 7 days
3. Clear frontend localStorage if needed

## Production Checklist

- [ ] Change `JWT_SECRET` to secure random string (min 32 characters)
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origin in `FRONTEND_URL`
- [ ] Use SSL/HTTPS for API
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Set up monitoring (PM2 Plus, or similar)
- [ ] Configure log rotation
- [ ] Test all API endpoints
- [ ] Verify frontend can connect to backend


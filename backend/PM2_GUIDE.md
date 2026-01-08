# PM2 Guide for KyatFlow Backend

## Installation

### Install PM2 globally:
```bash
npm install -g pm2
```

## Quick Start

### 1. Build the application first:
```bash
cd backend
npm install
npm run build
```

### 2. Make sure `.env` file exists:
```bash
cp env.example .env
nano .env  # Edit with your settings
```

### 3. Start with PM2:
```bash
npm run pm2:start
# OR
pm2 start ecosystem.config.js
```

## Available PM2 Scripts

All scripts are available via npm or directly with pm2:

```bash
# Start the application
npm run pm2:start
pm2 start ecosystem.config.js

# Stop the application
npm run pm2:stop
pm2 stop kyatflow-backend

# Restart the application (with downtime)
npm run pm2:restart
pm2 restart kyatflow-backend

# Reload the application (zero-downtime)
npm run pm2:reload
pm2 reload kyatflow-backend

# Delete from PM2
npm run pm2:delete
pm2 delete kyatflow-backend

# View logs
npm run pm2:logs
pm2 logs kyatflow-backend

# View last 100 lines of logs
pm2 logs kyatflow-backend --lines 100

# View real-time logs
pm2 logs kyatflow-backend --raw

# View status
npm run pm2:status
pm2 status

# Monitor (real-time dashboard)
npm run pm2:monit
pm2 monit
```

## Common PM2 Commands

### View detailed info:
```bash
pm2 show kyatflow-backend
pm2 info kyatflow-backend
```

### View all logs:
```bash
pm2 logs
```

### Clear logs:
```bash
pm2 flush
```

### View logs for specific lines:
```bash
pm2 logs kyatflow-backend --lines 50
```

### Stop all PM2 processes:
```bash
pm2 stop all
```

### Restart all PM2 processes:
```bash
pm2 restart all
```

### Delete all PM2 processes:
```bash
pm2 delete all
```

## Auto-start on Server Reboot

To make PM2 start automatically on server reboot:

```bash
# Generate startup script
pm2 startup

# This will output a command like:
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u your_user --hp /home/your_user

# Run the outputted command, then:
pm2 save
```

### For Ubuntu/Debian:
```bash
pm2 startup systemd
pm2 save
```

### For CentOS/RHEL:
```bash
pm2 startup
pm2 save
```

## Production Deployment Steps

### 1. Pull latest code:
```bash
cd /var/www/html/kyatflow-mobile-
git pull
```

### 2. Install dependencies (if needed):
```bash
cd backend
npm install
```

### 3. Build the application:
```bash
npm run build
```

### 4. Stop existing PM2 process (if running):
```bash
npm run pm2:stop
# OR
pm2 stop kyatflow-backend
```

### 5. Start with PM2:
```bash
npm run pm2:start
# OR
pm2 start ecosystem.config.js
```

### 6. Verify it's running:
```bash
npm run pm2:status
# OR
pm2 status
curl http://localhost:9800/health
```

## Monitoring and Maintenance

### View real-time monitoring:
```bash
pm2 monit
```

### Check memory usage:
```bash
pm2 list
```

### Restart if memory usage is high:
```bash
pm2 restart kyatflow-backend
```

### View error logs:
```bash
pm2 logs kyatflow-backend --err
```

### View output logs:
```bash
pm2 logs kyatflow-backend --out
```

## Troubleshooting

### Application not starting:
```bash
# Check logs
pm2 logs kyatflow-backend --lines 50

# Check if port is in use
sudo netstat -tlnp | grep 9800

# Check .env file
cat .env
```

### PM2 process keeps restarting:
```bash
# Check error logs
pm2 logs kyatflow-backend --err --lines 100

# Check system resources
pm2 monit
```

### Application stopped unexpectedly:
```bash
# View logs for errors
pm2 logs kyatflow-backend --err

# Check status
pm2 status

# Restart
pm2 restart kyatflow-backend
```

## Log Files Location

Logs are stored in:
- Error logs: `backend/logs/error.log`
- Output logs: `backend/logs/out.log`

### View log files directly:
```bash
tail -f backend/logs/error.log
tail -f backend/logs/out.log
```

### Rotate logs (if needed):
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Environment Variables

The PM2 configuration loads `.env` file automatically. Make sure:
1. `.env` file exists in `backend/` directory
2. All required variables are set
3. `.env` file is not committed to git (already in .gitignore)

## Performance Tuning

### Increase memory limit (if needed):
Edit `ecosystem.config.js`:
```javascript
max_memory_restart: '2G', // Change from 1G to 2G
```

### Run multiple instances (cluster mode):
Edit `ecosystem.config.js`:
```javascript
instances: 2, // Change from 1 to 2
exec_mode: 'cluster', // Change from 'fork' to 'cluster'
```

**Note:** Cluster mode requires updating the Express app to handle cluster mode properly.

## Useful PM2 Links

- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [PM2 Ecosystem File](https://pm2.keymetrics.io/docs/usage/application-declaration/)


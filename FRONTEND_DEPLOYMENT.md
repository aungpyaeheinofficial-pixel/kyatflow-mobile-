# KyatFlow Frontend Deployment Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend API running (on port 9800)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Backend API URL
# For development: http://localhost:9800/api
# For production: http://your-vps-ip:9800/api or https://api.yourdomain.com/api
VITE_API_URL=http://localhost:9800/api

# App Configuration
VITE_APP_NAME=KyatFlow
```

### 3. Development Mode

```bash
npm run dev
```

The app will start on `http://localhost:5173` (or next available port).

## Production Build

### 1. Update Environment Variables

For production, update `.env`:

```env
VITE_API_URL=http://your-vps-ip:9800/api
# OR if using domain:
VITE_API_URL=https://api.yourdomain.com/api

VITE_APP_NAME=KyatFlow
```

### 2. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

### 3. Preview Production Build

```bash
npm run preview
```

## Deployment Options

### Option 1: Deploy with PM2 (Same VPS as Backend)

If deploying on the same VPS as your backend:

#### Install serve (static file server)

```bash
npm install -g serve
```

#### Create PM2 config for frontend

Create `ecosystem.frontend.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'kyatflow-frontend',
      script: 'serve',
      args: '-s dist -l 3555',
      env: {
        NODE_ENV: 'production',
        PORT: 3555,
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
    },
  ],
};
```

#### Build and Start

```bash
# Build frontend
npm run build

# Start with PM2
pm2 start ecosystem.frontend.config.js

# Save PM2 config
pm2 save
```

### Option 2: Deploy with Nginx (Recommended for Production)

#### 1. Install Nginx

```bash
sudo apt update
sudo apt install nginx
```

#### 2. Build Frontend

```bash
npm run build
```

#### 3. Copy Build Files

```bash
sudo cp -r dist/* /var/www/html/
# OR create a specific directory
sudo mkdir -p /var/www/kyatflow
sudo cp -r dist/* /var/www/kyatflow/
```

#### 4. Configure Nginx

Create `/etc/nginx/sites-available/kyatflow`:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    root /var/www/kyatflow;
    index index.html;

    # Frontend routes - SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy to backend
    location /api {
        proxy_pass http://localhost:9800;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 5. Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/kyatflow /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

### Option 3: Deploy to Vercel (Easiest)

1. **Push code to GitHub** (already done)

2. **Go to [Vercel Dashboard](https://vercel.com)**
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   - In Vercel project settings, add:
     - `VITE_API_URL`: `http://your-vps-ip:9800/api`

4. **Deploy**
   - Vercel will auto-detect Vite
   - Click "Deploy"
   - Done!

### Option 4: Deploy to Netlify

1. **Build locally**:
   ```bash
   npm run build
   ```

2. **Drag and drop** the `dist` folder to Netlify, OR

3. **Connect via Git**:
   - Import repository in Netlify
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variable: `VITE_API_URL`

## Environment Variables for Production

### Local Development (.env)
```env
VITE_API_URL=http://localhost:9800/api
VITE_APP_NAME=KyatFlow
```

### Production on Same VPS (.env)
```env
VITE_API_URL=http://localhost:9800/api
# OR use your VPS IP:
VITE_API_URL=http://123.45.67.89:9800/api
```

### Production with Domain (.env)
```env
VITE_API_URL=https://api.yourdomain.com/api
# OR if API is on same domain:
VITE_API_URL=/api
```

## Update Backend CORS

Make sure your backend `.env` has the correct `FRONTEND_URL`:

```env
# If frontend is on same domain
FRONTEND_URL=http://yourdomain.com

# If frontend is on different port (PM2)
FRONTEND_URL=http://your-vps-ip:3555

# If frontend is on Vercel/Netlify
FRONTEND_URL=https://your-app.vercel.app
```

Then restart backend:
```bash
pm2 restart kyatflow-backend
```

## Frontend Port Configuration

To run frontend on port 3555 in development, update `vite.config.ts`:

```typescript
server: {
  host: true,
  port: 3555,  // Change from 5173 to 3555
  strictPort: false,
  open: mode === "development",
},
```

## Testing the Connection

### 1. Check Backend Health

```bash
curl http://localhost:9800/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Test Frontend API Connection

Open browser console and check:
- Network tab should show API calls to `/api/auth/login`
- No CORS errors
- Responses from backend

### 3. Test Login

Try logging in with credentials:
- Email: (any email - need to register first)
- Password: (your password)

## Troubleshooting

### CORS Errors

If you see CORS errors:
1. Check `FRONTEND_URL` in backend `.env`
2. Restart backend: `pm2 restart kyatflow-backend`
3. Verify frontend URL matches exactly

### API Connection Failed

1. Check `VITE_API_URL` in frontend `.env`
2. Verify backend is running: `pm2 status`
3. Test backend directly: `curl http://localhost:9800/health`
4. Check firewall/port access

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working

- Vite requires `VITE_` prefix
- Must rebuild after changing `.env`
- Check `.env` file is in root directory
- Verify no syntax errors in `.env`

## PM2 Scripts for Frontend (if using PM2)

Add to `package.json`:

```json
"scripts": {
  "pm2:start": "pm2 start ecosystem.frontend.config.js",
  "pm2:stop": "pm2 stop kyatflow-frontend",
  "pm2:restart": "pm2 restart kyatflow-frontend",
  "pm2:logs": "pm2 logs kyatflow-frontend"
}
```

## Deployment Checklist

- [ ] Backend is running and accessible
- [ ] `.env` file created with correct `VITE_API_URL`
- [ ] Built production bundle: `npm run build`
- [ ] Tested locally: `npm run preview`
- [ ] Backend CORS configured correctly
- [ ] Frontend deployed and accessible
- [ ] Tested login/registration
- [ ] Tested API calls from frontend

## Production Recommendations

1. **Use HTTPS** - Set up SSL certificate (Let's Encrypt)
2. **Use Nginx** - Better performance than PM2 serve
3. **Set up CDN** - For static assets (Cloudflare, etc.)
4. **Monitor** - Set up monitoring (PM2 Plus, Sentry, etc.)
5. **Backup** - Regular backups of database
6. **Environment Variables** - Keep `.env` files secure, never commit


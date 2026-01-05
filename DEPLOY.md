# Vercel Deployment Guide

## Quick Deploy

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel](https://vercel.com)
2. Sign in with your GitHub account
3. Click "Add New Project"
4. Import your repository: `aungpyaeheinofficial-pixel/KyatFlow-`
5. Vercel will auto-detect the settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Or deploy to preview
vercel
```

## Environment Variables (if needed)

If you need to add environment variables:
1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Add any required variables

## Build Settings

The project is configured with:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18.x or higher

## Custom Domain

After deployment:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Automatic Deployments

- **Production**: Automatically deploys on push to `main` branch
- **Preview**: Creates preview deployments for pull requests

## Troubleshooting

### Build Fails
- Check Node.js version (should be 18+)
- Ensure all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### Routing Issues
- The `vercel.json` includes SPA rewrites for React Router
- All routes redirect to `index.html` for client-side routing

## Support

For issues, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)


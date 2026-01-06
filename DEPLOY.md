# Vercel Deployment Guide

This guide will help you deploy KyatFlow to Vercel.

## Quick Deploy

### Method 1: Vercel Dashboard (Easiest)

1. **Push to Git Repository**
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository
   - Vercel will auto-detect Vite configuration

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live!

### Method 2: Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # Deploy to preview
   vercel

   # Deploy to production
   vercel --prod
   ```

## Configuration

The project includes `vercel.json` with optimized settings:

- **Framework**: Vite (auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **SPA Routing**: All routes redirect to `/index.html`
- **Caching**: Optimized headers for static assets
- **Security**: XSS protection, frame options, content type options

## Environment Variables

Currently, the app doesn't require environment variables. If you need to add them:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables (e.g., `VITE_API_URL`)
3. Redeploy

## Build Optimization

The build is optimized for:
- ✅ Code splitting (vendor, UI, charts, animations)
- ✅ Asset optimization (inline small assets)
- ✅ Long-term caching for static assets
- ✅ Mobile-first performance

## Troubleshooting

### Build Fails
- Check Node.js version (Vercel uses Node 18+ by default)
- Ensure all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### Routing Issues
- Ensure `vercel.json` rewrites are configured (already done)
- All routes should redirect to `/index.html` for SPA

### Performance
- Assets are cached for 1 year (immutable)
- Code splitting reduces initial bundle size
- Lazy loading for routes

## Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL certificate is automatically provisioned

## Preview Deployments

Every push to a branch creates a preview deployment:
- Preview URL: `your-project-git-branch.vercel.app`
- Production URL: `your-project.vercel.app`

## Monitoring

Vercel provides:
- Build logs
- Function logs
- Analytics (optional)
- Performance metrics

## Support

For Vercel-specific issues, check:
- [Vercel Documentation](https://vercel.com/docs)
- [Vite on Vercel](https://vercel.com/docs/frameworks/vite)

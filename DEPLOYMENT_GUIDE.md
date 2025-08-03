# 🚀 Real Estate Hotspot - Deployment Guide

This guide provides comprehensive instructions for deploying Real Estate Hotspot to various platforms.

## 📋 Prerequisites

### Required Environment Variables

Before deploying, ensure you have the following environment variables configured:

#### **Production (Required)**
```bash
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_production_paystack_key
VITE_MAPBOX_ACCESS_TOKEN=your_production_mapbox_access_token
VITE_APP_NAME=Real Estate Hotspot
VITE_APP_URL=https://realestatehotspot.com
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### **Optional (Recommended)**
```bash
VITE_HOTJAR_ID=your_hotjar_id
VITE_SENTRY_DSN=your_sentry_dsn
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_TRACKING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

### API Keys Setup

1. **Supabase**: Create a production project at [supabase.com](https://supabase.com)
2. **Paystack**: Get live keys from [paystack.com](https://paystack.com)
3. **Mapbox**: Create account at [mapbox.com](https://mapbox.com)
4. **Google Analytics**: Set up GA4 property
5. **Sentry** (optional): Create project at [sentry.io](https://sentry.io)

## 🔧 Pre-Deployment Validation

Run the deployment configuration checker:

```bash
npm run deploy:check
```

This will validate:
- ✅ All required environment variables
- ✅ Correct API key formats
- ✅ Build configuration
- ✅ Security settings
- ✅ Generate deployment manifest

## 🌐 Platform-Specific Deployment

### 1. Netlify Deployment

#### Quick Deploy (Recommended)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

#### Manual Setup

1. **Connect Repository**
   ```bash
   # Connect your GitHub repository to Netlify
   ```

2. **Build Settings**
   - Build command: `npm run deploy:production`
   - Publish directory: `dist`
   - Node version: `18`

3. **Environment Variables**
   Add all production environment variables in Netlify dashboard:
   - Site Settings → Environment Variables

4. **Domain Setup**
   - Add custom domain: `realestatehotspot.com`
   - Configure DNS records
   - Enable HTTPS (automatic)

5. **Deploy**
   ```bash
   # Push to main branch triggers automatic deployment
   git push origin main
   ```

#### Advanced Netlify Features

- **Split Testing**: Configure in `netlify.toml`
- **Analytics**: Enable Netlify Analytics
- **Functions**: Serverless functions in `netlify/functions/`

### 2. Vercel Deployment

#### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

#### Manual Setup

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login and Deploy**
   ```bash
   vercel login
   vercel --prod
   ```

3. **Configure Environment**
   ```bash
   # Add environment variables
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   # ... add all required variables
   ```

4. **Custom Domain**
   ```bash
   vercel domains add realestatehotspot.com
   ```

### 3. Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize Project**
   ```bash
   firebase init hosting
   ```

3. **Configure `firebase.json`**
   ```json
   {
     "hosting": {
       "public": "dist",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ],
       "headers": [
         {
           "source": "/assets/**",
           "headers": [
             {
               "key": "Cache-Control",
               "value": "public, max-age=31536000, immutable"
             }
           ]
         }
       ]
     }
   }
   ```

4. **Deploy**
   ```bash
   npm run build:production
   firebase deploy
   ```

### 4. AWS S3 + CloudFront

1. **Build for Production**
   ```bash
   npm run build:production
   ```

2. **Create S3 Bucket**
   ```bash
   aws s3 mb s3://realestatehotspot-app
   ```

3. **Upload Files**
   ```bash
   aws s3 sync dist/ s3://realestatehotspot-app --delete
   ```

4. **Configure CloudFront**
   - Create distribution pointing to S3 bucket
   - Configure custom error pages for SPA routing
   - Set up SSL certificate

## 🔄 CI/CD Pipeline Setup

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run deployment checks
      run: npm run deploy:check
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        # ... other environment variables
    
    - name: Build for production
      run: npm run build:production
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
        # ... other environment variables
    
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v1.2
      with:
        publish-dir: './dist'
        production-branch: main
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🔒 Security Checklist

### Pre-Production Security Validation

- [ ] All API keys are production-ready (not test/placeholder)
- [ ] HTTPS is enforced
- [ ] Security headers are configured
- [ ] Content Security Policy (CSP) is enabled
- [ ] Environment variables are properly secured
- [ ] No sensitive data in client-side code
- [ ] Rate limiting is configured
- [ ] Error tracking is enabled

### Security Headers Validation

The following headers are automatically configured:

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(self)
```

## 📊 Post-Deployment Verification

### 1. Functional Testing

```bash
# Test production build locally
npm run preview:production

# Run Lighthouse audit
npm run lighthouse

# Performance testing
npm run performance:test
```

### 2. Monitoring Setup

- **Analytics**: Verify Google Analytics is tracking
- **Error Tracking**: Confirm Sentry is receiving events
- **Performance**: Monitor Core Web Vitals
- **Uptime**: Set up uptime monitoring

### 3. SEO Verification

- [ ] Meta tags are populated
- [ ] Open Graph tags work
- [ ] Sitemap is accessible
- [ ] robots.txt is configured
- [ ] Structured data is valid

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules dist
   npm install
   npm run build:production
   ```

2. **Environment Variable Issues**
   ```bash
   # Validate configuration
   npm run deploy:check
   ```

3. **Routing Issues (404s)**
   - Ensure SPA fallback is configured
   - Check redirect rules in platform config

4. **Performance Issues**
   ```bash
   # Analyze bundle
   npm run analyze
   ```

### Support

- 📧 Technical Support: [support contact]
- 📖 Documentation: [docs link]
- 💬 Community: [community link]

## 📈 Performance Targets

### Core Web Vitals Goals

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Bundle Size Targets

- **Initial Bundle**: < 200KB (gzipped)
- **Total JavaScript**: < 1MB (gzipped)
- **Critical CSS**: < 50KB (gzipped)

## 🎉 Go Live Checklist

- [ ] Production environment variables configured
- [ ] SSL certificate active
- [ ] Custom domain configured
- [ ] Analytics tracking verified
- [ ] Error monitoring active
- [ ] Performance monitoring setup
- [ ] SEO tags verified
- [ ] Social media sharing tested
- [ ] Mobile responsiveness confirmed
- [ ] Accessibility compliance verified
- [ ] Security headers configured
- [ ] Backup and monitoring systems active

---

**🚀 Your Real Estate Hotspot is ready for launch!**

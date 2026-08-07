# GIAP Frontend Deployment Guide for Netlify

## Prerequisites
- A Netlify account (sign up at https://netlify.com)
- Your backend deployed and accessible via HTTPS URL
- Git repository (optional but recommended)

## Deployment Steps

### Method 1: Deploy via Netlify CLI (Recommended)

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Deploy to Netlify**
   ```bash
   netlify deploy
   ```
   - Choose "Create & configure a new site"
   - Select your team
   - Enter a site name (or leave blank for random)
   - Set deploy path to: `dist`

6. **Deploy to production**
   ```bash
   netlify deploy --prod
   ```

### Method 2: Deploy via Netlify Web Interface

1. **Build the project locally**
   ```bash
   cd frontend
   npm run build
   ```

2. **Go to Netlify Dashboard**
   - Visit https://app.netlify.com
   - Click "Add new site" → "Deploy manually"

3. **Drag and drop**
   - Drag the `frontend/dist` folder to the upload area

### Method 3: Deploy via Git (Best for Continuous Deployment)

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider and repository

3. **Configure build settings**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

4. **Click "Deploy site"**

## Important Configuration

### 1. Update Backend URL

After deploying your backend, update the API URL in:

**Option A: netlify.toml**
```toml
[[redirects]]
  from = "/api/*"
  to = "https://YOUR-BACKEND-URL.com/api/:splat"
  status = 200
  force = true
```

**Option B: Environment Variables in Netlify Dashboard**
- Go to Site settings → Environment variables
- Add: `VITE_API_BASE_URL` = `https://YOUR-BACKEND-URL.com/api`

### 2. Configure CORS on Backend

Ensure your backend allows requests from your Netlify domain:
- Update CORS settings in `backend/app/__init__.py`
- Add your Netlify URL (e.g., `https://your-app.netlify.app`)

### 3. Update Frontend URLs

If needed, update `FRONTEND_URL` in backend `.env`:
```
FRONTEND_URL=https://your-app.netlify.app
```

## Post-Deployment Checklist

✅ Test login functionality
✅ Test registration
✅ Test password reset email links
✅ Test application submission
✅ Test admin dashboard
✅ Test file uploads
✅ Verify cookie banner appears
✅ Check all images and assets load correctly

## Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow DNS configuration instructions

## Environment Variables for Production

Set these in Netlify Dashboard (Site settings → Environment variables):

- `VITE_API_BASE_URL` - Your backend API URL

## Troubleshooting

### Issue: API calls fail with 404
- Check that the backend URL in `netlify.toml` is correct
- Verify backend is deployed and accessible

### Issue: Routes return 404
- The `_redirects` file should be in the `dist` folder after build
- Check that SPA fallback is configured: `/* /index.html 200`

### Issue: Environment variables not working
- Ensure variables start with `VITE_` prefix
- Restart the build after adding environment variables

## Useful Netlify Commands

```bash
# Check deployment status
netlify status

# Open site in browser
netlify open

# View site logs
netlify logs

# Link local project to existing site
netlify link
```

## Next Steps

1. Deploy your backend (Render, Railway, Heroku, AWS, etc.)
2. Update the backend URL in `netlify.toml`
3. Configure CORS on backend to allow your Netlify domain
4. Test all features thoroughly
5. Set up custom domain (optional)

## Support

For issues specific to Netlify deployment:
- Netlify Docs: https://docs.netlify.com
- Netlify Support: https://support.netlify.com

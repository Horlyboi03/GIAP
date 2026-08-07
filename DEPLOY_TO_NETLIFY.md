# Deploy GIAP Frontend to Netlify - Step by Step

## Option 1: Quick Deploy (Drag & Drop - Easiest)

### Step 1: Build the Frontend
```bash
cd frontend
npm run build
```

### Step 2: Deploy to Netlify
1. Go to https://app.netlify.com
2. Sign in or create account
3. Click "Add new site" → "Deploy manually"
4. Drag and drop the `frontend/dist` folder
5. Done! Your site is live

### Step 3: Configure Backend URL
1. In Netlify dashboard, go to your site
2. Go to "Site configuration" → "Environment variables"
3. Add variable:
   - Key: `VITE_API_BASE_URL`
   - Value: `http://localhost:3000/api` (use your deployed backend URL later)
4. Click "Deploy" → "Trigger deploy" to rebuild with new variable

---

## Option 2: Deploy via GitHub (Best for Updates)

### Step 1: Create GitHub Repository

1. Go to https://github.com
2. Click "+" → "New repository"
3. Name it: `giap-grant-platform` (or any name)
4. Make it **Private** (important for security)
5. Click "Create repository"

### Step 2: Push Your Code to GitHub

Run these commands in your GIAP folder:

```bash
# Initialize git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - GIAP Grant Platform"

# Add GitHub as remote (replace YOUR-USERNAME and YOUR-REPO)
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Connect Netlify to GitHub

1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub"
4. Select your repository
5. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
6. Click "Deploy site"

### Step 4: Add Environment Variables
1. Go to Site settings → Environment variables
2. Add: `VITE_API_BASE_URL` = `http://localhost:3000/api`
3. Redeploy the site

---

## Option 3: Install Netlify CLI and Deploy

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify
```bash
netlify login
```

### Step 3: Build and Deploy
```bash
cd frontend
npm run build
netlify deploy --prod
```

When prompted:
- Deploy path: `dist`
- Choose "Create & configure a new site"

---

## After Deployment: Update Backend URL

### Once your backend is deployed:

**Update netlify.toml** (in `frontend/netlify.toml`):
```toml
[[redirects]]
  from = "/api/*"
  to = "https://YOUR-BACKEND-URL.com/api/:splat"
  status = 200
  force = true
```

**Or use Environment Variable in Netlify:**
- Go to Site settings → Environment variables
- Update `VITE_API_BASE_URL` to your backend URL
- Redeploy

---

## Important: Update Backend CORS

In your backend `app/__init__.py`, add your Netlify URL:

```python
CORS(app, origins=[
    'http://localhost:5173',
    'https://your-app.netlify.app'  # Add your Netlify URL here
])
```

---

## Testing Your Deployed Site

✅ Visit your Netlify URL
✅ Test registration
✅ Test login
✅ Test cookie banner
✅ Test all navigation
✅ Check console for any errors

---

## Need Help?

If you get stuck, I can help you troubleshoot any deployment issues!

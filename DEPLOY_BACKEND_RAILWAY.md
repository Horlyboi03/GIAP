# Deploy GIAP Backend to Railway - Step by Step

## What is Railway?

Railway is a deployment platform that:
- ✅ Connects directly to GitHub
- ✅ Auto-deploys when you push code
- ✅ Provides free $5/month credits (enough for development)
- ✅ Gives you a live URL instantly
- ✅ Easy environment variable management

---

## Step 1: Sign Up for Railway

1. Go to https://railway.app
2. Click **"Login"** or **"Start a New Project"**
3. Sign in with **GitHub** (easiest option)
4. Authorize Railway to access your GitHub

---

## Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: **Horlyboi03/GIAP**
4. Railway will show you detected services

---

## Step 3: Configure the Backend Service

1. Railway will detect your Python app
2. Click on the detected service
3. Go to **"Settings"** tab
4. Set these configurations:

   **Root Directory**: `backend`
   
   **Start Command**: `gunicorn app:app`
   
   **Port**: Railway auto-assigns (usually 8000)

---

## Step 4: Add Environment Variables

Click **"Variables"** tab and add these:

```
SECRET_KEY=your-production-secret-key-change-this-12345
JWT_SECRET_KEY=your-jwt-production-secret-change-this-67890

MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USE_SSL=false
MAIL_TIMEOUT=30
MAIL_USERNAME=giapgrantteam@gmail.com
MAIL_PASSWORD=bzelmjkjkiswnyvv
MAIL_DEFAULT_SENDER=giapgrantteam@gmail.com

FRONTEND_URL=https://profound-belekoy-6ce8db.netlify.app
```

**IMPORTANT**: Replace `FRONTEND_URL` with your actual Netlify URL!

---

## Step 5: Deploy!

1. Railway automatically starts deploying
2. Watch the **"Deployments"** tab for build logs
3. Wait 2-3 minutes for deployment to complete
4. You'll get a URL like: `https://giap-production.up.railway.app`

---

## Step 6: Get Your Backend URL

1. Go to **"Settings"** tab
2. Under **"Domains"**, you'll see your Railway URL
3. Click **"Generate Domain"** if not already generated
4. Copy this URL (you'll need it for Netlify)

---

## Step 7: Update Frontend to Use Backend

### Option A: Update Netlify Environment Variable

1. Go to your Netlify dashboard
2. Site settings → Environment variables
3. Update or add: `VITE_API_BASE_URL` = `https://your-railway-url.up.railway.app/api`
4. Go to Deploys → Trigger deploy

### Option B: Update netlify.toml in GitHub

Update the file at root `netlify.toml`:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-railway-url.up.railway.app/api/:splat"
  status = 200
  force = true
```

Then push to GitHub - Netlify will auto-redeploy.

---

## Step 8: Update Backend CORS

The backend needs to allow your Netlify domain. I'll help you with this after deployment.

---

## Step 9: Test Your Deployed App

1. Visit your Netlify URL
2. Try to register a new account
3. Check if you receive the welcome email
4. Try logging in
5. Test all features

---

## Troubleshooting

### Issue: "Application Error"
- Check Railway logs in the "Deployments" tab
- Make sure all environment variables are set

### Issue: CORS errors
- Update CORS settings in backend (I'll help with this)

### Issue: Database not persisting
- Railway's free tier uses ephemeral storage
- For production, you'll need to add a PostgreSQL database

### Issue: 502 Bad Gateway
- Check that `gunicorn app:app` command is correct
- Verify Railway detected Python correctly

---

## Cost

- **Free Tier**: $5 credits/month
- **Usage**: ~$0.000231/minute when running
- **Estimate**: Enough for ~360 hours/month of uptime

---

## Next Steps After Deployment

1. Get your Railway backend URL
2. Update Netlify frontend to point to it
3. Test all features
4. Add PostgreSQL database if needed (optional)
5. Set up custom domain (optional)

---

## Need Help?

If you get stuck at any step, let me know and I'll guide you through it!

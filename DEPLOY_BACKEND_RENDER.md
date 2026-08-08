# Deploy GIAP Backend to Render - Complete Guide

## What is Render?

Render is a cloud platform that:
- ✅ Free tier with 750 hours/month
- ✅ Connects directly to GitHub
- ✅ Auto-deploys when you push code
- ✅ No credit card required for free tier
- ✅ Easy environment variable management

---

## Step 1: Sign Up for Render

1. Go to https://render.com
2. Click **"Get Started"** or **"Sign Up"**
3. Sign up with **GitHub** (recommended)
4. Authorize Render to access your GitHub

---

## Step 2: Create New Web Service

1. From Dashboard, click **"New +"** button
2. Select **"Web Service"**
3. Connect your GitHub repository: **Horlyboi03/GIAP**
4. Click **"Connect"** next to your repository

---

## Step 3: Configure Web Service

Fill in these settings:

### Basic Settings:
- **Name**: `giap-backend` (or any name you want)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`

### Build Settings:
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn wsgi:app --bind 0.0.0.0:$PORT`

### Instance Type:
- Select **"Free"** (750 hours/month)

---

## Step 4: Create PostgreSQL Database

Before configuring the web service, create a PostgreSQL database:

1. From Dashboard, click **"New +"** button
2. Select **"PostgreSQL"**
3. Configure database:
   - **Name**: `giap-database`
   - **Database**: `giap_db`
   - **User**: `giap_user` (or leave default)
   - **Region**: Same as your web service
   - **PostgreSQL Version**: 15 or latest
   - **Plan**: **Free** (256MB RAM, 1GB storage)
4. Click **"Create Database"**
5. Wait for database to be created
6. **Copy the Internal Database URL** - you'll need this!

---

## Step 5: Add Environment Variables

Scroll down to **"Environment Variables"** section and add these:

Click **"Add Environment Variable"** for each:

```
DATABASE_URL = [paste the Internal Database URL from Step 4]

SECRET_KEY = your-production-secret-key-change-this-12345
JWT_SECRET_KEY = your-jwt-production-secret-change-this-67890

MAIL_SERVER = smtp.gmail.com
MAIL_PORT = 587
MAIL_USE_TLS = true
MAIL_USE_SSL = false
MAIL_TIMEOUT = 30
MAIL_USERNAME = giapgrantteam@gmail.com
MAIL_PASSWORD = bzelmjkjkiswnyvv
MAIL_DEFAULT_SENDER = giapgrantteam@gmail.com

FRONTEND_URL = https://profound-belekoy-6ce8db.netlify.app
```

**IMPORTANT**: 
- Replace `DATABASE_URL` with the Internal Database URL you copied in Step 4
- Replace `FRONTEND_URL` with your actual Netlify URL
- Change the SECRET_KEY values to something secure

---

## Step 6: Create Web Service

1. Click **"Create Web Service"** button at the bottom
2. Render will start building your backend
3. Watch the logs - build takes 2-5 minutes
4. Wait for "Live" status

---

## Step 7: Get Your Backend URL

Once deployed (status shows "Live"):

1. You'll see your service URL at the top
2. It will look like: `https://giap-backend.onrender.com`
3. **Copy this URL** - you'll need it!

---

## Step 8: Test Your Backend

Visit: `https://your-service-name.onrender.com/api/grants/categories`

You should see a JSON response with grant categories.

---

## Step 9: Update Frontend to Use Backend

### Option A: Update Netlify Environment Variable (Recommended)

1. Go to Netlify dashboard: https://app.netlify.com
2. Select your site: **profound-belekoy-6ce8db**
3. Go to **"Site configuration"** → **"Environment variables"**
4. Add or update:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://your-render-url.onrender.com/api`
5. Click **"Save"**
6. Go to **"Deploys"** tab → **"Trigger deploy"** → **"Deploy site"**

### Option B: Update GitHub netlify.toml

Update `netlify.toml` in the root:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-render-url.onrender.com/api/:splat"
  status = 200
  force = true
```

Push to GitHub - Netlify auto-redeploys.

---

## Step 10: Update Backend CORS

Your backend needs to allow requests from Netlify.

Update `backend/app/__init__.py`:

Find this line:
```python
CORS(app, origins=['http://localhost:5173'])
```

Change to:
```python
CORS(app, origins=[
    'http://localhost:5173',
    'https://profound-belekoy-6ce8db.netlify.app'  # Add your Netlify URL
])
```

Then push to GitHub - Render will auto-redeploy.

---

## Step 11: Test Everything

1. Visit your Netlify site: https://profound-belekoy-6ce8db.netlify.app
2. Try to register a new account
3. Check if you receive the welcome email
4. Try logging in
5. Submit a test application
6. Check admin dashboard

---

## Important Notes

### Free Tier Limitations:
- ⚠️ **Spins down after 15 minutes of inactivity**
- First request after spin-down takes ~30-60 seconds
- 750 hours/month free (about 31 days if always on)

### Keep Service Awake (Optional):
Use a service like **UptimeRobot** or **cron-job.org** to ping your API every 14 minutes:
- URL to ping: `https://your-service.onrender.com/api/grants/categories`
- Frequency: Every 14 minutes

### Database:
- ✅ Using PostgreSQL (persistent storage)
- Data persists across restarts
- Free tier: 256MB RAM, 1GB storage
- Backup recommended for production

---

## Troubleshooting

### Issue: Build Failed
- Check the build logs in Render dashboard
- Verify `requirements.txt` has all dependencies
- Make sure Python version is compatible

### Issue: "Application Error" or 502
- Check the logs in Render dashboard
- Verify start command: `gunicorn wsgi:app --bind 0.0.0.0:$PORT`
- Make sure all environment variables are set
- Verify DATABASE_URL is set correctly

### Issue: CORS Errors
- Add your Netlify URL to CORS in `backend/app/__init__.py`
- Push changes to GitHub
- Render will auto-redeploy

### Issue: Email Not Sending
- Verify MAIL_USERNAME and MAIL_PASSWORD are correct
- Check Render logs for email errors

---

## Render Dashboard URLs

- Main Dashboard: https://dashboard.render.com
- Your Services: https://dashboard.render.com/services
- Docs: https://render.com/docs

---

## Cost Estimate

**Free Tier**: 750 hours/month = FREE
- Perfect for development and testing
- Suitable for low-traffic production apps

**Paid Plans** (if you outgrow free tier):
- Starter: $7/month (always on, no spin down)
- Standard: $25/month (more resources)

---

## Next Steps

After successful deployment:

1. ✅ Test all features on live site
2. ✅ Monitor Render logs for any errors
3. ✅ Consider adding PostgreSQL for persistent data
4. ✅ Set up uptime monitoring
5. ✅ Configure custom domain (optional)

---

## Need Help?

If you encounter any issues during deployment, let me know and I'll help troubleshoot!

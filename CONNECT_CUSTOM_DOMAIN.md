# Connect giapgrant.org to Your GIAP Application

You have: `giapgrant.org` on Cloudflare

We need to connect:
- **Frontend**: `giapgrant.org` → Netlify
- **Backend API**: `api.giapgrant.org` → Render

---

## Part 1: Connect Frontend Domain to Netlify

### Step 1: Add Domain in Netlify

1. **Go to Netlify Dashboard**: https://app.netlify.com
2. **Click your site** (profound-belekoy-6ce8db)
3. **Go to "Domain management"** (in left sidebar or top menu)
4. **Click "Add custom domain"**
5. **Enter**: `giapgrant.org`
6. **Click "Verify"** and then **"Add domain"**
7. Netlify will show you DNS records to add

### Step 2: Configure DNS in Cloudflare

1. **Go to Cloudflare Dashboard**: https://dash.cloudflare.com
2. **Select your domain**: `giapgrant.org`
3. **Click "DNS"** in the left menu
4. **Add these DNS records**:

#### Record 1: Root Domain
- **Type**: `A`
- **Name**: `@` (or root)
- **IPv4 address**: `75.2.60.5` (Netlify's load balancer IP)
- **Proxy status**: 🟠 DNS only (turn OFF orange cloud)
- **TTL**: Auto
- Click **Save**

#### Alternative (CNAME for Root - if A record doesn't work):
- **Type**: `CNAME`
- **Name**: `@`
- **Target**: `profound-belekoy-6ce8db.netlify.app`
- **Proxy status**: 🟠 DNS only
- Click **Save**

#### Record 2: WWW Subdomain (Optional but Recommended)
- **Type**: `CNAME`
- **Name**: `www`
- **Target**: `profound-belekoy-6ce8db.netlify.app`
- **Proxy status**: 🟠 DNS only
- **TTL**: Auto
- Click **Save**

### Step 3: Wait for DNS Propagation

- **Wait**: 5-60 minutes for DNS to propagate
- **Check status** in Netlify dashboard
- When ready, Netlify will automatically provision SSL certificate

### Step 4: Enable HTTPS Redirect in Netlify

1. In Netlify → Domain management
2. Find **"HTTPS"** section
3. Enable **"Force HTTPS"** (redirects HTTP to HTTPS)

---

## Part 2: Connect Backend API to Render

### Step 1: Add Custom Domain in Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click your backend service**
3. **Click "Settings"** in left sidebar
4. **Scroll to "Custom Domain"** section
5. **Click "Add Custom Domain"**
6. **Enter**: `api.giapgrant.org`
7. **Click "Save"**
8. Render will show you DNS records to add

### Step 2: Add DNS Record for API in Cloudflare

1. **Go to Cloudflare Dashboard**
2. **Select**: `giapgrant.org`
3. **Click "DNS"**
4. **Add this record**:

#### API Subdomain
- **Type**: `CNAME`
- **Name**: `api`
- **Target**: Copy from Render (will be like `giap-ivc4.onrender.com`)
- **Proxy status**: 🟠 DNS only (turn OFF orange cloud)
- **TTL**: Auto
- Click **Save**

### Step 3: Wait for SSL Certificate

- **Wait**: 5-15 minutes
- Render will automatically provision SSL certificate
- Check Render dashboard for "Certificate provisioned" status

---

## Part 3: Update Application Configuration

### Step 1: Update Environment Variables in Netlify

1. **Go to Netlify Dashboard**
2. **Click your site**
3. **Go to "Site configuration"** → **"Environment variables"**
4. **Update** `VITE_API_BASE_URL`:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://api.giapgrant.org/api`
5. **Click "Save"**
6. **Trigger a new deployment**: Go to "Deploys" → "Trigger deploy" → "Deploy site"

### Step 2: Update Environment Variables in Render

1. **Go to Render Dashboard**
2. **Click your backend service**
3. **Click "Environment"**
4. **Update** `FRONTEND_URL`:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://giapgrant.org`
5. **Click "Save Changes"**
6. Wait for automatic redeploy

### Step 3: Update CORS in Backend Code

Update the allowed origins in `backend/app/__init__.py`:

```python
CORS(app, resources={r"/api/*": {
    "origins": [
        "http://localhost:5173",
        "https://profound-belekoy-6ce8db.netlify.app",
        "https://giapgrant.org",
        "https://www.giapgrant.org"
    ],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": True
}})
```

Then commit and push the changes.

---

## Part 4: Update Brevo Sender Domain (Optional but Recommended)

Since you now have a custom domain, you can improve email deliverability:

1. **Go to Brevo Dashboard**: https://app.brevo.com
2. **Go to "Senders, Domains & Dedicated IPs"**
3. **Click "Domains" tab**
4. **Add domain**: `giapgrant.org`
5. **Follow verification steps** (add DNS records in Cloudflare)
6. **Once verified**, you can create sender: `noreply@giapgrant.org` or `team@giapgrant.org`

This is optional but improves email deliverability significantly!

---

## Part 5: Testing

### Test Frontend
1. Visit: `https://giapgrant.org`
2. Should load your GIAP application
3. Check that all pages work

### Test Backend API
1. Visit: `https://api.giapgrant.org/api` in browser
2. Should show: "GIAP Backend API is running!"

### Test Full Integration
1. Register a new account at `https://giapgrant.org`
2. Should receive welcome email
3. Submit an application
4. Check that everything works end-to-end

---

## 📋 Quick Reference

| What | Domain | Points to |
|------|--------|-----------|
| **Website** | `giapgrant.org` | Netlify (`profound-belekoy-6ce8db.netlify.app`) |
| **WWW** | `www.giapgrant.org` | Netlify |
| **Backend API** | `api.giapgrant.org` | Render (`giap-ivc4.onrender.com`) |

---

## 🔧 Cloudflare Important Settings

### Turn OFF Cloudflare Proxy (Orange Cloud)

For both records, make sure the orange cloud is **OFF** (gray cloud):
- `giapgrant.org` → Gray cloud 🟢
- `api.giapgrant.org` → Gray cloud 🟢

**Why?** Cloudflare proxy can interfere with Netlify/Render SSL certificates. Use "DNS only" mode.

### SSL/TLS Settings in Cloudflare

1. Go to **SSL/TLS** in Cloudflare
2. Set encryption mode to: **Full (strict)**
3. Enable **Always Use HTTPS**

---

## ⏱️ Timeline

- **DNS Records**: Add in Cloudflare (5 minutes)
- **DNS Propagation**: 5-60 minutes
- **SSL Certificate**: 5-15 minutes after DNS propagates
- **Total**: 15 minutes to 1.5 hours

---

## 🆘 Troubleshooting

### If domain doesn't work after 1 hour:
1. Check DNS propagation: https://dnschecker.org (enter `giapgrant.org`)
2. Verify Cloudflare proxy is OFF (gray cloud)
3. Check Netlify dashboard for domain status
4. Check Render dashboard for SSL certificate status

### If you see SSL errors:
1. Wait longer (can take up to 24 hours in rare cases)
2. Make sure Cloudflare proxy is OFF
3. Check SSL/TLS mode is "Full (strict)"

### If API calls fail:
1. Check browser console for errors
2. Verify `VITE_API_BASE_URL` in Netlify is correct
3. Verify CORS origins include new domain
4. Check that `api.giapgrant.org` resolves correctly

---

## 📞 Need Help?

If you run into issues, send me:
1. Screenshot of Cloudflare DNS records
2. Screenshot of Netlify domain settings
3. Screenshot of Render custom domain settings
4. Any error messages you see

Let's get your custom domain connected! 🚀

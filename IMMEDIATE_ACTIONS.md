# Immediate Actions to Fix Issues

## 🔴 CRITICAL: Brevo Email Not Sending

### The Problem
Brevo is blocking Render's IP address (`74.220.48.20`) with 401 Unauthorized error.

### The Solution (Choose ONE)

**OPTION 1: Whitelist All IPs (RECOMMENDED)**
1. Visit: https://app.brevo.com/security/authorised_ips
2. Click "Add IP Address" 
3. Enter: `0.0.0.0/0`
4. Save

**OPTION 2: Disable IP Whitelisting (EASIEST)**
1. Visit: https://app.brevo.com/security/authorised_ips
2. Remove all IP addresses OR toggle "Disable IP Whitelisting"
3. Save

**After fixing, test:**
- Create a new account → Check for welcome email
- Submit an application → Check for confirmation email
- Approve/reject as admin → Check for status email

---

## 🟡 ID Card Images Showing Black

### The Issue
Images may not be loading due to browser cache or Render's ephemeral storage.

### Diagnostic Steps

**Step 1: Check if Images Load Directly**
Open this URL in a new browser tab:
```
https://giap-ivc4.onrender.com/api/documents/uploads/10_1785710432.06037_Brothers_at_finish_line_2K_202607300221.jpeg
```

- ✅ If it loads: The issue is browser cache
- ❌ If it 404s: Files were lost (Render restarted)
- ❌ If CORS error: Configuration issue

**Step 2: Clear Browser Cache**
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Try in Incognito/Private mode

**Step 3: Check Console for Errors**
1. Open admin dashboard
2. Right-click on black image → "Inspect Element"
3. Check Console tab for errors
4. Check Network tab to see if image requests succeed

### Root Cause Analysis

**Most Likely**: Browser cached the failed image loads from previous attempts.

**Alternative**: Files were deleted when Render restarted (ephemeral storage).

### If Images Are Missing
Render's free tier uses **ephemeral storage** - files are lost on restart/redeploy.

**Solutions**:
1. **For testing**: Upload new ID cards (files will persist until next restart)
2. **For production**: Use cloud storage like:
   - AWS S3
   - Cloudinary
   - Google Cloud Storage

---

## 📋 Testing Checklist

After fixing Brevo IP whitelisting:

1. **Test Registration**
   - [ ] Create new account
   - [ ] Check email for welcome message
   - [ ] Check Render logs for `[BREVO SUCCESS]`

2. **Test Application Submission**
   - [ ] Submit a grant application
   - [ ] Check email for confirmation
   - [ ] Check Render logs for success

3. **Test Admin Actions**
   - [ ] Login as admin
   - [ ] Approve an application
   - [ ] Check applicant email for approval
   - [ ] Reject an application
   - [ ] Check applicant email for rejection

4. **Test ID Card Images**
   - [ ] View application with ID cards
   - [ ] Click to preview images
   - [ ] Download images
   - [ ] Check in multiple browsers

---

## 🔍 How to Check Render Logs

1. Go to: https://dashboard.render.com
2. Click on your backend service
3. Click "Logs" tab
4. Look for:
   - `[BREVO SUCCESS]` = Email sent successfully ✅
   - `[BREVO ERROR]` = Email failed ❌
   - Status 401 = IP whitelisting issue
   - Status 200 = Success

---

## 💡 Quick Test: Brevo Configuration

Run this on your local machine to test Brevo:

```bash
cd backend
python test_brevo.py
```

This will:
- Check if BREVO_API_KEY is set
- Verify Brevo SDK is installed
- Optionally send a test email
- Provide specific error messages if something is wrong

---

## ⚠️ Important Notes

### About Render's Ephemeral Storage
- Files in `backend/uploads/` are **NOT permanent**
- Files are lost when:
  - Service restarts
  - New deployment happens
  - Service crashes and recovers

### About Brevo IP Whitelisting
- Render's IP can change over time
- Using `0.0.0.0/0` (all IPs) is recommended for Render
- Alternatively, disable IP whitelisting entirely

### About the Admin Dashboard Fix
The admin dashboard **already has the correct code** to load images from:
```
https://giap-ivc4.onrender.com/api/documents/uploads/{filename}
```

The issue is either:
1. Browser cached failed attempts (clear cache)
2. Files were deleted by Render restart (re-upload)
3. CORS error (unlikely - CORS is configured correctly)

---

## 🆘 If Still Not Working

### For Brevo Email Issues:
1. Share the Render logs showing the `[BREVO ERROR]` messages
2. Confirm you've whitelisted `0.0.0.0/0` in Brevo settings
3. Try running `backend/test_brevo.py` locally

### For Image Issues:
1. Share screenshot of browser console errors
2. Share screenshot of Network tab showing image requests
3. Test if image URL loads directly in new tab
4. Confirm you've cleared browser cache

---

## 📞 Current Configuration

**Brevo**:
- API Key: Set in Render environment variables as `BREVO_API_KEY`
- Sender: `giapgrantteam@gmail.com`
- Blocked IP: `74.220.48.20` (Render's current IP)

**URLs**:
- Frontend: https://profound-belekoy-6ce8db.netlify.app
- Backend: https://giap-ivc4.onrender.com

**Admin Login**:
- Email: `giapgrantteam@gmail.com`
- Password: `Olawale1607!`

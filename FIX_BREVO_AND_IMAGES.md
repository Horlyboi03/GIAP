# Fix Brevo Emails & ID Card Images

## Issue 1: Brevo Emails Not Sending ❌

### Problem
Brevo API is blocking Render's IP address with 401 Unauthorized error.

### Root Cause
Brevo has IP whitelisting enabled in security settings, and Render's IP (`74.220.48.20`) is not whitelisted.

### Solution - Option A: Whitelist All IPs (Recommended for Render)

1. **Go to Brevo Security Settings**:
   - Navigate to: https://app.brevo.com/security/authorised_ips

2. **Add Universal Whitelist**:
   - Click "Add IP Address"
   - Enter: `0.0.0.0/0`
   - This allows ALL IPs (recommended for Render since IPs can change)

3. **Save Changes**

### Solution - Option B: Whitelist Specific IP

1. **Go to Brevo Security Settings**:
   - Navigate to: https://app.brevo.com/security/authorised_ips

2. **Add Render's Current IP**:
   - Click "Add IP Address"
   - Enter: `74.220.48.20`
   - **Warning**: Render's IP can change, so you may need to update this

3. **Save Changes**

### Solution - Option C: Disable IP Whitelisting (Easiest)

1. **Go to Brevo Security Settings**:
   - Navigate to: https://app.brevo.com/security/authorised_ips

2. **Disable IP Whitelisting**:
   - Look for a toggle or button to "Disable IP Whitelisting"
   - Or remove all IP addresses from the whitelist

3. **Save Changes**

### Verify Email is Working

After whitelisting the IP or disabling IP restrictions:

1. **Check Render Logs**:
   - Go to Render dashboard
   - View your backend service logs
   - Look for `[BREVO SUCCESS]` messages

2. **Test Registration**:
   - Create a new account on your app
   - Check the email inbox for welcome email
   - Check Render logs for success/error messages

3. **Test Application Submission**:
   - Submit a grant application
   - Check for submission confirmation email

4. **Test Admin Approval/Rejection**:
   - Login as admin
   - Approve or reject an application
   - Check applicant's email for status update

---

## Issue 2: ID Card Images Not Showing (Black Screen) 🖼️

### Problem
ID card images appear black or don't display in admin dashboard.

### Root Cause Analysis
The code is correctly constructing URLs to Render's backend, but images may not be loading due to:
1. CORS configuration issues
2. Image files not properly uploaded
3. Browser cache issues
4. Missing image files on Render (ephemeral storage)

### Solution Steps

#### Step 1: Verify CORS Configuration

The backend should allow image requests from the frontend. Check that CORS is properly configured in `backend/app.py`.

#### Step 2: Test Image URLs Directly

1. **Open Admin Dashboard**
2. **Right-click on the black image** → "Inspect Element"
3. **Check the Console tab** for any errors like:
   - `CORS policy: No 'Access-Control-Allow-Origin' header`
   - `404 Not Found`
   - `Failed to load resource`

4. **Copy the image URL** from the Network tab
5. **Open the URL in a new browser tab**
   - Example: `https://giap-ivc4.onrender.com/api/documents/uploads/3_1785537288.083111_Brother_B_tired_finish_line_202607300115.jpeg`
   - If it loads in a new tab, the issue is in the React code
   - If it returns 404 or CORS error, the issue is on the backend

#### Step 3: Check Uploaded Files

The files exist in `backend/uploads/` folder. Test if they're accessible:

1. **Try accessing an existing file directly**:
   ```
   https://giap-ivc4.onrender.com/api/documents/uploads/10_1785710432.06037_Brothers_at_finish_line_2K_202607300221.jpeg
   ```

2. **If you get 404**: The file path in the database might be incorrect
3. **If you get CORS error**: Need to update CORS configuration

#### Step 4: Clear Browser Cache

Sometimes browsers cache failed image loads:

1. **Hard refresh the page**: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. **Clear browser cache** for the site
3. **Try in Incognito/Private mode**

#### Step 5: Check Database Records

The database stores the filename without the path. The code constructs:
```
https://giap-ivc4.onrender.com/api/documents/uploads/{filename}
```

Verify that:
- `applicant.id_front_path` contains just the filename (e.g., `10_1785710432.06037_Brothers_at_finish_line_2K_202607300221.jpeg`)
- NOT a full path (e.g., ~~`uploads/10_1785710432.06037_Brothers_at_finish_line_2K_202607300221.jpeg`~~)

---

## Important Notes

### Render's Ephemeral Storage ⚠️

**Warning**: Render's free tier uses ephemeral storage. This means:
- Uploaded files are **lost when the service restarts**
- Files are **not persistent** across deployments

**Recommended Solutions**:
1. **Use cloud storage** (AWS S3, Cloudinary, etc.) for production
2. **For testing**: Files will persist until next deployment/restart

### Current Configuration

**Brevo Configuration**:
- API Key: Set in Render environment variables as `BREVO_API_KEY`
- Sender Email: `giapgrantteam@gmail.com`
- Sender Name: `GIAP Grant Team`

**Render Configuration**:
- Backend URL: `https://giap-ivc4.onrender.com`
- Frontend URL: `https://profound-belekoy-6ce8db.netlify.app`
- Current IP: `74.220.48.20`

---

## Testing Checklist

After applying fixes:

- [ ] Test user registration → Check for welcome email
- [ ] Test application submission → Check for confirmation email
- [ ] Test admin approval → Check for approval email
- [ ] Test admin rejection → Check for rejection email
- [ ] View application with ID cards in admin dashboard
- [ ] Click on ID card images to preview
- [ ] Download ID card images
- [ ] Check Render logs for any errors

---

## If Images Still Don't Show

If images still appear black after all steps:

1. **Take a screenshot** of the browser console errors
2. **Check the Network tab** in browser dev tools
3. **Share the exact error message** from console
4. **Test the image URL directly** in a new tab

The most likely causes are:
- CORS not allowing image requests
- Image files were lost due to Render restart
- Database has incorrect file paths

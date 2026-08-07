# Gmail SMTP Not Working - Fix Guide

## Current Error:
```
(535, b'5.7.8 Username and Password not accepted. BadCredentials')
```

This means Gmail is rejecting the app password.

---

## Solution 1: Generate NEW Gmail App Password (Recommended)

### Step 1: Verify 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Ensure "2-Step Verification" is **ON**
3. If OFF, enable it first

### Step 2: Generate New App Password
1. Go to https://myaccount.google.com/apppasswords
2. If you see old app passwords, **revoke them**
3. Click "Select app" → Choose "Mail"
4. Click "Select device" → Choose "Other (Custom name)"
5. Enter: "GIAP Application"
6. Click **Generate**
7. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
8. Remove spaces: `abcdefghijklmnop`

### Step 3: Update .env File
Open `backend/.env` and replace the password:

```env
MAIL_USERNAME=giapgrantteam@gmail.com
MAIL_PASSWORD=abcdefghijklmnop
```
(Use your NEW 16-character app password without spaces)

### Step 4: Restart Backend
```bash
# Stop the current backend (Ctrl+C)
cd backend
python app.py
```

---

## Solution 2: Enable "Less Secure App Access" (If App Password Fails)

1. Go to https://myaccount.google.com/lesssecureapps
2. Turn ON "Allow less secure apps"
3. Use your regular Gmail password in `.env`:

```env
MAIL_USERNAME=giapgrantteam@gmail.com
MAIL_PASSWORD=your-regular-password
```

⚠️ **Note:** This is less secure and Gmail may disable it.

---

## Solution 3: Use Outlook/Hotmail Instead

If Gmail continues to have issues, switch to Outlook:

### Step 1: Create Outlook Account (if needed)
- Go to https://outlook.live.com
- Sign up for free

### Step 2: Update .env
```env
MAIL_SERVER=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USE_SSL=false
MAIL_USERNAME=your-email@outlook.com
MAIL_PASSWORD=your-outlook-password
MAIL_DEFAULT_SENDER=your-email@outlook.com
```

### Step 3: Restart Backend

---

## Solution 4: Use SendGrid (Production Recommended)

For production, use SendGrid (free tier: 100 emails/day):

### Step 1: Sign Up
1. Go to https://sendgrid.com
2. Create free account
3. Verify email

### Step 2: Create API Key
1. Go to Settings → API Keys
2. Create API Key
3. Copy the key

### Step 3: Update .env
```env
MAIL_SERVER=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USE_SSL=false
MAIL_USERNAME=apikey
MAIL_PASSWORD=YOUR_SENDGRID_API_KEY
MAIL_DEFAULT_SENDER=your-verified-email@domain.com
```

---

## Testing After Fix

### Test 1: Quick Python Test
```python
# In backend folder, create test_email.py
import sys
sys.path.insert(0, '.')

from app import create_app
from app.email_utils import send_registration_welcome_email

app = create_app()

with app.app_context():
    result = send_registration_welcome_email('your-email@gmail.com', 'Test')
    if result:
        print("✅ Email sent successfully!")
    else:
        print("❌ Email failed. Check logs above.")
```

Run: `python test_email.py`

### Test 2: Register New User
1. Go to http://localhost:5173/register
2. Register with your real email
3. Check inbox for welcome email

### Test 3: Forgot Password
1. Go to http://localhost:5173/forgot-password
2. Enter your email
3. Check inbox for reset link

---

## Troubleshooting

### "Connection Timeout"
- **Issue:** Firewall/antivirus blocking SMTP
- **Fix:** Try different port (587 vs 465)

### "Authentication Failed"
- **Issue:** Wrong credentials
- **Fix:** Generate new app password

### "Username and Password not accepted"
- **Issue:** App password expired or revoked
- **Fix:** Generate NEW app password (Solution 1)

### Emails Go to Spam
- **Issue:** SPF/DKIM not configured
- **Fix:** Use SendGrid or professional email service

---

## Current Configuration Status

Your current `.env` has:
```
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=giapgrantteam@gmail.com
MAIL_PASSWORD=gqugvpwiiyoxjwnk
```

**The password `gqugvpwiiyoxjwnk` is being REJECTED by Gmail.**

### Action Required:
1. Go to https://myaccount.google.com/apppasswords
2. Generate a NEW app password
3. Replace `gqugvpwiiyoxjwnk` in `.env` with the new password
4. Restart backend

---

## Quick Fix Commands

```bash
# 1. Stop backend (Ctrl+C in terminal)

# 2. Edit .env file (replace password with new one)

# 3. Restart backend
cd backend
python app.py

# 4. Test email
python test_email.py
```

---

## Alternative: Use Environment Variable

If `.env` isn't being read correctly, set environment variables directly:

### Windows PowerShell:
```powershell
$env:MAIL_USERNAME="giapgrantteam@gmail.com"
$env:MAIL_PASSWORD="your-new-app-password"
python app.py
```

### Windows CMD:
```cmd
set MAIL_USERNAME=giapgrantteam@gmail.com
set MAIL_PASSWORD=your-new-app-password
python app.py
```

---

## Success Indicators

✅ Backend logs should show:
```
DEBUG: Welcome email sent to user@example.com
```

❌ Instead of:
```
WARNING: Failed to send email: BadCredentials
```

---

**Bottom Line:** The Gmail app password needs to be regenerated. It's likely expired or revoked.

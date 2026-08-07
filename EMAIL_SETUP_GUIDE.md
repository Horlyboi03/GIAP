# GIAP Email Notification Setup Guide

## 📧 Email Functionality

The GIAP application sends automated emails for:

1. **Welcome Email** - When a user registers
2. **Application Submitted** - When an applicant submits an application (future feature)
3. **Application Approved** - When admin approves an application
4. **Application Rejected** - When admin rejects an application
5. **Password Reset** - When user requests password reset (future feature)

---

## 🔧 SMTP Configuration

### Option 1: Gmail (Recommended for Testing)

#### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"

#### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Name it "GIAP Application"
4. Click "Generate"
5. Copy the 16-character password (no spaces)

#### Step 3: Update `.env` File
Open `backend/.env` and update:

```env
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-16-character-app-password
MAIL_DEFAULT_SENDER=your-gmail@gmail.com
FRONTEND_URL=http://localhost:5173
```

**Replace:**
- `your-gmail@gmail.com` with your actual Gmail address
- `your-16-character-app-password` with the app password from Step 2

---

### Option 2: Outlook/Hotmail

```env
MAIL_SERVER=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@outlook.com
MAIL_PASSWORD=your-password
MAIL_DEFAULT_SENDER=your-email@outlook.com
FRONTEND_URL=http://localhost:5173
```

---

### Option 3: Other SMTP Services

For services like SendGrid, Mailgun, or AWS SES, update:

```env
MAIL_SERVER=smtp.your-service.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-api-key
MAIL_DEFAULT_SENDER=noreply@yourdomain.com
FRONTEND_URL=http://localhost:5173
```

---

## 🚀 Testing Email Functionality

### After configuring SMTP:

#### 1. Restart Backend Server
```bash
# Stop the current backend (Ctrl+C in terminal)
cd backend
python app.py
```

#### 2. Test Registration Email
1. Go to http://localhost:5173/register
2. Register a new user with **your real email address**
3. Check your inbox for "Welcome to GIAP" email
4. Check spam folder if not found

#### 3. Test Approval/Rejection Email
1. Register and submit an application
2. Login as admin (admin@giap.org / Admin123!)
3. Approve or reject the application
4. The applicant should receive an email notification

---

## 🐛 Troubleshooting

### Email Not Sending

**1. Check Backend Logs**
Look for error messages in the terminal running `python app.py`:
```
DEBUG: Welcome email sent to user@example.com
```
or
```
DEBUG: Failed to send welcome email: [error message]
```

**2. Common Issues:**

#### Gmail: "Username and Password not accepted"
- Make sure you're using an **App Password**, not your regular password
- Enable 2-Factor Authentication first
- Generate a new App Password

#### Connection Timeout
- Check if your firewall/antivirus is blocking port 587
- Try using port 465 with SSL:
  ```env
  MAIL_PORT=465
  MAIL_USE_TLS=false
  MAIL_USE_SSL=true
  ```

#### "550 Authentication required"
- Verify MAIL_USERNAME and MAIL_PASSWORD are correct
- Ensure no extra spaces in the .env file

**3. Test SMTP Connection**
Create a file `test_email.py` in the backend folder:

```python
import sys
sys.path.insert(0, '.')

from app import create_app
from app.email_utils import send_registration_welcome_email

app = create_app()

with app.app_context():
    # Replace with your email
    result = send_registration_welcome_email('your-test-email@gmail.com', 'Test')
    if result:
        print("✓ Email sent successfully!")
    else:
        print("✗ Email failed to send. Check logs above.")
```

Run it:
```bash
cd backend
python test_email.py
```

---

## 📝 Email Templates

### Welcome Email (Registration)
```
Subject: Welcome to GIAP

Hello [First Name],

Your GIAP account has been created successfully.

You can now sign in, complete your profile, and submit your grant application.

Thank you for joining GIAP.
```

### Application Approved
```
Subject: GIAP Application Approved

Hello [Name],

We are pleased to let you know that your GIAP application for [Category] has been approved.

Application Status: Approved
Application ID: [APP-ID]

Your submitted details have been reviewed and approved by our team.
Please keep an eye on this email address for any next-step instructions from GIAP.

If you have any questions, you can reply to this email or contact giapteam@outlook.com.

Thank you for choosing GIAP.
```

### Application Declined
```
Subject: GIAP Application Declined

Hello [Name],

This is to let you know that your GIAP application for [Category] was not approved at this time.

Application Status: Declined
Application ID: [APP-ID]

Please log in to your dashboard to review the latest update.
If you need assistance, contact giapteam@outlook.com.

Thank you for using GIAP.
```

---

## 🔐 Security Notes

1. **Never commit `.env` file** to version control
2. **Use App Passwords** for Gmail (not your regular password)
3. **Rotate passwords** regularly
4. **For production**, use a dedicated email service (SendGrid, AWS SES, etc.)
5. **Email logs** are stored in the database for auditing

---

## ✅ Checklist

- [ ] Created Gmail App Password (or configured other SMTP)
- [ ] Updated `backend/.env` with correct credentials
- [ ] Restarted backend server
- [ ] Tested registration with real email
- [ ] Received welcome email
- [ ] Tested application approval email
- [ ] Tested application rejection email
- [ ] Emails not going to spam

---

## 🆘 Still Having Issues?

If emails still aren't working after following this guide:

1. Check backend terminal for error messages
2. Verify `.env` file has no typos or extra spaces
3. Test with a simple Python SMTP script to isolate the issue
4. Try a different email provider (Gmail → Outlook)
5. Check if your hosting provider blocks SMTP ports

---

## 📧 Email Flow Diagram

```
User Registers
    ↓
Backend creates account
    ↓
Sends welcome email
    ↓
User receives email

Admin Changes Status
    ↓
Backend updates status
    ↓
Sends status email (Approved/Rejected)
    ↓
Applicant receives email
    ↓
In-app notification also created
```

---

**Note:** For production deployment, consider using professional email services like SendGrid, AWS SES, or Mailgun for better deliverability and monitoring.

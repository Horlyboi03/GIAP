# Check Brevo Email Status

Since you don't see IP whitelisting options in Brevo, the issue might be different.

## Step 1: Check Render Environment Variables

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click on your backend service** (giap-ivc4)
3. **Click "Environment" tab on the left**
4. **Verify these variables exist**:
   - `BREVO_API_KEY` = Your Brevo API key (starting with `xkeysib-...`)
   - `MAIL_USERNAME` = `giapgrantteam@gmail.com`
   - `MAIL_DEFAULT_SENDER` = `giapgrantteam@gmail.com`
   - `FRONTEND_URL` = `https://profound-belekoy-6ce8db.netlify.app`

5. **If BREVO_API_KEY is missing or wrong**:
   - Click "Add Environment Variable"
   - Key: `BREVO_API_KEY`
   - Value: Your Brevo API key (the one starting with `xkeysib-`)
   - Click "Save Changes"

## Step 2: Check Render Logs

1. **Go to Render Dashboard**
2. **Click your backend service**
3. **Click "Logs" tab**
4. **Look for recent log messages**

### What to Look For:

**Good signs** (email is working):
```
✓ [BREVO SUCCESS] Email sent to someone@email.com
```

**Bad signs** (email is failing):
```
✗ [BREVO ERROR] Failed to send email to someone@email.com
✗ [BREVO ERROR] Status: 401
✗ [BREVO ERROR] Reason: Unauthorized
```

OR

```
[BREVO DEBUG] API Key configured: False, Length: 0
```
This means the API key is NOT set in environment variables.

## Step 3: Test Email Sending

After confirming environment variables are correct:

1. **Go to your app**: https://profound-belekoy-6ce8db.netlify.app
2. **Try to register a new account**:
   - Email: Use a real email you can access
   - Password: Anything
3. **Check if account is created** (try logging in)
4. **Check your email inbox** for welcome email
5. **Check Render logs** for success/error messages

## Step 4: Verify Brevo Sender Email

The sender email (`giapgrantteam@gmail.com`) might need to be verified in Brevo.

1. **Go to Brevo Dashboard**: https://app.brevo.com
2. **Click "Senders & IP" in the menu** (might be under Settings)
3. **Look for "Sender addresses" or similar**
4. **Check if `giapgrantteam@gmail.com` is listed and verified**

If NOT listed or NOT verified:
- Click "Add a sender"
- Enter: `giapgrantteam@gmail.com`
- Verify it (Brevo will send a verification email)

## Step 5: Check Brevo Account Status

1. **Go to Brevo Dashboard**: https://app.brevo.com
2. **Check if your account is fully activated**
3. **Look for any warnings or notices** about:
   - Account verification
   - Email sending limits
   - Account suspension

## Common Issues & Solutions

### Issue 1: API Key Not Set in Render
**Symptom**: Logs show `API Key configured: False`
**Solution**: Add `BREVO_API_KEY` in Render environment variables

### Issue 2: Sender Email Not Verified
**Symptom**: 401 or 403 errors in logs
**Solution**: Verify `giapgrantteam@gmail.com` in Brevo

### Issue 3: Brevo Free Plan Limit
**Symptom**: Emails worked before, now failing
**Solution**: Check if you've exceeded free plan limits (300 emails/day)

### Issue 4: Account Not Fully Activated
**Symptom**: All emails fail immediately
**Solution**: Complete Brevo account activation steps

## Quick Diagnostic Test

Run this command on your local machine (in the `backend` folder):

```bash
python test_brevo.py
```

This will:
- Check if your API key works
- Show detailed error messages
- Help identify the exact problem

**Note**: Make sure you have a `.env` file in the `backend` folder with:
```
BREVO_API_KEY=your-api-key-here
MAIL_USERNAME=giapgrantteam@gmail.com
```

## What to Share If Still Not Working

If emails still don't send after checking above:

1. **Screenshot of Render environment variables** (hide the actual API key value)
2. **Copy the error logs from Render** (especially lines with `[BREVO ERROR]`)
3. **Screenshot of Brevo dashboard** showing account status
4. **Result of running `python test_brevo.py`** locally

This will help me identify the exact issue!

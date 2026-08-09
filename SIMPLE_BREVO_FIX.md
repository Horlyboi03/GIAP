# Simple Brevo Email Fix

Since you don't see IP whitelisting options in Brevo, let's check the actual issue.

## 🔍 Step 1: Check Render Environment Variables (MOST IMPORTANT)

The most common issue is that the `BREVO_API_KEY` is not set in Render.

### How to Check:

1. **Open Render Dashboard**: https://dashboard.render.com
2. **Click on your backend service** (the one named "giap" or similar)
3. **Click "Environment" in the left sidebar**
4. **Look for these variables**:

| Variable Name | Expected Value |
|---------------|----------------|
| `BREVO_API_KEY` | Your Brevo API key (starts with `xkeysib-...`) |
| `MAIL_USERNAME` | `giapgrantteam@gmail.com` |
| `MAIL_DEFAULT_SENDER` | `giapgrantteam@gmail.com` |
| `FRONTEND_URL` | `https://profound-belekoy-6ce8db.netlify.app` |

### ❌ If `BREVO_API_KEY` is Missing:

1. Click **"Add Environment Variable"**
2. **Key**: `BREVO_API_KEY`
3. **Value**: Paste your Brevo API key
4. Click **"Save Changes"**
5. **Wait 2-3 minutes** for Render to redeploy with new variable

---

## 🔍 Step 2: Verify Sender Email in Brevo

Brevo requires you to verify the sender email address.

### How to Check:

1. **Go to Brevo**: https://app.brevo.com
2. **Look for "Senders"** in the menu (might be in Settings or Transactional)
3. **Check if `giapgrantteam@gmail.com` is listed**
4. **Check if it shows "Verified" or has a green checkmark**

### ❌ If Email is NOT Verified:

1. Click **"Add a new sender"** or similar button
2. Enter email: `giapgrantteam@gmail.com`
3. Enter name: `GIAP Grant Team`
4. Brevo will send a verification email to `giapgrantteam@gmail.com`
5. Check that Gmail inbox and click the verification link
6. Wait for confirmation

---

## 🔍 Step 3: Check Render Logs

Let's see what error Render is showing.

### How to Check Logs:

1. **Go to Render Dashboard**
2. **Click your backend service**
3. **Click "Logs"** tab
4. **Scroll down to see recent logs**

### What to Look For:

#### ✅ If You See This (GOOD):
```
✓ [BREVO SUCCESS] Email sent to user@example.com
```
**→ Emails are working!**

#### ❌ If You See This (BAD):
```
[BREVO DEBUG] API Key configured: False, Length: 0
```
**→ `BREVO_API_KEY` is not set in Render environment variables**

#### ❌ Or This:
```
✗ [BREVO ERROR] Failed to send email
✗ [BREVO ERROR] Status: 401
✗ [BREVO ERROR] Reason: Unauthorized
```
**→ API key is wrong OR sender email not verified**

#### ❌ Or This:
```
✗ [BREVO ERROR] Status: 400
✗ [BREVO ERROR] Reason: Bad Request
```
**→ Sender email not verified in Brevo**

---

## 🧪 Step 4: Test Email Sending

After fixing the issues above:

1. **Go to your app**: https://profound-belekoy-6ce8db.netlify.app
2. **Click "Register"**
3. **Create a new test account**:
   - Email: Use YOUR real email
   - Password: Anything
   - First name: Test
   - Last name: User
4. **Click Register**
5. **Wait 30 seconds**
6. **Check your email inbox** for welcome email from GIAP
7. **Also check Spam folder**

### Check Render Logs Again:
- Scroll to the bottom
- Look for `[BREVO SUCCESS]` or `[BREVO ERROR]`
- This tells you if the email sent successfully

---

## 📸 What to Send Me If Still Not Working

If emails still don't send after trying above:

1. **Screenshot of Render Environment tab** showing your variables (you can blur the actual API key value)
2. **Copy/paste the error from Render Logs** (especially lines with `[BREVO ERROR]`)
3. **Screenshot from Brevo dashboard** showing sender status

This will help me see exactly what's wrong!

---

## 💡 Quick Wins

### Most Common Solutions:

**95% of the time it's one of these**:

1. ✅ **Add `BREVO_API_KEY` to Render environment variables**
2. ✅ **Verify sender email `giapgrantteam@gmail.com` in Brevo**
3. ✅ **Wait 2-3 minutes after changing environment variables** (Render needs to redeploy)

### How to Get Your Brevo API Key (if you lost it):

1. Go to: https://app.brevo.com
2. Look for "SMTP & API" or "API Keys" in settings
3. You should see your API key OR ability to create a new one
4. Copy the key (starts with `xkeysib-`)
5. Add it to Render environment variables

---

## 🎯 After It's Working

Once emails are sending successfully:

- ✅ Test registration → Check for welcome email
- ✅ Test application submission → Check for confirmation email  
- ✅ Test admin approval → Check for approval email
- ✅ Test admin rejection → Check for rejection email

All emails should arrive within 30 seconds!

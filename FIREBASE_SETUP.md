# Firebase Setup Guide

## Overview

This guide walks you through setting up Firebase App Check and deploying Firestore security rules for the Habit Tracker application.

## Prerequisites

- Firebase project created (`habit-tracker-5ad2d`)
- Firebase CLI installed (`npm install -g firebase-tools`)
- Google account for reCAPTCHA registration

---

## Part 1: Register reCAPTCHA v3

### Step 1: Access reCAPTCHA Admin Console

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Sign in with your Google account
3. Click the **"+"** button to create a new site

### Step 2: Configure reCAPTCHA Site

Fill in the registration form:

- **Label**: `Habit Tracker App Check`
- **reCAPTCHA type**: Select **"reCAPTCHA v3"**
- **Domains**: Add the following domains (one per line):
  ```
  localhost
  127.0.0.1
  sharathmuthyala.github.io
  ```
  *Add any additional custom domains you plan to use*

- **Owners**: Your email (pre-filled)
- **Accept reCAPTCHA Terms of Service**: ✅ Check the box
- Click **"Submit"**

### Step 3: Copy Your Site Key

After registration, you'll see two keys:
- **Site Key** (public) - Copy this one ✅
- **Secret Key** (private) - Keep this secure, don't use in frontend code

**Save your Site Key** - you'll need it in the next section.

---

## Part 2: Enable Firebase App Check

### Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **habit-tracker-5ad2d**

### Step 2: Navigate to App Check

1. In the left sidebar, click **"Build"**
2. Click **"App Check"**
3. If prompted, click **"Get started"**

### Step 3: Register Your Web App

1. Under **"Web apps"**, find your app (or click **"Register app"** if not listed)
2. Click **"Register"** or the app name
3. **Provider**: Select **"reCAPTCHA v3"**
4. **reCAPTCHA site key**: Paste the Site Key from Part 1
5. Click **"Save"**

### Step 4: Enforce App Check for Firestore

1. Still in the App Check page, scroll to **"APIs"**
2. Find **"Cloud Firestore"** in the list
3. Click the three dots menu → **"Enforce"**
4. In the confirmation dialog, click **"Enforce"**

> [!WARNING]
> Once enforced, only requests with valid App Check tokens will be allowed. Make sure your app is properly configured before enforcing in production.

### Step 5: Create Debug Token (for Local Development)

1. In App Check, click the **"Apps"** tab
2. Find your web app and click the three dots → **"Manage debug tokens"**
3. Click **"Add debug token"**
4. **Token name**: `Local Development`
5. Click **"Add"**
6. **Copy the debug token** - you'll use this when testing locally

---

## Part 3: Update Your Code with reCAPTCHA Site Key

### Step 1: Edit firebase-config.js

1. Open `assets/js/firebase-config.js`
2. Find this line:
   ```javascript
   const recaptchaSiteKey = 'YOUR-RECAPTCHA-SITE-KEY'; // TODO: Replace with your key
   ```
3. Replace `'YOUR-RECAPTCHA-SITE-KEY'` with your actual Site Key from Part 1:
   ```javascript
   const recaptchaSiteKey = '6LcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // Your actual key
   ```
4. Save the file

---

## Part 4: Deploy Firestore Security Rules

### Option A: Using Firebase Console (Recommended for First Time)

1. In Firebase Console, go to **"Firestore Database"**
2. Click the **"Rules"** tab
3. Copy the contents of `firestore.rules` from your project
4. Paste into the Firebase Console rules editor
5. Click **"Publish"**
6. Verify no errors appear

### Option B: Using Firebase CLI

1. **Login to Firebase** (if not already logged in):
   ```bash
   firebase login
   ```

2. **Initialize Firebase** (if not already done):
   ```bash
   cd /Users/sharath/Desktop/Habits/habit-tracker
   firebase init firestore
   ```
   - Select your project: `habit-tracker-5ad2d`
   - Use existing `firestore.rules` file: **Yes**
   - Use existing `firestore.indexes.json` file: **Yes**

3. **Deploy the rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Verify deployment**:
   - Check the output for success message
   - Go to Firebase Console → Firestore → Rules to verify

---

## Part 5: Testing Your Setup

### Test 1: Local Development with Debug Token

1. **Start your local server**:
   ```bash
   python3 -m http.server 8080
   ```

2. **Open the app** in your browser:
   ```
   http://localhost:8080
   ```

3. **Open Browser Console** (F12 or Cmd+Option+I)

4. **Look for App Check messages**:
   - You should see: `🔧 Running in development mode - App Check debug mode enabled`
   - You should see instructions for adding a debug token

5. **Add the debug token** (if needed):
   - In the console, paste:
     ```javascript
     self.FIREBASE_APPCHECK_DEBUG_TOKEN = "YOUR-DEBUG-TOKEN-FROM-STEP-2.5"
     ```
   - Refresh the page

### Test 2: Authentication and Data Operations

1. **Sign up** with a test account
2. **Create a habit**
3. **Mark it as complete**
4. **Check the console** for any errors
5. **Verify in Firebase Console**:
   - Go to Firestore Database
   - Check that your data appears under `/users/{your-uid}/habits/`

### Test 3: Security Rules Validation

1. **Open Browser Console**
2. **Try to access another user's data** (this should fail):
   ```javascript
   // This should be denied by security rules
   const otherUserId = "some-other-user-id";
   firebase.firestore().collection(`users/${otherUserId}/habits`).get()
     .then(() => console.log("❌ SECURITY ISSUE: Access granted"))
     .catch(() => console.log("✅ SECURITY OK: Access denied"));
   ```

### Test 4: App Check Verification

1. **Check Network tab** in DevTools
2. **Filter by "firestore"**
3. **Look for requests** to Firestore
4. **Check request headers** - should include `X-Firebase-AppCheck` header

---

## Part 6: Production Deployment

### Before Deploying to Production:

1. ✅ Verify reCAPTCHA site key is correctly configured
2. ✅ Test all CRUD operations work correctly
3. ✅ Verify security rules are deployed
4. ✅ Test with App Check enforcement enabled
5. ✅ Remove any debug tokens from production code
6. ✅ Add your production domain to reCAPTCHA allowed domains

### Deploy to GitHub Pages:

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: Implement Firebase App Check and security rules"
   git push origin main
   ```

2. **Verify deployment**:
   - Visit your GitHub Pages URL
   - Check browser console for App Check initialization
   - Test authentication and data operations

---

## Troubleshooting

### Issue: "App Check token is invalid"

**Solution**: 
- Verify your reCAPTCHA site key is correct
- Check that your domain is added to reCAPTCHA allowed domains
- Clear browser cache and try again

### Issue: "Permission denied" errors in Firestore

**Solution**:
- Verify security rules are deployed correctly
- Check that you're authenticated
- Verify the user ID matches in the request

### Issue: App Check not initializing

**Solution**:
- Check browser console for errors
- Verify the reCAPTCHA site key is not `'YOUR-RECAPTCHA-SITE-KEY'`
- Ensure you're using HTTPS in production (reCAPTCHA v3 requires it)

### Issue: Debug token not working locally

**Solution**:
- Verify the debug token is added in Firebase Console
- Check that `self.FIREBASE_APPCHECK_DEBUG_TOKEN = true` is set
- Try refreshing the page after setting the token

---

## Monitoring and Maintenance

### Monitor App Check Metrics

1. Go to Firebase Console → App Check
2. Click **"Metrics"** tab
3. Monitor:
   - Valid requests
   - Invalid requests
   - Token refresh rate

### Review Security Rules Violations

1. Go to Firebase Console → Firestore → Rules
2. Click **"Rules playground"** to test rules
3. Monitor the **"Usage"** tab for violations

### Update reCAPTCHA Domains

When adding new domains:
1. Go to [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click your site
3. Add new domains to the list
4. Save changes

---

## Security Best Practices

✅ **Never commit** reCAPTCHA secret keys to your repository  
✅ **Always use HTTPS** in production  
✅ **Monitor** App Check metrics regularly  
✅ **Review** security rules violations  
✅ **Test** security rules before deploying  
✅ **Keep** Firebase SDK and dependencies updated  
✅ **Use** environment-specific configurations  

---

## Additional Resources

- [Firebase App Check Documentation](https://firebase.google.com/docs/app-check)
- [reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

**Setup Complete!** 🎉

Your Habit Tracker app is now protected with Firebase App Check and comprehensive security rules.

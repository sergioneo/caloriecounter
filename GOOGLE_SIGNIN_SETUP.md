# Google Sign-In Setup Guide

This app now supports **"Sign in with Google"** for a seamless authentication experience!

## ✅ What You Get

- One-click sign-in with Google account
- No need to remember passwords
- Faster registration process
- Works alongside email/password authentication

## 🔧 Setup Instructions

### 1. Enable Google Sign-In in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Find **Google** in the providers list
5. Click on **Google** to expand
6. Toggle **Enable** switch to ON
7. **Important:** Add your support email (required by Google)
   - Use your project email or personal email
8. Click **Save**

That's it! No additional configuration needed for local development.

### 2. For Production (Netlify Deployment)

When deploying to Netlify, you need to add your Netlify domain to Firebase's authorized domains:

1. Deploy your app to Netlify first (get your URL like `your-app.netlify.app`)
2. Go to Firebase Console → **Authentication** → **Settings**
3. Scroll to **Authorized domains**
4. Click **Add domain**
5. Enter your Netlify domain: `your-app.netlify.app`
6. Click **Add**

### 3. Common Issues & Solutions

#### "Popup was closed" error
- **Cause:** User closed the Google sign-in popup
- **Solution:** Try again, don't close the popup

#### "Unauthorized domain" error
- **Cause:** Your domain isn't authorized in Firebase
- **Solution:** Add your domain to Firebase authorized domains (see step 2 above)

#### "Sign-in was cancelled" error
- **Cause:** Multiple popups were triggered
- **Solution:** Refresh the page and try again

### 4. Testing Locally

1. Make sure you enabled Google in Firebase (step 1)
2. Run `npm run dev`
3. Go to http://localhost:8888
4. Click **"Continue with Google"**
5. Select your Google account
6. Done! You're logged in

### 5. How It Works

The app uses Firebase's built-in Google authentication:
- Users click "Continue with Google"
- A popup appears with Google sign-in
- User selects their Google account
- Firebase creates/retrieves their account
- User is logged in automatically

No passwords to remember, no email verification needed!

### 6. Privacy & Security

- **No passwords stored:** Google handles authentication
- **Profile data:** We only store name and email
- **Data control:** Users can revoke access anytime from Google Account settings
- **Secure tokens:** Firebase handles all security tokens

### 7. User Experience

**For New Users:**
1. Click "Continue with Google"
2. Select Google account
3. Automatically logged in → Start tracking food!

**For Returning Users:**
1. Click "Continue with Google"
2. Already logged in to Google? Instant access!
3. Continue tracking

## 🎨 UI Features

The login/register pages now show:
- Traditional email/password form
- "or" divider
- Google Sign-In button with official Google logo
- Both methods work seamlessly together

## 🔒 Security Notes

- Firebase handles all OAuth2 flows
- Tokens are securely managed
- User data is protected with Firestore security rules
- Google authentication is industry-standard security

## 📱 Mobile Experience

Works perfectly on mobile:
- Touch-optimized Google sign-in flow
- Native Google app integration on Android/iOS
- Falls back to web popup if native app unavailable

Enjoy the convenience of Google Sign-In! 🚀

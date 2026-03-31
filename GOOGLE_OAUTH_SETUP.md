# 🔐 Google OAuth Setup Guide - Tutoria Manager

## Overview

This guide explains how to set up Google OAuth for the Tutoria Manager application to enable Google Calendar synchronization. The system allows tutors to automatically sync tutoring sessions to their Google Calendar.

## Current Status

✅ **Configuration Complete:**
- Google OAuth credentials are configured in the system
- Redirect URIs are properly set
- Environment variables are loaded
- Comprehensive logging is enabled for debugging

⚠️ **Remaining Step:**
- Add your Google account as a **Test User** in Google Cloud Console (required for testing)

## Why Test User is Required

Google requires that applications in development be explicitly approved before they can access Google APIs. Since the Tutoria Manager application is still in testing phase, you need to add your Google account as an authorized test user.

**Error you may see:** `Error 403: access_denied` with message "The app is currently being tested and it hasn't been verified by Google."

This is **normal** and expected. The solution is to add your account as a test user.

## Step-by-Step Setup

### Step 1: Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project: **Tutoria Manager** (or the project containing your OAuth credentials)
3. If prompted for 2FA (two-factor authentication), complete the verification

### Step 2: Navigate to OAuth Consent Screen

1. In the left sidebar, go to **APIs & Services**
2. Click on **OAuth consent screen**
3. You should see your application configured as "Internal" or "External"

### Step 3: Add Test Users

1. Scroll down to the **Test users** section
2. Click **Add users** button
3. In the dialog that appears, enter your email address:
   ```
   jv0261324@gmail.com
   ```
4. Click **Add** to confirm

### Step 4: Verify Configuration

After adding yourself as a test user, verify these settings are correct:

| Setting | Value |
|---------|-------|
| **Application Name** | Tutoria Manager |
| **Scopes** | `calendar`, `userinfo.email`, `userinfo.profile` |
| **Redirect URI** | `https://tutormanag-6856tex4.manus.space/api/oauth/google/callback` |
| **Test Users** | `jv0261324@gmail.com` |

## Testing the OAuth Flow

### Prerequisites

- You must be logged into Tutoria Manager as an admin
- Your Google account must be added as a test user (see Step 3 above)
- The development server must be running

### Test Steps

1. **Login to Tutoria Manager**
   - Go to https://tutormanag-6856tex4.manus.space/app
   - Use your access code to login

2. **Click "Conectar Google" Button**
   - On the dashboard, find a tutoring session
   - Click the orange **"Conectar Google"** button
   - This will redirect you to Google's login page

3. **Authorize Access**
   - Select your Google account (the one you added as test user)
   - Complete any verification steps Google requires
   - Click **"Allow"** to grant calendar access

4. **Verify Success**
   - You should be redirected back to `/app?oauth_success=true`
   - The button should change from orange to purple
   - The button text should change from "Conectar Google" to "Google Cal"

5. **Sync a Tutoring Session**
   - Click the purple **"Google Cal"** button
   - An event should be created in your Google Calendar
   - You should see it appear within 1-2 minutes

## Debugging

### Enable Logging

The system has comprehensive logging enabled. Check the server logs for detailed information:

```
[Google OAuth] ===== CALLBACK STARTED =====
[Google OAuth] Query params: { code: '...', state: '480115', ... }
[Google OAuth] ✅ Processing callback for user ID: 480115
[Google OAuth] Exchanging code for tokens...
[Google OAuth] ✅ Tokens received - accessToken length: 1234 refreshToken: present
[Google OAuth] Saving tokens to database for user: 480115
[Google OAuth] ✅ Tokens saved successfully for user: 480115
[Google OAuth] ===== CALLBACK COMPLETED SUCCESSFULLY =====
```

### Common Issues

#### Issue: "Error 403: access_denied"

**Cause:** Your Google account is not added as a test user.

**Solution:** Follow Step 3 above to add your account to the test users list.

#### Issue: "Invalid state parameter"

**Cause:** The state parameter (user ID) is not being parsed correctly.

**Solution:** Check that you're logged in and the user ID is valid. The logs will show: `[Google OAuth] ✅ Processing callback for user ID: [YOUR_ID]`

#### Issue: "No access token received from Google"

**Cause:** The authorization code exchange failed.

**Solution:** 
1. Check that your Client ID and Client Secret are correct
2. Verify the redirect URI matches exactly: `https://tutormanag-6856tex4.manus.space/api/oauth/google/callback`
3. Check the server logs for the full error message

#### Issue: "Tokens saved successfully" but button still shows "Conectar Google"

**Cause:** The page needs to be refreshed to see the updated state.

**Solution:** Refresh the page (F5 or Cmd+R). The button should now show "Google Cal" in purple.

## Environment Variables

The following environment variables are automatically configured:

| Variable | Value |
|----------|-------|
| `GOOGLE_CLIENT_ID` | `839466429658-s576lis0016foeevk7ig7o11fvlrusu6.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | *(configured in system)* |
| `GOOGLE_OAUTH_REDIRECT_URI` | `https://tutormanag-6856tex4.manus.space/api/oauth/google/callback` |

These are loaded automatically from the system environment.

## Architecture

### OAuth Flow

```
1. User clicks "Conectar Google" button
   ↓
2. Frontend redirects to Google OAuth authorization URL
   - URL: https://accounts.google.com/o/oauth2/v2/auth
   - Parameters: client_id, redirect_uri, scope, state (user ID)
   ↓
3. User logs into Google and authorizes access
   ↓
4. Google redirects to callback: /api/oauth/google/callback?code=...&state=480115
   ↓
5. Backend exchanges code for tokens
   - Calls: https://oauth2.googleapis.com/token
   - Receives: access_token, refresh_token, expires_at
   ↓
6. Backend saves tokens to database
   - Table: users (googleAccessToken, googleRefreshToken, googleTokenExpiry)
   ↓
7. Backend redirects to /app?oauth_success=true
   ↓
8. Frontend updates UI - button changes to "Google Cal"
```

### Token Storage

Tokens are stored securely in the database:

```sql
UPDATE users 
SET 
  googleAccessToken = '...',
  googleRefreshToken = '...',
  googleTokenExpiry = '2026-03-31 16:53:00'
WHERE id = 480115;
```

### Calendar Sync

When a tutoring session is created and "Google Cal" is clicked:

```
1. Backend retrieves stored tokens for the user
2. Uses access_token to call Google Calendar API
3. Creates event with:
   - Title: "[Disciplina] - [Professor]"
   - Start time: tutoring session date/time
   - End time: calculated from duration
   - Attendees: professor email, bolsista email
   - Description: session details
4. Google Calendar sends email invitations to attendees
5. Event ID is stored in database for future reference
```

## Next Steps

1. **Add yourself as test user** (see Step 3 above)
2. **Test the OAuth flow** (see Testing section above)
3. **Verify calendar sync** - Create a tutoring session and sync to calendar
4. **Monitor logs** - Check server logs for any errors

## Support

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure your Google account is added as a test user
4. Check that the redirect URI matches exactly in Google Cloud Console

## References

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- [Google Cloud Console](https://console.cloud.google.com)

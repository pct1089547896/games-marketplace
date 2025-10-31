# Quick Start: Enable Google OAuth for Forums

## Prerequisites
You need a Google Cloud account (free to create).

---

## Step-by-Step Guide (5 minutes)

### 1. Create Google OAuth Credentials

1. Go to: https://console.cloud.google.com/
2. Create a new project (or use existing)
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. If prompted, configure OAuth consent screen:
   - App name: "Free Games Marketplace"
   - Support email: Your email
   - Authorized domain: `supabase.co`
   - Save and continue through other steps
6. Back in Credentials, create OAuth Client ID:
   - Type: **Web application**
   - Name: "Forum Authentication"
   - Authorized redirect URI: **Copy this exactly**:
     ```
     https://dieqhiezcpexkivklxcw.supabase.co/auth/v1/callback
     ```
   - Click Create
7. **Copy** your Client ID and Client Secret

### 2. Configure in Supabase

1. Go to: https://supabase.com/dashboard/project/dieqhiezcpexkivklxcw
2. Click **Authentication** in sidebar
3. Click **Providers** tab
4. Find **Google** and toggle it ON
5. Paste:
   - Client ID: [Your Google Client ID]
   - Client Secret: [Your Google Secret]
6. Click **Save**

### 3. Test It

1. Go to: https://z42x5t9ce163.space.minimax.io/forums/login
2. Click "Continue with Google"
3. Sign in with your Google account
4. Success! You'll be redirected to forums with your profile created

---

## Important Notes

- The redirect URI must be EXACTLY: `https://dieqhiezcpexkivklxcw.supabase.co/auth/v1/callback`
- One typo will break Google sign-in
- Email/password authentication works without this setup
- Google OAuth is optional but highly recommended for better user experience

---

## If Something Goes Wrong

### "Redirect URI mismatch" error
Check that the redirect URI in Google Cloud Console exactly matches:
`https://dieqhiezcpexkivklxcw.supabase.co/auth/v1/callback`

### "Invalid client" error
- Check Client ID and Secret are correctly entered in Supabase
- Make sure Google provider is toggled ON in Supabase

### Still not working?
- Wait 5 minutes for changes to propagate
- Clear browser cache and try again
- Check Google Cloud Console that OAuth consent screen is configured

---

## Current Status

**Without Google OAuth**:
- Users can sign up with email/password
- Full forum functionality works
- Professional authentication system

**With Google OAuth** (after setup):
- One-click sign-in with Google
- Automatic profile import (avatar, name)
- Better user experience
- Higher conversion rate

**Recommendation**: Set up Google OAuth for optimal user experience.

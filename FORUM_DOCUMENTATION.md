# Forum System Documentation

## Overview
Your marketplace now includes a fully functional community forum system with authentication. Users can create discussions, post replies, and engage with the community.

**Production URL**: https://z42x5t9ce163.space.minimax.io

---

## Features Implemented

### 1. Forum Structure
- **5 Default Categories**:
  - General Discussion
  - Game Reviews
  - Programming Help
  - News & Updates
  - Off-Topic

- **Discussion Threads**: Users can create new threads in any category
- **Nested Replies**: Full comment system with replies
- **User Profiles**: Automatic profile creation linked to authentication
- **Thread Management**: Pinning and locking capabilities (for admins)

### 2. Authentication System
The forum supports two authentication methods:

**A. Email/Password Authentication (Currently Active)**
- Sign up with email and password
- Automatic user profile creation
- Minimum 6 character password requirement

**B. Google OAuth (Configuration Required)**
- One-click sign-in with Google account
- Automatic profile import (avatar, display name, email)
- Secure OAuth 2.0 flow

---

## How to Enable Google OAuth

### Step 1: Get Google OAuth Credentials

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Configure OAuth consent screen if prompted:
   - User Type: External
   - App name: Your marketplace name
   - Support email: Your email
   - Add authorized domain: `supabase.co`
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "Marketplace Forum"
   - **Authorized redirect URIs**: Add this exactly:
     ```
     https://dieqhiezcpexkivklxcw.supabase.co/auth/v1/callback
     ```
7. Click **Create** and copy:
   - Client ID (looks like: xxxxx.apps.googleusercontent.com)
   - Client Secret

### Step 2: Configure Google Provider in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/dieqhiezcpexkivklxcw
2. Navigate to **Authentication** > **Providers**
3. Find **Google** in the list and click to expand
4. Toggle **Enable Sign in with Google** to ON
5. Paste your credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
6. Click **Save**

### Step 3: Test Google Sign In

1. Go to the forum login page: https://z42x5t9ce163.space.minimax.io/forums/login
2. Click "Continue with Google"
3. Sign in with your Google account
4. You'll be redirected back to the forums with your profile created

---

## Forum Navigation

### For Users

**Browse Forums (No Login Required)**:
- Visit `/forums` to see all categories
- Click any category to view threads
- Click any thread to read discussion and replies

**Participate (Login Required)**:
1. Click "Forums" in navigation
2. Click "Sign In" if not logged in
3. Create an account or sign in with Google (once enabled)
4. You can now:
   - Create new threads
   - Post replies
   - Your avatar and display name will appear on posts

### For Admins

Admin capabilities (via Admin Dashboard at `/admin/dashboard`):
- Pin important threads to top of categories
- Lock threads to prevent further replies
- Delete inappropriate threads or replies
- Manage forum categories

---

## Database Schema

The forum system uses 4 main tables:

### 1. `user_profiles`
- Stores user information from auth
- Links to Supabase auth.users
- Tracks post count and last activity

### 2. `forum_categories`
- Predefined categories for organizing discussions
- Tracks thread count per category
- Ordered by `order_index`

### 3. `forum_threads`
- Discussion topics created by users
- Belongs to a category
- Tracks views, replies, pinned/locked status

### 4. `forum_replies`
- Comments on threads
- Supports nested replies (parent_reply_id)
- Tracks edit status

---

## User Flow Examples

### Example 1: Creating a Thread
1. User signs in via `/forums/login`
2. Navigates to a category (e.g., "Game Reviews")
3. Clicks "New Thread" button
4. Enters title and content
5. Clicks "Create Thread"
6. Redirected to their new thread page
7. Others can now view and reply

### Example 2: Posting a Reply
1. User visits any thread page
2. Scrolls to reply form at bottom
3. Enters their comment
4. Clicks "Post Reply"
5. Reply appears immediately in the thread

### Example 3: Google Sign In (Once Enabled)
1. New visitor clicks "Forums" in navigation
2. Clicks "Sign In" on any action requiring auth
3. On login page, clicks "Continue with Google"
4. Selects Google account
5. Automatically redirected back to forums
6. Profile created with Google avatar and name
7. Ready to participate immediately

---

## Security Features

### Row Level Security (RLS)
All tables have RLS enabled with policies:
- **Read**: Everyone can view forum content
- **Create**: Only authenticated users can create threads/replies
- **Update**: Only authors can edit their own content
- **Delete**: Authors can delete their posts; admins have broader access

### Authentication Security
- Passwords hashed by Supabase Auth
- Google OAuth uses secure OAuth 2.0 flow
- Session management handled by Supabase
- CSRF protection built-in

### Content Security
- User input sanitized
- XSS protection via React's built-in escaping
- No direct HTML rendering in user content

---

## Customization Options

### Adding New Categories

```sql
INSERT INTO forum_categories (name, description, slug, order_index)
VALUES ('Your Category', 'Description here', 'your-category', 6);
```

### Modifying Category Order

```sql
UPDATE forum_categories 
SET order_index = 10 
WHERE slug = 'off-topic';
```

---

## API Integration

### Create User Profile (Edge Function)
**Endpoint**: `https://dieqhiezcpexkivklxcw.supabase.co/functions/v1/create-user-profile`

**Method**: POST

**Body**:
```json
{
  "userId": "uuid",
  "email": "user@example.com",
  "displayName": "User Name",
  "avatarUrl": "https://..."
}
```

This is automatically called on user signup.

---

## Monitoring & Analytics

### Track Forum Activity

**Query total discussions**:
```sql
SELECT COUNT(*) FROM forum_threads;
```

**Query total users**:
```sql
SELECT COUNT(*) FROM user_profiles;
```

**Query most active category**:
```sql
SELECT name, thread_count 
FROM forum_categories 
ORDER BY thread_count DESC 
LIMIT 1;
```

**Query top contributors**:
```sql
SELECT display_name, post_count 
FROM user_profiles 
ORDER BY post_count DESC 
LIMIT 10;
```

---

## Troubleshooting

### Google Sign In Not Working

**Check**:
1. Google OAuth credentials are correctly entered in Supabase
2. Redirect URI exactly matches: `https://dieqhiezcpexkivklxcw.supabase.co/auth/v1/callback`
3. OAuth consent screen is configured
4. Google provider is enabled in Supabase Authentication

### User Profile Not Created

**Check**:
1. Edge function is deployed: `create-user-profile`
2. RLS policies allow insert on `user_profiles`
3. Check Supabase logs for errors

### Cannot Create Thread/Reply

**Check**:
1. User is signed in (check auth state)
2. RLS policies allow authenticated users to insert
3. Check browser console for errors

---

## Performance Optimization

### Current Optimizations
- Database indexes on frequently queried fields
- Efficient query patterns (no foreign key joins)
- Pagination ready (can be added to category/thread views)
- Image optimization for avatars

### Future Enhancements
- Search functionality across threads
- Thread pagination (currently loads all)
- Rich text editor for posts
- File uploads for threads
- User reputation system
- Email notifications

---

## Support

For issues or questions:
1. Check Supabase logs: Authentication > Users (for auth issues)
2. Check Edge Functions logs: Edge Functions > Logs
3. Check database logs: Database > Logs
4. Review RLS policies in Table Editor

---

## Quick Reference

| Item | Value |
|------|-------|
| Forum URL | https://z42x5t9ce163.space.minimax.io/forums |
| Login Page | https://z42x5t9ce163.space.minimax.io/forums/login |
| Supabase Project | dieqhiezcpexkivklxcw |
| Edge Function | create-user-profile |
| Auth Redirect URI | https://dieqhiezcpexkivklxcw.supabase.co/auth/v1/callback |

---

## Next Steps

1. **Test the Forum**: Visit the forums and create a test account
2. **Enable Google OAuth**: Follow Step 1-3 in "How to Enable Google OAuth"
3. **Customize Categories**: Add or modify categories as needed
4. **Moderate Content**: Use admin panel to manage discussions
5. **Monitor Activity**: Check forum statistics regularly

The forum system is production-ready and fully integrated with your marketplace!

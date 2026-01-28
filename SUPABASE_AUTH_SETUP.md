# Supabase Auth Setup

## Required Environment Variables

Your `.env.local` file must contain:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Project Configuration

### 1. Email Confirmation (Development)

For development, you may want to disable email confirmation:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers** → **Email**
3. **Disable** "Confirm email" option
4. Save changes

This allows immediate signup without email verification during development.

### 2. Email Confirmation (Production)

For production, keep email confirmation enabled:
- Users will receive a confirmation email after signup
- They must click the link before they can log in
- The app handles this with a "Check your email" screen

### 3. OAuth Providers (Optional)

To enable Google sign-in:

1. Go to **Authentication** → **Providers** → **Google**
2. Enable the provider
3. Add your OAuth credentials
4. Set redirect URL to: `http://localhost:8081/dashboard` (dev) or your production URL

## Auth Flow Overview

### Signup
- If email confirmation is **disabled**: User is logged in immediately
- If email confirmation is **enabled**: User sees "Check your email" screen

### Login
- Users can log in with email/password
- Error handling for unconfirmed emails
- Error handling for wrong credentials

### Auth State
- Uses Supabase's `onAuthStateChange` to keep UI in sync
- User state persists across page refreshes
- "Create my account" button disappears when authenticated

## Testing

1. Start dev server: `npm run dev`
2. Go to dashboard at: http://localhost:8081/dashboard
3. Click "Create my account"
4. Test signup and login flows
5. Verify button disappears when authenticated

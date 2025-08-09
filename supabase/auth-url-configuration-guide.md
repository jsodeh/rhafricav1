# Supabase Authentication URL Configuration Guide

## Production Setup for https://rhafrica.netlify.app

### 1. Site URL Configuration
In your Supabase Dashboard → Authentication → URL Configuration:

**Site URL:**
```
https://rhafrica.netlify.app
```

### 2. Redirect URLs Configuration
Add these URLs to the "Redirect URLs" section:

```
https://rhafrica.netlify.app
https://rhafrica.netlify.app/auth/callback
https://rhafrica.netlify.app/auth/confirm
https://rhafrica.netlify.app/auth/reset-password
https://rhafrica.netlify.app/**
```

### 3. Email Template Configuration
Go to Authentication → Email Templates and update:

#### Confirm Signup Template:
- **Redirect URL:** `https://rhafrica.netlify.app/auth/callback?type=signup`
- **Subject:** Welcome to Real Estate Hotspot - Confirm Your Email

#### Reset Password Template:
- **Redirect URL:** `https://rhafrica.netlify.app/auth/reset-password`
- **Subject:** Reset Your Real Estate Hotspot Password

#### Magic Link Template:
- **Redirect URL:** `https://rhafrica.netlify.app/auth/callback?type=magiclink`
- **Subject:** Your Real Estate Hotspot Login Link

### 4. Development URLs (Optional)
If you want to test locally, also add:

```
http://localhost:5173
http://localhost:5173/**
http://localhost:3000
http://localhost:3000/**
```

### 5. Environment Variables
Ensure your Netlify environment variables are set:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 6. Auth Flow Routes
Your app now supports these auth routes:

- `/auth/callback` - Handles all auth callbacks (signup, login, OAuth)
- `/auth/confirm` - Email confirmation success page
- `/auth/reset-password` - Password reset form

### 7. Testing the Flow

#### Sign Up Flow:
1. User signs up at `/signup`
2. Receives email with confirmation link
3. Clicks link → redirected to `/auth/callback?type=signup`
4. App processes confirmation → redirects to `/onboarding`

#### Password Reset Flow:
1. User requests reset at `/login`
2. Receives email with reset link
3. Clicks link → redirected to `/auth/reset-password`
4. User sets new password → redirected to `/dashboard`

#### Login Flow:
1. User logs in at `/login`
2. If successful → redirected to `/dashboard`
3. If email not confirmed → shown confirmation message

### 8. Security Considerations

- All URLs use HTTPS in production
- Wildcards (`/**`) allow deep linking after auth
- Tokens are handled securely by Supabase
- Session management is automatic

### 9. Troubleshooting

#### Common Issues:
- **"Invalid redirect URL"** → Check URL is added to Redirect URLs list
- **"Email not confirmed"** → Check email template redirect URLs
- **"Token expired"** → Email links expire after 24 hours by default
- **"Redirect loop"** → Ensure Site URL matches your domain exactly

#### Debug Steps:
1. Check browser network tab for auth requests
2. Verify environment variables in Netlify
3. Test with incognito/private browsing
4. Check Supabase logs in dashboard

### 10. Email Template Customization

You can customize the email templates in Supabase Dashboard:
- Add your branding/logo
- Customize the message text
- Ensure redirect URLs point to your domain

### 11. Next Steps

After configuration:
1. Deploy your updated app to Netlify
2. Test signup flow with a real email
3. Test password reset flow
4. Verify all redirects work correctly
5. Monitor Supabase auth logs for any issues

## Quick Checklist

- [ ] Site URL set to `https://rhafrica.netlify.app`
- [ ] All redirect URLs added
- [ ] Email templates updated with correct URLs
- [ ] Environment variables set in Netlify
- [ ] App deployed with new auth routes
- [ ] Signup flow tested
- [ ] Password reset flow tested
- [ ] Email confirmation working

Your authentication system is now ready for production! 🚀
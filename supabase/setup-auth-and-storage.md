# 🔐 Authentication & Storage Setup Guide

## Step 5: Configure Authentication

### 5.1 Enable Authentication Providers

1. **Go to Authentication → Providers in your Supabase dashboard**
2. **Enable the following providers:**

#### Email Provider (Required)
- ✅ Enable email provider
- ✅ Confirm email: `true`
- ✅ Secure email change: `true`

#### Google OAuth (Recommended)
- ✅ Enable Google provider
- **Client ID**: Get from [Google Cloud Console](https://console.cloud.google.com/)
- **Client Secret**: Get from Google Cloud Console
- **Redirect URL**: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

#### Facebook OAuth (Optional)
- ✅ Enable Facebook provider
- **App ID**: Get from [Facebook Developers](https://developers.facebook.com/)
- **App Secret**: Get from Facebook Developers

### 5.2 Configure Email Templates

Go to **Authentication → Email Templates** and customize:

#### Confirm Signup
```html
<h2>Welcome to Real Estate Hotspot!</h2>
<p>Please confirm your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
```

#### Reset Password
```html
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
```

### 5.3 Configure Site URL

1. **Go to Authentication → URL Configuration**
2. **Set Site URL**: `https://your-domain.com` (or `http://localhost:8080` for development)
3. **Add Redirect URLs**:
   - `https://your-domain.com/**`
   - `http://localhost:8080/**` (for development)

## Step 6: Set Up Storage

### 6.1 Create Storage Buckets

1. **Go to Storage in your Supabase dashboard**
2. **Create the following buckets:**

#### Property Images Bucket
- **Name**: `property-images`
- **Public**: ✅ Yes
- **File size limit**: 10MB
- **Allowed MIME types**: `image/jpeg,image/png,image/webp`

#### Profile Images Bucket
- **Name**: `profile-images`
- **Public**: ✅ Yes
- **File size limit**: 5MB
- **Allowed MIME types**: `image/jpeg,image/png,image/webp`

#### Documents Bucket
- **Name**: `property-documents`
- **Public**: ❌ No (Private)
- **File size limit**: 50MB
- **Allowed MIME types**: `application/pdf,image/jpeg,image/png`

### 6.2 Set Up Storage Policies

Run these SQL commands in your SQL Editor:

```sql
-- Property Images Policies
CREATE POLICY "Anyone can view property images" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');
CREATE POLICY "Authenticated users can upload property images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own property images" ON storage.objects FOR UPDATE USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Profile Images Policies
CREATE POLICY "Anyone can view profile images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
CREATE POLICY "Users can upload their own profile images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own profile images" ON storage.objects FOR UPDATE USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Property Documents Policies (Private)
CREATE POLICY "Users can view their own property documents" ON storage.objects FOR SELECT USING (bucket_id = 'property-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload their own property documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'property-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Step 7: Configure Database Settings

### 7.1 Set Timezone
```sql
-- Set database timezone to your local timezone
ALTER DATABASE postgres SET timezone TO 'Africa/Lagos';
```

### 7.2 Enable Extensions (if needed)
```sql
-- Enable PostGIS for advanced location features (optional)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Step 8: Test Your Setup

### 8.1 Update Environment Variables

Make sure your `.env.local` file has the correct values:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

### 8.2 Test Database Connection

Run this in your application to test:

```javascript
import { supabase } from './lib/supabase'

// Test connection
const testConnection = async () => {
  const { data, error } = await supabase
    .from('properties')
    .select('count(*)')
    .single()
  
  if (error) {
    console.error('Database connection failed:', error)
  } else {
    console.log('Database connected! Properties count:', data.count)
  }
}
```

### 8.3 Test Authentication

```javascript
// Test signup
const testAuth = async () => {
  const { data, error } = await supabase.auth.signUp({
    email: 'test@example.com',
    password: 'testpassword123'
  })
  
  console.log('Auth test:', { data, error })
}
```

## Step 9: Production Considerations

### 9.1 Environment Variables for Production

Add these to your Netlify environment variables:

```
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

### 9.2 Security Checklist

- ✅ Row Level Security enabled on all tables
- ✅ Proper authentication policies
- ✅ Storage bucket policies configured
- ✅ Email confirmation enabled
- ✅ Strong password requirements
- ✅ Rate limiting enabled (in Supabase settings)

### 9.3 Backup Strategy

1. **Enable Point-in-Time Recovery** (Supabase Pro plan)
2. **Set up regular database backups**
3. **Monitor database performance**

## 🎉 Setup Complete!

Your new Supabase project is now ready with:
- ✅ Complete database schema
- ✅ Authentication configured
- ✅ Storage buckets set up
- ✅ Security policies in place
- ✅ Sample data loaded

Next: Update your application's environment variables and test the connection!
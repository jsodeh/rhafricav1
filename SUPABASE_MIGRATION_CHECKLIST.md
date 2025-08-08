# 🚀 Supabase Migration Checklist

## ✅ Complete Step-by-Step Guide

### Phase 1: Create New Supabase Project

- [ ] **1.1** Go to [Supabase Dashboard](https://supabase.com/dashboard)
- [ ] **1.2** Click "New Project"
- [ ] **1.3** Choose organization and fill project details:
  - Name: `real-estate-hotspot-prod`
  - Database Password: Generate strong password (SAVE THIS!)
  - Region: Choose closest to your users
- [ ] **1.4** Click "Create new project"
- [ ] **1.5** Wait for project to be ready (2-3 minutes)

### Phase 2: Get Project Credentials

- [ ] **2.1** Go to Settings → API in your new project
- [ ] **2.2** Copy Project URL: `https://your-project-ref.supabase.co`
- [ ] **2.3** Copy `anon` public key (starts with `eyJhbGciOiJIUzI1NiIs...`)
- [ ] **2.4** Save these credentials securely

### Phase 3: Update Environment Variables

- [ ] **3.1** Open `.env.local` file
- [ ] **3.2** Replace `VITE_SUPABASE_URL` with your new project URL
- [ ] **3.3** Replace `VITE_SUPABASE_ANON_KEY` with your new anon key
- [ ] **3.4** Save the file

### Phase 4: Set Up Database Schema

- [ ] **4.1** Go to your Supabase Dashboard → SQL Editor
- [ ] **4.2** Click "New Query"
- [ ] **4.3** Copy the entire content from `supabase/setup-new-database.sql`
- [ ] **4.4** Paste it in the SQL Editor
- [ ] **4.5** Click "Run" button
- [ ] **4.6** Wait for execution to complete (should see "Success" message)
- [ ] **4.7** Verify tables were created: Go to Table Editor and check tables exist

### Phase 5: Configure Authentication

- [ ] **5.1** Go to Authentication → Providers
- [ ] **5.2** Enable Email provider:
  - ✅ Enable email provider
  - ✅ Confirm email: `true`
  - ✅ Secure email change: `true`
- [ ] **5.3** (Optional) Enable Google OAuth:
  - Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
  - Add Client ID and Secret
  - Set redirect URL: `https://your-project-ref.supabase.co/auth/v1/callback`
- [ ] **5.4** Go to Authentication → URL Configuration
- [ ] **5.5** Set Site URL: `https://your-domain.com` (or localhost for dev)
- [ ] **5.6** Add redirect URLs for your domains

### Phase 6: Set Up Storage (Optional)

- [ ] **6.1** Go to Storage in Supabase Dashboard
- [ ] **6.2** Create buckets:
  - [ ] `property-images` (Public, 10MB limit, images only)
  - [ ] `profile-images` (Public, 5MB limit, images only)
  - [ ] `property-documents` (Private, 50MB limit, PDFs/images)
- [ ] **6.3** Run storage policies SQL (from setup guide)

### Phase 7: Test Your Setup

- [ ] **7.1** Install dependencies: `npm install`
- [ ] **7.2** Run test script: `node scripts/test-supabase-connection.js`
- [ ] **7.3** Verify all tests pass ✅
- [ ] **7.4** Start your app: `npm run dev`
- [ ] **7.5** Test basic functionality:
  - [ ] Properties load on homepage
  - [ ] Search works
  - [ ] User can sign up/login
  - [ ] Property details pages work

### Phase 8: Update Production Environment

- [ ] **8.1** Go to Netlify Dashboard → Site Settings → Environment Variables
- [ ] **8.2** Update production environment variables:
  - `VITE_SUPABASE_URL`: Your new project URL
  - `VITE_SUPABASE_ANON_KEY`: Your new anon key
- [ ] **8.3** Trigger new deployment
- [ ] **8.4** Test production site works correctly

### Phase 9: Data Migration (If Needed)

If you need to migrate data from your old project:

- [ ] **9.1** Export data from old project (CSV/JSON)
- [ ] **9.2** Clean and format data
- [ ] **9.3** Import to new project via SQL or Supabase Dashboard
- [ ] **9.4** Verify data integrity

### Phase 10: Final Verification

- [ ] **10.1** Test all major features:
  - [ ] User registration/login
  - [ ] Property browsing
  - [ ] Search functionality
  - [ ] Property details
  - [ ] User favorites
  - [ ] Contact forms
  - [ ] Agent profiles
- [ ] **10.2** Check database performance
- [ ] **10.3** Verify security policies work
- [ ] **10.4** Test on different devices/browsers

## 📋 Files Created for You

1. **`supabase/setup-new-database.sql`** - Complete database schema
2. **`supabase/setup-auth-and-storage.md`** - Authentication & storage guide
3. **`scripts/test-supabase-connection.js`** - Connection test script
4. **`.env.local`** - Updated with placeholder credentials

## 🚨 Important Notes

- **Backup**: Always backup your current data before migration
- **Testing**: Test thoroughly in development before updating production
- **Credentials**: Keep your database password and API keys secure
- **RLS**: Row Level Security is enabled - make sure your app handles auth correctly
- **Performance**: Indexes are created for optimal performance

## 🆘 Troubleshooting

### Common Issues:

1. **"relation does not exist" error**
   - Make sure you ran the complete SQL setup script
   - Check if all tables were created in Table Editor

2. **Authentication not working**
   - Verify Site URL and redirect URLs are correct
   - Check if email confirmation is properly configured

3. **Connection timeout**
   - Check your internet connection
   - Verify Supabase project is active and not paused

4. **RLS policy errors**
   - Make sure user is authenticated before accessing protected data
   - Check if policies allow the operation you're trying to perform

### Need Help?

- Check Supabase documentation: https://supabase.com/docs
- Review error logs in Supabase Dashboard → Logs
- Test individual queries in SQL Editor

## 🎉 Success Criteria

Your migration is complete when:
- ✅ All tests in the test script pass
- ✅ Your application loads without errors
- ✅ Users can sign up and log in
- ✅ Properties display correctly
- ✅ Search functionality works
- ✅ Production deployment is successful

---

**Estimated Time**: 30-60 minutes
**Difficulty**: Intermediate
**Prerequisites**: Supabase account, basic SQL knowledge
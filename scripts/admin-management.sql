-- SQL Script for Admin Management
-- Use these queries in your Supabase SQL Editor

-- 1. Make a user an admin by email
UPDATE user_profiles 
SET account_type = 'admin', updated_at = NOW()
WHERE email = 'your-admin@example.com';

-- 2. Make a user a super admin by email
UPDATE user_profiles 
SET account_type = 'super_admin', updated_at = NOW()
WHERE email = 'your-superadmin@example.com';

-- 3. View all admin users
SELECT 
  id,
  email,
  full_name,
  account_type,
  created_at,
  updated_at
FROM user_profiles 
WHERE account_type IN ('admin', 'super_admin')
ORDER BY created_at DESC;

-- 4. Remove admin privileges (make regular user)
UPDATE user_profiles 
SET account_type = 'buyer', updated_at = NOW()
WHERE email = 'former-admin@example.com';

-- 5. Check if a specific user is admin
SELECT 
  email,
  full_name,
  account_type,
  CASE 
    WHEN account_type IN ('admin', 'super_admin') THEN 'Yes'
    ELSE 'No'
  END as is_admin
FROM user_profiles 
WHERE email = 'check-this-user@example.com';

-- 6. Create admin user if they don't exist (replace with actual values)
INSERT INTO user_profiles (
  user_id,
  email,
  full_name,
  account_type,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(), -- or use actual auth user ID
  'new-admin@example.com',
  'Admin User Name',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  account_type = EXCLUDED.account_type,
  updated_at = NOW();

-- 7. Bulk update multiple users to admin (replace emails)
UPDATE user_profiles 
SET account_type = 'admin', updated_at = NOW()
WHERE email IN (
  'admin1@example.com',
  'admin2@example.com',
  'admin3@example.com'
);

-- 8. View admin activity (if you have audit logs)
-- This would depend on your audit log table structure
-- SELECT * FROM admin_actions WHERE admin_email = 'admin@example.com' ORDER BY created_at DESC LIMIT 10;
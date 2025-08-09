import { createClient } from '@supabase/supabase-js';

// Your Supabase configuration
const supabaseUrl = 'https://kepvtlgmtwhjsryfqexg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlcHZ0bGdtdHdoanNyeWZxZXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MzMxNjIsImV4cCI6MjA2NTUwOTE2Mn0.ET4r3HCZOP-9uddMergtO1n6baHqxd3r2Fq6F5wQF7w';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmailVerification() {
  console.log('🧪 Testing Email Verification Setup...\n');

  // Test 1: Check Supabase connection
  console.log('1. Testing Supabase connection...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('❌ Connection error:', error.message);
    } else {
      console.log('✅ Supabase connection successful');
    }
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
  }

  // Test 2: Test signup with a test email
  console.log('\n2. Testing signup process...');
  const testEmail = `test+${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          phone: '+1234567890',
        },
        emailRedirectTo: 'https://rhafrica.netlify.app/auth/callback?type=signup',
      },
    });

    if (error) {
      console.log('❌ Signup error:', error.message);
      
      // Check for specific error types
      if (error.message.includes('Email rate limit exceeded')) {
        console.log('💡 Rate limit hit - this is normal if testing frequently');
      } else if (error.message.includes('Invalid email')) {
        console.log('💡 Email validation failed');
      } else if (error.message.includes('SMTP')) {
        console.log('💡 SMTP configuration issue - check Supabase email settings');
      }
    } else {
      console.log('✅ Signup successful');
      console.log('📧 User created:', {
        id: data.user?.id,
        email: data.user?.email,
        confirmed: data.user?.email_confirmed_at ? 'Yes' : 'No',
        session: data.session ? 'Created' : 'Not created (email confirmation required)'
      });

      if (!data.session && !data.user?.email_confirmed_at) {
        console.log('📬 Verification email should have been sent');
        console.log('📍 Check your email (including spam folder)');
      }
    }
  } catch (error) {
    console.log('❌ Signup test failed:', error.message);
  }

  // Test 3: Check auth settings
  console.log('\n3. Checking authentication configuration...');
  console.log('🔗 Redirect URL configured:', 'https://rhafrica.netlify.app/auth/callback?type=signup');
  console.log('🌐 Supabase URL:', supabaseUrl);
  console.log('🔑 Anon Key configured:', supabaseKey ? 'Yes' : 'No');

  console.log('\n📋 Next Steps:');
  console.log('1. Check Supabase Dashboard → Authentication → Logs for any errors');
  console.log('2. Verify SMTP settings in Authentication → Settings');
  console.log('3. Check email templates in Authentication → Email Templates');
  console.log('4. Ensure redirect URLs are configured in Authentication → URL Configuration');
  console.log('5. Try with a real email address (Gmail, Yahoo, etc.)');
  console.log('6. Check spam/junk folders');

  console.log('\n🔧 Common Fixes:');
  console.log('- Configure custom SMTP in Supabase settings');
  console.log('- Add SPF record to your domain');
  console.log('- Check rate limits (default: 30 emails per hour)');
  console.log('- Verify email confirmation is enabled in settings');
}

// Run the test
testEmailVerification().catch(console.error);
#!/usr/bin/env node

/**
 * Script to make a user an admin or super admin
 * Usage: node scripts/make-user-admin.js <email> <admin_type>
 * Example: node scripts/make-user-admin.js admin@example.com admin
 * Example: node scripts/make-user-admin.js superadmin@example.com super_admin
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function makeUserAdmin(email, adminType = 'admin') {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);
    
    // First, find the user by email
    const { data: users, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError) {
      console.error('❌ Error finding user:', fetchError.message);
      return;
    }

    if (!users) {
      console.error('❌ User not found with email:', email);
      return;
    }

    console.log(`👤 Found user: ${users.full_name || 'No name'} (${users.email})`);
    console.log(`📋 Current account type: ${users.account_type || 'Not set'}`);

    // Update the user's account type
    const { data, error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        account_type: adminType,
        updated_at: new Date().toISOString()
      })
      .eq('email', email)
      .select();

    if (updateError) {
      console.error('❌ Error updating user:', updateError.message);
      return;
    }

    console.log(`✅ Successfully updated user account type to: ${adminType}`);
    console.log(`🎉 ${email} is now a ${adminType}!`);
    
    // Verify the update
    const { data: updatedUser } = await supabase
      .from('user_profiles')
      .select('email, full_name, account_type')
      .eq('email', email)
      .single();

    if (updatedUser) {
      console.log('\n📊 Updated user details:');
      console.log(`   Name: ${updatedUser.full_name || 'Not set'}`);
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Account Type: ${updatedUser.account_type}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const email = args[0];
const adminType = args[1] || 'admin';

// Validate arguments
if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: node scripts/make-user-admin.js <email> [admin_type]');
  console.log('Example: node scripts/make-user-admin.js admin@example.com admin');
  console.log('Example: node scripts/make-user-admin.js superadmin@example.com super_admin');
  process.exit(1);
}

// Validate admin type
const validAdminTypes = ['admin', 'super_admin'];
if (!validAdminTypes.includes(adminType)) {
  console.error(`❌ Invalid admin type: ${adminType}`);
  console.log(`Valid types: ${validAdminTypes.join(', ')}`);
  process.exit(1);
}

// Run the script
console.log('🚀 Making user admin...\n');
makeUserAdmin(email, adminType);
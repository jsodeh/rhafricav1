#!/usr/bin/env node

/**
 * Debug script to check user data and profile integration
 * Run with: node scripts/debug-user-data.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please check your .env.local file has:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUserData() {
  console.log('🔍 Debugging User Data Integration\n');

  try {
    // Check auth users
    console.log('1. Checking auth.users table...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Cannot access auth.users (admin access required)');
      console.log('This is normal - checking user_profiles instead\n');
    } else {
      console.log(`✅ Found ${authUsers.users.length} users in auth.users`);
      authUsers.users.forEach(user => {
        console.log(`   - ${user.email} (${user.id})`);
        console.log(`     Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`     Metadata: ${JSON.stringify(user.user_metadata)}`);
      });
      console.log('');
    }

    // Check user_profiles table
    console.log('2. Checking user_profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*');

    if (profilesError) {
      console.log('❌ Error fetching user_profiles:', profilesError.message);
    } else {
      console.log(`✅ Found ${profiles.length} profiles in user_profiles`);
      profiles.forEach(profile => {
        console.log(`   - User ID: ${profile.user_id}`);
        console.log(`     Name: ${profile.full_name || 'Not set'}`);
        console.log(`     Phone: ${profile.phone || 'Not set'}`);
        console.log(`     Location: ${profile.location || 'Not set'}`);
        console.log(`     Avatar: ${profile.avatar_url || 'Not set'}`);
        console.log(`     Created: ${profile.created_at}`);
        console.log('');
      });
    }

    // Check property_favorites table
    console.log('3. Checking property_favorites table...');
    const { data: favorites, error: favError } = await supabase
      .from('property_favorites')
      .select('*');

    if (favError) {
      console.log('❌ Error fetching property_favorites:', favError.message);
    } else {
      console.log(`✅ Found ${favorites.length} saved properties`);
      favorites.forEach(fav => {
        console.log(`   - User: ${fav.user_id}, Property: ${fav.property_id}`);
      });
      console.log('');
    }

    // Check saved_searches table
    console.log('4. Checking saved_searches table...');
    const { data: searches, error: searchError } = await supabase
      .from('saved_searches')
      .select('*');

    if (searchError) {
      console.log('❌ Error fetching saved_searches:', searchError.message);
    } else {
      console.log(`✅ Found ${searches.length} saved searches`);
      searches.forEach(search => {
        console.log(`   - User: ${search.user_id}, Name: ${search.name}`);
      });
      console.log('');
    }

    // Check properties table
    console.log('5. Checking properties table...');
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, title, price, city, created_at')
      .limit(5);

    if (propError) {
      console.log('❌ Error fetching properties:', propError.message);
    } else {
      console.log(`✅ Found ${properties.length} properties (showing first 5)`);
      properties.forEach(prop => {
        console.log(`   - ${prop.title} - ₦${prop.price?.toLocaleString()} (${prop.city})`);
      });
      console.log('');
    }

    // Check real_estate_agents table
    console.log('6. Checking real_estate_agents table...');
    const { data: agents, error: agentError } = await supabase
      .from('real_estate_agents')
      .select('*');

    if (agentError) {
      console.log('❌ Error fetching real_estate_agents:', agentError.message);
    } else {
      console.log(`✅ Found ${agents.length} agents`);
      agents.forEach(agent => {
        console.log(`   - ${agent.agency_name} (${agent.verification_status})`);
        console.log(`     User ID: ${agent.user_id}`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }

  console.log('🎯 Recommendations:');
  console.log('1. If you see no user_profiles, the user needs to complete profile setup');
  console.log('2. If you see no properties, run: node scripts/seed-properties.js');
  console.log('3. If user data looks wrong, check the AuthContext convertSupabaseUser function');
  console.log('4. If profile setup not showing, check Dashboard useEffect dependencies');
  console.log('5. Clear browser localStorage and cookies to reset any cached data');
}

debugUserData();
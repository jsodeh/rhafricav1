#!/usr/bin/env node

/**
 * Supabase Connection Test Script
 * Run this script to verify your new Supabase setup is working correctly
 * 
 * Usage: node scripts/test-supabase-connection.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Please update your .env.local file with:');
  console.log('VITE_SUPABASE_URL=https://your-project-ref.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=your-anon-key-here');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('properties')
      .select('count(*)')
      .single();
    
    if (healthError) {
      console.error('❌ Connection failed:', healthError.message);
      return false;
    }
    console.log('✅ Connection successful!');
    
    // Test 2: Count records
    console.log('\n2. Checking database content...');
    const { count: propertiesCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true });
    
    const { count: agentsCount } = await supabase
      .from('real_estate_agents')
      .select('*', { count: 'exact', head: true });
    
    console.log(`✅ Found ${propertiesCount} properties`);
    console.log(`✅ Found ${agentsCount} agents`);
    
    // Test 3: Fetch sample data
    console.log('\n3. Fetching sample properties...');
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        price,
        city,
        property_type,
        real_estate_agents (
          agency_name
        )
      `)
      .limit(3);
    
    if (propertiesError) {
      console.error('❌ Error fetching properties:', propertiesError.message);
      return false;
    }
    
    console.log('✅ Sample properties:');
    properties.forEach(property => {
      console.log(`   • ${property.title} - ₦${property.price.toLocaleString()} (${property.city})`);
    });
    
    // Test 4: Test authentication (without actually signing up)
    console.log('\n4. Testing authentication setup...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Auth setup issue:', authError.message);
      return false;
    }
    console.log('✅ Authentication system ready');
    
    // Test 5: Test storage (list buckets)
    console.log('\n5. Testing storage setup...');
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.log('⚠️  Storage not fully configured yet (this is optional)');
    } else {
      console.log(`✅ Found ${buckets.length} storage buckets`);
      buckets.forEach(bucket => {
        console.log(`   • ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });
    }
    
    console.log('\n🎉 All tests passed! Your Supabase setup is working correctly.');
    console.log('\n📋 Summary:');
    console.log(`   Database URL: ${supabaseUrl}`);
    console.log(`   Properties: ${propertiesCount}`);
    console.log(`   Agents: ${agentsCount}`);
    console.log(`   Auth: Ready`);
    console.log(`   Storage: ${buckets ? buckets.length + ' buckets' : 'Not configured'}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Real Estate Hotspot - Supabase Connection Test');
  console.log('================================================\n');
  
  const success = await testConnection();
  
  if (!success) {
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure you\'ve run the setup-new-database.sql script');
    console.log('2. Check your .env.local file has the correct credentials');
    console.log('3. Verify your Supabase project is active');
    console.log('4. Check the Supabase dashboard for any errors');
    process.exit(1);
  }
  
  console.log('\n🎯 Next steps:');
  console.log('1. Test your application: npm run dev');
  console.log('2. Deploy to production: Update Netlify environment variables');
  console.log('3. Configure authentication providers in Supabase dashboard');
  console.log('4. Set up storage buckets if needed');
}

main().catch(console.error);
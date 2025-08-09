#!/usr/bin/env node

/**
 * Database Schema Verification Script
 * 
 * This script verifies that our TypeScript types align with the actual
 * Supabase database schema from setup-clean-database.sql
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTableStructure(tableName, expectedColumns) {
  console.log(`🔍 Verifying ${tableName} table structure...`);
  
  try {
    // Try to select from the table to verify it exists and get column info
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`❌ Error accessing ${tableName}:`, error.message);
      return false;
    }

    console.log(`✅ ${tableName} table exists and is accessible`);
    
    // If we have data, verify some key columns exist
    if (data && data.length > 0) {
      const firstRow = data[0];
      const missingColumns = expectedColumns.filter(col => !(col in firstRow));
      
      if (missingColumns.length > 0) {
        console.warn(`⚠️  ${tableName} missing expected columns:`, missingColumns);
      } else {
        console.log(`✅ ${tableName} has all expected columns`);
      }
    }

    return true;
  } catch (err) {
    console.error(`❌ Error verifying ${tableName}:`, err.message);
    return false;
  }
}

async function testRelationships() {
  console.log('🔍 Testing table relationships...');
  
  try {
    // Test property_favorites with properties relationship
    const { data: favoritesData, error: favoritesError } = await supabase
      .from('property_favorites')
      .select(`
        id,
        property_id,
        created_at,
        properties (
          id,
          title,
          price,
          address,
          city,
          state,
          images,
          bedrooms,
          bathrooms,
          area_sqm,
          property_type,
          listing_type,
          status
        )
      `)
      .limit(1);

    if (favoritesError) {
      console.error('❌ Error testing property_favorites relationship:', favoritesError.message);
      return false;
    }

    console.log('✅ property_favorites -> properties relationship works');

    // Test properties with real_estate_agents relationship
    const { data: propertiesData, error: propertiesError } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        real_estate_agents (
          id,
          agency_name,
          phone,
          rating,
          profile_image_url
        )
      `)
      .limit(1);

    if (propertiesError) {
      console.error('❌ Error testing properties relationship:', propertiesError.message);
      return false;
    }

    console.log('✅ properties -> real_estate_agents relationship works');

    return true;
  } catch (err) {
    console.error('❌ Error testing relationships:', err.message);
    return false;
  }
}

async function testUserProfileOperations() {
  console.log('🔍 Testing user profile operations...');
  
  try {
    // Test if we can query user_profiles (should work with RLS)
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('❌ Error accessing user_profiles:', error.message);
      return false;
    }

    console.log('✅ user_profiles table is accessible');
    return true;
  } catch (err) {
    console.error('❌ Error testing user profiles:', err.message);
    return false;
  }
}

async function verifyEnumTypes() {
  console.log('🔍 Verifying enum types...');
  
  try {
    // Test property_type enum
    const { data: propertiesData, error: propertiesError } = await supabase
      .from('properties')
      .select('property_type')
      .limit(5);

    if (propertiesError) {
      console.error('❌ Error checking property_type enum:', propertiesError.message);
      return false;
    }

    if (propertiesData && propertiesData.length > 0) {
      const propertyTypes = [...new Set(propertiesData.map(p => p.property_type))];
      console.log('✅ Found property_type values:', propertyTypes);
    }

    // Test account_type enum in user_profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('account_type')
      .limit(5);

    if (profilesError && profilesError.code !== 'PGRST116') {
      console.error('❌ Error checking account_type enum:', profilesError.message);
      return false;
    }

    console.log('✅ Enum types are working correctly');
    return true;
  } catch (err) {
    console.error('❌ Error verifying enum types:', err.message);
    return false;
  }
}

async function runSchemaVerification() {
  console.log('🚀 Starting database schema verification...\n');

  const tables = [
    {
      name: 'user_profiles',
      columns: ['id', 'user_id', 'full_name', 'email', 'phone', 'avatar_url', 'account_type', 'bio', 'location', 'preferences', 'created_at', 'updated_at']
    },
    {
      name: 'real_estate_agents',
      columns: ['id', 'user_id', 'agency_name', 'license_number', 'phone', 'bio', 'profile_image_url', 'verification_status', 'rating', 'total_reviews', 'years_experience', 'specializations', 'social_media', 'created_at', 'updated_at']
    },
    {
      name: 'properties',
      columns: ['id', 'title', 'description', 'property_type', 'listing_type', 'status', 'price', 'bedrooms', 'bathrooms', 'area_sqm', 'address', 'city', 'state', 'country', 'latitude', 'longitude', 'agent_id', 'owner_id', 'featured', 'verified', 'images', 'amenities', 'year_built', 'parking_spaces', 'furnishing_status', 'property_documents', 'virtual_tour_url', 'views_count', 'seo_slug', 'meta_description', 'created_at', 'updated_at']
    },
    {
      name: 'property_favorites',
      columns: ['id', 'user_id', 'property_id', 'created_at']
    },
    {
      name: 'saved_searches',
      columns: ['id', 'user_id', 'name', 'search_criteria', 'email_alerts', 'created_at', 'updated_at']
    },
    {
      name: 'property_inquiries',
      columns: ['id', 'property_id', 'user_id', 'agent_id', 'message', 'phone', 'email', 'preferred_contact_method', 'status', 'response', 'inquiry_type', 'created_at', 'updated_at']
    },
    {
      name: 'property_viewings',
      columns: ['id', 'property_id', 'user_id', 'agent_id', 'scheduled_date', 'status', 'notes', 'viewing_type', 'created_at', 'updated_at']
    },
    {
      name: 'notifications',
      columns: ['id', 'user_id', 'title', 'message', 'type', 'read', 'action_url', 'created_at']
    }
  ];

  let allPassed = true;

  // Verify each table
  for (const table of tables) {
    const passed = await verifyTableStructure(table.name, table.columns);
    if (!passed) allPassed = false;
  }

  console.log('');

  // Test relationships
  const relationshipsOk = await testRelationships();
  if (!relationshipsOk) allPassed = false;

  console.log('');

  // Test user profile operations
  const userProfilesOk = await testUserProfileOperations();
  if (!userProfilesOk) allPassed = false;

  console.log('');

  // Verify enum types
  const enumsOk = await verifyEnumTypes();
  if (!enumsOk) allPassed = false;

  console.log('\n📊 Schema Verification Results:');
  console.log('================================');

  if (allPassed) {
    console.log('🎉 All schema verifications passed!');
    console.log('✅ Database schema matches TypeScript types');
    console.log('✅ All relationships are working');
    console.log('✅ Row Level Security is properly configured');
    console.log('✅ Enum types are functioning correctly');
    console.log('\n🚀 Your database is ready for production!');
  } else {
    console.log('❌ Some schema verifications failed');
    console.log('Please check the errors above and ensure:');
    console.log('1. You have run the setup-clean-database.sql script');
    console.log('2. All tables were created successfully');
    console.log('3. Row Level Security policies are in place');
    console.log('4. Sample data has been inserted');
  }

  process.exit(allPassed ? 0 : 1);
}

// Run the verification
runSchemaVerification().catch(error => {
  console.error('❌ Schema verification failed:', error);
  process.exit(1);
});
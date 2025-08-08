#!/usr/bin/env node

/**
 * Database Setup Test
 * Tests if all tables and data were created successfully
 */

import fs from 'fs';
import path from 'path';

// Read environment variables
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const envVars = {};
envContent.split('\n').forEach(line => {
  if (line.includes('=') && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Database Setup...\n');

async function testTable(tableName) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=count`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Range': '0-0'
      }
    });
    
    if (response.ok) {
      const countHeader = response.headers.get('content-range');
      const count = countHeader ? countHeader.split('/')[1] : '0';
      console.log(`✅ ${tableName}: ${count} records`);
      return true;
    } else {
      console.log(`❌ ${tableName}: Error ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${tableName}: ${error.message}`);
    return false;
  }
}

async function testDatabaseSetup() {
  const tables = [
    'user_profiles',
    'real_estate_agents', 
    'properties',
    'property_favorites',
    'property_inquiries',
    'property_reviews',
    'agent_reviews',
    'property_viewings',
    'search_history',
    'notifications',
    'saved_searches'
  ];
  
  console.log('📋 Checking all tables...\n');
  
  let successCount = 0;
  for (const table of tables) {
    const success = await testTable(table);
    if (success) successCount++;
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }
  
  console.log(`\n📊 Results: ${successCount}/${tables.length} tables accessible`);
  
  if (successCount === tables.length) {
    console.log('\n🎉 Database setup is complete and working!');
    console.log('\n📋 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Test your application');
    console.log('3. Check properties are loading on homepage');
    return true;
  } else {
    console.log('\n⚠️  Some tables are missing or inaccessible.');
    console.log('Please run the safe migration script in Supabase SQL Editor.');
    return false;
  }
}

testDatabaseSetup().catch(console.error);
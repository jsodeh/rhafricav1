#!/usr/bin/env node

/**
 * Simple Supabase Connection Test
 * Tests connection using environment variables from .env.local
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env.local file
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line.includes('=') && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Not found');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

// Test basic HTTP connection
async function testConnection() {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Connection successful!');
      console.log('Status:', response.status);
      return true;
    } else {
      console.log('❌ Connection failed');
      console.log('Status:', response.status);
      console.log('Response:', await response.text());
      return false;
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Your Supabase credentials are working!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to your Supabase Dashboard SQL Editor');
    console.log('2. Copy and paste the content from supabase/setup-new-database.sql');
    console.log('3. Click "Run" to create all tables and data');
    console.log('4. Come back and run: npm run dev');
  } else {
    console.log('\n🔧 Please check your credentials and try again');
  }
});
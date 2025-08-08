#!/usr/bin/env node

/**
 * Database Migration Runner
 * Runs the database setup script via Supabase REST API
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

console.log('🚀 Running Database Migration...\n');

// Read SQL file
const sqlPath = path.join(process.cwd(), 'supabase', 'setup-new-database.sql');
const sqlContent = fs.readFileSync(sqlPath, 'utf8');

// Split SQL into individual statements
const statements = sqlContent
  .split(';')
  .map(stmt => stmt.trim())
  .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
  .map(stmt => stmt + ';');

console.log(`📝 Found ${statements.length} SQL statements to execute`);

async function runMigration() {
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip comments and empty statements
    if (statement.startsWith('--') || statement.trim() === ';') {
      continue;
    }
    
    try {
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ sql: statement })
      });
      
      if (response.ok) {
        successCount++;
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } else {
        errorCount++;
        const error = await response.text();
        console.log(`❌ Statement ${i + 1} failed:`, error);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      errorCount++;
      console.error(`❌ Error executing statement ${i + 1}:`, error.message);
    }
  }
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  
  if (errorCount === 0) {
    console.log(`\n🎉 Migration completed successfully!`);
    console.log(`\n📋 Next steps:`);
    console.log(`1. Run: npm run dev`);
    console.log(`2. Test your application`);
    console.log(`3. Check the database in Supabase Dashboard`);
  } else {
    console.log(`\n⚠️  Some statements failed. Please check the errors above.`);
    console.log(`You may need to run the SQL manually in Supabase Dashboard.`);
  }
}

// Check if we can run migrations via API
console.log('⚠️  Note: This script attempts to run migrations via API.');
console.log('If it fails, please run the SQL manually in Supabase Dashboard.\n');

runMigration().catch(console.error);
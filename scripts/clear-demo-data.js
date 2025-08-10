#!/usr/bin/env node

/**
 * Script to clear demo data and reset user experience
 * Run with: node scripts/clear-demo-data.js
 */

console.log('🧹 Clearing Demo Data and Resetting User Experience\n');

console.log('📋 Manual Steps to Clear Demo Data:');
console.log('');

console.log('1. 🌐 Clear Browser Data:');
console.log('   - Open Developer Tools (F12)');
console.log('   - Go to Application/Storage tab');
console.log('   - Clear Local Storage');
console.log('   - Clear Session Storage');
console.log('   - Clear Cookies');
console.log('   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)');
console.log('');

console.log('2. 🔐 Sign Out and Sign In Again:');
console.log('   - Click sign out in the app');
console.log('   - Sign in with your actual account');
console.log('   - This will refresh all user data');
console.log('');

console.log('3. 📱 Check Profile Setup:');
console.log('   - After signing in, click "Complete Profile" button');
console.log('   - Fill out your actual information');
console.log('   - This will create your real user profile');
console.log('');

console.log('4. 🗄️ Database Check:');
console.log('   - Run: node scripts/debug-user-data.js');
console.log('   - This will show what data exists in your database');
console.log('');

console.log('5. 🎯 Expected Behavior After Clearing:');
console.log('   - Dashboard shows YOUR name and email');
console.log('   - Profile setup appears for new/incomplete profiles');
console.log('   - No hardcoded "Sarah Johnson" data');
console.log('   - No fake chat notifications');
console.log('   - Real account verification status');
console.log('');

console.log('✅ Demo data clearing guide complete!');
console.log('');
console.log('🔧 If issues persist:');
console.log('1. Check browser console for errors');
console.log('2. Verify Supabase connection with: node scripts/test-supabase-connection-fixed.js');
console.log('3. Check user data with: node scripts/debug-user-data.js');
console.log('4. Ensure .env.local has correct Supabase credentials');
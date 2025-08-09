#!/usr/bin/env node

/**
 * Production Readiness Check Script
 * 
 * This script performs comprehensive checks to ensure the application
 * is ready for production deployment.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.production' });

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const optionalEnvVars = [
  'VITE_APP_VERSION',
  'VITE_ANALYTICS_ID',
  'VITE_SENTRY_DSN'
];

async function checkEnvironmentVariables() {
  console.log('🔍 Checking environment variables...');
  
  const missing = [];
  const warnings = [];

  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check optional variables
  for (const varName of optionalEnvVars) {
    if (!process.env[varName]) {
      warnings.push(varName);
    }
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    return false;
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Missing optional environment variables:');
    warnings.forEach(varName => console.warn(`   - ${varName}`));
  }

  console.log('✅ Environment variables check passed');
  return true;
}

async function checkDatabaseConnection() {
  console.log('🔍 Checking database connection...');
  
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase credentials not found');
      return false;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test basic connection
    const { data, error } = await supabase
      .from('properties')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  }
}

async function checkDatabaseSchema() {
  console.log('🔍 Checking database schema...');
  
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.VITE_SUPABASE_ANON_KEY
    );

    const requiredTables = [
      'user_profiles',
      'properties',
      'property_favorites',
      'saved_searches',
      'real_estate_agents'
    ];

    for (const table of requiredTables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.error(`❌ Table '${table}' not accessible:`, error.message);
        return false;
      }
    }

    console.log('✅ Database schema check passed');
    return true;
  } catch (error) {
    console.error('❌ Database schema check failed:', error.message);
    return false;
  }
}

async function checkBuildFiles() {
  console.log('🔍 Checking build files...');
  
  const distPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.error('❌ Build directory not found. Run "npm run build" first.');
    return false;
  }

  const requiredFiles = [
    'index.html',
    'assets'
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(distPath, file);
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Required build file missing: ${file}`);
      return false;
    }
  }

  // Check if assets directory has files
  const assetsPath = path.join(distPath, 'assets');
  const assetsFiles = fs.readdirSync(assetsPath);
  
  if (assetsFiles.length === 0) {
    console.error('❌ Assets directory is empty');
    return false;
  }

  console.log('✅ Build files check passed');
  return true;
}

async function checkTypeScriptCompilation() {
  console.log('🔍 Checking TypeScript compilation...');
  
  try {
    const { execSync } = await import('child_process');
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation check passed');
    return true;
  } catch (error) {
    console.error('❌ TypeScript compilation errors found');
    console.error(error.stdout?.toString() || error.message);
    return false;
  }
}

async function checkTestCoverage() {
  console.log('🔍 Checking test coverage...');
  
  try {
    const { execSync } = await import('child_process');
    const result = execSync('npm run test:run', { stdio: 'pipe' });
    console.log('✅ Tests passed');
    return true;
  } catch (error) {
    console.error('❌ Tests failed');
    console.error(error.stdout?.toString() || error.message);
    return false;
  }
}

async function checkSecurityHeaders() {
  console.log('🔍 Checking security configuration...');
  
  // Check if security headers are configured
  const netlifyTomlPath = path.join(process.cwd(), 'netlify.toml');
  const publicPath = path.join(process.cwd(), 'public');
  
  let hasSecurityConfig = false;

  if (fs.existsSync(netlifyTomlPath)) {
    const netlifyConfig = fs.readFileSync(netlifyTomlPath, 'utf8');
    if (netlifyConfig.includes('X-Frame-Options') || netlifyConfig.includes('Content-Security-Policy')) {
      hasSecurityConfig = true;
    }
  }

  if (fs.existsSync(path.join(publicPath, '_headers'))) {
    hasSecurityConfig = true;
  }

  if (!hasSecurityConfig) {
    console.warn('⚠️  No security headers configuration found');
    console.warn('   Consider adding security headers for production');
  } else {
    console.log('✅ Security configuration found');
  }

  return true;
}

async function checkPerformanceOptimizations() {
  console.log('🔍 Checking performance optimizations...');
  
  const distPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    console.warn('⚠️  Build directory not found, skipping performance check');
    return true;
  }

  const assetsPath = path.join(distPath, 'assets');
  const files = fs.readdirSync(assetsPath);
  
  // Check for gzipped files or compression
  const hasGzipFiles = files.some(file => file.endsWith('.gz'));
  const hasBrotliFiles = files.some(file => file.endsWith('.br'));
  
  if (!hasGzipFiles && !hasBrotliFiles) {
    console.warn('⚠️  No compressed assets found');
    console.warn('   Consider enabling compression in your deployment platform');
  }

  // Check bundle sizes
  const jsFiles = files.filter(file => file.endsWith('.js') && !file.includes('.map'));
  const cssFiles = files.filter(file => file.endsWith('.css') && !file.includes('.map'));
  
  let totalJsSize = 0;
  let totalCssSize = 0;

  jsFiles.forEach(file => {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    totalJsSize += stats.size;
  });

  cssFiles.forEach(file => {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    totalCssSize += stats.size;
  });

  const totalJsSizeMB = (totalJsSize / 1024 / 1024).toFixed(2);
  const totalCssSizeMB = (totalCssSize / 1024 / 1024).toFixed(2);

  console.log(`📊 Bundle sizes: JS: ${totalJsSizeMB}MB, CSS: ${totalCssSizeMB}MB`);

  if (totalJsSize > 2 * 1024 * 1024) { // 2MB
    console.warn('⚠️  JavaScript bundle size is large (>2MB)');
    console.warn('   Consider code splitting or removing unused dependencies');
  }

  console.log('✅ Performance check completed');
  return true;
}

async function generateProductionReport() {
  console.log('\n📋 Generating production readiness report...\n');
  
  const checks = [
    { name: 'Environment Variables', fn: checkEnvironmentVariables },
    { name: 'Database Connection', fn: checkDatabaseConnection },
    { name: 'Database Schema', fn: checkDatabaseSchema },
    { name: 'TypeScript Compilation', fn: checkTypeScriptCompilation },
    { name: 'Test Coverage', fn: checkTestCoverage },
    { name: 'Build Files', fn: checkBuildFiles },
    { name: 'Security Configuration', fn: checkSecurityHeaders },
    { name: 'Performance Optimizations', fn: checkPerformanceOptimizations }
  ];

  const results = [];
  let allPassed = true;

  for (const check of checks) {
    try {
      const passed = await check.fn();
      results.push({ name: check.name, passed, error: null });
      if (!passed) allPassed = false;
    } catch (error) {
      results.push({ name: check.name, passed: false, error: error.message });
      allPassed = false;
    }
  }

  console.log('\n📊 Production Readiness Report:');
  console.log('================================');
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  console.log('\n================================');
  
  if (allPassed) {
    console.log('🎉 All checks passed! Your application is ready for production.');
    console.log('\nNext steps:');
    console.log('1. Deploy to your hosting platform');
    console.log('2. Set up monitoring and analytics');
    console.log('3. Configure CDN and caching');
    console.log('4. Set up error tracking');
    process.exit(0);
  } else {
    console.log('❌ Some checks failed. Please address the issues above before deploying to production.');
    process.exit(1);
  }
}

// Run the production check
generateProductionReport().catch(error => {
  console.error('❌ Production check failed:', error);
  process.exit(1);
});
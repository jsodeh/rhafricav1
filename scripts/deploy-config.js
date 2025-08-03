#!/usr/bin/env node

/**
 * Deployment Configuration Script
 * Validates environment variables and prepares build for deployment
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_VARS = {
  development: [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_APP_NAME',
    'VITE_APP_URL'
  ],
  staging: [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_PAYSTACK_PUBLIC_KEY',
    'VITE_MAPBOX_ACCESS_TOKEN',
    'VITE_APP_NAME',
    'VITE_APP_URL'
  ],
  production: [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_PAYSTACK_PUBLIC_KEY',
    'VITE_MAPBOX_ACCESS_TOKEN',
    'VITE_APP_NAME',
    'VITE_APP_URL',
    'VITE_GA_MEASUREMENT_ID'
  ]
};

const SENSITIVE_VARS = [
  'VITE_SUPABASE_ANON_KEY',
  'VITE_PAYSTACK_PUBLIC_KEY',
  'VITE_MAPBOX_ACCESS_TOKEN',
  'VITE_GA_MEASUREMENT_ID',
  'VITE_SENTRY_DSN'
];

class DeploymentConfig {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.buildTarget = process.env.VITE_BUILD_TARGET || this.environment;
    this.errors = [];
    this.warnings = [];
  }

  validateEnvironmentVariables() {
    console.log(`🔍 Validating environment variables for ${this.buildTarget}...`);
    
    const requiredVars = REQUIRED_VARS[this.buildTarget] || REQUIRED_VARS.development;
    
    requiredVars.forEach(varName => {
      const value = process.env[varName];
      
      if (!value) {
        this.errors.push(`Missing required environment variable: ${varName}`);
        return;
      }
      
      // Check for placeholder values
      if (value.includes('your_') || value.includes('your-') || value.includes('XXXXXXXXXX')) {
        this.warnings.push(`Environment variable ${varName} appears to contain placeholder value`);
      }
      
      // Validate URL format for URL variables
      if (varName.includes('URL') && !this.isValidUrl(value)) {
        this.errors.push(`Invalid URL format for ${varName}: ${value}`);
      }
      
      // Validate Supabase URL format
      if (varName === 'VITE_SUPABASE_URL' && !value.includes('.supabase.co')) {
        this.warnings.push(`Supabase URL format may be incorrect: ${varName}`);
      }
      
      // Validate Paystack key format
      if (varName === 'VITE_PAYSTACK_PUBLIC_KEY') {
        if (this.buildTarget === 'production' && !value.startsWith('pk_live_')) {
          this.errors.push(`Production environment should use live Paystack key (pk_live_*)`);
        } else if (this.buildTarget !== 'production' && !value.startsWith('pk_test_')) {
          this.warnings.push(`Non-production environment should use test Paystack key (pk_test_*)`);
        }
      }
    });
  }

  validateBuildConfiguration() {
    console.log('🔧 Validating build configuration...');
    
    // Check if dist directory exists and clean it
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      console.log('🧹 Cleaning existing dist directory...');
      fs.rmSync(distPath, { recursive: true, force: true });
    }
    
    // Validate package.json
    const packagePath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packagePath)) {
      this.errors.push('package.json not found');
      return;
    }
    
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Check required scripts
    const requiredScripts = ['build', 'preview'];
    requiredScripts.forEach(script => {
      if (!packageJson.scripts[script]) {
        this.errors.push(`Missing required script: ${script}`);
      }
    });
    
    // Check for required dependencies
    const requiredDeps = ['react', 'react-dom', 'vite'];
    requiredDeps.forEach(dep => {
      if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
        this.errors.push(`Missing required dependency: ${dep}`);
      }
    });
  }

  generateSecurityReport() {
    console.log('🔒 Generating security report...');
    
    const securityReport = {
      timestamp: new Date().toISOString(),
      environment: this.buildTarget,
      sensitiveVarsConfigured: 0,
      potentialIssues: []
    };
    
    SENSITIVE_VARS.forEach(varName => {
      const value = process.env[varName];
      if (value && !value.includes('your_')) {
        securityReport.sensitiveVarsConfigured++;
      }
    });
    
    // Check for common security issues
    if (this.buildTarget === 'production') {
      if (process.env.VITE_ENABLE_ANALYTICS !== 'true') {
        securityReport.potentialIssues.push('Analytics not enabled in production');
      }
      
      if (process.env.VITE_ENABLE_ERROR_TRACKING !== 'true') {
        securityReport.potentialIssues.push('Error tracking not enabled in production');
      }
    }
    
    // Write security report
    const reportPath = path.join(process.cwd(), 'deployment-security-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(securityReport, null, 2));
    console.log(`📊 Security report saved to: ${reportPath}`);
    
    return securityReport;
  }

  generateDeploymentManifest() {
    console.log('📋 Generating deployment manifest...');
    
    const manifest = {
      timestamp: new Date().toISOString(),
      environment: this.buildTarget,
      version: process.env.npm_package_version || '1.0.0',
      buildHash: this.generateBuildHash(),
      configuration: {
        appName: process.env.VITE_APP_NAME,
        appUrl: process.env.VITE_APP_URL,
        features: {
          analytics: process.env.VITE_ENABLE_ANALYTICS === 'true',
          errorTracking: process.env.VITE_ENABLE_ERROR_TRACKING === 'true',
          performanceMonitoring: process.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
          pwa: process.env.VITE_ENABLE_PWA === 'true'
        }
      },
      validation: {
        passed: this.errors.length === 0,
        errors: this.errors,
        warnings: this.warnings
      }
    };
    
    const manifestPath = path.join(process.cwd(), 'deployment-manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`📋 Deployment manifest saved to: ${manifestPath}`);
    
    return manifest;
  }

  generateBuildHash() {
    const crypto = require('crypto');
    const packageJson = fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8');
    return crypto.createHash('md5').update(packageJson).digest('hex').substring(0, 8);
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log(`🚀 DEPLOYMENT CONFIGURATION SUMMARY`);
    console.log('='.repeat(60));
    console.log(`Environment: ${this.buildTarget}`);
    console.log(`Errors: ${this.errors.length}`);
    console.log(`Warnings: ${this.warnings.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ ERRORS:');
      this.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    if (this.errors.length === 0) {
      console.log('\n✅ Configuration validation passed!');
      console.log('🎯 Ready for deployment');
    } else {
      console.log('\n❌ Configuration validation failed!');
      console.log('🛑 Please fix errors before deploying');
    }
    
    console.log('='.repeat(60));
  }

  run() {
    console.log(`🚀 Starting deployment configuration for ${this.buildTarget}...\n`);
    
    this.validateEnvironmentVariables();
    this.validateBuildConfiguration();
    
    const securityReport = this.generateSecurityReport();
    const manifest = this.generateDeploymentManifest();
    
    this.printSummary();
    
    // Exit with error code if validation failed
    if (this.errors.length > 0) {
      process.exit(1);
    }
    
    console.log('\n🎉 Deployment configuration completed successfully!');
  }
}

// Run the configuration check
if (require.main === module) {
  const config = new DeploymentConfig();
  config.run();
}

module.exports = DeploymentConfig;

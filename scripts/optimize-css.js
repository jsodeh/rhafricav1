#!/usr/bin/env node

/**
 * CSS Optimization Script
 * 
 * This script analyzes and optimizes CSS by:
 * - Removing unused styles
 * - Consolidating duplicate rules
 * - Optimizing custom properties
 * - Generating critical CSS
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the main CSS file
const cssPath = path.join(__dirname, '../src/index.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// Extract all CSS custom properties
const extractCustomProperties = (css) => {
  const customProps = new Map();
  const regex = /--([\w-]+):\s*([^;]+);/g;
  let match;
  
  while ((match = regex.exec(css)) !== null) {
    const [, name, value] = match;
    customProps.set(`--${name}`, value.trim());
  }
  
  return customProps;
};

// Find unused custom properties
const findUnusedProperties = (css, customProps) => {
  const usedProps = new Set();
  const unusedProps = new Set();
  
  // Find all var() usages
  const varRegex = /var\((--[\w-]+)/g;
  let match;
  
  while ((match = varRegex.exec(css)) !== null) {
    usedProps.add(match[1]);
  }
  
  // Check which properties are unused
  customProps.forEach((value, name) => {
    if (!usedProps.has(name)) {
      unusedProps.add(name);
    }
  });
  
  return { usedProps, unusedProps };
};

// Remove duplicate CSS rules
const removeDuplicateRules = (css) => {
  const rules = new Map();
  const lines = css.split('\n');
  const optimizedLines = [];
  
  let currentRule = '';
  let inRule = false;
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    if (trimmedLine.includes('{')) {
      inRule = true;
      currentRule = trimmedLine;
    } else if (trimmedLine.includes('}')) {
      inRule = false;
      currentRule += ' ' + trimmedLine;
      
      // Check if we've seen this rule before
      if (!rules.has(currentRule)) {
        rules.set(currentRule, true);
        optimizedLines.push(line);
      }
      
      currentRule = '';
    } else if (inRule) {
      currentRule += ' ' + trimmedLine;
      optimizedLines.push(line);
    } else {
      optimizedLines.push(line);
    }
  });
  
  return optimizedLines.join('\n');
};

// Generate optimized CSS
const generateOptimizedCSS = (css) => {
  const customProps = extractCustomProperties(css);
  const { usedProps, unusedProps } = findUnusedProperties(css, customProps);
  
  console.log(`Found ${customProps.size} custom properties`);
  console.log(`${usedProps.size} are used, ${unusedProps.size} are unused`);
  
  if (unusedProps.size > 0) {
    console.log('Unused properties:', Array.from(unusedProps));
  }
  
  // Remove unused properties
  let optimizedCSS = css;
  unusedProps.forEach(prop => {
    const regex = new RegExp(`\\s*${prop.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}:\\s*[^;]+;`, 'g');
    optimizedCSS = optimizedCSS.replace(regex, '');
  });
  
  // Remove duplicate rules
  optimizedCSS = removeDuplicateRules(optimizedCSS);
  
  // Remove empty lines and excessive whitespace
  optimizedCSS = optimizedCSS
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/\s+/g, ' ')
    .replace(/;\s*}/g, ';}')
    .replace(/{\s*/g, '{')
    .replace(/\s*}/g, '}');
  
  return optimizedCSS;
};

// Extract critical CSS (above-the-fold styles)
const extractCriticalCSS = (css) => {
  const criticalSelectors = [
    ':root',
    'body',
    'html',
    '.page-container',
    '.nav-modern',
    '.hero-consistent',
    '.card-modern',
    '.btn-modern-primary',
    '.property-grid',
    'h1', 'h2', 'h3',
    '.loading-spinner',
    '.skeleton'
  ];
  
  const criticalRules = [];
  const lines = css.split('\n');
  let currentRule = '';
  let inCriticalRule = false;
  let braceCount = 0;
  
  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    if (trimmedLine.includes('{')) {
      braceCount++;
      const selector = trimmedLine.split('{')[0].trim();
      
      inCriticalRule = criticalSelectors.some(criticalSelector => 
        selector.includes(criticalSelector) || 
        criticalSelector.includes(selector)
      );
      
      if (inCriticalRule) {
        currentRule = line;
      }
    } else if (trimmedLine.includes('}')) {
      braceCount--;
      
      if (inCriticalRule) {
        currentRule += '\n' + line;
        
        if (braceCount === 0) {
          criticalRules.push(currentRule);
          currentRule = '';
          inCriticalRule = false;
        }
      }
    } else if (inCriticalRule) {
      currentRule += '\n' + line;
    }
  });
  
  return criticalRules.join('\n\n');
};

// Main optimization function
const optimizeCSS = () => {
  console.log('Starting CSS optimization...');
  
  try {
    const optimizedCSS = generateOptimizedCSS(cssContent);
    const criticalCSS = extractCriticalCSS(cssContent);
    
    // Calculate savings
    const originalSize = Buffer.byteLength(cssContent, 'utf8');
    const optimizedSize = Buffer.byteLength(optimizedCSS, 'utf8');
    const criticalSize = Buffer.byteLength(criticalCSS, 'utf8');
    const savings = originalSize - optimizedSize;
    const savingsPercent = ((savings / originalSize) * 100).toFixed(2);
    
    console.log(`Original size: ${(originalSize / 1024).toFixed(2)}KB`);
    console.log(`Optimized size: ${(optimizedSize / 1024).toFixed(2)}KB`);
    console.log(`Critical CSS size: ${(criticalSize / 1024).toFixed(2)}KB`);
    console.log(`Savings: ${(savings / 1024).toFixed(2)}KB (${savingsPercent}%)`);
    
    // Write optimized files
    const optimizedPath = path.join(__dirname, '../src/index.optimized.css');
    const criticalPath = path.join(__dirname, '../src/critical.css');
    
    fs.writeFileSync(optimizedPath, optimizedCSS);
    fs.writeFileSync(criticalPath, criticalCSS);
    
    console.log('Optimization complete!');
    console.log(`Optimized CSS written to: ${optimizedPath}`);
    console.log(`Critical CSS written to: ${criticalPath}`);
    
    // Generate optimization report
    const report = {
      timestamp: new Date().toISOString(),
      originalSize: originalSize,
      optimizedSize: optimizedSize,
      criticalSize: criticalSize,
      savings: savings,
      savingsPercent: parseFloat(savingsPercent),
      recommendations: [
        'Consider using the critical CSS for above-the-fold content',
        'Load non-critical CSS asynchronously',
        'Use CSS custom properties for consistent theming',
        'Remove unused Tailwind classes with purging',
        'Consider CSS-in-JS for component-specific styles'
      ]
    };
    
    const reportPath = path.join(__dirname, '../optimization-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`Optimization report written to: ${reportPath}`);
    
  } catch (error) {
    console.error('CSS optimization failed:', error);
    process.exit(1);
  }
};

// Run optimization if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeCSS();
}

export { optimizeCSS, extractCriticalCSS, generateOptimizedCSS };
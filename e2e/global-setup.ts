import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('Starting global setup...');
  
  // Launch browser for setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Wait for dev server to be ready
    const baseURL = config.webServer?.url || 'http://localhost:8080';
    console.log(`Waiting for dev server at ${baseURL}...`);
    
    let retries = 30;
    while (retries > 0) {
      try {
        const response = await page.goto(baseURL, { timeout: 5000 });
        if (response?.ok()) {
          console.log('Dev server is ready!');
          break;
        }
      } catch (error) {
        console.log(`Waiting for dev server... (${retries} retries left)`);
        await page.waitForTimeout(2000);
        retries--;
      }
    }
    
    if (retries === 0) {
      throw new Error('Dev server failed to start within timeout');
    }
    
    // Setup test data or authentication if needed
    console.log('Setting up test environment...');
    
    // Create test user session (if needed)
    await page.context().addCookies([
      {
        name: 'test-session',
        value: 'e2e-test-session',
        domain: 'localhost',
        path: '/',
      }
    ]);
    
    // Pre-warm any caches or perform initial data setup
    await page.goto(`${baseURL}/api/health-check`, { timeout: 10000 }).catch(() => {
      console.log('Health check endpoint not available, continuing...');
    });
    
    console.log('Global setup completed successfully!');
    
  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;

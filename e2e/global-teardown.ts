import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('Starting global teardown...');
  
  try {
    // Cleanup test data
    console.log('Cleaning up test data...');
    
    // Clear any test files or uploads
    // await fs.rm('./uploads/test-*', { recursive: true, force: true });
    
    // Reset any test database state
    // await resetTestDatabase();
    
    // Clear any external service test data
    // await cleanupExternalServices();
    
    console.log('Global teardown completed successfully!');
    
  } catch (error) {
    console.error('Global teardown failed:', error);
    // Don't throw here as it might mask test failures
  }
}

export default globalTeardown;

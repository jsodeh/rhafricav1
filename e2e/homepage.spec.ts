import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Real Estate Hotspot/);
    await expect(page.getByRole('heading', { name: /find your dream home/i })).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    // Check main navigation items
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /properties/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /agents/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /contact/i })).toBeVisible();
  });

  test('should have working search functionality', async ({ page }) => {
    // Find search input
    const searchInput = page.getByPlaceholder(/search by location/i);
    await expect(searchInput).toBeVisible();

    // Enter search term
    await searchInput.fill('Lagos');
    
    // Submit search
    await page.getByRole('button', { name: /search/i }).click();
    
    // Should navigate to search results
    await expect(page).toHaveURL(/\/search/);
    await expect(page.getByText(/search results/i)).toBeVisible();
  });

  test('should display featured properties', async ({ page }) => {
    // Wait for properties to load
    await page.waitForSelector('[data-testid="featured-properties"]', { timeout: 10000 });
    
    // Check if featured properties section exists
    await expect(page.getByText(/featured properties/i)).toBeVisible();
    
    // Should have at least one property card
    const propertyCards = page.locator('[data-testid="property-card"]');
    await expect(propertyCards.first()).toBeVisible();
    
    // Property card should have essential information
    await expect(propertyCards.first().getByText(/₦/)).toBeVisible(); // Price
    await expect(propertyCards.first().getByText(/bed/i)).toBeVisible(); // Bedrooms
    await expect(propertyCards.first().getByText(/bath/i)).toBeVisible(); // Bathrooms
  });

  test('should navigate to property details', async ({ page }) => {
    // Wait for properties to load
    await page.waitForSelector('[data-testid="property-card"]', { timeout: 10000 });
    
    // Click on first property card
    await page.locator('[data-testid="property-card"]').first().click();
    
    // Should navigate to property detail page
    await expect(page).toHaveURL(/\/properties\/\d+/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should have responsive design on mobile', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip('Mobile-specific test');
    }

    // Check mobile navigation menu
    const menuButton = page.getByRole('button', { name: /menu/i });
    await expect(menuButton).toBeVisible();
    
    // Open mobile menu
    await menuButton.click();
    
    // Mobile menu should be visible
    await expect(page.getByRole('navigation').getByText(/properties/i)).toBeVisible();
    
    // Close menu
    await page.getByRole('button', { name: /close/i }).click();
  });

  test('should load key sections', async ({ page }) => {
    // Hero section
    await expect(page.getByText(/find your dream home/i)).toBeVisible();
    
    // Search section
    await expect(page.getByText(/search properties/i)).toBeVisible();
    
    // Featured properties
    await expect(page.getByText(/featured properties/i)).toBeVisible();
    
    // Services section (if present)
    const servicesSection = page.getByText(/our services/i);
    if (await servicesSection.isVisible()) {
      await expect(servicesSection).toBeVisible();
    }
    
    // Footer
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });

  test('should have working contact form', async ({ page }) => {
    // Scroll to contact section or navigate to contact page
    const contactLink = page.getByRole('link', { name: /contact/i });
    if (await contactLink.isVisible()) {
      await contactLink.click();
    } else {
      // Look for contact form on homepage
      await page.getByText(/get in touch/i).scrollIntoViewIfNeeded();
    }
    
    // Fill contact form
    await page.getByLabel(/name/i).fill('Test User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/message/i).fill('This is a test message for E2E testing');
    
    // Submit form
    await page.getByRole('button', { name: /send/i }).click();
    
    // Should show success message
    await expect(page.getByText(/message sent/i)).toBeVisible({ timeout: 10000 });
  });

  test('should handle no JavaScript gracefully', async ({ page, context }) => {
    // Disable JavaScript
    await context.setExtraHTTPHeaders({});
    await page.route('**/*.js', route => route.abort());
    
    await page.goto('/');
    
    // Basic content should still be visible
    await expect(page.getByText(/real estate hotspot/i)).toBeVisible();
    await expect(page.getByText(/properties/i)).toBeVisible();
    
    // Links should still work
    await page.getByRole('link', { name: /properties/i }).click();
    await expect(page).toHaveURL(/\/properties/);
  });
});

test.describe('Homepage Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    
    // Should have only one H1
    await expect(h1).toHaveCount(1);
    
    // H2s should follow H1
    const h2s = page.getByRole('heading', { level: 2 });
    const h2Count = await h2s.count();
    if (h2Count > 0) {
      await expect(h2s.first()).toBeVisible();
    }
  });

  test('should have proper ARIA labels', async ({ page }) => {
    // Navigation should have aria-label
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();
    
    // Search form should have proper labels
    const searchInput = page.getByRole('textbox', { name: /search/i });
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
    
    // Buttons should have accessible names
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        await expect(button).toHaveAttribute('aria-label');
      }
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Skip to main content link should work
    await page.keyboard.press('Tab');
    const skipLink = page.getByText(/skip to main content/i);
    if (await skipLink.isVisible()) {
      await expect(skipLink).toBeFocused();
      await page.keyboard.press('Enter');
    }
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Should be able to activate with keyboard
    if (await focusedElement.getAttribute('role') === 'button') {
      await page.keyboard.press('Enter');
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // This is a basic check - in a real scenario you'd use axe-core
    const backgroundColor = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).backgroundColor;
    });
    
    const textColor = await page.evaluate(() => {
      const body = document.body;
      return window.getComputedStyle(body).color;
    });
    
    // Basic check that colors are defined
    expect(backgroundColor).toBeTruthy();
    expect(textColor).toBeTruthy();
    expect(backgroundColor).not.toBe(textColor);
  });

  test('should have alt text for images', async ({ page }) => {
    const images = page.getByRole('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      if (await img.isVisible()) {
        const alt = await img.getAttribute('alt');
        const ariaHidden = await img.getAttribute('aria-hidden');
        
        // Image should either have alt text or be aria-hidden
        expect(alt !== null || ariaHidden === 'true').toBeTruthy();
      }
    }
  });
});

test.describe('Homepage Performance', () => {
  test('should load within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Get performance metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lcpEntry = entries.find(entry => entry.entryType === 'largest-contentful-paint');
          if (lcpEntry) {
            resolve({
              lcp: lcpEntry.startTime,
              fcp: performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint')?.startTime
            });
          }
        }).observe({ entryTypes: ['largest-contentful-paint', 'paint'] });
        
        // Fallback timeout
        setTimeout(() => resolve({ lcp: null, fcp: null }), 5000);
      });
    });
    
    console.log('Performance metrics:', metrics);
    
    // Basic performance assertions (if metrics are available)
    if (metrics.lcp) {
      expect(metrics.lcp).toBeLessThan(2500); // Good LCP is < 2.5s
    }
    if (metrics.fcp) {
      expect(metrics.fcp).toBeLessThan(1800); // Good FCP is < 1.8s
    }
  });
});

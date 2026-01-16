const { test, expect } = require('@playwright/test');

test(
  'Get product list and display count and names',
  { tags: ['@ui', '@services', '@medium', '@smoke'] },
  async ({ page }) => {
    // Navigate to the page containing the products
    await page.goto('/'); // Replace with the actual URL

    
    // Click on the "All Services" link using its role and href
    await page.click('a[href="/robots.html"]');
    // Get the parent div containing the products
    const productNames = await page.$$eval('#robots-grid > div > h3', elements => {
      return elements.map(el => el.textContent.trim());
    });

    // Display the count and names of the products
    console.log(`Product Count: ${productNames.length}`);
    console.log('Product Names:', productNames);

    // Validate that products are displayed
    expect(productNames.length).toBeGreaterThan(0);
  }
);
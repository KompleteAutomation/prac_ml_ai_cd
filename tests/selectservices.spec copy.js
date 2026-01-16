const { test, expect } = require('@playwright/test');
const { login } = require('../playwright/pages_ai/login');

// Test data
const credentials = { email: 'sumit@gmail.com', password: 'sumit' };

test('SelectCategory', async ({ page }) => {
  // Step 1: Navigate to Login Page
  await page.goto('https://aiglobal.space/login.html');

  // Step 2: Perform Login
  await page.fill('input[name="email"]', credentials.email);
  await page.fill('input[name="password"]', credentials.password);
  await page.click('button:has-text("Login")');

  // Validate successful login
  await expect(page.locator('button:has-text("Logout")')).toBeVisible();
  await page.screenshot({ path: 'screenshots/login-success.png' });

  // Step 3: Navigate to 'All Services'
  await page.click('a:has-text("All Services")');
  await expect(page).toHaveURL(/.*\/robots\.html/);
  await page.screenshot({ path: 'screenshots/all-services.png' });

  // Step 4: Select 'Cleaning' category using actual locator
  await page.selectOption('#filter-cat', { label: 'Cleaning' });
  await page.screenshot({ path: 'screenshots/cleaning-category.png' });

  // Step 5: Get all product names displayed on the page
  const productNames = await page.$$eval('h3', elements => elements.map(el => el.textContent.trim()));
  console.log('Products:', productNames);

  // Step 6: Validate products are displayed and match expected data
  const expectedProducts = ['RoboClean Pro', 'DustMaster 360'];
  const displayedProductNames = await page.$$eval('#robots-grid div > h3', elements => elements.map(el => el.textContent.trim()));
  expect(displayedProductNames).toEqual(expectedProducts);
  await page.screenshot({ path: 'screenshots/products-validation.png' });

  // Step 7: Perform Logout
  await page.click('button:has-text("Logout")');

  // Validate successful logout
  await expect(page.locator('a:has-text("Login")')).toBeVisible();
  await page.screenshot({ path: 'screenshots/logout-success.png' });
});
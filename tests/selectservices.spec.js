// import { test, expect } from '../playwright/setup/globalHooks';
import { test, expect } from '@playwright/test';
import { credentials } from '../playwright/config/config';
const { LoginPage } = require('../playwright/pages/login.page');
const { ServicesPage } = require('../playwright/pages/services.page');
const { serviceTestData } = require('../playwright/data/serviceTestData');

test.describe(
  'Service Category Tests',
  { tags: ['@ui', '@services', '@high', '@regression'] },
  () => {
    // Ensure serviceTestData is not empty
    if (!serviceTestData || !Array.isArray(serviceTestData) || serviceTestData.length === 0) {
      throw new Error('serviceTestData is empty or not properly loaded.');
    }

    serviceTestData.forEach(({ service, expectedProducts }) => {
      if (!service) return;

      test(`TestSelectCategory - ${service}`, async ({ page }) => {
        const loginPage = new LoginPage(page);
        const servicesPage = new ServicesPage(page);

        await loginPage.navigateToLogin('/login.html');
        await loginPage.login(credentials.username, credentials.password);
        await servicesPage.navigateToAllServices();
        await servicesPage.selectCategory(service);

        const productNames = await servicesPage.getProductNames();
        console.log(`Products for ${service}:`, productNames);
        expect(await servicesPage.validateProducts(expectedProducts)).toBeTruthy();

        await loginPage.logout();
        expect(await loginPage.validateLogoutSuccess()).toBeTruthy();
      });
    });

    // Optional hard-coded test
    test('@ui @services @category @high @regression SelectCategory - Cleaning', async ({ page }) => {
      const loginPage = new LoginPage(page);
      const servicesPage = new ServicesPage(page);

      await loginPage.navigateToLogin('/login.html');
      await loginPage.login(credentials.username, credentials.password);
      await servicesPage.navigateToAllServices();
      await servicesPage.selectCategory('Cleaning');

      const expectedProducts = ['RoboClean Pro', 'DustMaster 360'];
      const productNames = await servicesPage.getProductNames();
      console.log('Products:', productNames);
      expect(await servicesPage.validateProducts(expectedProducts)).toBeTruthy();

      await loginPage.logout();
      expect(await loginPage.validateLogoutSuccess()).toBeTruthy();
    });
  }
);

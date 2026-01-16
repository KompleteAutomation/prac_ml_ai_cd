// playwright/setup/globalHooks.js
const base = require('@playwright/test');

const test = base.test.extend({
  page: async ({ page }, use, testInfo) => {
    console.log('>>> Locator interceptor installed for:', testInfo.title);
    const { installLocatorInterceptor } = require('../healing/locatorInterceptor');
    installLocatorInterceptor(page, testInfo);
    await use(page);
  }
});

module.exports = {
  test,
  expect: test.expect
};

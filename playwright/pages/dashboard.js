const path = require('path');
const locators = require('../locators_ai/dashboard.locator');

module.exports = {
  async navigateToEmployees(page) {
    await page.locator(locators.ordersMenu).click();
    await page.locator(locators.employeesMenu.id).click();
  }
};

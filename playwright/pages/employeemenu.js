const locators = require('../locators_ai/employeemenu.locator');

module.exports = {
  async navigateToAddEmployee(page) {
    await page.locator(locators.addEmployeeLink).click();
  },
};


const locators = require('../locators_ai/employee.locator');

module.exports = {
  async fillEmployeeForm(page, employeeData) {
    await page.locator(locators.firstNameInput).fill(employeeData.firstName);
    await page.locator(locators.lastNameInput).fill(employeeData.lastName);
    await page.locator(locators.emailInput).fill(employeeData.emailID);
    await page.locator(locators.genderRadioMale).check();
    await page.locator(locators.roleDropdown).selectOption(employeeData.role);
    await page.locator(locators.locationDropdown).selectOption(employeeData.location);
    await page.locator(locators.descriptionInput).fill(employeeData.description);
    await page.locator(locators.confirmCheckbox).check();
  },

  async submitEmployeeForm(page) {
    await page.locator(locators.submitButton).click();
  }
};

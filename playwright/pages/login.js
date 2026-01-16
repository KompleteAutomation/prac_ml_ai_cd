const locators = require('../locators_ai/login.locator');

async function login(page, { email, password }) {
  await page.fill(locators.emailInput, email);
  await page.fill(locators.passwordInput, password);
  await page.click(locators.loginButton);
}

module.exports = { login };

import { loginLocators } from '../locators_ai/login_prac';
import { expect } from '@playwright/test';

export class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async login() {
    await this.page.goto('https://aiglobal.space/');
    // await expect(this.page.getByRole(loginLocators.loginLink)).toBeVisible();
    await expect(this.page.getByRole(loginLocators.loginLink.role, { name: loginLocators.loginLink.name })).toBeVisible();
    await this.page.getByRole(loginLocators.loginLink.role, { name: loginLocators.loginLink.name }).click();
    await this.page.getByRole(loginLocators.emailTextbox.role, { name: loginLocators.emailTextbox.name }).click();
    await this.page.getByRole(loginLocators.emailTextbox.role, { name: loginLocators.emailTextbox.name }).fill('sumit@gmail.com');
    await this.page.getByRole(loginLocators.passwordTextbox.role, { name: loginLocators.passwordTextbox.name }).click();
    await this.page.getByRole(loginLocators.passwordTextbox.role, { name: loginLocators.passwordTextbox.name }).fill('sumit');
    await this.page.getByRole(loginLocators.loginButton.role, { name: loginLocators.loginButton.name }).click();
    await expect(this.page.getByRole(loginLocators.logoutButton.role, { name: loginLocators.logoutButton.name })).toBeVisible();
  }
}
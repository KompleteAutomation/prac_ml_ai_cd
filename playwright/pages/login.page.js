import { time } from "node:console";

// playwright/pages_ai/login.page.js
export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = 'input[name="email"]';
    this.passwordInput = 'input[name="password"]';
    this.loginButton = 'button:has-text("Login")';
  }

  async navigateToLogin(url) {
    await this.page.goto(url);
  }

  async login(email, password) {
    await this.page.fill(this.emailInput, email);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
  }

  async validateLoginSuccess() {
    return await this.page.locator('button:has-text("Logout")').isVisible({timeout: 5000});
  }

  async logout() {
    await this.page.click('button:has-text("Logout")');
  }

  async validateLogoutSuccess() {
    return await this.page.locator('a:has-text("Login")').isVisible();
  }
}
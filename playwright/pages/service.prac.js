import { loginLocators } from '../locators_ai/login_prac';
import { expect } from '@playwright/test';

export class ServicePage {
  constructor(page) {
    this.page = page;
  }

  async manageService(category, robotName) {
    await this.page.getByRole(loginLocators.allServicesLink.role, { name: loginLocators.allServicesLink.name }).click();
    await this.page.locator(loginLocators.categoryFilter).selectOption(category);
    await expect(this.page.locator(loginLocators.robotsGrid)).toContainText(robotName);
  }
}
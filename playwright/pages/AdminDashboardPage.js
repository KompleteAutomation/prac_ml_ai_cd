import { Page } from '@playwright/test';
import { adminDashboard_menu_employees_link, adminDashboard_menu_orders_link } from '../locators_ai/adminDashboard.locator';
export class AdminDashboardPage {
  constructor(page) {
    this.page = page;
  }

  async navigateToEmployees(page) {
    await page.click(adminDashboard_menu_orders_link);
    await page.click(adminDashboard_menu_employees_link);
  }

  async isDashboardLoaded(page) {
    // Add logic to verify dashboard load
    return await page.isVisible(adminDashboard_menu_employees_link);
  }
}
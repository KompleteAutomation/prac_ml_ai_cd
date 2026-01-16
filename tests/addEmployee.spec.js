import { test, expect } from '@playwright/test';

import { LoginPage } from '../playwright/pages/login.page';
import { AdminDashboardPage } from '../playwright/pages/AdminDashboardPage'; // Updated path
import { EmployeesPage } from '../playwright/pages/EmployeesPage'; // Updated path
import {credentials} from '../playwright/config/config'; // Import the config file
const { email, password } = credentials; // Extract credentials
import employeeData from '../playwright/data/employeeData';
test(
  'Validate Add Employee',
  { tags: ['@ui', '@employee', '@critical', '@regression'] },
  async ({ page }) => {
    // allure.feature('Employee Management');
    // allure.story('Add Employee');
    // allure.tag('ui', 'playwright');

    // ---------- Login ----------
    const loginPage = new LoginPage(page);
    await page.goto('/login.html');
    await loginPage.login(credentials.username, credentials.password);
    await expect(page.locator('text=Welcome to AI Global Shop')).toBeVisible();

    // ---------- Navigate to Employees ----------
    const dashboard = new AdminDashboardPage(page);
    await page.goto('/admin-dashboard.html');

    try {
      await dashboard.navigateToEmployees(page);
    } catch {
      // retry once for intermittent server error (demo-safe)
      await dashboard.navigateToEmployees(page);
    }

    // ---------- Add Employee ----------
    const employeesPage = new EmployeesPage(page);
    await employeesPage.addEmployee(employeeData);

    // Validate employee addition
    const employeeRow = page.locator('#employeeTableBody tr').last();
    await expect(employeeRow).toBeVisible();
    await expect(employeeRow.locator('td').nth(1)).toHaveText(employeeData.firstName);
    await expect(employeeRow.locator('td').nth(3)).toHaveText(employeeData.emailID);
  }
);

// d:/projects/GenAI/automation-demo/playwright/data/employee.data.d.ts

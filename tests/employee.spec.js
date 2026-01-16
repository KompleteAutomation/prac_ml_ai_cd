import { test, expect } from '@playwright/test';
import { credentials } from '../playwright/config/config';
const loginLocators = require('../playwright/locators_ai/login.locator');
const dashboardLocators = require('../playwright/locators_ai/dashboard.locator');
const employeeLocators = require('../playwright/locators_ai/employee.locator');
const { login } = require('../playwright/pages/login');
const { navigateToEmployees } = require('../playwright/pages/dashboard');
const {  navigateToAddEmployee } = require('../playwright/pages/employeemenu');

const { fillEmployeeForm, submitEmployeeForm } = require('../playwright/pages/employee');
const { employeeData } = require('../playwright/data/employeeData');

test(
  'Add Employee',
  { tags: ['@ui', '@employee', '@critical', '@regression'] },
  async ({ page }) => {
    // Step 1: Open URL
    await page.goto('/login.html');

    // Step 2-3: Login
    await login(page, { email: credentials.username, password: credentials.password });
    const logoutButton = page.getByRole('button', { name: 'Logout' });

    try {
      await logoutButton.waitFor({ state: 'visible', timeout: 5000 });
    } catch (error) {
      // Do nothing – move on after timeout
    }
    // Step 4: Open Admin Dashboard
    await page.goto('/admin-dashboard.html');

    // Step 5: Navigate to Employees
    await navigateToEmployees(page);

    // Step 6: Navigate to Add Employee
    await navigateToAddEmployee(page);

    // Ensure form is visible
    await expect(page.locator(employeeLocators.addEmployeeForm)).toBeVisible();

    // Fill and Submit Employee Form
    await fillEmployeeForm(page, employeeData);
    await submitEmployeeForm(page);
  }
);
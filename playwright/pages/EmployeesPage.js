import { Page } from '@playwright/test';

export class EmployeesPage {
  constructor(page) {
    this.page = page;
  }

  async addEmployee(employeeData) {
    await this.page.fill('#firstName', employeeData.firstName);
    await this.page.fill('#lastName', employeeData.lastName);
    await this.page.fill('#email', employeeData.emailID);
    await this.page.selectOption('#role', employeeData.role);
    await this.page.fill('#location', employeeData.location);
    await this.page.fill('#description', employeeData.description);
    await this.page.click('#submitButton');
  }
}
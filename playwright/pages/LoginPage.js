import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
  }

  async login(email, password) {
    // Implement login logic here
  }
}
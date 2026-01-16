import { test, expect } from '@playwright/test';
import { LoginPage } from '../playwright/pages/login.prac';
import { ServicePage } from '../playwright/pages/service.prac';
import { credentials } from '../playwright/config/config';

test('@ui @login @critical @smoke TestService', async ({ page }) => {
  //Login
  const loginPage = new LoginPage(page);
  await loginPage.login(credentials.username, credentials.password);

  //Service
  const servicePage = new ServicePage(page);
  await servicePage.manageService('Cleaning', 'RoboClean Pro');
});
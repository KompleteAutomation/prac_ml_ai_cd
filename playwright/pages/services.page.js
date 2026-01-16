// playwright/pages_ai/services.page.js
export class ServicesPage {
  constructor(page) {
    this.page = page;
    this.allServicesLink = 'a:has-text("All Services")';
    this.categoryDropdown = '#filter-cat';
    this.productsGrid = '#robots-grid h3';
  }

  async navigateToAllServices() {
    await this.page.click(this.allServicesLink);
    await this.page.waitForURL(/.*\/robots\.html/);
  }

  async selectCategory(category) {
    await this.page.selectOption(this.categoryDropdown, { label: category });
  }

  async getProductNames() {
  await this.page.waitForSelector(this.productsGrid);
  return await this.page.$$eval(
    this.productsGrid,
    elements => elements.map(el => el.textContent.trim())
  );
}

  async validateProducts(expectedProducts) {
    await this.page.locator(this.productsGrid).first().waitFor({ state: 'visible' });
    const displayedProducts = await this.getProductNames();
    console.log('Displayed Products:', displayedProducts);
    console.log('Expected Products:', expectedProducts);
    return JSON.stringify(displayedProducts) === JSON.stringify(expectedProducts);
  }
}
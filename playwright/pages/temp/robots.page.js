// pages/robots.page.js
export async function selectProduct(page, productName) {
  const candidates = [
    { locator: '#robots-grid h3', score: 5 },
    { locator: 'div:has(h3)', score: 3 }
  ];

  for (const candidate of candidates.sort((a, b) => b.score - a.score)) {
    const elements = await page.locator(candidate.locator).allTextContents();
    if (elements.includes(productName)) {
      await page.locator(candidate.locator).filter({ hasText: productName }).click();
      return;
    }
  }

  throw new Error(`Product '${productName}' not found using available locators.`);
}
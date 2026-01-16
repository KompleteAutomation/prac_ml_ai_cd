async function validateLocators(page, locators) {
  const broken = [];

  for (const [key, selector] of Object.entries(locators)) {
    if (typeof selector !== 'string') continue;

    try {
      const count = await page.locator(selector).count();

      if (count === 0) {
        broken.push({ key, selector });
      }
    } catch {
      // Covers invalid selector syntax edge cases
      broken.push({ key, selector });
    }
  }

  return broken;
}

module.exports = { validateLocators };

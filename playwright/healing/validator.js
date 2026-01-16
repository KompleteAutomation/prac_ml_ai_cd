async function validateCandidates(page, candidates) {
  const valid = [];
  for (const locator of candidates) {
    const count = await page.locator(locator).count();
    if (count === 1) valid.push(locator);
  }
  return valid;
}

module.exports = { validateCandidates };

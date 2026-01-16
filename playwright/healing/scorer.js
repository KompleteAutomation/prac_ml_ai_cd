function score(locator) {
  if (locator.startsWith('#')) return 5;
  if (locator.includes(':has-text')) return 1;
  return 3;
}

module.exports = { score };

const fs = require('fs');
const path = require('path');
const { validateLocators } = require('./locatorValidator');
const { extractLocatorsFromPage } = require('./locatorExtractor');
const { formatLocatorsAsJS } = require('./formatLocators');

async function ensureLocators(page, locatorFilePath) {
  // Always load fresh
  delete require.cache[require.resolve(locatorFilePath)];
  const locators = require(locatorFilePath);

  const broken = await validateLocators(page, locators);

  if (broken.length === 0) {
    console.log('Locators valid:', path.basename(locatorFilePath));
    return locators;
  }

  console.warn('Healing locators:', broken.map(b => b.key));

  if (process.env.CI === 'true') {
    throw new Error('Locator drift detected in CI');
  }

  // -------- Extract fresh locators
  const fresh = await extractLocatorsFromPage(page);

  if (!fresh || Object.keys(fresh).length === 0) {
    throw new Error('Healing failed: extractor returned nothing');
  }

  // -------- Heal ONLY broken keys
  const healed = { ...locators };
  let healedCount = 0;

  for (const { key } of broken) {
    if (!fresh[key]) {
      console.warn(`⚠️ Could not heal locator: ${key}`);
      continue;
    }
    healed[key] = fresh[key];
    healedCount++;
  }

  if (healedCount === 0) {
    throw new Error(
      'Healing failed: none of the broken locators were re-identified'
    );
  }

  // -------- Backup old file
  const dir = path.dirname(locatorFilePath);
  const backupDir = path.join(dir, 'backup');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(
    backupDir,
    `${path.basename(locatorFilePath, '.js')}.${ts}.js`
  );

  fs.writeFileSync(backupFile, formatLocatorsAsJS(locators));
  console.log('Backup created:', path.basename(backupFile));

  // -------- Write healed locators
  fs.writeFileSync(locatorFilePath, formatLocatorsAsJS(healed));

  // -------- Reload healed locators
  delete require.cache[require.resolve(locatorFilePath)];
  return require(locatorFilePath);
}

module.exports = { ensureLocators };

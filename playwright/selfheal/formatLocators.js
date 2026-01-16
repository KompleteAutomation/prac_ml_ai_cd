function formatLocatorsAsJS(locators) {
  const lines = Object.entries(locators).map(([key, value]) => {
    if (typeof value !== 'string') {
      return `  ${key}: ${JSON.stringify(value, null, 2)}`;
    }

    // Force: input[name="email"]
    const normalized = value.replace(/'/g, '"');

    return `  ${key}: '${normalized}'`;
  });

  return `module.exports = {\n${lines.join(',\n')}\n};\n`;
}

module.exports = { formatLocatorsAsJS };

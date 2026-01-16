const fs = require('node:fs');
const path = require('node:path');
const { buildCandidates } = require('./candidateBuilder');
/**
 * Capture DOM snapshot + update healing report
 */
function captureSnapshot({ page, selector, error, testInfo }) {
  console.log('>>> captureSnapshot called for:', selector);

  const artifactsDir = path.resolve(process.cwd(), 'playwright', 'artifacts');
  const snapshotsDir = path.join(artifactsDir, 'snapshots');

  fs.mkdirSync(snapshotsDir, { recursive: true });

  const snapshot = {
    timestamp: new Date().toISOString(),
    test: testInfo?.title,
    testFile: testInfo?.file,
    url: page.url(),
    failedLocator: selector,
    error: error
  };

  // Write raw snapshot
  fs.writeFileSync(
    path.join(snapshotsDir, `snapshot-${Date.now()}.json`),
    JSON.stringify(
      {
        ...snapshot,
        error: error.message
      },
      null,
      2
    )
  );

  writeHealingReport(snapshot);
}

/**
 * Extract correct page-object file and function name
 * from the runtime error stack
 */
function extractCallSite(error) {
  if (!error || !error.stack) {
    return { file: 'UNKNOWN', function: 'UNKNOWN' };
  }

  const lines = error.stack.split('\n');

  for (const line of lines) {
    /**
     * Matches:
     * at LoginPage.login (D:\...\playwright\pages\login.page.js:16:12)
     * at ServicesPage.getProductNames (...\playwright\pages\services.page.js:20:19)
     */
    const match = line.match(
      /at\s+([\w$.]+)\s+\((.*playwright[\\/].*\.js):\d+:\d+\)/
    );

    if (match) {
      const functionName = match[1];
      const absolutePath = match[2];

      const normalizedFile = absolutePath
        .split(/playwright[\\/]/)[1]
        .replace(/\\/g, '/');

      return {
        file: normalizedFile,
        function: functionName
      };
    }
  }

  return { file: 'UNKNOWN', function: 'UNKNOWN' };
}

/**
 * Append entry into healing-report.json
 */
function writeHealingReport(snapshot) {
  const candidates = buildCandidates(snapshot);
  const reportPath = path.resolve(
    process.cwd(),
    'playwright',
    'artifacts',
    'healing-report.json'
  );

  let report = [];
  if (fs.existsSync(reportPath)) {
    report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
  }

  const callSite = extractCallSite(snapshot.error);

  report.push({
    file: callSite.file,
    function: callSite.function,
    oldLocator: snapshot.failedLocator,
    status: 'PENDING',
    candidates
  });

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('>>> healing-report.json updated');
}

module.exports = { captureSnapshot };

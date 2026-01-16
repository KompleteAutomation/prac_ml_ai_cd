const fs = require('fs');
const path = require('path');
const { applyApprovedPatches } = require('./healing/patcher');
const { score } = require('./healing/scorer');

const reportPath = path.resolve(
  process.cwd(),
  'playwright/artifacts/healing-report.json'
);

const approvalPath = path.resolve(
  process.cwd(),
  'playwright/artifacts/approval.json'
);

if (!fs.existsSync(reportPath)) {
  console.log('No healing-report.json found');
  process.exit(0);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

const approved = [];

for (const entry of report) {
  if (!entry.candidates || entry.candidates.length === 0) continue;

  // Pick best scored candidate
  const ranked = entry.candidates
    .map(locator => ({ locator, score: score(locator) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];

  // AUTO-APPROVAL POLICY
  if (best.score >= 4) {
    approved.push({
      file: entry.file,
      function: entry.function,
      oldLocator: entry.oldLocator,
      newLocator: best.locator
    });

    console.log(` Auto-approved: ${entry.oldLocator} → ${best.locator}`);
  }
}

if (approved.length === 0) {
  console.log('No candidates met auto-approval criteria');
  process.exit(0);
}

// Write approval.json automatically
fs.writeFileSync(
  approvalPath,
  JSON.stringify(
    { approved, rejected: [], deferred: [] },
    null,
    2
  )
);

// Apply patches
applyApprovedPatches();

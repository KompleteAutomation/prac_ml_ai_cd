const fs = require('node:fs');
const path = require('node:path');

function applyApprovedPatches() {
  const approvalPath = path.resolve(
    process.cwd(),
    'playwright',
    'artifacts',
    'approval.json'
  );

  if (!fs.existsSync(approvalPath)) return;

  const approval = JSON.parse(fs.readFileSync(approvalPath, 'utf-8'));

  approval.approved.forEach(item => {
    const pageFile = path.resolve(
      process.cwd(),
      'playwright',
      item.file
    );

    if (!fs.existsSync(pageFile)) return;

    let content = fs.readFileSync(pageFile, 'utf-8');
    if (!content.includes(item.oldLocator)) return;

    content = content.replaceAll(
      `'${item.oldLocator}'`,
      `'${item.newLocator}'`
    );

    fs.writeFileSync(pageFile, content);
    console.log(`✔ Patched: ${item.oldLocator} → ${item.newLocator}`);
  });
}

module.exports = { applyApprovedPatches };

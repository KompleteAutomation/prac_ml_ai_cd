const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'quality-data-normalized');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.csv'));

let totalRows = 0;
let invalidRows = 0;
let issues = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf-8').split('\n').slice(1);

  content.forEach((line, index) => {
    if (!line.trim()) return;
    totalRows++;

    const cols = line.split('","').map(c => c.replace(/"/g, ''));

    const testName = cols[2];
    const status   = cols[4];
    const duration = cols[5];

    let errors = [];

    if (!testName) errors.push('Invalid TestName');
    if (!['passed','failed','skipped','timedOut','interrupted'].includes(status))
      errors.push('Invalid Status');
    if (isNaN(Number(duration))) errors.push('Invalid Duration');

    if (errors.length > 0) {
      invalidRows++;
      issues.push(`${file} [Row ${index+2}] → ${errors.join(', ')} → ${line}`);
    }
  });
});

console.log('\nValidation Summary');
console.log('====================');
console.log(`Files Checked: ${files.length}`);
console.log(`Total Rows: ${totalRows}`);
console.log(`Invalid Rows: ${invalidRows}`);

if (issues.length) {
  console.log('\nDetailed Issues:');
  console.log('--------------------');
  issues.slice(0,20).forEach(i => console.log(i));
} else {
  console.log('\n✅ All normalized data valid');
}

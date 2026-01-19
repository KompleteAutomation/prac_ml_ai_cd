const fs = require('fs');
const path = require('path');

const WORKSPACE = process.env.WORKSPACE || '.';
const NORMALIZED_DIR = path.resolve(WORKSPACE, 'quality-data-normalized');
const OUT_DIR = path.resolve(WORKSPACE, 'quality-presentation');
const OUT_FILE = path.join(OUT_DIR, 'run-metrics-table.csv');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function readCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
  const headers = content[0].split(',');
  return content.slice(1).map(line => {
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i]?.replace(/(^"|"$)/g, '') || '');
    return obj;
  });
}

function loadRuns() {
  if (!fs.existsSync(NORMALIZED_DIR)) {
    console.log("No normalized data found.");
    return [];
  }

  const files = fs.readdirSync(NORMALIZED_DIR)
    .filter(f => f.startsWith('run_') && f.endsWith('.csv'))
    .sort((a,b)=>Number(a.replace(/\D/g,'')) - Number(b.replace(/\D/g,'')));

  const rows = [];

  files.forEach(f => {
    const runId = f.replace('run_','').replace('.csv','');
    const data = readCSV(path.join(NORMALIZED_DIR,f));

    const totalTests = data.length;
    const failedTests = data.filter(d => d.status === 'failed').length;

    const critical = data.filter(d => d.risk === 'critical');
    const passedCritical = critical.filter(d => d.status === 'passed').length;
    const criticalRate = critical.length === 0 ? 100 : Math.round((passedCritical / critical.length)*100);

    const totalDuration = data.reduce((sum,d)=> sum + Number(d.duration_ms || 0), 0);
    const flaky = data.filter(d => Number(d.retry_count) > 0).length;

    rows.push({
      runId,
      criticalRate,
      totalDuration,
      flaky,
      totalTests,
      failedTests
    });
  });

  return rows;
}

function writeCsv(rows) {
  if (rows.length === 0) {
    fs.writeFileSync(OUT_FILE, "No data found\n");
    return;
  }

  const header = "Run,CriticalPassRate,ExecutionDurationMs,FlakyTests,TotalTests,FailedTests\n";
  const lines = rows.map(r =>
    `${r.runId},${r.criticalRate},${r.totalDuration},${r.flaky},${r.totalTests},${r.failedTests}`
  ).join('\n');

  fs.writeFileSync(OUT_FILE, header + lines);
}

function main() {
  const rows = loadRuns();
  writeCsv(rows);
  console.log("Run Metrics Table generated at:", OUT_FILE);
}

main();

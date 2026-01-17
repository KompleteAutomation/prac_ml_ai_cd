const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(process.env.WORKSPACE || '.', 'quality-data-normalized');
const OUT_DIR = path.resolve(process.env.WORKSPACE || '.', 'quality-dashboard');
const OUT_FILE = path.join(OUT_DIR, 'index.html');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function readCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8').trim().split('\n');
  const headers = content[0].split(',');
  return content.slice(1).map(line => {
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    const obj = {};
    headers.forEach((h, i) => obj[h] = values[i].replace(/(^"|"$)/g, ''));
    return obj;
  });
}

function loadAllRuns() {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.startsWith('run_') && f.endsWith('.csv'));
  const all = [];
  files.forEach(f => {
    const runId = f.replace('run_', '').replace('.csv', '');
    const records = readCSV(path.join(DATA_DIR, f));
    records.forEach(r => r.run_id = runId);
    all.push(...records);
  });
  return all;
}

function generateDashboard(data) {

  // ---- Critical Pass Rate per Run ----
  const runs = [...new Set(data.map(d => d.run_id))].sort((a,b)=>a-b);
  const criticalRates = runs.map(run => {
    const runData = data.filter(d => d.run_id === run && d.risk === 'critical');
    if (runData.length === 0) return { run, rate: 0 };
    const passed = runData.filter(d => d.status === 'passed').length;
    return { run, rate: ((passed / runData.length) * 100).toFixed(1) };
  });

  // ---- Failure Recurrence ----
  const failures = data.filter(d => d.status === 'failed');
  const failureMap = {};
  failures.forEach(f => {
    const key = f.stack_trace_hash || 'no_hash';
    failureMap[key] = (failureMap[key] || 0) + 1;
  });
  const topFailures = Object.entries(failureMap)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,5);

  // ---- Slowest Tests ----
  const durationMap = {};
  data.forEach(d => {
    durationMap[d.test_title] = (durationMap[d.test_title] || 0) + Number(d.duration_ms);
  });
  const slowTests = Object.entries(durationMap)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,5);

  // ---- Flaky Tests ----
  const flaky = data.filter(d => Number(d.retry_count) > 0);
  const flakyTests = [...new Set(flaky.map(f => f.test_title))];

  // ---- Build HTML ----
  const html = `
  <html>
  <head>
    <title>Quality Intelligence Dashboard</title>
    <style>
      body { font-family: Arial; margin: 20px; }
      h2 { color: #2c3e50; }
      table { border-collapse: collapse; margin-bottom:20px; }
      th,td { border:1px solid #ccc; padding:6px 10px; }
      th { background:#eee; }
    </style>
  </head>
  <body>
    <h1>Quality Intelligence Dashboard</h1>

    <h2>Critical Pass Rate (%)</h2>
    <table>
      <tr><th>Run</th><th>Pass %</th></tr>
      ${criticalRates.map(r => `<tr><td>${r.run}</td><td>${r.rate}</td></tr>`).join('')}
    </table>

    <h2>Top Repeating Failures</h2>
    <table>
      <tr><th>Failure Hash</th><th>Occurrences</th></tr>
      ${topFailures.map(f => `<tr><td>${f[0]}</td><td>${f[1]}</td></tr>`).join('')}
    </table>

    <h2>Slowest Tests (Total Duration)</h2>
    <table>
      <tr><th>Test</th><th>Total ms</th></tr>
      ${slowTests.map(s => `<tr><td>${s[0]}</td><td>${s[1]}</td></tr>`).join('')}
    </table>

    <h2>Flaky Tests (Retry Detected)</h2>
    <ul>
      ${flakyTests.map(t => `<li>${t}</li>`).join('')}
    </ul>

  </body>
  </html>
  `;

  fs.writeFileSync(OUT_FILE, html);
  console.log("Dashboard generated at:", OUT_FILE);
}

generateDashboard(loadAllRuns());

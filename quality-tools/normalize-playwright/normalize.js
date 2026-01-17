const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const RAW_DATA_DIR = path.resolve(process.env.WORKSPACE || '.', 'quality-data');
const OUTPUT_DIR = path.resolve(process.env.WORKSPACE || '.', 'quality-data-normalized');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function hashText(text) {
  if (!text) return '';
  return crypto.createHash('md5').update(text).digest('hex');
}

function parseTags(tagsArray) {
  const tags = tagsArray || [];
  const result = {
    layer: '',
    domain: '',
    risk: '',
    suite: ''
  };

  tags.forEach(t => {
    const tag = t.replace('@', '');
    if (['ui','api','bdd','mock'].includes(tag)) result.layer = tag;
    else if (['critical','high','medium','low'].includes(tag)) result.risk = tag;
    else if (['smoke','regression','integration'].includes(tag)) result.suite = tag;
    else result.domain = tag;
  });

  return result;
}

function normalizeFile(filePath, runId) {
  const raw = JSON.parse(fs.readFileSync(filePath));
  const rows = [];

  function walkSuites(suite) {
    if (suite.specs) {
      suite.specs.forEach(spec => {
        const testTitle = spec.title;
        const testFile = spec.file || '';
        spec.tests.forEach(test => {
          const tags = test.tags || [];
          const tagMeta = parseTags(tags);

          test.results.forEach(result => {
            const errorMsg = result.error ? result.error.message || '' : '';
            const stackTrace = result.error ? result.error.stack || '' : '';
            const stackHash = hashText(stackTrace);

            rows.push({
              run_id: runId,
              test_id: `${testFile}::${testTitle}`,
              test_title: testTitle,
              tags: tags.join(','),
              layer: tagMeta.layer,
              domain: tagMeta.domain,
              risk: tagMeta.risk,
              suite: tagMeta.suite,
              status: result.status,
              duration_ms: result.duration,
              retry_count: result.retry || 0,
              error_message: errorMsg.replace(/[\r\n]+/g, ' '),
              stack_trace_hash: stackHash
            });
          });
        });
      });
    }
    if (suite.suites) suite.suites.forEach(walkSuites);
  }

  raw.suites.forEach(walkSuites);

  return rows;
}

function writeCSV(rows, outPath) {
  if (rows.length === 0) return;

  const headers = Object.keys(rows[0]).join(',');
  const lines = rows.map(r => Object.values(r)
    .map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

  fs.writeFileSync(outPath, [headers, ...lines].join('\n'));
}

function main() {
  const files = fs.readdirSync(RAW_DATA_DIR)
    .filter(f => f.startsWith('run_') && f.endsWith('.json'));

  files.forEach(file => {
    const runId = file.replace('run_', '').replace('.json', '');
    const rawPath = path.join(RAW_DATA_DIR, file);
    const outPath = path.join(OUTPUT_DIR, `run_${runId}.csv`);

    const rows = normalizeFile(rawPath, runId);
    writeCSV(rows, outPath);

    console.log(`Normalized run ${runId} → ${outPath}`);
  });
}

main();

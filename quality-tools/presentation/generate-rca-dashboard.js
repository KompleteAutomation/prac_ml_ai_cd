const fs = require('fs');
const path = require('path');

const WORKSPACE = process.env.WORKSPACE || '.';

const RCA_FILE = path.resolve(WORKSPACE, 'quality-data-rca', 'rca-report.json');
const OUT_DIR = path.resolve(WORKSPACE, 'quality-presentation');
const OUT_FILE = path.join(OUT_DIR, 'rca-dashboard.html');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function loadRcaData() {
  if (!fs.existsSync(RCA_FILE)) return [];
  return JSON.parse(fs.readFileSync(RCA_FILE));
}

function generateHtml(rcaData) {

  const rows = rcaData.map(c => `
    <tr>
      <td>${c.cluster_id}</td>
      <td>${c.occurrences}</td>
      <td>${c.summary}</td>
      <td>${c.suggested_component}</td>
      <td>${Math.round(c.confidence * 100)}%</td>
      <td>${c.impacted_tests.join('<br/>')}</td>
      <td>
        <b>Error:</b> ${c.evidence.error_message_sample}<br/>
        <b>First Seen:</b> Run ${c.evidence.first_seen_run}<br/>
        <b>Last Seen:</b> Run ${c.evidence.last_seen_run}
      </td>
    </tr>
  `).join('');

  return `
<html>
<head>
<title>Engineering RCA Dashboard</title>
<style>
body { font-family: Arial; margin:20px; }
h1 { color:#2c3e50; }
table { border-collapse: collapse; width:100%; }
th,td { border:1px solid #ccc; padding:8px; vertical-align:top; }
th { background:#eee; }
tr:hover { background:#f9f9f9; }
#search { margin-bottom:10px; padding:5px; width:300px; }
</style>

<script>
function searchTable() {
  const input = document.getElementById("search").value.toLowerCase();
  const rows = document.querySelectorAll("tbody tr");
  rows.forEach(r => {
    r.style.display = r.innerText.toLowerCase().includes(input) ? "" : "none";
  });
}
</script>
</head>
<body>

<h1>Engineering RCA Dashboard</h1>

<input type="text" id="search" onkeyup="searchTable()" placeholder="Search cluster, component, test..."/>

<table>
<thead>
<tr>
<th>Cluster ID</th>
<th>Occurrences</th>
<th>AI RCA Summary</th>
<th>Suggested Component</th>
<th>Confidence</th>
<th>Impacted Tests</th>
<th>Evidence</th>
</tr>
</thead>
<tbody>
${rows}
</tbody>
</table>

</body>
</html>
`;
}

function main() {
  const rcaData = loadRcaData();
  const html = generateHtml(rcaData);
  fs.writeFileSync(OUT_FILE, html);
  console.log("RCA Dashboard generated at:", OUT_FILE);
}

main();

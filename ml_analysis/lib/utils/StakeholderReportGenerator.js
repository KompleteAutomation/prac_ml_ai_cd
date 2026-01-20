/**
 * StakeholderReportGenerator
 * Generates an executive-friendly HTML report from ML JSON output
 */

const fs = require('fs');
const path = require('path');

class StakeholderReportGenerator {

    generateReport(jsonReportPath, outputReportName) {
        const raw = fs.readFileSync(jsonReportPath);
        const records = JSON.parse(raw);

        if (!records || records.length === 0) {
            console.warn("Report JSON is empty or invalid. Skipping report generation.");
            return;
        }

        // ---------- KPI CALCULATIONS ----------
        const totalTests = records.length;
        const passed = records.filter(r => r.status === "PASS").length;
        const failed = records.filter(r => r.status === "FAIL").length;

        const clusterCounts = {};
        const moduleRisk = {};
        const envRisk = {};
        const priorityCounts = { HIGH:0, MEDIUM:0, LOW:0 };

        records.forEach(r => {

            // Failure cluster distribution
            clusterCounts[r.failureCluster] =
                (clusterCounts[r.failureCluster] || 0) + 1;

            // Module risk
            moduleRisk[r.module] =
                (moduleRisk[r.module] || 0) + (r.status === "FAIL" ? 1 : 0);

            // Environment risk
            envRisk[r.environment] =
                (envRisk[r.environment] || 0) + (r.status === "FAIL" ? 1 : 0);

            // Priority Buckets
            if (r.priorityScore >= 9) priorityCounts.HIGH++;
            else if (r.priorityScore >= 6) priorityCounts.MEDIUM++;
            else priorityCounts.LOW++;
        });

        // ---------- HTML BUILD ----------
        const html = `
<!DOCTYPE html>
<html>
<head>
<title>AI Test Intelligence Report</title>
<style>
body { font-family: Arial; margin:40px; background:#f5f5f5; }
h1 { color:#003366; }
h2 { color:#444; }
.card { background:white; padding:20px; margin:15px 0; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.1);}
table { border-collapse: collapse; width:100%; }
th,td { border:1px solid #ccc; padding:8px; text-align:left;}
th { background:#003366; color:white;}
</style>
</head>
<body>

<h1>AI Test Intelligence Executive Report</h1>

<div class="card">
<h2>Test Execution Summary</h2>
<p><b>Total Tests:</b> ${totalTests}</p>
<p><b>Passed:</b> ${passed}</p>
<p><b>Failed:</b> ${failed}</p>
<p><b>Pass Rate:</b> ${((passed/totalTests)*100).toFixed(2)}%</p>
</div>

<div class="card">
<h2>Failure Cluster Distribution</h2>
<table>
<tr><th>Cluster</th><th>Count</th></tr>
${Object.entries(clusterCounts)
.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
</table>
</div>

<div class="card">
<h2>Risk by Module (Fail Count)</h2>
<table>
<tr><th>Module</th><th>Failures</th></tr>
${Object.entries(moduleRisk)
.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
</table>
</div>

<div class="card">
<h2>Risk by Environment (Fail Count)</h2>
<table>
<tr><th>Environment</th><th>Failures</th></tr>
${Object.entries(envRisk)
.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
</table>
</div>

<div class="card">
<h2>Priority Breakdown</h2>
<table>
<tr><th>Priority Level</th><th>Tests</th></tr>
<tr><td>HIGH (Score ≥9)</td><td>${priorityCounts.HIGH}</td></tr>
<tr><td>MEDIUM (Score 6-8)</td><td>${priorityCounts.MEDIUM}</td></tr>
<tr><td>LOW (Score ≤5)</td><td>${priorityCounts.LOW}</td></tr>
</table>
</div>

<div class="card">
<h2>Top 10 High Priority Failures</h2>
<table>
<tr>
<th>TestCase</th><th>Module</th><th>Error</th><th>Cluster</th><th>Priority</th>
</tr>
${records.filter(r=>r.priorityScore>=9)
.slice(0,10)
.map(r=>`
<tr>
<td>${r.testCaseId}</td>
<td>${r.module}</td>
<td>${r.errorMessage}</td>
<td>${r.failureCluster}</td>
<td>${r.priorityScore}</td>
</tr>`).join('')}
</table>
</div>

<p>Generated on: ${new Date().toLocaleString()}</p>

</body>
</html>
`;

        // ---------- SAVE ----------
        const reportsDir = path.join(__dirname, '../../reports');
        if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

        const outputPath = path.join(reportsDir, `${outputReportName}.html`);
        fs.writeFileSync(outputPath, html);

        console.log(`Stakeholder HTML Report generated → ${outputPath}`);
    }
}

module.exports = StakeholderReportGenerator;

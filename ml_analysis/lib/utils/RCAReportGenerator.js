/**
 * RCAReportGenerator
 * Generates Root Cause Analysis (RCA) CSV from ML JSON report
 */

const fs = require('fs');
const path = require('path');

class RCAReportGenerator {

    generateRCA(jsonReportPath, outputCsvName) {
        const raw = fs.readFileSync(jsonReportPath);
        const records = JSON.parse(raw);

        // Consider only FAIL records for RCA
        const failures = records.filter(r => r.status === "FAIL");

        if (!failures.length) {
            throw new Error("No failures found in report. RCA not generated.");
        }

        // ---------- Aggregate by failureCluster ----------
        const rcaMap = {};

        failures.forEach(r => {
            if (!rcaMap[r.failureCluster]) {
                rcaMap[r.failureCluster] = {
                    cluster: r.failureCluster,
                    total: 0,
                    modules: new Set(),
                    environments: new Set(),
                    errorMessages: {},
                    highPriority: 0
                };
            }

            const entry = rcaMap[r.failureCluster];
            entry.total++;
            entry.modules.add(r.module);
            entry.environments.add(r.environment);

            // Track most common error message
            entry.errorMessages[r.errorMessage] =
                (entry.errorMessages[r.errorMessage] || 0) + 1;

            if (r.priorityScore >= 9) {
                entry.highPriority++;
            }
        });

        // ---------- Helper: recommendation engine ----------
        const recommendAction = (cluster) => {
            switch(cluster) {
                case "API_LATENCY_SPIKE":
                    return "Investigate backend API performance, add monitoring, optimize response times.";
                case "UI_LOCATOR_FAILURE":
                    return "Stabilize UI locators, introduce resilient selectors, review UI changes.";
                case "PAGE_LOAD_TIMEOUT":
                    return "Optimize page load performance, add wait strategy, review network logs.";
                case "ASSERTION_MISMATCH":
                    return "Review test assertions and expected data conditions.";
                case "DATA_ISSUE":
                    return "Validate test data setup and database state before execution.";
                default:
                    return "Perform deeper log analysis to identify root cause.";
            }
        };

        // ---------- Build CSV ----------
        let csv = "FailureCluster,TotalOccurrences,AffectedModules,AffectedEnvironments,CommonErrorMessage,HighPriorityCount,RiskLevel,RecommendedAction\n";

        Object.values(rcaMap).forEach(entry => {

            // Find most common error message
            const commonError = Object.entries(entry.errorMessages)
                .sort((a,b) => b[1] - a[1])[0][0];

            // Risk Level
            let risk = "LOW";
            if (entry.highPriority >= 5) risk = "HIGH";
            else if (entry.highPriority >= 2) risk = "MEDIUM";

            csv += [
                entry.cluster,
                entry.total,
                `"${[...entry.modules].join('; ')}"`,
                `"${[...entry.environments].join('; ')}"`,
                `"${commonError.replace(/"/g, '""')}"`,
                entry.highPriority,
                risk,
                `"${recommendAction(entry.cluster)}"`
            ].join(",") + "\n";
        });

        // ---------- Save ----------
        const reportsDir = path.join(__dirname, '../../reports');
        if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

        const outputPath = path.join(reportsDir, `${outputCsvName}.csv`);
        fs.writeFileSync(outputPath, csv);

        console.log(`RCA CSV Report generated → ${outputPath}`);
    }
}

module.exports = RCAReportGenerator;

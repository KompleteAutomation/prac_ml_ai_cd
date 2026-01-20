const DataReader = require('./utils/DataReader');
const DataValidator = require('./utils/DataValidator');
const FailureAnalyzer = require('./utils/FailureAnalyzer');
const PriorityDatasetGenerator = require('./utils/PriorityDatasetGenerator');
const StakeholderReportGenerator = require('./utils/StakeholderReportGenerator');
const RCAReportGenerator = require('./utils/RCAReportGenerator');
const fs = require('fs');
const path = require('path');

class TestCasePrioritization {
    constructor(openApiUrl) {
        this.openApiUrl = openApiUrl;
        this.dataReader = new DataReader();
        this.dataValidator = new DataValidator();
        this.failureAnalyzer = new FailureAnalyzer(openApiUrl);
        this.priorityDatasetGenerator = new PriorityDatasetGenerator();
    }

    saveReport(dataset, reportName) {
        const reportsDir = path.join(__dirname, '../reports');
        if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

        const reportPath = path.join(reportsDir, `${reportName}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(dataset, null, 2));
        console.log(`Report saved → ${reportPath}`);
    }

    async processAndSaveReport(filePath, reportName) {
        console.log("Step 1 → Reading execution data");
        const rawData = await this.dataReader.readAndNormalizeData(filePath);

        console.log("Step 2 → Validation");
        const validData = this.dataValidator.validateData(rawData);

        console.log("Step 3 → Failure clustering");
        const analyzedData = await this.failureAnalyzer.performFailureAnalysis(validData);

        console.log("Step 4 → ML Feature dataset + Priority scoring");
        const prioritizedDataset = this.priorityDatasetGenerator.generatePriorityDataset(analyzedData);

        console.log(`Records processed: ${prioritizedDataset.length}`);
        this.saveReport(prioritizedDataset, reportName);

        // Generate stakeholder report
        const stakeholderReportGenerator = new StakeholderReportGenerator();
        stakeholderReportGenerator.generateReport(
            path.join(__dirname, `../reports/${reportName}.json`),
            `stakeholder_report_${reportName}`
        );

        // Generate RCA report
        const rcaReportGenerator = new RCAReportGenerator();
        rcaReportGenerator.generateRCA(
            path.join(__dirname, `../reports/${reportName}.json`),
            `RCA_Report_${reportName}`
        );
    }
}

module.exports = TestCasePrioritization;


// CLI Runner
if (require.main === module) {
    const filePath = process.argv[2];
    const reportName = process.argv[3];

    if (!filePath || !reportName) {
        console.error("Usage: node testCasePrioritization.js <csvFilePath> <reportName>");
        process.exit(1);
    }

    const prioritization = new TestCasePrioritization("http://localhost:9999/failure-cluster");
    prioritization.processAndSaveReport(filePath, reportName)
        .then(() => console.log("Pipeline completed successfully"))
        .catch(err => console.error("Pipeline error:", err));
}

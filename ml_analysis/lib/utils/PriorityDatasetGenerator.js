class PriorityDatasetGenerator {
    generatePriorityDataset(data) {
        return data.map(record => {

            let score = 0;

            if (record.status === 'FAIL') score += 5;
            if (record.duration > 30000) score += 3;

            // Higher risk if real failure clusters
            if (record.failureCluster !== 'NO_FAILURE') score += 2;

            return {
                testCaseId: record.testCaseId,
                duration: record.duration,
                environment: record.environment,
                browser: record.browser,
                module: record.module,
                failedStep: record.failedStep,
                errorMessage: record.errorMessage,
                status: record.status,
                failureCluster: record.failureCluster,
                priorityScore: score
            };
        });
    }
}

module.exports = PriorityDatasetGenerator;

class DataValidator {
    validateData(data) {
        return data.map(r => ({
            testCaseId: r.testCaseId || 'UNKNOWN_TC',
            duration: r.duration || 0,
            environment: r.environment || 'UNKNOWN_ENV',
            browser: r.browser || 'UNKNOWN_BROWSER',
            module: r.module || 'UNKNOWN_MODULE',
            failedStep: r.failedStep || 'N/A',
            errorMessage: r.errorMessage || 'N/A',
            status: r.status || 'UNKNOWN',
            buildId: r.buildId || 'N/A'
        }));
    }
}

module.exports = DataValidator;

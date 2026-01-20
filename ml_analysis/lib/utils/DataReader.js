const fs = require('fs');
const csv = require('csv-parser');

class DataReader {

    async readAndNormalizeData(filePath) {
        return new Promise((resolve, reject) => {
            const results = [];

            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => {

                    // ✅ Normalize CSV columns → camelCase fields
                    const normalized = {
                        testCaseId: data.TestCaseID?.trim(),
                        duration: parseInt(data['Duration(ms)'] || 0),
                        environment: data.Environment,
                        browser: data.Browser,
                        module: data.Module,
                        failedStep: data.FailedStep || 'N/A',
                        errorMessage: data.ErrorMessage || 'N/A',
                        status: data.Status,
                        buildId: data.BuildID || 'N/A'
                    };

                    results.push(normalized);
                })
                .on('end', () => {
                    console.log(`Successfully read ${results.length} records`);
                    resolve(results);
                })
                .on('error', reject);
        });
    }
}

module.exports = DataReader;

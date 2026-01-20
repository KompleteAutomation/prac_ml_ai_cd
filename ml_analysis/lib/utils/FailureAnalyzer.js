/**
 * FailureAnalyzer
 * - Skips PASS records
 * - Uses rule-based clustering for common errors
 * - Uses OpenAI only when rule cannot classify
 */

const https = require('https');

class FailureAnalyzer {
    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY not found in environment variables");
        }

        this.apiKey = process.env.OPENAI_API_KEY;
        this.apiHost = "api.openai.com";
        this.apiPath = "/v1/chat/completions";
        this.model = "gpt-4.1-mini";
    }

    // ---------- Rule-based fast classifier ----------
    ruleBasedCluster(record) {
        const msg = (record.errorMessage || "").toLowerCase();

        // PASS records → no failure
        if (record.status === "PASS") return "NO_FAILURE";

        if (msg.includes("timeout")) return "API_LATENCY_SPIKE";
        if (msg.includes("locator") || msg.includes("not found")) return "UI_LOCATOR_FAILURE";
        if (msg.includes("navigation")) return "PAGE_LOAD_TIMEOUT";
        if (msg.includes("assertion")) return "ASSERTION_MISMATCH";

        return null; // not classified by rules
    }

    // ---------- OpenAI fallback classifier ----------
    openAICluster(record) {
        return new Promise((resolve) => {

            const requestData = JSON.stringify({
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content:
                          "You classify test failure messages. " +
                          "Return ONLY JSON: {\"cluster\":\"LABEL\"}. " +
                          "Possible labels: API_LATENCY_SPIKE, UI_LOCATOR_FAILURE, " +
                          "PAGE_LOAD_TIMEOUT, ASSERTION_MISMATCH, DATA_ISSUE, NO_FAILURE."
                    },
                    {
                        role: "user",
                        content:
                          `Failed Step: ${record.failedStep}\n` +
                          `Error Message: ${record.errorMessage}\n` +
                          `Status: ${record.status}`
                    }
                ],
                temperature: 0
            });

            const options = {
                hostname: this.apiHost,
                path: this.apiPath,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(requestData)
                }
            };

            const req = https.request(options, (res) => {
                let responseData = '';

                res.on('data', chunk => responseData += chunk);

                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(responseData);
                        const content = parsed.choices?.[0]?.message?.content?.trim();
                        const json = JSON.parse(content);
                        resolve(json.cluster || "UNCLASSIFIED");
                    } catch {
                        resolve("UNCLASSIFIED");
                    }
                });
            });

            req.on('error', () => resolve("API_FAILURE_FALLBACK"));

            req.write(requestData);
            req.end();
        });
    }

    // ---------- Main pipeline ----------
    async performFailureAnalysis(data) {
        const analyzedData = [];

        for (const record of data) {

            // 1) Try rule-based classification first
            let cluster = this.ruleBasedCluster(record);

            // 2) If rule-based couldn't classify → call OpenAI
            if (!cluster) {
                cluster = await this.openAICluster(record);
            }

            record.failureCluster = cluster;
            analyzedData.push(record);
        }

        return analyzedData;
    }
}

module.exports = FailureAnalyzer;

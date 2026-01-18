const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const CLUSTER_FILE = path.resolve(process.env.WORKSPACE || '.', 'quality-data-clusters', 'clusters.json');
const OUT_DIR = path.resolve(process.env.WORKSPACE || '.', 'quality-data-rca');
const OUT_FILE = path.join(OUT_DIR, 'rca-report.json');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function generateSummary(cluster) {

  const prompt = `
You are assisting QA engineers in defect triage.
You are given failure cluster evidence.
Summarize likely root cause.
Suggest affected system component.
Do NOT invent causes beyond evidence.
Provide a confidence score between 0 and 1.

Evidence:
Cluster ID: ${cluster.cluster_id}
Occurrences: ${cluster.occurrences}
First Seen Run: ${cluster.first_seen_run}
Last Seen Run: ${cluster.last_seen_run}
Impacted Tests: ${cluster.impacted_tests.join(', ')}
Error Message Sample: ${cluster.error_message_sample}

Respond in JSON:
{
 "summary": "...",
 "suggested_component": "...",
 "confidence": 0.xx
}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini", 
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });

  return JSON.parse(response.choices[0].message.content);
}

async function main() {
  const clusters = JSON.parse(fs.readFileSync(CLUSTER_FILE));

  const results = [];

  for (const cluster of clusters) {
    const aiResult = await generateSummary(cluster);

    results.push({
      cluster_id: cluster.cluster_id,
      occurrences: cluster.occurrences,
      impacted_tests: cluster.impacted_tests,
      summary: aiResult.summary,
      suggested_component: aiResult.suggested_component,
      confidence: aiResult.confidence,
      evidence: {
        error_message_sample: cluster.error_message_sample,
        first_seen_run: cluster.first_seen_run,
        last_seen_run: cluster.last_seen_run
      }
    });

    console.log(`RCA generated for cluster ${cluster.cluster_id}`);
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2));
  console.log("RCA report generated at:", OUT_FILE);
}

main();

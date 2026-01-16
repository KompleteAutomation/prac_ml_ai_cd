const fetch = require('node-fetch');

async function extractLocatorsFromPage(page) {
  await page.evaluate(() => {
    document
      .querySelectorAll('script, style, noscript')
      .forEach(e => e.remove());
  });

  const html = await page.content();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: `
You are a senior QA automation engineer.
Return ONLY Playwright selectors.
Return RAW JSON only.
Never hallucinate attributes.
          `.trim()
        },
        {
          role: 'user',
          content: `
Return ONLY this shape:
{
  "emailInput": "selector",
  "passwordInput": "selector",
  "loginButton": "selector"
}

HTML:
${html}
          `.trim()
        }
      ]
    })
  });

  const data = await response.json();

  if (!data?.choices?.[0]?.message?.content) {
    throw new Error('Extractor returned empty response');
  }

  return JSON.parse(data.choices[0].message.content);
}

module.exports = { extractLocatorsFromPage };

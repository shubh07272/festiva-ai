/**
 * Festiva AI - Production Server & Gemini Proxy
 * Node.js Express server providing static hosting and secure AI proxying.
 */

const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    application: 'Festiva AI - Smart Celebration & Event Planner',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// AI Plan Generation Proxy Endpoint
app.post('/api/generate-plan', async (req, res) => {
  const formData = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY not set on server. Using client-side intelligence engine.'
    });
  }

  try {
    const prompt = `You are Festiva AI, an elite celebration product architect.
Generate a comprehensive, mathematically consistent tailored event plan JSON based on:
${JSON.stringify(formData, null, 2)}

Return strictly a JSON object with:
- "concepts": 3 tailored concepts with name, tagline, description, colorPalette (5 hex codes), paletteNames, decorStyle, lighting, venueStyling, foodAndDrink, entertainment, guestExperience, isRecommended (true for one).
- "budgetItems": 7-9 items with category, allocated, estimated, actual: 0, status: "pending", vendor, notes. Sum of allocated must equal exactly ${formData.budget || 20000}.
- "tasks": 12-16 tasks with title, category, deadline (YYYY-MM-DD relative to ${formData.date}), status: "pending", priority ("High"|"Medium"|"Low"), owner, notes.
- "vendors": 7-8 vendors with name, category, service, estimatedCost, actualCost: 0, depositPaid: 0, balanceDue: estimatedCost, status: "Inquiry", notes.
- "ideas": 6 creative ideas with category, title, description, whyItFits, tiers (affordable, balanced, premium), tag.
- "surpriseIdeas": 3 unexpected ideas with title, description, category, estimatedCost.`;

    const requestBody = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const apiReq = https.request(options, (apiRes) => {
      let data = '';
      apiRes.on('data', chunk => data += chunk);
      apiRes.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const planData = JSON.parse(text);
            return res.json(planData);
          }
          res.status(502).json({ error: 'Invalid response from Gemini model', raw: data });
        } catch (e) {
          res.status(500).json({ error: 'Failed to parse Gemini response', raw: data });
        }
      });
    });

    apiReq.on('error', (e) => {
      res.status(500).json({ error: 'Request to Gemini failed', details: e.message });
    });

    apiReq.write(requestBody);
    apiReq.end();
  } catch (error) {
    res.status(500).json({ error: 'Server error generating plan', message: error.message });
  }
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Festiva AI server running at http://localhost:${PORT}`);
  console.log(`Google Gemini API Key configured: ${Boolean(process.env.GEMINI_API_KEY)}`);
});

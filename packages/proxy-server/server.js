const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (including null)
app.use(cors({
  origin: '*',
  credentials: false
}));

app.use(express.json({ limit: '50mb' }));

// Proxy endpoint for Claude API
app.post('/api/claude', async (req, res) => {
  try {
    const { apiKey, messages, systemPrompt } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key required' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API error:', JSON.stringify(data, null, 2));
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Figma Plugin Proxy Server running on http://localhost:${PORT}`);
  console.log(`   Forwarding requests to Anthropic API\n`);
});

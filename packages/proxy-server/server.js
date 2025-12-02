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

// Proxy endpoint for Gemini API
app.post('/api/claude', async (req, res) => {
  try {
    const { apiKey, messages, systemPrompt } = req.body;

    if (!apiKey) {
      return res.status(400).json({ error: 'API key required' });
    }

    // Convert Claude-style messages to Gemini format
    const geminiContents = [];

    // Add system prompt as first user message if provided
    if (systemPrompt) {
      geminiContents.push({
        role: 'user',
        parts: [{ text: `System Instructions: ${systemPrompt}` }]
      });
      geminiContents.push({
        role: 'model',
        parts: [{ text: 'Understood. I will follow these instructions.' }]
      });
    }

    // Convert messages from Claude format to Gemini format
    for (const msg of messages) {
      const parts = [];

      if (Array.isArray(msg.content)) {
        // Handle multipart content (text + images)
        for (const item of msg.content) {
          if (item.type === 'text') {
            parts.push({ text: item.text });
          } else if (item.type === 'image' && item.source) {
            parts.push({
              inline_data: {
                mime_type: item.source.media_type || 'image/png',
                data: item.source.data
              }
            });
          }
        }
      } else if (typeof msg.content === 'string') {
        parts.push({ text: msg.content });
      }

      geminiContents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: parts
      });
    }

    // Use gemini-2.5-flash for multimodal support (supports images)
    const model = 'gemini-2.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: geminiContents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', JSON.stringify(data, null, 2));
      return res.status(response.status).json(data);
    }

    // Log the full response for debugging
    console.log('Gemini API response:', JSON.stringify(data, null, 2));

    // Extract text from Gemini response
    let responseText = '';
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        responseText = candidate.content.parts[0].text || '';
      }
    }

    // If no text found, return error
    if (!responseText) {
      console.error('No text in Gemini response:', JSON.stringify(data, null, 2));
      return res.status(500).json({
        error: 'Empty response from Gemini API',
        debugInfo: data
      });
    }

    // Convert Gemini response to Claude-compatible format
    const claudeCompatibleResponse = {
      content: [
        {
          type: 'text',
          text: responseText
        }
      ],
      role: 'assistant'
    };

    res.json(claudeCompatibleResponse);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Figma Plugin Proxy Server running on http://localhost:${PORT}`);
  console.log(`   Forwarding requests to Google Gemini API\n`);
});

require('dotenv').config();
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const WebSocket = require('ws');
const { SpeechClient } = require('@google-cloud/speech');
const recorder = require('node-record-lpcm16');
const { OpenAI } = require('openai');

const app = express();

// Initialize APIs
const speechClient = new SpeechClient({ keyFilename: process.env.GOOGLE_KEY_PATH });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// SSL setup
const options = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH),
};

const server = https.createServer(options, app);
const wss = new WebSocket.Server({ server });

// Audio recording
const recording = recorder.record({
  sampleRate: 16000,
  channels: 1,
  audioType: 'wav',
});

// Transcription handling
let recognizeStream = null;
let transcribedText = '';
const ANCHOR_WORDS = ['ok, let\'s see', 'very nice question'];

// Track active AI requests
let activeAIRequest = null;

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');

  recognizeStream = speechClient.streamingRecognize({
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
      enableAutomaticPunctuation: true,
    },
    interimResults: true,
  }).on('data', async (data) => {
    const transcript = data.results[0].alternatives[0].transcript;
    transcribedText += ' ' + transcript; // Append to transcribed text
    ws.send(JSON.stringify({ transcript: transcribedText }));

    // Check for anchor words
    if (ANCHOR_WORDS.some(word => transcript.toLowerCase().includes(word))) {
      try {
        // Cancel previous request if still active
        if (activeAIRequest) {
          activeAIRequest.controller.abort();
        }

        // Create new AbortController for this request
        const controller = new AbortController();
        activeAIRequest = { controller };

        // Send clearResponse message to client
        ws.send(JSON.stringify({ clearResponse: true }));

        // Get OpenAI response
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{
            role: 'system',
            content: 'You are a software developer and MLOps expert. Answer concisely.',
          }, { role: 'user', content: transcribedText.split(' ').slice(-50).join(' ') }],
          stream: true,
        }, { signal: controller.signal });

        // Stream response to client
        let fullResponse = '';
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullResponse += content;
            ws.send(JSON.stringify({ aiResponse: fullResponse }));
          }
        }

        // Clear active request flag
        activeAIRequest = null;
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('OpenAI error:', error);
          ws.send(JSON.stringify({ aiResponse: 'Error generating response.' }));
        }
      }
    }
  });

  // Pipe audio data to Google Speech API
  recording.stream().pipe(recognizeStream);

  // Handle WebSocket close
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    if (recognizeStream) {
      recognizeStream.end();
    }
    if (activeAIRequest) {
      activeAIRequest.controller.abort();
    }
  });
});

// Serve static files
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const port = process.env.PORT || 8443;
server.listen(port, () => {
  console.log(`Server running at https://localhost:${port}/`);
});
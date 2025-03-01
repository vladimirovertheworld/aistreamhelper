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

// Audio processing constants
const SAMPLE_RATE = 16000;
const CHUNK_DURATION = 0.1; // 100ms
const SAMPLES_PER_CHUNK = SAMPLE_RATE * CHUNK_DURATION;

wss.on('connection', (ws) => {
  console.log('New WebSocket connection');
  let recognizeStream = null;
  let transcribedText = '';
  let lastTriggerPosition = 0;
  let triggerCount = 0;
  const ANCHOR_WORDS = ['ok, let\'s see', 'very nice question'];
  let activeAIRequest = null;

  const audioStream = recorder.record({
    sampleRate: SAMPLE_RATE,
    channels: 1,
    audioType: 'raw',
    threshold: 0,
    verbose: false
  }).stream();

  // Audio level calculation
  let lastLevelUpdate = Date.now();
  const levelUpdateInterval = 50; // Update every 50ms
  
  audioStream.on('data', (chunk) => {
    // Calculate audio level
    const samples = new Int16Array(chunk.buffer);
    let sum = 0;
    
    for (let i = 0; i < samples.length; i++) {
      const sample = samples[i] / 32768;
      sum += sample * sample;
    }
    
    const rms = Math.sqrt(sum / samples.length);
    const db = 20 * Math.log10(rms + 1e-6); // Avoid log(0)
    
    // Throttle updates
    if (Date.now() - lastLevelUpdate > levelUpdateInterval) {
      ws.send(JSON.stringify({ 
        audioLevel: {
          rms: rms,
          db: db,
          peak: Math.max(...samples.map(s => Math.abs(s/32768)))
        }
      }));
      lastLevelUpdate = Date.now();
    }
  });

  recognizeStream = speechClient.streamingRecognize({
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: SAMPLE_RATE,
      languageCode: 'en-US',
      enableAutomaticPunctuation: true,
    },
    interimResults: true,
  }).on('data', async (data) => {
    // ... existing transcription handling code ...
  });

  audioStream.pipe(recognizeStream);

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    audioStream.unpipe(recognizeStream);
    if (recognizeStream) recognizeStream.end();
    if (activeAIRequest) activeAIRequest.controller.abort();
  });
});

app.use(express.static('public'));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
server.listen(process.env.PORT || 8443, () => console.log(`Server running at https://localhost:${process.env.PORT || 8443}/`));
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const WebSocket = require('ws');
const { SpeechClient } = require('@google-cloud/speech');
const OpenAI = require('openai');

const config = require('./config.json');
const app = express();

// Initialize APIs
const speechClient = new SpeechClient({ keyFilename: config.googleKeyPath });
const openai = new OpenAI({ apiKey: config.openaiKey });

// WebSocket Server
const server = https.createServer({
  key: fs.readFileSync(config.sslKeyPath),
  cert: fs.readFileSync(config.sslCertPath)
}, app);

const wss = new WebSocket.Server({ server });

// Transcription Stream
let recognizeStream = null;

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    
    if (data.audio) {
      // Process audio with Google Speech
      if (!recognizeStream) {
        recognizeStream = speechClient.streamingRecognize({
          config: {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: data.language || 'en-US',
            enableAutomaticPunctuation: true
          },
          interimResults: true
        })
        .on('data', async (response) => {
          const transcript = response.results[0].alternatives[0].transcript;
          ws.send(JSON.stringify({ transcript }));
          
          // Get OpenAI response
          const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: transcript}]
          });
          ws.send(JSON.stringify({ aiResponse: completion.choices[0].message.content }));
        });
      }
      recognizeStream.write(data.audio);
    }
  });
});

// Serve static files
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(config.port, () => {
  console.log(`Server running at https://localhost:${config.port}/`);
});
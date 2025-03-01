# AI Stream Helper

**Real-time Meeting Transcription and AI Assistant with Audio Monitoring**

## Features

### Core Functionality
- 🎙️ **Real-time Speech-to-Text Transcription**
  - Powered by Google Cloud Speech-to-Text API
  - Supports English and Russian
  - Automatic punctuation and formatting

- 🤖 **AI-Powered Responses**
  - OpenAI GPT integration for instant answers
  - Anchor word detection ("Ok, let's see", "Very nice question")
  - Context-aware responses (uses last 50 words of transcription)

- 📜 **Teleprompter-Style Display**
  - Smooth scrolling for AI responses
  - Adjustable scroll speed based on text length
  - Automatic clearing of previous responses

### Audio Monitoring
- 🔊 **Professional VU Meter**
  - Real-time RMS level display
  - Peak hold indicator with 2-second decay
  - Color-coded zones (green/yellow/red)
  - Accurate dB scale (-48dB to 0dB)

### Technical Highlights
- 🛠️ **WebSocket Communication**
  - Real-time data streaming
  - Efficient audio level updates (50ms intervals)
  - Stable connection handling

- 🎛️ **Audio Processing**
  - 16-bit PCM audio analysis
  - Server-side RMS and peak calculation
  - Proper dB conversion and normalization

- 🎨 **Responsive UI**
  - Dual-panel layout (transcription + teleprompter)
  - Smooth animations and transitions
  - Custom scrollbars and visual elements

---

## Installation

### Prerequisites
- Node.js v18+
- Google Cloud Service Account credentials
- OpenAI API key
- SSL certificates

### Setup
1. Clone the repository:
   
   git clone https://github.com/vladimirovertheworld/aistreamhelper.git
   cd aistreamhelper
   npm install

    Create .env file:
   
    GOOGLE_KEY_PATH=/path/to/google-service-account.json
    OPENAI_API_KEY=your_openai_api_key
    SSL_KEY_PATH=/path/to/ssl/key.pem
    SSL_CERT_PATH=/path/to/ssl/cert.pem
    PORT=8443

    Start the server:
   
    npm start

###   Usage

    Open your browser:
    https://localhost:8443/
    Allow microphone access when prompted.

    Speak into your microphone:
        Transcription appears in the top panel
        AI responses scroll in the teleprompter
        Audio levels display in the VU meter
    Use anchor phrases to trigger AI responses:

        "Ok, let's see"

### Project Structure
```
aistreamhelper/
├── public/
│   ├── index.html          # Main interface
│   └── styles.css          # Custom styles
├── server.js               # Main application logic
├── package.json            # Dependencies and scripts
├── .env.example            # Environment variables template
└── README.md               # This file
```
   ```     "Very nice question"


## Dependencies

### Core
- `@google-cloud/speech`: Google Speech-to-Text API
- `openai`: OpenAI GPT API
- `node-record-lpcm16`: Audio recording

### Web
- `express`: Web server
- `ws`: WebSocket communication

---

## Configuration

### Environment Variables
| Variable           | Description                          |
|--------------------|--------------------------------------|
| `GOOGLE_KEY_PATH`  | Path to Google service account JSON  |
| `OPENAI_API_KEY`   | OpenAI API key                       |
| `SSL_KEY_PATH`     | Path to SSL private key              |
| `SSL_CERT_PATH`    | Path to SSL certificate              |
| `PORT`             | Server port (default: 8443)          |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

MIT License

---

## Acknowledgments

- Google Cloud Speech-to-Text API
- OpenAI GPT API
- Node.js ecosystem

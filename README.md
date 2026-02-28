# EchoScribe AI — Professional Content Generation Engine

**Transform audio recordings into profession-specific, AI-generated content for LinkedIn, newsletters, and more.**

## ✨ Features

- 🎙️ **Real-Time Audio Transcription** — Upload MP3, WAV, or WebM files (up to 50MB)
- 🤖 **AI-Powered Content Generation** — Uses Groq's Mixtral
- 💼 **Profession-Specific Outputs** — Customized for Coaches, Content Creators, Sales, Marketing, Education
- 📱 **Multiple Formats** — LinkedIn posts, tweet threads, newsletter outlines, key themes
- 📚 **Content Library** — Save and manage all generated content
- 🎨 **Modern Dark UI** — Professional neon-glass design with animated waveforms
- ⚡ **Professional Fallbacks** — High-quality content even if APIs unavailable

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Free API keys from [Hugging Face](https://huggingface.co/settings/tokens) and [Groq Console](https://console.groq.com)

### Installation
```bash
npm install
cp .env.example .env
# Edit .env with your API keys
npm start
# Open http://localhost:3000
```

### First Use
1. Select your profession from sidebar
2. Upload an audio file
3. Copy generated content and share!

---

## 📖 Full Documentation

- **User Guide**: See this README
- **Professional Deployment**: See `README_PROFESSIONAL.md`
- **API Endpoints**: See `README_PROFESSIONAL.md`

## Technologies Used

- **Backend**: Node.js, Express
- **Frontend**: HTML, CSS, JavaScript
- **APIs**: Hugging Face Inference API, Groq API
- **File Upload**: Multer

## Future Enhancements

- Add support for video files
- Integrate with social media APIs for direct posting
- Add user authentication and content history
- Support for multiple languages
- Batch processing of multiple audio files

## License

MIT License

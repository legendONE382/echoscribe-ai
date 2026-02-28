# 🎙️ EchoScribe AI - Voice-to-Content Engine

Convert audio into platform-ready content for 8+ social media platforms with AI-powered transcription and intelligent content generation.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-16+-green.svg)

---

## ✨ Features

### 🎤 Audio Processing
- **Multiple Input Methods**
  - Upload audio files (MP3, WAV, WebM, OGG)
  - Record directly from browser microphone
  - Support for files up to 50MB

- **AI Transcription**
  - Powered by OpenAI Whisper
  - Multi-API fallback system
  - Accurate speech-to-text conversion

### 📱 Multi-Platform Content Generation

Generate platform-optimized content for:
- 🔗 **LinkedIn** - Professional engagement posts
- 🐦 **Twitter/X** - Viral tweet threads
- 📷 **Instagram** - Hashtag-optimized captions
- 🎵 **TikTok** - Hook-first short-form scripts
- 📹 **YouTube** - SEO-optimized descriptions
- 📝 **Blog** - Long-form article outlines
- 📧 **Email** - Marketing campaign templates
- 📰 **Newsletter** - Professional newsletters

### 🎯 Customization
- **5 Professional Types**
  - Coaching
  - Content Creator
  - Sales
  - Marketing
  - Education

- **5 Tone Options**
  - Professional
  - Casual & Friendly
  - Technical
  - Motivational
  - Educational

### 🔐 User Authentication
- Secure signup/login system
- JWT-based authentication
- Per-user data isolation
- Session persistence

### 🎨 Modern UI
- Professional dark theme
- Fully responsive design
- Smooth animations
- Glassmorphism design elements
- Mobile-optimized interface

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- API keys (see below)

### 1. Clone Repository
```bash
git clone https://github.com/YOUR-USERNAME/echoscribe-ai.git
cd echoscribe-ai
npm install
```

### 2. Get API Keys
Get free API keys from:
- **Groq** (LLM): https://console.groq.com
- **Hugging Face** (Transcription): https://huggingface.co/settings/tokens

### 3. Setup Environment Variables
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
HUGGINGFACE_API_KEY=hf_your_key_here
GROQ_API_KEY=gsk_your_key_here
JWT_SECRET=generate-a-random-secret
NODE_ENV=development
```

### 4. Run Locally
```bash
npm run dev
# Opens http://localhost:3000
```

### 5. Create an Account
- Sign up with any email/password
- Upload audio to test
- Generate content!

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import on Vercel**
   - Visit https://vercel.com/new
   - Select your GitHub repository
   - Add environment variables
   - Click Deploy

3. **Done!** Your app is live at `https://your-app-name.vercel.app`

For detailed instructions, see [DEPLOYMENT_GUIDE_VERCEL.md](./DEPLOYMENT_GUIDE_VERCEL.md)

---

## 📁 Project Structure

```
echoscribe-ai/
├── server.js                 # Express backend with auth
├── public/
│   ├── index.html           # Main app with embedded CSS
│   ├── auth.js              # Authentication logic
│   └── script-simple.js     # Frontend logic
├── data/
│   ├── users.json           # User accounts (file-based)
│   └── library.json         # Generated content history
├── uploads/                 # Temporary audio files
├── package.json
├── .env.example
└── README.md
```

---

## 🔧 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | HTML5, CSS3, Vanilla JS | Responsive UI, auth flows |
| **Backend** | Node.js, Express | API endpoints, auth |
| **Auth** | JWT, jsonwebtoken | Secure user sessions |
| **APIs** | Groq, Hugging Face | LLM, transcription |
| **Hosting** | Vercel | Serverless deployment |

---

## 📊 API Endpoints

All endpoints require authentication (`Authorization: Bearer <token>`)

### Authentication
- `POST /api/signup` - Create new account
- `POST /api/login` - Login and get token
- `POST /api/verify-token` - Verify JWT token

### Content Generation
- `POST /transcribe` - Transcribe audio file
- `POST /generate-content` - Generate multi-platform content
- `GET /platforms` - List available platforms
- `GET /professions` - List profession types

### Utilities
- `POST /profession` - Set user profession
- `GET /health` - Health check endpoint

---

## 💡 Usage Example

### 1. Signup
```javascript
fetch('http://localhost:3000/api/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'secure_password_123'
  })
})
.then(res => res.json())
.then(data => {
  localStorage.setItem('authToken', data.token);
  console.log('User created:', data.user);
});
```

### 2. Upload and Transcribe
```javascript
const formData = new FormData();
formData.append('audio', audioFile);

fetch('http://localhost:3000/transcribe', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${authToken}` },
  body: formData
})
.then(res => res.json())
.then(data => console.log('Transcript:', data.transcript));
```

### 3. Generate Content
```javascript
fetch('http://localhost:3000/generate-content', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  },
  body: JSON.stringify({
    transcript: 'Your transcribed text...',
    tone: 'professional',
    platforms: ['linkedin', 'twitter', 'email']
  })
})
.then(res => res.json())
.then(data => console.log('Generated:', data.platforms));
```

---

## 🔐 Security

- ✅ JWT authentication with 30-day expiry
- ✅ API key management via environment variables
- ✅ File upload validation and size limits
- ✅ User data isolation
- ✅ HTTPS enforced on production (Vercel)

**⚠️ Production Considerations:**
- Use bcrypt for password hashing
- Implement rate limiting on auth endpoints
- Add database (PostgreSQL) for persistence
- Enable CORS properly
- Monitor API usage and costs
- Rotate JWT secret regularly

---

## 📈 Performance

- **Transcription**: 30-60 seconds (depends on file size)
- **Content Generation**: 5-15 seconds (per platform)
- **API Overhead**: ~2-3 seconds

Optimize with:
- Caching generated content
- Database indexing
- CDN for static assets
- Background job queues

---

## 🐛 Troubleshooting

### "API Key not found"
- Check `.env` file is in root directory
- Verify key format is correct
- Keys should start with `hf_` or `gsk_`

### "Module not found: jsonwebtoken"
- Run `npm install`
- Check `package.json` has the dependency
- Delete `node_modules` and reinstall if needed

### Transcription fails
- Verify file is valid audio format
- Check file size is under 50MB
- Try a different audio file
- Check API keys are valid

### Content generation is slow
- Free API tiers have rate limits
- Consider upgrading to paid plans
- Check internet connection
- Monitor Vercel function duration

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **OpenAI Whisper** - Audio transcription
- **Groq** - Fast LLM inference
- **Hugging Face** - AI model hosting
- **Vercel** - Serverless hosting

---

## 📞 Support

- 📧 Email: support@echoscribe.ai
- 🐛 Issues: [GitHub Issues](https://github.com/YOUR-USERNAME/echoscribe-ai/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/YOUR-USERNAME/echoscribe-ai/discussions)
- 📖 Docs: [Full Documentation](./DEPLOYMENT_GUIDE_VERCEL.md)

---

## 🎯 Roadmap

- [ ] Database integration (PostgreSQL/Supabase)
- [ ] User profiles and settings
- [ ] Content history and analytics
- [ ] Team collaboration features
- [ ] Advanced scheduling and automation
- [ ] Custom brand voice training
- [ ] API for third-party integrations
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

---

## 📊 Stats

- **Platforms Supported**: 8+
- **Audio Formats**: 5+ (MP3, WAV, WebM, OGG, X-WAV)
- **Tone Variations**: 5
- **Professional Profiles**: 5
- **Total API Integrations**: 2+ (Groq, Hugging Face)

---

**⭐ If you find this project helpful, please consider giving it a star!**

---

*Last Updated: February 28, 2026*
*Version: 2.0.0*

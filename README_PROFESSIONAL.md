# EchoScribe AI — Professional Content Generation Engine

**Transform audio recordings into profession-specific, AI-generated content for LinkedIn, newsletters, and more.**

## Features

✅ **Real-Time Audio Transcription** — Upload MP3, WAV, or WebM audio files  
✅ **AI-Powered Content Generation** — Uses Groq's Mixtral-8x7B for high-quality content  
✅ **Profession-Specific Outputs** — Tailored content for:
   - Coaching (transformation, insights, action plans)
   - Content Creators (trends, strategies, growth tactics)
   - Sales (pipeline, discovery, value prop)
   - Marketing (campaigns, segmentation, messaging)
   - Education (objectives, engagement, retention)

✅ **Multiple Output Formats**:
   - LinkedIn Posts (optimized for engagement)
   - Tweet Threads (shareable threads)
   - Newsletter Outlines (structured, valuable content)
   - Key Themes (extracted insights)

✅ **Persistent Library** — All generated content saved to user's library  
✅ **Professional Grade** — Production-ready fallbacks if APIs unavailable

---

## Quick Start

### Prerequisites
- Node.js 16+
- Audio files (MP3, WAV, WebM)
- API keys from:
  - [Hugging Face](https://huggingface.co/settings/tokens) (for transcription)
  - [Groq Console](https://console.groq.com) (for content generation)

### Setup

1. **Clone/Download this project**
   ```bash
   cd voice-to-content-engine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file** (copy from `.env.example`)
   ```bash
   cp .env.example .env
   ```

4. **Add your API keys** to `.env`
   ```
   HUGGINGFACE_API_KEY=hf_xxx...
   GROQ_API_KEY=gsk_xxx...
   ```

5. **Start the server**
   ```bash
   npm start
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## How to Use

### 1. Select Your Profession
   - Dropdown in the left sidebar
   - Changes the AI prompt strategy for your industry

### 2. Upload Audio
   - Click "Upload New" or drag/drop audio file
   - Supports MP3, WAV, WebM
   - Max 50MB per file

### 3. Wait for Transcription & Generation
   - Real-time progress bar
   - Groq Whisper transcribes your audio
   - Mixtral-8x7B generates profession-specific content

### 4. Copy & Share
   - Use "Copy to Clipboard" button
   - Paste into LinkedIn, email, social media, etc.

### 5. Regenerate or View History
   - Click "Regenerate" for new variations
   - Click "📚 Library" to view all saved content
   - Delete old entries to keep organized

---

## API Endpoints

### `/transcribe` (POST)
Transcribes uploaded audio file.

**Request:**
```bash
curl -X POST http://localhost:3000/transcribe \
  -F "audio=@recording.mp3" \
  -F "userId=user_123"
```

**Response:**
```json
{
  "transcript": "[Speaker A] ... [Speaker B] ..."
}
```

### `/generate-content` (POST)
Generates profession-specific content from transcript.

**Request:**
```bash
curl -X POST http://localhost:3000/generate-content \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "[Speaker A] ...",
    "type": "linkedin",
    "userId": "user_123"
  }'
```

**Response:**
```json
{
  "content": "Powerful session today...",
  "themes": ["Strategy", "Growth"],
  "linkedinPost": "...",
  "newsletterOutline": [...]
}
```

### `/profession` (POST)
Sets user's profession for AI prompt customization.

**Request:**
```bash
curl -X POST http://localhost:3000/profession \
  -H "Content-Type: application/json" \
  -d '{
    "profession": "coaching",
    "userId": "user_123"
  }'
```

### `/library` (GET)
View all saved content for a user.

**Request:**
```
http://localhost:3000/library?userId=user_123
```

---

## Professional Deployment

### Environment Variables Checklist
- [ ] `HUGGINGFACE_API_KEY` — Set and tested
- [ ] `GROQ_API_KEY` — Set and tested
- [ ] `NODE_ENV` — Set to `production`
- [ ] `PORT` — Set to desired port (default 3000)

### Suggested Deployments
- **Vercel** (serverless) — Recommended for quick setup
- **Railway** (container) — Good for persistent storage
- **Heroku** (legacy) — Still works but deprecated
- **AWS Lambda + RDS** — Enterprise-grade

### Best Practices
1. **Rotate API keys** regularly
2. **Monitor rate limits** on Groq (free tier: ~30 requests/min)
3. **Back up `data/library.json`** regularly
4. **Use production models** (not beta versions)
5. **Test with real audio** before going live

---

## Pricing & Rate Limits

| Service | Free Tier | Recommended For |
|---------|-----------|-----------------|
| Hugging Face Whisper | 5 API calls/month | Development |
| Groq Mixtral-8x7B | 30 req/min | Production |

**Cost Estimate:**
- Free tier can process ~50 audio files/month
- Professional tier recommended for 500+ files/month
- Expected cost: $5-20/month depending on volume

---

## Troubleshooting

### Problem: "HUGGINGFACE_API_KEY not set"
**Solution:** 
1. Check `.env` file exists in root directory
2. Verify key is correct: `HUGGINGFACE_API_KEY=hf_xxx`
3. Restart server: `npm start`

### Problem: Transcription returns demo content
**Solution:**
1. Check API key is valid and has quota
2. Check audio file is <50MB and valid format
3. Check internet connection
4. Try with a shorter audio clip (< 5 min)

### Problem: Content generation times out
**Solution:**
1. Groq free tier may be rate-limited
2. Try again in 1 minute
3. Consider upgrading to Groq Pro
4. Fallback content will be used automatically

### Problem: Library not saving content
**Solution:**
1. Check `data/` directory exists and is writable
2. Check disk space available
3. Verify `data/library.json` is not corrupted
4. Restart server

---

## Advanced Configuration

### Custom Models
Edit `server.js` and update:
```javascript
model: 'mixtral-8x7b-32768'  // Change to your preferred model
```

Available Groq models:
- `mixtral-8x7b-32768` (recommended)
- `llama-3.1-70b-versatile`
- `llama2-70b-4096`

### Custom Profession Prompts
Edit `getSystemPrompt()` function in `server.js` to add:
```javascript
'consultant': `You are an expert business consultant...`,
```

---

## Support & Feedback

- **Issues:** Check console logs for detailed error messages
- **Questions:** Review this README and API endpoint docs
- **Contributions:** PRs welcome for improvements

---

**Built for professionals. Designed for scale.**

# EchoScribe AI - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies
```bash
cd voice-to-content-engine
npm install
```

### Step 2: Setup Environment Variables
Create `.env` file in the project root:

```env
# Required for transcription
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxx
# Or use Groq for transcription (free)
GROQ_API_KEY=gsk_xxxxxxxxxxxx

# Optional
PORT=3000
NODE_ENV=development
```

**Getting API Keys:**
- Hugging Face: https://huggingface.co/settings/tokens (free)
- Groq: https://console.groq.com (free with rate limits)

### Step 3: Start the Server
```bash
npm run dev
```

You should see:
```
✅ Server is running on port 3000
📍 Open http://localhost:3000
🤖 Hugging Face API: ✅ Configured
🤖 Groq API: ✅ Configured
```

### Step 4: Open in Browser
- Navigate to `http://localhost:3000`
- You'll see the EchoScribe AI interface

---

## 📖 How to Use

### 1. **Select Your Profile**
- Choose your profession from the left sidebar:
  - 🎯 Coaching
  - 🎬 Content Creator
  - 💼 Sales
  - 📊 Marketing
  - 🎓 Education

### 2. **Select Tone of Voice**
Choose how you want your content to sound:
- Professional (business/formal)
- Casual & Friendly (conversational)
- Technical (detailed)
- Motivational (inspiring)
- Educational (teaching)

### 3. **Choose Platforms**
Check which platforms you want content for:
- LinkedIn (default) ✓
- Twitter/X (default) ✓
- Instagram
- TikTok
- YouTube
- Blog
- Newsletter (default) ✓
- Email

### 4. **Upload or Record Audio**
Choose one of two methods:

**Option A: Upload File**
- Click "📁 Choose Audio File" or sidebar "⬆️ Upload Audio"
- Select your MP3, WAV, WebM, or OGG file
- File is automatically transcribed

**Option B: Record Directly**
- Click "Start Recording"
- Speak into your microphone
- Click "Stop Recording"
- Click "Use This Recording" to transcribe

### 5. **View Results**
Once transcription is complete:
- See the full transcript in the center panel
- View generated content in the right panel
- Switch between platforms using the tabs

### 6. **Use Your Content**
- **Copy to Clipboard**: Click "📋 Copy All" to copy visible content
- **Download**: Click "⬇️ Download" to save as text file
- **Regenerate**: Click "🔄 Regenerate" for new variations

### 7. **Save to Library**
Content is automatically saved to your library. Access it:
- Click "📚 Library" in the sidebar
- View all your previous generations
- Delete items you no longer need

---

## 🎯 Example Workflows

### Coaching Call Transcript
1. Record a coaching session
2. Select "Coaching" profession
3. Choose "Professional" tone
4. Select: LinkedIn, Email, Newsletter
5. Generate and post on multiple channels

### Sales Meeting Notes
1. Upload meeting recording
2. Select "Sales" profession
3. Choose "Motivational" tone
4. Select: LinkedIn, Email, Twitter
5. Share key insights with team

### Educational Content
1. Record lecture
2. Select "Education" profession
3. Choose "Educational" tone
4. Select: Blog, Newsletter, YouTube
5. Create structured learning content

---

## 🔧 Troubleshooting

### "Microphone not available"
- Check browser permissions for microphone
- Try in Chrome or Firefox (better support)
- Check privacy settings

### "Transcription failed"
- Verify API key is set correctly in `.env`
- Check that file is less than 50MB
- Try with the demo transcript (no API needed)
- Check internet connection

### "Content generation failed"
- Ensure Groq API key is configured
- Try regenerating with demo data
- Check Groq API status and rate limits
- Check that transcript has content

### "Button not working"
- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito/private mode
- Check browser console for errors (F12)

### "Slow transcription"
- This is normal - Whisper models take 30-120 seconds
- File size affects speed (larger files slower)
- Free tier has rate limits

---

## 📊 Supported File Formats

| Format | Extension | Notes |
|--------|-----------|-------|
| MP3 | .mp3 | Most common |
| WAV | .wav | High quality |
| WebM | .webm | Browser recording |
| OGG | .ogg | Open format |
| M4A | .m4a | iTunes format |

**Max File Size:** 50MB
**Supported Bitrates:** 16kHz - 48kHz

---

## 🎨 Customization

### Change Accent Colors
Edit `public/styles.css`:
```css
:root {
  --accent-1: #29f0d6;  /* Teal */
  --accent-2: #6c63ff;  /* Purple */
}
```

### Change Models
Edit `server.js` to use different AI models:
```javascript
model: 'llama-3.1-8b-instant',  // Change this
```

---

## 💡 Tips & Tricks

1. **Batch Processing** - Generate content for multiple platforms at once
2. **Save Preferences** - Your profession and tone are saved automatically
3. **Download Multiple** - Download each platform's content individually
4. **Copy Formatting** - Formatted content copies with line breaks intact
5. **Use Demo Data** - Test features without API keys using demo content

---

## 📝 Common Prompts

### For Coaching
"Record a coaching session on overcoming limiting beliefs..."

### For Sales
"Record a discovery call with a potential enterprise client..."

### For Education
"Record a lecture on machine learning fundamentals..."

### For Marketing
"Record a strategy session on Q1 campaign planning..."

### For Content Creation
"Record thoughts on trending TikTok sounds and strategies..."

---

## 🚨 Rate Limits

### Free Tier
- Hugging Face: ~30 requests/minute
- Groq: ~200 requests/minute
- File upload: 50MB max

### If You Hit Rate Limits
- Wait a few minutes before retrying
- Upgrade to paid tier for higher limits
- Use smaller files
- Batch your requests

---

## 📞 Getting Help

1. **Check Logs**: Open browser console (F12) → Console tab
2. **Check Server Logs**: Look at terminal output
3. **Test Health Check**: Visit `http://localhost:3000/health`
4. **Try Demo Mode**: Disable API keys to test with demo data
5. **Clear Cache**: Ctrl+Shift+Delete to clear browser cache

---

## 🔑 API Key Setup

### Hugging Face
1. Go to https://huggingface.co/settings/tokens
2. Click "New token"
3. Choose "Read" access
4. Copy token
5. Paste into `.env`: `HUGGINGFACE_API_KEY=`

### Groq
1. Go to https://console.groq.com
2. Sign up/login
3. Go to "API Keys"
4. Create new API key
5. Paste into `.env`: `GROQ_API_KEY=`

---

## ✨ Features Overview

| Feature | Status | Notes |
|---------|--------|-------|
| Audio Upload | ✅ | MP3, WAV, WebM, OGG |
| Recording | ✅ | Built-in microphone |
| Transcription | ✅ | Whisper-based |
| Multi-Platform | ✅ | 8 platforms supported |
| Tone Control | ✅ | 5 tone options |
| Profession Profiles | ✅ | 5 profession types |
| Content Download | ✅ | Text file export |
| Content Library | ✅ | Save/organize content |
| Dark Theme | ✅ | Modern UI |
| Responsive Design | ✅ | Mobile-friendly |

---

## 📚 File Structure

```
voice-to-content-engine/
├── server.js              # Backend API
├── package.json           # Dependencies
├── .env                   # API Keys (create this)
├── public/
│   ├── index.html        # Main UI
│   ├── script.js         # Frontend logic
│   ├── styles.css        # Styling
│   └── icon.ico          # Favicon
├── uploads/              # Temp audio files
├── data/                 # Saved library data
└── README.md             # Full documentation
```

---

## 🎓 Learning More

- **Whisper Model**: https://github.com/openai/whisper
- **Groq API**: https://groq.com
- **Hugging Face**: https://huggingface.co
- **Node.js**: https://nodejs.org

---

**Ready to transform your voice into content?** 🚀

Start by uploading your first audio file and watch EchoScribe AI create professional content for all your platforms!

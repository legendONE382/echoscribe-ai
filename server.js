const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const multer = require('multer');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const USERS_FILE = 'data/users.json';

// Initialize users file (only in development, not on Vercel)
if (process.env.VERCEL === undefined) {
  if (!fs.existsSync('data')) fs.mkdirSync('data', { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify({}));
}

// Setup multer for file uploads (only in development)
const uploadDir = 'uploads';
if (process.env.VERCEL === undefined && !fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const mimeTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/webm', 'audio/ogg', 'audio/x-wav'];
    if (mimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio format. Please use MP3, WAV, WebM, or OGG.'));
    }
  }
});

let usageMinutes = 0;
let userProfessions = {}; // Track user profession preferences
const LIBRARY_FILE = 'data/library.json';

const PROFESSIONS = {
  'coaching': 'coach',
  'content-creator': 'content-creator',
  'sales': 'sales',
  'marketing': 'marketing',
  'education': 'education'
};

const PLATFORMS = {
  'linkedin': 'LinkedIn Post',
  'twitter': 'Twitter/X Thread',
  'instagram': 'Instagram Caption',
  'tiktok': 'TikTok Script',
  'youtube': 'YouTube Description',
  'newsletter': 'Newsletter Draft',
  'blog': 'Blog Post',
  'email': 'Email Campaign'
};

// Initialize data directory
if (!fs.existsSync('data')) {
  fs.mkdirSync('data', { recursive: true });
}

// Initialize library file if not exists
if (!fs.existsSync(LIBRARY_FILE)) {
  fs.writeFileSync(LIBRARY_FILE, JSON.stringify({}));
}

// ========== HELPER FUNCTIONS ==========

function loadLibrary() {
  try {
    return JSON.parse(fs.readFileSync(LIBRARY_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function saveLibrary(data) {
  fs.writeFileSync(LIBRARY_FILE, JSON.stringify(data, null, 2));
}

function getOrCreateUserId(req) {
  const userId = req.query.userId || req.body.userId || req.cookies?.userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return userId;
}

function getSystemPrompt(profession, tone = 'professional') {
  const prompts = {
    'coaching': `You are an expert copywriter specializing in coaching content with a ${tone} tone. Create engaging, inspiring content that resonates with coaching clients and reflects the value of coaching sessions. Focus on transformation, breakthroughs, and actionable insights.`,
    'content-creator': `You are an expert copywriter specializing in creator/influencer content with a ${tone} tone. Create viral-worthy, engaging content optimized for social media and audience growth. Use trending hooks and authentic voice.`,
    'sales': `You are an expert sales copywriter with a ${tone} tone. Create persuasive, conversion-focused content that drives sales and leads. Emphasize value proposition and pain point solutions.`,
    'marketing': `You are an expert marketing strategist with a ${tone} tone. Create strategic, data-driven content for brand awareness and engagement. Focus on customer benefits and brand positioning.`,
    'education': `You are an expert educational content creator with a ${tone} tone. Create clear, informative, and engaging educational content that teaches and inspires. Include practical examples and actionable steps.`
  };
  return prompts[profession] || prompts['coaching'];
}

function extractThemes(text) {
  const keywords = ['strategy', 'challenge', 'opportunity', 'value', 'customer', 'growth', 'insight', 'breakthrough', 'solution', 'results', 'innovation', 'transformation', 'success', 'impact'];
  const themes = [];
  const words = text.toLowerCase().split(' ');
  
  keywords.forEach(kw => {
    if (words.some(w => w.includes(kw))) {
      themes.push(kw.charAt(0).toUpperCase() + kw.slice(1));
    }
  });
  
  return themes.length > 0 ? themes.slice(0, 5) : ['Key Insight', 'Important Finding', 'Action Item'];
}

// ========== AUTH FUNCTIONS ==========
// In-memory user storage for Vercel (since filesystem is read-only)
let usersMemory = {};

function loadUsers() {
  // On Vercel, use in-memory storage
  if (process.env.VERCEL !== undefined) {
    return usersMemory;
  }
  
  // In development, use file storage
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch (e) {
    return {};
  }
}

function saveUsers(users) {
  // On Vercel, save to memory
  if (process.env.VERCEL !== undefined) {
    usersMemory = users;
    return;
  }
  
  // In development, save to file
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('Error saving users:', e.message);
  }
}

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.slice(7);
  const decoded = verifyToken(token);
  
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  req.user = decoded;
  next();
}

// ========== AUTH ENDPOINTS ==========
app.post('/api/signup', (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    const users = loadUsers();
    
    if (users[email]) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Create new user (in production, hash password!)
    const user = {
      id: `user_${Date.now()}`,
      name,
      email,
      password, // WARNING: In production, use bcrypt!
      createdAt: new Date().toISOString()
    };
    
    users[email] = user;
    saveUsers(users);
    
    const token = generateToken(user);
    console.log(`✅ New user created: ${email}`);
    
    res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
    
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    const users = loadUsers();
    const user = users[email];
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = generateToken(user);
    console.log(`✅ User logged in: ${email}`);
    
    res.status(200).json({
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
    
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/verify-token', authMiddleware, (req, res) => {
  res.status(200).json({ valid: true, user: req.user });
});

// Set profession
app.post('/profession', (req, res) => {
  try {
    const { profession } = req.body;
    const userId = getOrCreateUserId(req);
    
    if (!PROFESSIONS[profession]) {
      return res.status(400).json({ error: 'Invalid profession' });
    }
    
    userProfessions[userId] = profession;
    res.json({ userId, profession, message: 'Profession set successfully' });
  } catch (error) {
    console.error('Error setting profession:', error);
    res.status(500).json({ error: 'Failed to set profession' });
  }
});

// Transcribe endpoint - accepts audio file via multipart/form-data
app.post('/transcribe', authMiddleware, upload.single('audio'), async (req, res) => {
  let audioPath = null;
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }
    
    audioPath = req.file.path;
    console.log(`\n📂 Processing audio file: ${audioPath} for user ${userId}`);
    console.log(`📊 File size: ${(req.file.size / 1024 / 1024).toFixed(2)}MB`);
    
    let transcript = null;
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || process.env.HF_API_KEY;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    // Try Hugging Face Whisper API first
    if (HF_API_KEY) {
      try {
        console.log('🤖 Attempting Hugging Face Whisper transcription...');
        const audioBuffer = fs.readFileSync(audioPath);
        const form = new FormData();
        form.append('audio', audioBuffer, { filename: 'audio.wav' });
        
        const response = await axios.post(
          'https://api-inference.huggingface.co/models/openai/whisper-large-v3',
          form,
          {
            headers: {
              ...form.getHeaders(),
              'Authorization': `Bearer ${HF_API_KEY}`,
            },
            timeout: 120000
          }
        );
        
        if (response.data && response.data.text) {
          transcript = response.data.text;
          console.log('✅ Whisper transcription successful\n');
        }
      } catch (hfError) {
        console.warn('⚠️ Hugging Face transcription failed:', hfError.message);
      }
    }
    
    // Fallback: Try Groq Whisper
    if (!transcript && GROQ_API_KEY) {
      try {
        console.log('🤖 Attempting Groq Whisper transcription...');
        const audioBuffer = fs.readFileSync(audioPath);
        const form = new FormData();
        form.append('file', audioBuffer, { filename: 'audio.wav' });
        form.append('model', 'whisper-large-v3');
        
        const response = await axios.post(
          'https://api.groq.com/openai/v1/audio/transcriptions',
          form,
          {
            headers: {
              ...form.getHeaders(),
              'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            timeout: 120000
          }
        );
        
        if (response.data && response.data.text) {
          transcript = response.data.text;
          console.log('✅ Groq transcription successful\n');
        }
      } catch (groqError) {
        console.warn('⚠️ Groq transcription failed:', groqError.message);
      }
    }
    
    // If no real transcription available, use structured demo
    if (!transcript) {
      console.warn('⚠️ Using demo transcript - configure API keys for real transcription');
      transcript = `In today's session, we discussed the critical importance of audience alignment in marketing strategy. 
The key takeaway is that successful businesses focus on understanding their customer's pain points deeply before creating solutions. 
We also covered how to develop a competitive advantage through differentiation and unique value proposition. 
Finally, we outlined an action plan for implementing these insights over the next 90 days.`;
    }

    usageMinutes += Math.ceil(req.file.size / (1024 * 1024)); // Track by file size
    res.json({ 
      transcript: transcript.trim(),
      wordCount: transcript.split(/\s+/).length,
      processingTime: '30-120 seconds depending on audio length'
    });
    
  } catch (error) {
    console.error('❌ Error transcribing:', error);
    res.status(500).json({ error: 'Transcription failed: ' + error.message });
  } finally {
    // Clean up uploaded file
    if (audioPath && fs.existsSync(audioPath)) {
      fs.unlink(audioPath, (err) => {
        if (err) console.warn('Failed to delete temp file:', err);
      });
    }
  }
});

app.post('/upload', async (req, res) => {
  try {
    const audioFile = req.files['audio'];
    const audioPath = `uploads/${audioFile.name}`;
    audioFile.mv(audioPath);

    let transcript = null;
    let lastError = null;

    // Try OpenAI Whisper API for transcription
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        {
          file: fs.createReadStream(audioPath),
          model: 'whisper-1',
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if (response.data && response.data.text) {
        transcript = response.data.text;
        console.log('Transcript obtained via OpenAI Whisper');
      }
    } catch (error) {
      lastError = error;
      console.log('OpenAI transcription failed:', error.message);
    }

    // Fallback: Try Groq for transcription
    if (!transcript) {
      try {
        console.log('Trying Groq for transcription...');
        const form = new FormData();
        form.append('file', fs.createReadStream(audioPath), { filename: 'audio.mp3', contentType: 'audio/mpeg' });
        form.append('model', 'whisper-large-v3');
        const response = await axios.post(
          'https://api.groq.com/openai/v1/audio/transcriptions',
          form,
          {
            headers: {
              ...form.getHeaders(),
              'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            },
          }
        );
        if (response.data && response.data.text) {
          transcript = response.data.text;
          console.log('Transcript obtained via Groq');
        }
      } catch (error) {
        lastError = error;
        console.log('Groq transcription failed:', error.message);
      }
    }

    // Final fallback: Try a simpler Hugging Face model
    if (!transcript) {
      try {
        const response = await axios.post(
          'https://api.huggingface.co/models/facebook/whisper-large-v2',
          {
            inputs: fs.createReadStream(audioPath),
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        if (response.data && response.data.text) {
          transcript = response.data.text;
          console.log('Transcript obtained via final Hugging Face fallback');
        }
      } catch (error) {
        lastError = error;
        console.log('Hugging Face transcription failed:', error.message);
      }
    }

    if (!transcript) {
      throw lastError || new Error('All transcription methods failed');
    }

    // Add speaker labels to the transcript
    transcript = addSpeakerLabels(transcript);

    // Increment usage minutes
    usageMinutes += 10; // Assuming each transcription takes 10 minutes

    res.json({ transcript: transcript.trim() });
  } catch (error) {
    console.error('Error uploading and transcribing audio:', error);
    res.status(500).json({ error: 'Audio upload and transcription failed' });
  }
});

// Generate content for multiple platforms
app.post('/generate-content', authMiddleware, async (req, res) => {
  try {
    const { transcript, tone = 'professional', platforms = ['linkedin', 'twitter', 'email'] } = req.body;
    const userId = req.user.id;
    const profession = userProfessions[userId] || 'coaching';
    
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    const systemPrompt = getSystemPrompt(profession, tone);
    
    console.log('\n═══════════════════════════════════════');
    console.log(`📋 Content Generation Request`);
    console.log(`  Transcript length: ${transcript.length} chars`);
    console.log(`  Platforms: ${platforms.join(', ')}`);
    console.log(`  Profession: ${profession}`);
    console.log(`  Tone: ${tone}`);
    console.log('═══════════════════════════════════════\n');
    
    const result = {
      themes: extractThemes(transcript),
      platforms: {},
      metadata: {
        profession,
        tone,
        transcriptLength: transcript.length,
        generatedAt: new Date().toISOString()
      }
    };

    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    // Generate content for each platform
    for (const platform of platforms) {
      if (!PLATFORMS[platform]) continue;
      
      try {
        const platformPrompts = {
          linkedin: `Create a professional LinkedIn post (150-300 words) from this ${profession} transcript that drives engagement:\n\n${transcript}`,
          twitter: `Create a viral Twitter thread (5-7 tweets) from this ${profession} transcript:\n\n${transcript}`,
          instagram: `Create an Instagram caption (100-150 words) with relevant hashtags for a ${profession} audience:\n\n${transcript}`,
          tiktok: `Create a TikTok script (30-60 seconds) from this ${profession} transcript that hooks viewers in the first 3 seconds:\n\n${transcript}`,
          youtube: `Create a YouTube video description (150-300 words) with SEO-optimized keywords for a ${profession}:\n\n${transcript}`,
          newsletter: `Create a newsletter section (3-4 paragraphs) from this ${profession} transcript:\n\n${transcript}`,
          blog: `Create a blog post outline (5-7 sections) from this ${profession} transcript:\n\n${transcript}`,
          email: `Create a compelling email campaign subject line and body (150-250 words) for a ${profession} audience:\n\n${transcript}`
        };

        const userPrompt = platformPrompts[platform] || platformPrompts.linkedin;

        if (!GROQ_API_KEY) {
          throw new Error('GROQ_API_KEY not configured');
        }

        console.log(`🚀 Generating ${platform} content...`);

        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 0.9
          },
          {
            headers: {
              'Authorization': `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 30000
          }
        );

        if (response.data?.choices?.[0]?.message?.content) {
          result.platforms[platform] = response.data.choices[0].message.content;
          console.log(`✅ ${platform} generated successfully`);
        }
      } catch (apiError) {
        console.error(`❌ Failed to generate ${platform}:`, apiError.message);
        
        // Fallback content
        const fallbacks = {
          linkedin: `Great insights from today's session! Key takeaways:\n\n${result.themes.join('\n• ')}\n\n#${profession.replace('-', '')} #Growth #Insights`,
          twitter: `1/ Just documented key insights from today's work\n2/ Topic: ${result.themes[0]}\n3/ Application: Real-world impact\n4/ Next: Implementation`,
          instagram: `✨ Today's highlights\n\n${result.themes.join('\n\n')}\n\n#insights #growth #${profession.replace('-', '')}`,
          tiktok: `[HOOK] Did you know? [BODY] Here's what we discovered: ${result.themes[0]}... [CTA] Save this!`,
          youtube: `Title: ${result.themes[0]} - Key Insights\nDescription: Learn about ${result.themes.join(', ')}. Perfect for ${profession}s.`,
          newsletter: `This Week's Insight:\n${result.themes[0]}\n\nWhat we learned: ${result.themes.slice(1, 3).join(', ')}`,
          blog: `# ${result.themes[0]}\n\n## Key Points\n- ${result.themes.join('\n- ')}\n\n## Takeaway\nPractical insights for ${profession}s`,
          email: `Subject: ${result.themes[0]}\n\nHi there,\n\nI wanted to share today's insights with you: ${result.themes.join(', ')}\n\nBest regards`
        };

        result.platforms[platform] = fallbacks[platform] || fallbacks.linkedin;
      }
    }

    // Save to library
    const library = loadLibrary();
    if (!library[userId]) library[userId] = [];
    
    const entry = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      profession,
      tone,
      transcript: transcript.substring(0, 300) + (transcript.length > 300 ? '...' : ''),
      generatedContent: result
    };
    
    library[userId].push(entry);
    saveLibrary(library);

    console.log('✅ Content generation complete\n');
    res.json({ ...result, userId });
  } catch (error) {
    console.error('❌ Error generating content:', error);
    res.status(500).json({ error: 'Content generation failed: ' + error.message });
  }
});

// Get available platforms
app.get('/platforms', (req, res) => {
  res.json(PLATFORMS);
});

// Get available professions
app.get('/professions', (req, res) => {
  res.json(PROFESSIONS);
});

// Usage tracking
app.get('/usage', (req, res) => {
  const FREE_LIMIT_MINUTES = 1000;
  const usage = Math.min((usageMinutes / FREE_LIMIT_MINUTES) * 100, 100);
  res.json({ 
    usage, 
    freeLimit: FREE_LIMIT_MINUTES,
    usedMinutes: usageMinutes,
    remainingMinutes: Math.max(0, FREE_LIMIT_MINUTES - usageMinutes)
  });
});

// Library endpoints
app.get('/library', (req, res) => {
  try {
    const userId = req.query.userId || 'unknown';
    const library = loadLibrary();
    const userContent = library[userId] || [];
    
    // Build cards HTML
    let cardsHtml = '';
    if (userContent.length === 0) {
      cardsHtml = '<div class="empty-state"><p>No saved content yet. Start generating!</p></div>';
    } else {
      cardsHtml = '<div class="library-grid">';
      userContent.slice().reverse().forEach(item => {
        const safeId = item.id.replace(/'/g, "\\'");
        const date = new Date(item.timestamp).toLocaleDateString();
        cardsHtml += `
          <div class="library-card">
            <div class="card-header">
              <h3>${item.profession.toUpperCase()}</h3>
              <span class="tone-badge">${item.tone}</span>
            </div>
            <p class="meta">📅 ${date}</p>
            <p style="color: rgba(255,255,255,0.75); margin-top: 12px; line-height: 1.5;">${item.transcript}</p>
            <div class="actions">
              <button class="view-btn" onclick="viewContent('${safeId}')">View</button>
              <button class="delete-btn" onclick="deleteContent('${safeId}')">Delete</button>
            </div>
          </div>`;
      });
      cardsHtml += '</div>';
    }
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Content Library</title>
  <link rel="stylesheet" href="styles.css">
  <style>
    .library-container { max-width: 1400px; margin: 0 auto; padding: 40px 20px; }
    .library-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .library-header h1 { color: var(--muted); font-size: 2em; }
    .back-btn { background: linear-gradient(90deg, var(--accent-1), var(--accent-2)); padding: 10px 16px; border-radius: 8px; border: none; color: #041022; cursor: pointer; font-weight: 600; }
    .library-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    .library-card { background: linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.03); transition: all 0.3s; }
    .library-card:hover { border-color: rgba(41, 240, 214, 0.2); background: linear-gradient(135deg, rgba(41,240,214,0.05), rgba(108,99,255,0.05)); }
    .library-card .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
    .library-card h3 { color: var(--accent-1); margin: 0; }
    .tone-badge { background: rgba(108,99,255,0.3); color: var(--accent-2); padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .library-card p { color: rgba(255,255,255,0.65); margin-bottom: 8px; font-size: 13px; }
    .library-card .meta { color: rgba(255,255,255,0.45); font-size: 12px; }
    .library-card .actions { display: flex; gap: 8px; margin-top: 12px; }
    .library-card button { flex: 1; padding: 8px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.2s; }
    .view-btn { background: linear-gradient(90deg, var(--accent-2), var(--accent-1)); color: #041022; }
    .view-btn:hover { transform: translateY(-2px); }
    .delete-btn { background: rgba(255,75,75,0.2); color: rgba(255,100,100,0.9); }
    .delete-btn:hover { background: rgba(255,75,75,0.4); }
    .empty-state { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.45); }
  </style>
</head>
<body>
  <div class="library-container">
    <div class="library-header">
      <h1>📚 Content Library</h1>
      <button class="back-btn" onclick="history.back()">← Back</button>
    </div>
    <div id="library-content">
      ${cardsHtml}
    </div>
  </div>
  <script>
    const USER_ID = '${userId}';
    const CONTENT_DATA = ${JSON.stringify(userContent)};
    function viewContent(id) {
      const item = CONTENT_DATA.find(x => x.id === id);
      if (item) {
        const modal = document.createElement('div');
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;';
        modal.innerHTML = '<div style="background: #0f1724; padding: 30px; border-radius: 12px; max-width: 90%; max-height: 90%; overflow-y: auto; border: 1px solid rgba(41,240,214,0.3);"><h2 style="color: var(--accent-1); margin-bottom: 20px;">Generated Content</h2><pre style="color: #e6eef8; white-space: pre-wrap; word-break: break-word; font-family: monospace; font-size: 12px;">' + JSON.stringify(item.generatedContent, null, 2) + '</pre><button onclick="this.parentElement.parentElement.remove()" style="margin-top: 20px; padding: 10px 20px; background: var(--accent-2); color: #041022; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Close</button></div>';
        document.body.appendChild(modal);
      }
    }
    function deleteContent(id) {
      if (confirm('Delete this content permanently?')) {
        fetch('/library/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: USER_ID, id })
        }).then(() => location.reload());
      }
    }
  </script>
</body>
</html>`;
    res.send(html);
  } catch (error) {
    console.error('Error loading library:', error);
    res.status(500).send('<h1>Error loading library</h1>');
  }
});

app.post('/library/delete', (req, res) => {
  try {
    const { userId, id } = req.body;
    const library = loadLibrary();
    if (library[userId]) {
      library[userId] = library[userId].filter(item => item.id !== id);
      saveLibrary(library);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Export for Vercel
module.exports = app;

// Start server locally (not on Vercel)
if (process.env.VERCEL === undefined) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\n✅ Server is running on port ${PORT}`);
    console.log(`📍 Open http://localhost:${PORT}`);
    console.log(`🔑 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🤖 Hugging Face API: ${process.env.HUGGINGFACE_API_KEY ? '✅ Configured' : '⚠️ Not configured'}`);
    console.log(`🤖 Groq API: ${process.env.GROQ_API_KEY ? '✅ Configured' : '⚠️ Not configured'}\n`);
  });
}

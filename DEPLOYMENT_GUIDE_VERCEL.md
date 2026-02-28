# EchoScribe AI - Deployment Guide

## 🚀 Deploying to Vercel

This guide covers deploying EchoScribe AI to Vercel with full authentication and API integration.

---

## 📋 Prerequisites

Before deploying, you need:

1. **GitHub Account** - To host your code
2. **Vercel Account** - For hosting (free tier available)
3. **Groq API Key** - For LLM content generation
4. **Hugging Face API Key** - For audio transcription
5. **API Keys for your own use** (or users will use the app)

---

## 🔑 Step 1: Get Your API Keys

### Groq API Key
1. Go to https://console.groq.com
2. Sign up or log in
3. Create a new API key
4. Copy the key (format: `gsk_...`)

### Hugging Face API Key
1. Go to https://huggingface.co/settings/tokens
2. Create a new token
3. Copy the token (format: `hf_...`)

---

## 📦 Step 2: Prepare Your Code

### 1. Create GitHub Repository

```bash
# Navigate to your project
cd voice-to-content-engine

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: EchoScribe AI with authentication"

# Add remote (replace YOUR-USERNAME and REPO-NAME)
git remote add origin https://github.com/YOUR-USERNAME/echoscribe-ai.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 2. Verify .env.example is Updated

Make sure `.env.example` is in your repo with all required variables:

```env
HUGGINGFACE_API_KEY=hf_your_token_here
GROQ_API_KEY=gsk_your_key_here
JWT_SECRET=your-secure-random-string
NODE_ENV=production
PORT=3000
```

---

## 🌐 Step 3: Deploy to Vercel

### Option A: Using Vercel Dashboard (Easiest)

1. **Go to Vercel**
   - Visit https://vercel.com/new
   - Click "Import Project"

2. **Connect GitHub**
   - Click "Select Git Repository"
   - Authorize Vercel to access your GitHub
   - Find your `echoscribe-ai` repository

3. **Configure Project**
   - Framework: Leave as "Other" (Node.js)
   - Root Directory: `./` (default)
   - Build Command: (leave empty)
   - Output Directory: `public`

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add each variable from your `.env`:
     - `HUGGINGFACE_API_KEY`: Your Hugging Face key
     - `GROQ_API_KEY`: Your Groq key
     - `JWT_SECRET`: Generate a strong random string
       ```bash
       node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
       ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your app will be available at `https://your-app-name.vercel.app`

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts to set up project
# Add environment variables when prompted
```

---

## ✅ Step 4: Verify Deployment

After deployment:

1. **Visit Your App**
   - Go to your Vercel URL
   - You should see the login page

2. **Test Signup**
   - Create a new account with a test email
   - Verify you can sign up successfully

3. **Test Functionality**
   - Upload an audio file
   - Generate content
   - Download results

4. **Check Logs**
   - In Vercel dashboard, check "Deployments" → "Logs"
   - Look for any errors or API issues

---

## 🔒 Security Best Practices

### For Production:

1. **Change JWT_SECRET**
   ```bash
   # Generate a strong secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Use HTTPS Only**
   - Vercel provides free HTTPS
   - Ensure all API calls use HTTPS

3. **Hash Passwords**
   - Current implementation stores plain passwords
   - In production, use `bcrypt`:
   ```bash
   npm install bcrypt
   ```
   - Update `server.js` to hash passwords before saving

4. **Rate Limiting**
   - Implement rate limiting for auth endpoints
   - Protect against brute force attacks

5. **Environment Variables**
   - Never commit `.env` to GitHub
   - Use Vercel dashboard to manage secrets
   - Rotate API keys regularly

---

## 🐛 Troubleshooting

### "Module not found" errors

- Ensure all dependencies in `package.json` are installed
- Check that `jsonwebtoken` is in dependencies
- Run `npm install` locally before pushing

### API calls failing

- Verify API keys are correct in Vercel dashboard
- Check that keys have sufficient permissions
- Look at Vercel logs for specific error messages

### Authentication not working

- Verify `JWT_SECRET` is set in Vercel
- Clear browser cookies and try again
- Check that auth endpoints return correct status codes

### File uploads failing

- File uploads work in memory but not persisted
- For production, connect to cloud storage:
  - AWS S3
  - Google Cloud Storage
  - Azure Blob Storage

---

## 📈 Scaling & Optimization

### For Higher Usage:

1. **Database**
   - Replace JSON file storage with Supabase/PostgreSQL
   - Store user data, transcripts, generated content

2. **Caching**
   - Cache generated content to reduce API calls
   - Use Redis for session management

3. **CDN**
   - Vercel includes built-in CDN
   - Static assets automatically cached

4. **Worker Queues**
   - For long-running transcription jobs
   - Use background jobs to handle async processing

---

## 🔄 Continuous Deployment

Your app will auto-deploy when you push to main branch:

```bash
# Make changes
git add .
git commit -m "Fix: Update authentication logic"
git push origin main

# Vercel automatically deploys
# Check dashboard for deployment status
```

---

## 📊 Monitoring

### Monitor Your App:

1. **Vercel Analytics**
   - Check deployment dashboard
   - View function execution times
   - Monitor error rates

2. **Logs**
   - Click deployment → Logs
   - Filter by status (errors, warnings)
   - Check API integration status

3. **Performance**
   - Check Core Web Vitals
   - Monitor function duration
   - Optimize slow endpoints

---

## 💰 Cost Estimation

### Vercel Pricing:
- **Free Tier**: Perfect for testing
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Serverless functions

- **Pro Tier**: For production
  - $20/month
  - Unlimited bandwidth
  - Faster function execution
  - Priority support

### API Costs:
- **Groq**: Free tier available (rate limited)
- **Hugging Face**: Free tier available (rate limited)

For higher usage, upgrade API plans on respective platforms.

---

## 🆘 Getting Help

- **Vercel Docs**: https://vercel.com/docs
- **Groq Docs**: https://console.groq.com/docs
- **Hugging Face Docs**: https://huggingface.co/docs

---

## ✨ Next Steps

After deployment:

1. **Invite Beta Users**
   - Share your Vercel URL
   - Get feedback on features
   - Collect improvement suggestions

2. **Monitor Usage**
   - Track API costs
   - Monitor performance
   - Identify bottlenecks

3. **Iterate**
   - Add user feedback
   - Improve UI/UX
   - Add new features
   - Push updates (auto-deploy)

---

**🎉 Congratulations! Your EchoScribe AI app is live!**

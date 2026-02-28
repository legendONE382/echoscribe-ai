# 🚀 GitHub Push & Vercel Deployment - Step by Step

This guide walks you through pushing your EchoScribe AI app to GitHub and deploying to Vercel.

---

## 📋 Prerequisites Checklist

Before you start:
- [ ] You have a GitHub account (https://github.com)
- [ ] You have a Vercel account (https://vercel.app)
- [ ] You have your API keys ready:
  - [ ] Groq API Key
  - [ ] Hugging Face API Key
- [ ] Git is installed on your computer
- [ ] You're in the `voice-to-content-engine` directory

---

## 🔧 Step 1: Initialize Git (If Not Already Done)

```bash
# Navigate to project
cd c:\Users\User\OneDrive\Documents\coding\voice-to-content-engine

# Check if git is initialized
git status

# If not initialized, run:
git init
```

---

## 📤 Step 2: Create GitHub Repository

### Option A: Using GitHub Web Interface (Easiest)

1. **Go to GitHub**
   - Visit https://github.com/new
   - Log in if needed

2. **Create Repository**
   - Repository name: `echoscribe-ai`
   - Description: "AI Voice-to-Content Engine - Convert audio to platform-ready content"
   - Choose: Public (to share with others)
   - Do NOT initialize with README (we have one)
   - Click "Create repository"

3. **Copy Repository URL**
   - You'll see: `https://github.com/YOUR-USERNAME/echoscribe-ai.git`
   - Copy this URL

### Option B: Using GitHub CLI

```bash
# Install GitHub CLI if needed
# Then authenticate
gh auth login

# Create new repository
gh repo create echoscribe-ai --public --source=. --remote=origin --push
```

---

## 🔗 Step 3: Add GitHub Remote to Your Local Repo

```bash
# Replace YOUR-USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR-USERNAME/echoscribe-ai.git

# Verify remote was added
git remote -v
# Should show:
# origin  https://github.com/YOUR-USERNAME/echoscribe-ai.git (fetch)
# origin  https://github.com/YOUR-USERNAME/echoscribe-ai.git (push)
```

---

## 📝 Step 4: Prepare Your Code

### Verify .gitignore

Make sure sensitive files are NOT committed:

Create/update `.gitignore`:
```
node_modules/
.env
.env.local
uploads/
data/users.json
data/library.json
*.log
.DS_Store
```

### Stage Files

```bash
# Check what will be committed
git status

# Add all files
git add .

# Review changes
git diff --cached

# If everything looks good, continue
```

---

## 💾 Step 5: Create First Commit

```bash
# Commit with descriptive message
git commit -m "Initial commit: EchoScribe AI - Voice-to-Content Engine with authentication"

# Verify commit
git log --oneline
```

---

## 🎯 Step 6: Push to GitHub

```bash
# Push main branch
git push -u origin main

# Or if your default branch is "master":
git push -u origin master

# Verify on GitHub
# Visit: https://github.com/YOUR-USERNAME/echoscribe-ai
# You should see all your files
```

---

## 🌐 Step 7: Prepare for Vercel Deployment

### 1. Verify Dependencies

Check `package.json` includes all required packages:
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0",
    "multer": "^1.4.5-lts.1",
    "jsonwebtoken": "^9.0.0",
    "dotenv": "^16.3.1",
    "form-data": "^4.0.4"
  }
}
```

### 2. Verify .env.example is Committed

```bash
# Check if file exists
ls .env.example

# If not, create it:
cp .env .env.example

# Remove actual values
# Replace with examples:
# HUGGINGFACE_API_KEY=hf_your_token_here
# etc.

# Commit
git add .env.example
git commit -m "Add environment variables template"
git push origin main
```

### 3. Ensure .env is NOT in Repository

```bash
# Check if accidentally committed
git ls-files | grep "\.env$"

# If found, remove it
git rm --cached .env
git commit -m "Remove .env from repository"
git push origin main
```

---

## 🚀 Step 8: Deploy on Vercel

### Option A: Automatic Deployment (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Log in with GitHub

2. **Add New Project**
   - Click "+ New Project"
   - Click "Import Git Repository"

3. **Select Repository**
   - Find `echoscribe-ai`
   - Click "Import"

4. **Configure Project**
   - Framework Preset: Leave blank (Node.js)
   - Root Directory: `./`
   - Build Command: Leave empty
   - Install Command: `npm install`
   - Start Command: `node server.js`

5. **Add Environment Variables**
   - Click "Environment Variables"
   - Add each variable:
     - Name: `HUGGINGFACE_API_KEY`
     - Value: `hf_...your_key...`
     - Click "Add"
     
   - Add next variable:
     - Name: `GROQ_API_KEY`
     - Value: `gsk_...your_key...`
     - Click "Add"
     
   - Add JWT Secret:
     - Name: `JWT_SECRET`
     - Value: (Generate random string - see below)
     - Click "Add"

### Generate Random JWT_SECRET

```bash
# On Windows PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output
# Paste as JWT_SECRET value
```

6. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for deployment
   - You'll see: "Congratulations! Your project is deployed"

7. **Visit Your App**
   - Click the URL shown (e.g., `https://echoscribe-ai.vercel.app`)
   - Test signup and functionality

---

## ✅ Verification Checklist

After deployment, verify everything works:

- [ ] Visit your Vercel URL
- [ ] See the login page loads
- [ ] Create a test account (signup works)
- [ ] Login with test account (auth works)
- [ ] See the main app interface
- [ ] Upload a test audio file
- [ ] Transcription completes
- [ ] Content generates for selected platforms
- [ ] Copy/Download buttons work

---

## 🔄 Making Updates

### To Update Your Deployed App:

```bash
# Make changes locally
# Test everything works: npm run dev

# Commit changes
git add .
git commit -m "Update: Fix/feature description"

# Push to GitHub
git push origin main

# Vercel automatically redeploys!
# Check deployment status: https://vercel.com/dashboard
```

---

## 🐛 Troubleshooting Deployment

### Deployment Failed - "Build Command Exited"
- Check server.js starts without errors: `npm run dev`
- Verify all dependencies are in package.json
- Check that `.env` is NOT in your repo

### App Crashes After Deployment
- Check Vercel logs: Dashboard → Click deployment → Logs
- Look for module not found errors
- Verify environment variables are set correctly

### "API Key not found" Errors
- Double-check API keys in Vercel dashboard
- Verify keys are exact (no extra spaces)
- Check variable names match code (`HUGGINGFACE_API_KEY`, `GROQ_API_KEY`)

### "Cannot find module jsonwebtoken"
- Verify package.json has the dependency
- Run `npm install` locally
- Commit and push again

### Changes Not Showing After Push
- Vercel takes 1-3 minutes to detect changes
- Check deployment status in Vercel dashboard
- Refresh your browser (Ctrl+Shift+R for hard refresh)
- Check Vercel logs for build errors

---

## 📊 Vercel Dashboard Features

Once deployed, explore:

1. **Deployments** - See all past deployments
2. **Logs** - View build and function logs
3. **Analytics** - Track usage and performance
4. **Settings** - Manage domains, env variables
5. **Functions** - See serverless function performance

---

## 🎉 Success Indicators

Your app is fully deployed when:

✅ Vercel shows "Ready" status  
✅ App loads at `https://your-app-name.vercel.app`  
✅ Signup/Login page appears  
✅ Authentication works  
✅ Audio upload functions  
✅ Content generates without errors  

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **GitHub Help**: https://docs.github.com
- **Check Logs**: Vercel Dashboard → Your Project → Deployments

---

## 🔐 Important Reminders

**⚠️ DO NOT commit `.env` file**
- It contains your API keys
- Anyone with access can use your keys
- This will cost you money

**⚠️ DO keep `.env.example` committed**
- Shows what variables are needed
- Helps others set up their own keys

**⚠️ Keep API Keys Safe**
- Don't share them publicly
- Use Vercel environment variables
- Rotate keys if accidentally exposed

---

**🎉 Congratulations! Your EchoScribe AI app is now live on GitHub and Vercel!**

**Next Steps:**
1. Test the app thoroughly
2. Share the Vercel URL with friends
3. Gather feedback for improvements
4. Make updates and push to main
5. Monitor usage and API costs

---

*Last Updated: February 28, 2026*

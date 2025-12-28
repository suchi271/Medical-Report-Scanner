# Quick Start Guide - For Absolute Beginners

Can't get it running? Start here! This is the simplest path to get the app working.

## Prerequisites (5 minutes)

1. **Install Node.js**
   - Go to [nodejs.org](https://nodejs.org/)
   - Download and install LTS version (18 or higher)
   - Verify: Open terminal and run `node --version`

2. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

3. **Create Accounts**
   - [Firebase Account](https://console.firebase.google.com/) (free)
   - [Google Cloud Account](https://console.cloud.google.com/) (free tier available)

## Quick Setup (15 minutes)

### Step 1: Login to Firebase
```bash
firebase login
```

### Step 2: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Name it: `medical-reports-test`
4. Click through setup (defaults are fine)

### Step 3: Enable Services
In Firebase Console, enable:
- **Authentication** → Enable Email/Password
- **Firestore** → Create database (Production mode)
- **Storage** → Get started (Production mode)

### Step 4: Copy Environment Files
```bash
# Frontend
cd frontend
copy .env.example .env
# (Edit .env with your Firebase config values)

# Backend
cd ../functions
copy .env.example .env
# (Edit .env with your API keys)
```

### Step 5: Get Your Firebase Config
1. Firebase Console → Project Settings → General
2. Scroll to "Your apps"
3. Click Web app icon (</>)
4. Copy the config values to `frontend/.env`

### Step 6: Install Dependencies
```bash
# From project root
cd frontend
npm install

cd ../functions
npm install
```

### Step 7: Start Local Development
```bash
# Terminal 1: Start emulators
firebase emulators:start

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### Step 8: Open App
Go to: http://localhost:3000

## What You'll See

1. **Login/Signup page** - Create an account
2. **Dashboard** - Upload a PDF lab report
3. **Report View** - See extracted data
4. **AI Explanation** - Get plain-language explanation

## Minimal Configuration (For Testing)

You can test locally with just Firebase. For full features, you'll need:

- ✅ **Firebase** (required) - Auth, Storage, Database
- ⚠️ **Document AI** (optional for testing) - For PDF extraction
- ⚠️ **BigQuery** (optional for testing) - For trend analysis
- ⚠️ **Gemini** (optional for testing) - For AI explanations

**To test without all services:**
- Use sample data from `test-data/sample-report.json`
- Skip Document AI extraction
- Skip BigQuery queries
- Skip Gemini explanations

## Common First-Time Issues

### "npm: command not found"
**Fix:** Install Node.js from nodejs.org

### "firebase: command not found"
**Fix:** Run `npm install -g firebase-tools`

### "Cannot find module"
**Fix:** Run `npm install` in both `frontend/` and `functions/` directories

### "Port 3000 already in use"
**Fix:** Change port in `frontend/vite.config.js` or kill the process using port 3000

### "Firebase not initialized"
**Fix:** Run `firebase init` and select your project

## Next Steps

Once you have it running locally:
1. Read `SETUP_GUIDE.md` for full production setup
2. Enable Google Cloud APIs (Document AI, BigQuery, Gemini)
3. Deploy to production

## Need More Help?

- See `SETUP_GUIDE.md` for detailed instructions
- See `TROUBLESHOOTING.md` for common issues
- Check Firebase/Google Cloud Console logs

**You got this!** 🚀


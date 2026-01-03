# Phase 3: Production Deployment Guide
## Deploy Your Medical Report Scanner to Production

**Prerequisites:** Phase 1 ✅ and Phase 2 ✅ completed

---

## Overview

This guide will deploy your application to production with:
- ✅ Cloud Functions (Backend API)
- ✅ Firebase Hosting (Frontend SPA)
- ✅ Public HTTPS URL accessible by anyone

---

## Pre-Deployment Checklist

### 1. Install Firebase CLI (if not done)
```powershell
npm install -g firebase-tools
```

### 2. Login to Firebase
```powershell
firebase login
```

### 3. Verify Project Link
```powershell
firebase use medical-scanner-app
```

If project isn't linked:
```powershell
firebase use --add
# Select: medical-scanner-app
```

---

## Step 1: Update Frontend Environment for Production

Create a production environment file:

**File: `frontend/.env.production`**
```env
VITE_FIREBASE_API_KEY="AIzaSyBOnr43_-kb57o0vg3nk24-FqUyA4JeBq8"
VITE_FIREBASE_AUTH_DOMAIN="medical-scanner-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="medical-scanner-app"
VITE_FIREBASE_STORAGE_BUCKET="medical-scanner-app.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="2138560978"
VITE_FIREBASE_APP_ID="1:2138560978:web:2ac2d87c8a93915bd7500b"
VITE_CLOUD_FUNCTIONS_URL=https://us-central1-medical-scanner-app.cloudfunctions.net/api
```

**Note:** The `VITE_CLOUD_FUNCTIONS_URL` now points to production Cloud Functions, not localhost.

---

## Step 2: Set Cloud Functions Environment Variables

Firebase Functions need environment variables from `functions/src/.env`. We'll set them as secrets:

```powershell
# Set each environment variable
firebase functions:secrets:set GCP_PROJECT_ID
# When prompted, enter: medical-scanner-app

firebase functions:secrets:set DOCUMENT_AI_PROCESSOR_ID
# When prompted, enter: d4b9082bc4d72837

firebase functions:secrets:set GEMINI_API_KEY
# When prompted, enter: AIzaSyDSDdZmwxE8UjP6yjzWS2MVUKetMvFqiJk

firebase functions:secrets:set BIGQUERY_DATASET
# When prompted, enter: medical_reports

firebase functions:secrets:set DOCUMENT_AI_LOCATION
# When prompted, enter: us

firebase functions:secrets:set GCP_LOCATION
# When prompted, enter: us-central1
```

### Alternative: Using Environment Config (Simpler)

Update `functions/src/index.js` to use Firebase environment config:

```powershell
firebase functions:config:set app.gcp_project_id="medical-scanner-app"
firebase functions:config:set app.document_ai_processor_id="d4b9082bc4d72837"
firebase functions:config:set app.gemini_api_key="AIzaSyDSDdZmwxE8UjP6yjzWS2MVUKetMvFqiJk"
firebase functions:config:set app.bigquery_dataset="medical_reports"
firebase functions:config:set app.document_ai_location="us"
firebase functions:config:set app.gcp_location="us-central1"
```

---

## Step 3: Build Frontend for Production

```powershell
cd frontend
npm run build
```

This creates optimized production build in `frontend/dist/`

Verify build:
```powershell
dir dist
# Should see: index.html, assets/, etc.
```

---

## Step 4: Deploy Backend (Cloud Functions)

```powershell
cd ..  # Back to project root
firebase deploy --only functions
```

**This will:**
- Upload functions code to Google Cloud
- Deploy the Express API at: `https://us-central1-medical-scanner-app.cloudfunctions.net/api`
- Takes 2-5 minutes

**Expected Output:**
```
✔  Deploy complete!
Function URL (api): https://us-central1-medical-scanner-app.cloudfunctions.net/api
```

---

## Step 5: Deploy Frontend (Firebase Hosting)

```powershell
firebase deploy --only hosting
```

**This will:**
- Upload `frontend/dist/` to Firebase Hosting
- Configure SPA routing
- Enable HTTPS automatically
- Takes 1-2 minutes

**Expected Output:**
```
✔  Deploy complete!
Hosting URL: https://medical-scanner-app.web.app
```

---

## Step 6: Deploy Security Rules

```powershell
firebase deploy --only firestore:rules,storage
```

---

## Step 7: Complete Deployment (All at Once)

Or deploy everything in one command:

```powershell
firebase deploy
```

This deploys:
- ✅ Cloud Functions
- ✅ Firebase Hosting
- ✅ Firestore Rules
- ✅ Storage Rules

---

## Step 8: Update CORS for Production

Update `functions/src/index.js` to allow your production domain:

```javascript
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://medical-scanner-app.web.app",
      "https://medical-scanner-app.firebaseapp.com"
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

Then redeploy functions:
```powershell
firebase deploy --only functions
```

---

## Your Production URLs

After successful deployment:

### Frontend (Public Access)
```
https://medical-scanner-app.web.app
```
or
```
https://medical-scanner-app.firebaseapp.com
```

### Backend API
```
https://us-central1-medical-scanner-app.cloudfunctions.net/api
```

---

## Post-Deployment Testing

### 1. Test Authentication
- Visit: https://medical-scanner-app.web.app
- Sign up with new account
- Login

### 2. Test Upload
- Upload a medical report PDF
- Check processing works

### 3. Test AI Analysis
- Click "Get AI Explanation"
- Verify Gemini insights appear

### 4. Check Backend Logs
```powershell
firebase functions:log
```

---

## Enable Custom Domain (Optional)

### Add Custom Domain
1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow DNS setup instructions
4. SSL certificate auto-provisioned

Example: `medicalreport.yourdomain.com`

---

## Monitoring & Maintenance

### View Function Logs
```powershell
firebase functions:log --limit 50
```

### View Usage & Costs
- Firebase Console: https://console.firebase.google.com/project/medical-scanner-app/usage
- GCP Console: https://console.cloud.google.com/billing

### Update Application
```powershell
# Make code changes, then:
npm run build --prefix frontend
firebase deploy
```

---

## Rollback (If Something Goes Wrong)

### Rollback Hosting
```powershell
firebase hosting:channel:deploy rollback
```

### Rollback Functions
Go to Cloud Console → Cloud Functions → Select function → Versions → Rollback

---

## Troubleshooting

### Issue: "Build failed"
```powershell
cd frontend
npm install
npm run build
```

### Issue: "Function deployment failed"
- Check Node version: `node --version` (should be 18+)
- Check logs: `firebase functions:log`

### Issue: "CORS error in production"
- Update CORS origins in `functions/src/index.js`
- Redeploy: `firebase deploy --only functions`

### Issue: "Environment variables not working"
- Use `firebase functions:config:set` instead of .env
- Access with `functions.config().app.variable_name`

---

## Cost Optimization

### Free Tier Limits (Should be sufficient for MVP)
- ✅ Hosting: 10 GB storage, 360 MB/day transfer
- ✅ Functions: 2M invocations/month, 400K GB-sec, 200K CPU-sec
- ✅ Firestore: 50K reads, 20K writes, 20K deletes/day
- ✅ Storage: 5 GB storage, 1 GB/day download

### Monitor Usage
```powershell
firebase projects:list
# Check "quota usage" section
```

---

## Phase 3 Completion ✅

**Deployment Checklist:**
- [ ] Firebase CLI installed
- [ ] Production .env.production created
- [ ] Frontend built (`npm run build`)
- [ ] Functions environment variables set
- [ ] Backend deployed (Cloud Functions)
- [ ] Frontend deployed (Firebase Hosting)
- [ ] Security rules deployed
- [ ] CORS updated for production
- [ ] Public URL tested and working
- [ ] End-to-end flow verified in production

**Your MVP is LIVE! 🎉**

Share this URL with anyone: `https://medical-scanner-app.web.app`

---

## Next: Phase 4 Automation (Optional)

Create a one-command deployment script for easier updates.

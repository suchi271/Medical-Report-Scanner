# Complete Setup Guide - AI Medical Report Interpreter

## ⚠️ Important Notes

- **This project uses Vite** (not Create React App) - environment variables use `VITE_` prefix
- **Firebase Functions use .env files** (not deprecated `functions:config:set`)
- **Vite default port is 5173** (configured to 3000 in this project)

---

## Prerequisites Checklist

- [ ] Node.js 18+ installed ([Download](https://nodejs.org/))
- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Google Cloud account with billing enabled
- [ ] Firebase project created ([Console](https://console.firebase.google.com/))

---

## Recommended Setup Order

Follow this order to avoid dependency issues:

1. **Prerequisites** (Install Node, Firebase CLI, create accounts)
2. **Firebase Project** (Create + enable Auth/Storage/Firestore)
3. **Local Files** (Clone, create .env files)
4. **Google Cloud APIs** (Enable Document AI, BigQuery)
5. **BigQuery** (Create dataset, run schema)
6. **Security Rules** (Deploy firestore.rules, storage.rules)
7. **Install Dependencies** (npm install)
8. **Test Local Emulators** (Verify everything works locally)
9. **Deploy Backend** (Functions first)
10. **Deploy Frontend** (Build + hosting)

---

## Step-by-Step Setup

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd "google techsrpint"

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd functions
npm install
cd ..
```

---

### 2. Firebase Project Setup

#### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project**
3. Enter project name: `medical-report-interpreter`
4. Enable Google Analytics (optional)
5. Click **Create Project**

#### 2.2 Enable Firebase Services

**Authentication:**
1. Go to **Authentication** > **Get Started**
2. Enable **Email/Password** provider
3. Enable **Google** provider
4. Add authorized domains if needed

**Firestore Database:**
1. Go to **Firestore Database** > **Create Database**
2. Start in **Production mode** (we'll add rules later)
3. Choose location (preferably same as Cloud Functions)

**Storage:**
1. Go to **Storage** > **Get Started**
2. Start in **Production mode**
3. Use same location as Firestore

**Hosting:**
1. Go to **Hosting** > **Get Started**
2. Follow setup wizard (we'll deploy later)

#### 2.3 Initialize Firebase CLI

```bash
# Login to Firebase
firebase login

# Link to your project
firebase use --add
# Select your project from the list

# Initialize (if not already done)
firebase init

# Select:
# ✓ Firestore (use existing rules: firestore.rules)
# ✓ Functions (use existing package.json)
# ✓ Hosting (use existing public folder: frontend/dist)
# ✓ Storage (use existing rules: storage.rules)
```

---

### 3. Google Cloud APIs Setup

#### 3.1 Enable Required APIs

Go to [Google Cloud Console](https://console.cloud.google.com/) and enable:

1. **Document AI API**
   - APIs & Services > Library
   - Search "Document AI"
   - Click **Enable**

2. **BigQuery API**
   - Search "BigQuery"
   - Click **Enable**

3. **Cloud Functions API**
   - Search "Cloud Functions"
   - Click **Enable**

4. **Cloud Build API** (required for Functions)
   - Search "Cloud Build"
   - Click **Enable**

#### 3.2 Create Document AI Processor

**Step-by-Step:**

1. Go to [Document AI Console](https://console.cloud.google.com/ai/document-ai/processors)
2. Click **Create Processor**
3. Select **Form Parser** (works well for lab reports)
4. Name it: `lab-report-parser`
5. Choose region: `us` or `eu` (note this for later)
6. Click **Create**
7. **Copy the Processor ID** - it looks like:
   ```
   projects/123456789/locations/us/processors/abc123def456
   ```
   You'll need the full ID for environment variables.

**Note for Better Accuracy:**
- The generic Form Parser works initially
- For production, consider training a custom processor:
  - Upload 10-20 sample lab reports
  - Use Document AI Workbench (requires paid tier)
  - Train custom model for your lab report format

#### 3.3 Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **Create API Key**
3. Copy the API key (you won't see it again!)
4. Save it securely

---

### 4. BigQuery Setup

#### 4.1 Create Dataset

```bash
# Using bq CLI (install from Google Cloud SDK)
bq mk --dataset medical_reports

# Or via Console:
# 1. Go to BigQuery Console
# 2. Click "Create Dataset"
# 3. Dataset ID: medical_reports
# 4. Location: same as your project
```

#### 4.2 Create Tables

```bash
# Run the schema file
bq query --use_legacy_sql=false < bigquery/schema.sql

# Or copy-paste the SQL from bigquery/schema.sql into BigQuery Console
```

**Verify tables created:**
```bash
bq ls medical_reports
# Should show: lab_results table
```

---

### 5. Environment Configuration

#### 5.1 Frontend Environment Variables

Create `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_CLOUD_FUNCTIONS_URL=https://your-region-your-project.cloudfunctions.net/api
```

**How to get these values:**
1. Go to Firebase Console > Project Settings > General
2. Scroll to "Your apps" section
3. Click on Web app (or create one)
4. Copy the config values

**For local development**, use:
```env
VITE_CLOUD_FUNCTIONS_URL=http://localhost:5001/your-project-id/us-central1/api
```

#### 5.2 Backend Environment Variables

**Recommended: Use .env file** (not deprecated `functions:config:set`)

Create `functions/.env`:

```env
# Google Cloud Project
GCP_PROJECT_ID=your-project-id

# Document AI (use FULL processor ID from step 3.2)
DOCUMENT_AI_PROCESSOR_ID=projects/123456789/locations/us/processors/abc123def456
DOCUMENT_AI_LOCATION=us

# BigQuery
BIGQUERY_DATASET=medical_reports

# Gemini API
GEMINI_API_KEY=your-gemini-api-key-here
```

**For Production Deployment:**

Firebase Functions automatically loads environment variables from:
1. `.env` file (for local development)
2. Firebase Functions config (for production)

To set production environment variables:

```bash
# Option 1: Use Firebase Functions config (for production)
firebase functions:config:set \
  gcp.project_id="your-project-id" \
  document_ai.processor_id="projects/123456789/locations/us/processors/abc123def456" \
  document_ai.location="us" \
  bigquery.dataset="medical_reports" \
  gemini.api_key="your-gemini-api-key"

# Option 2: Use .env file (recommended for local, works in production too)
# Just make sure .env is in functions/ directory
```

**Important:** The code in `functions/src/index.js` loads `.env` for local development. For production, you can either:
- Use Firebase Functions config (access via `functions.config()`)
- Or set environment variables in Google Cloud Console > Cloud Functions > Environment Variables

---

### 6. Security Rules Setup

#### 6.1 Deploy Security Rules

```bash
# Deploy Firestore and Storage rules
firebase deploy --only firestore:rules,storage
```

**Verify rules:**
- Firestore rules are in `firestore.rules`
- Storage rules are in `storage.rules`
- Both ensure users can only access their own data

---

### 7. CORS Configuration

CORS is already configured in `functions/src/index.js`:

```javascript
app.use(cors({ origin: true })); // Allows all origins (configure for production)
```

**For Production**, restrict origins:

```javascript
const corsHandler = cors({
  origin: [
    'https://your-project.web.app',
    'https://your-project.firebaseapp.com',
    'http://localhost:3000' // for local testing
  ],
  credentials: true
});
```

---

### 8. Local Development

#### 8.1 Start Firebase Emulators

```bash
# Start all emulators (Firestore, Functions, Storage, Auth)
firebase emulators:start

# Or start specific emulators
firebase emulators:start --only functions,firestore,storage,auth
```

Emulators run on:
- Functions: http://localhost:5001
- Firestore: http://localhost:8080
- Storage: http://localhost:9199
- Auth: http://localhost:9099
- UI: http://localhost:4000

#### 8.2 Start Frontend Development Server

```bash
cd frontend
npm run dev
```

**Runs on:** http://localhost:3000 (configured in `vite.config.js`)

**Note:** Vite's default port is 5173, but this project is configured to use 3000.

#### 8.3 Update Frontend .env for Local Development

```env
VITE_CLOUD_FUNCTIONS_URL=http://localhost:5001/your-project-id/us-central1/api
```

---

### 9. Deploy to Production

#### 9.1 Deploy Security Rules (First!)

```bash
firebase deploy --only firestore:rules,storage
```

#### 9.2 Deploy Cloud Functions

```bash
cd functions

# Make sure .env is set up OR use Firebase config
firebase deploy --only functions

# Note the function URL from output:
# Function URL: https://us-central1-your-project.cloudfunctions.net/api
```

**Update frontend .env with production URL:**
```env
VITE_CLOUD_FUNCTIONS_URL=https://us-central1-your-project.cloudfunctions.net/api
```

#### 9.3 Build and Deploy Frontend

```bash
cd frontend

# Build for production
npm run build

# Deploy to Firebase Hosting
cd ..
firebase deploy --only hosting
```

**Your app will be live at:**
- https://your-project.web.app
- https://your-project.firebaseapp.com

---

## Testing the Setup

### 1. Test Authentication

1. Go to http://localhost:3000 (local) or your deployed URL
2. Click **Sign Up**
3. Create account with email/password
4. Try **Sign in with Google**
5. Verify user appears in Firebase Console > Authentication

### 2. Test File Upload

1. Upload a sample PDF lab report
2. Check Firebase Console > Storage for the file
3. Check Firebase Console > Firestore for report metadata
4. Check BigQuery Console for extracted data

**Sample Test Data:**
See `test-data/sample-report.json` for example structure.

### 3. Test Document Extraction

```bash
# Test extraction manually (after deploying functions)
curl -X POST https://your-region-your-project.cloudfunctions.net/api/processReport \
  -H "Authorization: Bearer YOUR_FIREBASE_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pdfUri": "gs://your-bucket/users/user123/reports/report123.pdf",
    "userId": "user123"
  }'
```

### 4. Test AI Analysis

1. In the app, click on a report
2. Click **Get AI Explanation**
3. Verify:
   - AI explanation appears
   - Safety disclaimer is present
   - No diagnosis/treatment language

### 5. Verify BigQuery Data

```bash
# Query BigQuery to verify data
bq query --use_legacy_sql=false \
  "SELECT * FROM medical_reports.lab_results LIMIT 10"
```

---

## Verify Your Setup

Run these commands to verify everything is configured:

```bash
# Check Firebase login
firebase projects:list

# Check BigQuery dataset exists
bq ls medical_reports

# Check Cloud Functions deployed
firebase functions:list

# Test frontend build
cd frontend && npm run build

# Check for missing dependencies
npm audit

# Check environment variables are set
cd functions && cat .env  # Should show all variables
```

---

## Common Issues & Solutions

### Issue: "Document AI processor not found"
**Solution:**
- Verify Processor ID is correct (use FULL path from step 3.2)
- Check processor exists in Document AI Console
- Verify API is enabled in Google Cloud Console

### Issue: "BigQuery table not found"
**Solution:**
- Run `bigquery/schema.sql` to create tables
- Verify dataset name matches environment variable
- Check BigQuery Console for dataset location

### Issue: "Gemini API error"
**Solution:**
- Check API key is valid
- Verify API quota hasn't been exceeded
- Check API is enabled in Google AI Studio

### Issue: "Firebase Auth not working"
**Solution:**
- Enable Authentication methods in Firebase Console
- Check API keys in `.env` file
- Verify authorized domains in Auth settings

### Issue: "CORS errors"
**Solution:**
- Verify CORS is configured in `functions/src/index.js`
- Check function URL is correct in frontend `.env`
- For production, add your domain to CORS origins

### Issue: "Functions not deploying"
**Solution:**
- Check Node.js version matches `package.json` (18+)
- Verify all dependencies installed (`npm install`)
- Check Firebase CLI is logged in (`firebase login`)
- Review deployment logs: `firebase functions:log`

### Issue: "Vite port already in use"
**Solution:**
- Change port in `frontend/vite.config.js`:
  ```javascript
  server: { port: 3001 }
  ```
- Or kill process using port 3000

### Issue: "Environment variables not loading"
**Solution:**
- For frontend: Restart dev server after changing `.env`
- For functions: Use `.env` for local, Firebase config for production
- Verify variable names match exactly (case-sensitive)

---

## Expected Costs (Monthly)

### Free Tier (Suitable for Testing)
- **Firebase Auth**: 50,000 users free
- **Cloud Functions**: 2M invocations free
- **BigQuery**: 1TB queries free
- **Document AI**: 1,000 pages free/month
- **Gemini API**: Rate limited but free tier available
- **Storage**: 5GB free

### Production Costs (Estimate for 1,000 reports/month)
- **Document AI**: ~$15 (1.5¢/page after free tier)
- **Cloud Functions**: ~$5 (compute time)
- **BigQuery**: ~$5 (storage + queries)
- **Gemini API**: ~$10 (API calls)
- **Storage**: ~$1 (PDF storage)
- **Total**: ~$36/month

**Note:** Costs vary based on usage. Monitor in Google Cloud Console.

---

## Daily Development Workflow

```bash
# 1. Start emulators
firebase emulators:start

# 2. In another terminal, start frontend
cd frontend && npm run dev

# 3. Make changes to code

# 4. Test locally

# 5. Deploy when ready
firebase deploy --only functions,hosting
```

---

## Production Checklist

Before going live:

- [ ] All environment variables set correctly
- [ ] Security rules deployed and tested
- [ ] Rate limiting configured (10 req/min)
- [ ] Error handling tested
- [ ] Safety guardrails verified (no diagnosis language)
- [ ] CORS configured for production domains only
- [ ] Monitoring and alerts configured
- [ ] Backup strategy in place
- [ ] HIPAA compliance reviewed (if applicable)
- [ ] Terms of Service and Privacy Policy added
- [ ] Error logging configured (Cloud Logging)
- [ ] Performance monitoring enabled

---

## Next Steps

1. **Train Document AI processor** with sample lab reports for better extraction
2. **Customize safety guardrails** keywords based on your needs
3. **Add more test formats** to the extraction parser
4. **Set up monitoring** (Cloud Monitoring, Error Reporting)
5. **Configure backups** for BigQuery data
6. **Add analytics** (Firebase Analytics, Google Analytics)
7. **Set up CI/CD** (GitHub Actions, Cloud Build)

---

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Document AI Documentation](https://cloud.google.com/document-ai/docs)
- [BigQuery Documentation](https://cloud.google.com/bigquery/docs)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Vite Documentation](https://vitejs.dev/)

---

## Getting Help

If you encounter issues:

1. Check the **Common Issues** section above
2. Review Firebase/Google Cloud Console logs
3. Check function logs: `firebase functions:log`
4. Verify all environment variables are set
5. Ensure all APIs are enabled
6. Check security rules are deployed

---

**Ready to start?** Follow the steps in order, and you'll have a working medical report interpreter in no time! 🚀

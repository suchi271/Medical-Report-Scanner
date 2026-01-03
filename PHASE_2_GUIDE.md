# Phase 2 Guide: BigQuery Setup & Testing
## Setting Up BigQuery and Testing End-to-End Flow

**Prerequisites from Phase 1:** ✅ All code fixes completed

---

## Step 1: Install Required CLI Tools

### Install Firebase CLI
```powershell
npm install -g firebase-tools
```

### Install Google Cloud SDK (Optional but Recommended)
Download and install from: https://cloud.google.com/sdk/docs/install

---

## Step 2: Set Up BigQuery Dataset

### Option A: Using Google Cloud Console (Recommended for First Time)

1. **Go to BigQuery Console:**
   - Visit: https://console.cloud.google.com/bigquery
   - Select project: `medical-scanner-app`

2. **Create Dataset:**
   - Click on your project name in the left sidebar
   - Click "CREATE DATASET"
   - Dataset ID: `medical_reports`
   - Data location: `US` (or same as your Cloud Functions region)
   - Click "CREATE DATASET"

3. **Run Schema SQL:**
   - Click on the `medical_reports` dataset
   - Click "COMPOSE NEW QUERY"
   - Copy and paste the entire contents of `bigquery/schema.sql`
   - Click "RUN"

### Option B: Using gcloud CLI (If Installed)

```powershell
# Set project
gcloud config set project medical-scanner-app

# Create dataset
bq mk --dataset --location=US medical-scanner-app:medical_reports

# Create table using schema
bq query --use_legacy_sql=false < bigquery/schema.sql
```

---

## Step 3: Verify BigQuery Setup

### Check if dataset exists:
1. Go to https://console.cloud.google.com/bigquery
2. Expand your project `medical-scanner-app`
3. You should see `medical_reports` dataset
4. Expand it to see:
   - ✅ `lab_results` table
   - ✅ `trend_analysis` view
   - ✅ `personal_baselines` view

---

## Step 4: Deploy Firestore Security Rules

```powershell
# Login to Firebase (if not already)
firebase login

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

---

## Step 5: Test Functions Locally

### Start Firebase Emulators
```powershell
cd functions
firebase emulators:start
```

This will start:
- ✅ Functions emulator (port 5001)
- ✅ Firestore emulator (port 8080)
- ✅ Auth emulator (port 9099)

**Note:** BigQuery and Document AI will use real services (emulators don't support them)

---

## Step 6: Test Frontend Locally

### In a NEW terminal:
```powershell
cd frontend
npm run dev
```

Frontend should open at: http://localhost:3000

---

## Step 7: End-to-End Testing Checklist

### Test 1: Authentication
- [ ] Open http://localhost:3000
- [ ] Click "Sign Up"
- [ ] Create account with email/password
- [ ] Verify you're logged in

### Test 2: Upload Report
- [ ] Click "Upload Report" or drag PDF
- [ ] Upload a medical report PDF
- [ ] Wait for processing
- [ ] Check console for Document AI extraction logs

### Test 3: Verify Data Storage

**Check Firestore:**
```powershell
# Go to Firebase Console
https://console.firebase.google.com/project/medical-scanner-app/firestore
# Navigate to: users/{userId}/reports/{reportId}
# Should see: extractedData, pdfPath, reportDate, status
```

**Check BigQuery:**
```sql
-- Run in BigQuery Console
SELECT * FROM `medical_reports.lab_results` 
ORDER BY created_at DESC 
LIMIT 10;
```

### Test 4: AI Analysis
- [ ] Click "Get AI Explanation" on uploaded report
- [ ] Verify Gemini API processes the data
- [ ] Check for medical insights and trend analysis
- [ ] Ensure safety guardrails work (no diagnosis/treatment advice)

---

## Step 8: Verify Complete Data Flow

```
User Upload PDF
    ↓
Firebase Storage (PDF saved)
    ↓
Document AI (Extract structured data)
    ↓
BigQuery (Store lab results) ✅
    ↓
Firestore (Save report metadata) ✅
    ↓
Gemini API (Generate insights) ✅
    ↓
Frontend (Display results)
```

---

## Common Issues & Solutions

### Issue: "Document AI Processor not found"
**Solution:** 
- Verify `DOCUMENT_AI_PROCESSOR_ID` in `functions/src/.env`
- Check processor exists in https://console.cloud.google.com/ai/document-ai

### Issue: "BigQuery table not found"
**Solution:**
- Run the schema SQL in BigQuery console
- Verify dataset name is exactly `medical_reports`

### Issue: "Gemini API error"
**Solution:**
- Check `GEMINI_API_KEY` is valid
- Enable Gemini API in Google Cloud Console
- Verify API key has correct permissions

### Issue: "Permission denied on Firestore"
**Solution:**
```powershell
firebase deploy --only firestore:rules
```

---

## Next Steps After Testing

Once all tests pass:
1. ✅ Move to Phase 3: Deployment
2. ✅ Deploy Cloud Functions to production
3. ✅ Build and deploy frontend to Firebase Hosting
4. ✅ Get public MVP URL

---

## Phase 2 Completion Criteria

- [x] BigQuery dataset created
- [x] Schema tables and views deployed
- [x] Firestore rules deployed
- [x] Local testing completed
- [x] End-to-end flow verified
- [x] All services integrated properly

**When all checkboxes are complete, Phase 2 is done! ✅**

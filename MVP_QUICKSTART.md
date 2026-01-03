# 🚀 Quick Start - Medical Report Scanner MVP

**Get your MVP running in minutes!**

---

## 🎯 What This Does

Translates medical lab reports (blood tests, etc.) from medical jargon into plain language that anyone can understand using AI.

**Tech Stack:** React + Firebase + Document AI + BigQuery + Gemini AI

---

## ⚡ Fast Track to Production

### Step 1: Prerequisites
- ✅ Node.js 18+ installed
- ✅ Firebase project created (`medical-scanner-app`)
- ✅ Environment files configured (.env files)

### Step 2: Run Setup Script
```powershell
.\setup.ps1
```

This will:
- Install all dependencies
- Verify environment configuration
- Give you options to test locally or deploy

### Step 3: Deploy
Choose option **2** when prompted, or run:
```powershell
.\deploy.ps1
```

**That's it! Your MVP will be live at:**  
🌐 `https://medical-scanner-app.web.app`

---

## 🧪 Test Locally First

### Option 1: Use Setup Script
```powershell
.\setup.ps1
# Choose option 1: Test locally
```

### Option 2: Manual
```powershell
# Terminal 1 - Backend
firebase emulators:start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit: http://localhost:3000

---

## 📋 What's Been Fixed

✅ **Gemini AI Integration** - SDK properly imported and configured  
✅ **Firestore Save** - Reports saved after Document AI extraction  
✅ **Environment Config** - All .env files properly loaded  
✅ **CORS Setup** - Works in local and production  
✅ **Production Build** - Frontend builds correctly  
✅ **Deployment Ready** - Firebase Hosting configured  

---

## 🔑 Required Setup (Before Deploy)

### 1. BigQuery Dataset
```
1. Go to: https://console.cloud.google.com/bigquery
2. Create dataset: medical_reports
3. Run SQL from: bigquery/schema.sql
```

### 2. Document AI Processor
```
Already configured: d4b9082bc4d72837
Location: us
```

### 3. Firebase Services
```
✅ Authentication (Email + Google)
✅ Firestore Database
✅ Cloud Storage
✅ Cloud Functions
✅ Hosting
```

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `setup.ps1` | Automated setup & deployment |
| `deploy.ps1` | Quick deployment script |
| `PHASE_1_COMPLETION.md` | Code fixes report |
| `PHASE_2_GUIDE.md` | Testing instructions |
| `PHASE_3_DEPLOYMENT.md` | Detailed deployment guide |
| `PROJECT_COMPLETION.md` | Complete project summary |

---

## 🌐 Production URLs

**Frontend:**  
https://medical-scanner-app.web.app  
https://medical-scanner-app.firebaseapp.com

**API:**  
https://us-central1-medical-scanner-app.cloudfunctions.net/api

---

## 🔄 Complete User Flow

```
1. User signs up/logs in
   ↓
2. Uploads medical report PDF
   ↓
3. Document AI extracts lab values
   ↓
4. Data saved to BigQuery + Firestore
   ↓
5. User clicks "Get AI Explanation"
   ↓
6. Gemini AI analyzes trends & creates insights
   ↓
7. Plain-language explanation displayed
   ↓
8. Charts show historical trends
```

---

## 🛠️ Troubleshooting

**Build fails?**
```powershell
cd frontend
npm install
npm run build
```

**Deploy fails?**
```powershell
firebase login
firebase use medical-scanner-app
firebase deploy
```

**Functions error?**
- Check `functions/src/.env` has all variables
- Verify Firebase CLI is logged in
- Check Node version: `node --version` (need 18+)

---

## 📚 Full Documentation

For detailed guides, see:
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Comprehensive setup
- [PHASE_3_DEPLOYMENT.md](PHASE_3_DEPLOYMENT.md) - Deployment details
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues

---

## ✅ All Systems Ready

- ✅ Phase 1: Code Fixes Complete
- ✅ Phase 2: Testing Guide Ready
- ✅ Phase 3: Deployment Scripts Ready
- ✅ Phase 4: Automation Complete

**Your MVP is ready to ship! 🎉**

```powershell
.\deploy.ps1
```

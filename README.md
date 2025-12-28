# AI Medical Report Interpreter

A comprehensive web application that helps non-medical users understand their lab reports through structured data extraction, trend analysis, and AI-powered explanations—without providing diagnosis or treatment advice.

## ⚠️ Important Disclaimer

**This tool explains what your lab values mean but does NOT:**
- ✗ Diagnose medical conditions
- ✗ Recommend treatments
- ✗ Replace your doctor's judgment

**✓ Always discuss your results with your healthcare provider**
**✓ Seek immediate care for urgent symptoms**

## Features

- 🔐 **Secure Authentication**: Firebase Auth with email/password and Google OAuth
- 📄 **Document Upload**: Drag-and-drop PDF lab report uploads
- 🤖 **AI-Powered Extraction**: Google Document AI for structured data extraction
- 📊 **Trend Analysis**: BigQuery-powered historical trend tracking
- 💡 **AI Explanations**: Gemini 2.0 Flash for plain-language explanations
- 🔒 **Safety Guardrails**: Built-in protection against diagnosis/treatment language
- 📈 **Visualizations**: Interactive charts showing test trends over time
- 🔄 **Report Comparison**: Side-by-side comparison of multiple reports

## Tech Stack

### Frontend
- React 18
- Vite
- Firebase SDK (Auth, Firestore, Storage)
- Recharts for data visualization
- React Router for navigation

### Backend
- Google Cloud Functions (Node.js)
- Google Document AI
- BigQuery (data warehouse)
- Google Gemini 2.0 Flash
- Firebase Admin SDK

## Project Structure

```
medical-report-interpreter/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Signup.jsx
│   │   │   │   └── Auth.css
│   │   │   ├── Upload/
│   │   │   │   ├── ReportUploader.jsx
│   │   │   │   ├── UploadProgress.jsx
│   │   │   │   └── Upload.css
│   │   │   ├── Dashboard/
│   │   │   │   ├── ReportsList.jsx
│   │   │   │   ├── ReportViewer.jsx
│   │   │   │   ├── TestCard.jsx
│   │   │   │   ├── TrendChart.jsx
│   │   │   │   └── Dashboard.css
│   │   │   └── Analysis/
│   │   │       ├── ExplanationView.jsx
│   │   │       ├── TrendInsights.jsx
│   │   │       ├── ComparisonView.jsx
│   │   │       └── Analysis.css
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Dashboard.css
│   │   ├── config/
│   │   │   └── firebase.js
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── functions/
│   ├── src/
│   │   ├── index.js
│   │   ├── extractLabData.js
│   │   ├── analyzeReport.js
│   │   ├── getTrends.js
│   │   ├── compareReports.js
│   │   └── safetyGuardrails.js
│   └── package.json
├── bigquery/
│   └── schema.sql
├── config/
│   └── document-ai-config.json
├── firebase.json
├── firestore.rules
├── storage.rules
└── README.md
```

## Quick Links

- 📖 **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete step-by-step setup instructions
- 🚀 **[QUICK_START.md](QUICK_START.md)** - Fast setup for beginners
- 🔧 **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- 📁 **[FILE_ORGANIZATION.md](FILE_ORGANIZATION.md)** - Detailed file structure

## Setup Instructions

**New to the project?** Start with [QUICK_START.md](QUICK_START.md) for the fastest path to a working app.

**Need detailed setup?** See [SETUP_GUIDE.md](SETUP_GUIDE.md) for comprehensive instructions.

### Prerequisites

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud account with billing enabled
- Firebase project

### 1. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and Google)
3. Create Firestore database
4. Create Storage bucket
5. Install Firebase CLI: `npm install -g firebase-tools`
6. Login: `firebase login`
7. Initialize project: `firebase init`

### 2. Google Cloud Setup

1. Enable the following APIs in Google Cloud Console:
   - Document AI API
   - BigQuery API
   - Cloud Functions API

2. Create a Document AI processor:
   - Go to Document AI Console
   - Create a Form Parser Processor
   - Note the Processor ID

3. Create BigQuery dataset:
   ```bash
   bq mk --dataset medical_reports
   ```

4. Run the schema SQL:
   ```bash
   bq query --use_legacy_sql=false < bigquery/schema.sql
   ```

### 3. Environment Variables

#### Frontend (.env file in `frontend/` directory)

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_CLOUD_FUNCTIONS_URL=https://your-region-your-project.cloudfunctions.net/api
```

#### Backend (Firebase Functions config)

```bash
firebase functions:config:set \
  gcp.project_id="your-project-id" \
  document_ai.processor_id="your-processor-id" \
  document_ai.location="us" \
  bigquery.dataset="medical_reports" \
  gemini.api_key="your-gemini-api-key"
```

Or set environment variables directly:
```bash
firebase functions:config:set gemini.api_key="your-api-key"
```

### 4. Install Dependencies

#### Frontend
```bash
cd frontend
npm install
```

#### Backend
```bash
cd functions
npm install
```

### 5. Deploy

#### Deploy Cloud Functions
```bash
firebase deploy --only functions
```

#### Deploy Frontend
```bash
cd frontend
npm run build
cd ..
firebase deploy --only hosting
```

#### Deploy Security Rules
```bash
firebase deploy --only firestore:rules,storage
```

### 6. Local Development

#### Frontend
```bash
cd frontend
npm run dev
```

#### Backend (Emulator)
```bash
firebase emulators:start
```

## Usage

1. **Sign Up/Login**: Create an account or sign in with Google
2. **Upload Report**: Drag and drop a PDF lab report
3. **View Results**: See extracted test values with color-coded status
4. **Get Explanation**: Click "Get AI Explanation" for plain-language insights
5. **View Trends**: See historical trends for specific tests
6. **Compare Reports**: Select multiple reports to compare side-by-side

## Safety Features

- **Keyword Blocking**: Automatically removes diagnosis/treatment language
- **Disclaimer**: Every AI response includes safety disclaimer
- **Rate Limiting**: 10 requests per minute per user
- **Authentication**: All endpoints require valid Firebase Auth token
- **User Isolation**: Users can only access their own data

## API Endpoints

All endpoints require Firebase Auth Bearer token.

### POST /processReport
Process a PDF lab report and extract structured data.

**Request:**
```json
{
  "pdfUri": "gs://bucket/path/to/file.pdf",
  "userId": "user_123"
}
```

### POST /analyzeReport
Generate AI-powered explanation for a report.

**Request:**
```json
{
  "reportId": "report_123"
}
```

### POST /getTrends
Get historical trends for a specific test.

**Request:**
```json
{
  "userId": "user_123",
  "testName": "Hemoglobin"
}
```

### POST /compareReports
Compare multiple reports side-by-side.

**Request:**
```json
{
  "reportIds": ["report_1", "report_2"]
}
```

## Testing Checklist

- [ ] Upload various lab report formats (Quest, LabCorp, hospital labs)
- [ ] Verify data extraction accuracy (>95% for standard formats)
- [ ] Test trend calculations with synthetic historical data
- [ ] Validate safety guardrails block diagnosis language
- [ ] Check responsive design on mobile devices
- [ ] Verify authentication and authorization
- [ ] Load test Cloud Functions (100 concurrent users)
- [ ] Confirm HIPAA compliance considerations (encryption at rest/transit)

## Security Considerations

- All data encrypted in transit (HTTPS)
- Firebase Storage encryption at rest
- BigQuery encryption at rest
- User data isolation via Firestore security rules
- Rate limiting to prevent abuse
- No PII stored in logs

## Troubleshooting

### Document AI not extracting data correctly
- Verify processor ID is correct
- Check processor is trained for lab report format
- Review Document AI response format

### BigQuery errors
- Verify dataset and table exist
- Check service account permissions
- Ensure schema matches expected format

### Gemini API errors
- Verify API key is set correctly
- Check API quota limits
- Review prompt format

## Contributing

This is a production application. Please ensure:
- All safety guardrails are maintained
- No diagnosis/treatment language in code or responses
- Proper error handling
- Security best practices

## License

This project is for educational purposes. Ensure compliance with healthcare regulations (HIPAA, etc.) before production use.

## Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Complete setup with all configurations
- **[QUICK_START.md](QUICK_START.md)** - Fast setup for beginners
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Solutions to common problems
- **[FILE_ORGANIZATION.md](FILE_ORGANIZATION.md)** - Project structure explained

## Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) first
2. Review [SETUP_GUIDE.md](SETUP_GUIDE.md) for configuration
3. Check official documentation:
   - [Firebase Documentation](https://firebase.google.com/docs)
   - [Document AI Documentation](https://cloud.google.com/document-ai/docs)
   - [BigQuery Documentation](https://cloud.google.com/bigquery/docs)
   - [Gemini API Documentation](https://ai.google.dev/docs)


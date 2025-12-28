# File Organization Structure

## Complete Project File Tree

```
medical-report-interpreter/
│
├── .gitignore                          # Git ignore rules
├── README.md                            # Main project documentation
├── FILE_ORGANIZATION.md                 # This file - file structure documentation
├── firebase.json                        # Firebase configuration
├── firestore.rules                      # Firestore security rules
├── storage.rules                        # Firebase Storage security rules
│
├── frontend/                            # React Frontend Application
│   ├── package.json                     # Frontend dependencies
│   ├── vite.config.js                   # Vite build configuration
│   ├── index.html                      # HTML entry point
│   ├── .env.example                    # Environment variables template
│   │
│   ├── public/                         # Static assets
│   │   └── favicon.ico                 # Site favicon
│   │
│   └── src/                            # Source code
│       ├── main.jsx                    # React entry point
│       ├── App.jsx                     # Main App component with routing
│       ├── App.css                     # Global app styles
│       │
│       ├── config/                     # Configuration files
│       │   └── firebase.js            # Firebase SDK initialization
│       │
│       ├── utils/                      # Utility functions
│       │   └── api.js                 # API client for Cloud Functions
│       │
│       ├── components/                 # React components
│       │   │
│       │   ├── Auth/                   # Authentication components
│       │   │   ├── Login.jsx          # Login form component
│       │   │   ├── Signup.jsx         # Signup form component
│       │   │   └── Auth.css           # Auth component styles
│       │   │
│       │   ├── Upload/                 # File upload components
│       │   │   ├── ReportUploader.jsx # Main upload component with drag-drop
│       │   │   ├── UploadProgress.jsx # Upload progress indicator
│       │   │   └── Upload.css         # Upload component styles
│       │   │
│       │   ├── Dashboard/             # Dashboard components
│       │   │   ├── ReportsList.jsx    # List of all user reports
│       │   │   ├── ReportViewer.jsx   # Individual report viewer
│       │   │   ├── TestCard.jsx       # Individual test result card
│       │   │   ├── TrendChart.jsx     # Trend visualization component
│       │   │   └── Dashboard.css      # Dashboard component styles
│       │   │
│       │   └── Analysis/              # Analysis components
│       │       ├── ExplanationView.jsx # AI explanation display
│       │       ├── TrendInsights.jsx   # Trend insights component
│       │       ├── ComparisonView.jsx  # Report comparison component
│       │       └── Analysis.css        # Analysis component styles
│       │
│       └── pages/                     # Page components
│           ├── Dashboard.jsx          # Main dashboard page
│           └── Dashboard.css          # Dashboard page styles
│
├── functions/                          # Cloud Functions Backend
│   ├── package.json                    # Backend dependencies
│   ├── .eslintrc.js                   # ESLint configuration
│   ├── .gitignore                     # Functions-specific gitignore
│   ├── index.js                       # Placeholder (actual code in src/)
│   │
│   └── src/                           # Source code
│       ├── index.js                   # Main Express app & function exports
│       ├── extractLabData.js          # Document AI extraction function
│       ├── analyzeReport.js           # Gemini AI analysis function
│       ├── getTrends.js               # BigQuery trend analysis function
│       ├── compareReports.js          # Report comparison function
│       └── safetyGuardrails.js        # Safety filtering middleware
│
├── bigquery/                          # BigQuery schemas
│   └── schema.sql                     # Database schema and views
│
└── config/                            # Configuration files
    └── document-ai-config.json        # Document AI processor config
```

## File Descriptions

### Root Level Files

- **README.md**: Complete project documentation with setup instructions
- **FILE_ORGANIZATION.md**: This file - detailed file structure
- **firebase.json**: Firebase project configuration (hosting, functions, storage)
- **firestore.rules**: Security rules for Firestore database
- **storage.rules**: Security rules for Firebase Storage
- **.gitignore**: Git ignore patterns for the entire project

### Frontend Files (`frontend/`)

#### Configuration
- **package.json**: React, Vite, Firebase SDK, Recharts dependencies
- **vite.config.js**: Vite build tool configuration
- **index.html**: HTML entry point for React app
- **.env.example**: Template for environment variables

#### Source Code (`frontend/src/`)

**Core Files:**
- **main.jsx**: React DOM rendering entry point
- **App.jsx**: Main application component with routing and auth state
- **App.css**: Global application styles

**Configuration (`config/`):**
- **firebase.js**: Firebase SDK initialization (Auth, Firestore, Storage)

**Utilities (`utils/`):**
- **api.js**: Axios-based API client for Cloud Functions with auth interceptors

**Components (`components/`):**

*Auth Components:*
- **Login.jsx**: Email/password and Google OAuth login
- **Signup.jsx**: User registration with profile data
- **Auth.css**: Authentication form styles

*Upload Components:*
- **ReportUploader.jsx**: Drag-and-drop PDF upload with Firebase Storage
- **UploadProgress.jsx**: Upload progress indicator
- **Upload.css**: Upload component styles

*Dashboard Components:*
- **ReportsList.jsx**: Displays all user reports with status
- **ReportViewer.jsx**: Individual report viewer with test results
- **TestCard.jsx**: Individual test result card with status indicators
- **TrendChart.jsx**: Recharts-based trend visualization
- **Dashboard.css**: Dashboard component styles

*Analysis Components:*
- **ExplanationView.jsx**: AI explanation display with tabs
- **TrendInsights.jsx**: Trend analysis insights
- **ComparisonView.jsx**: Side-by-side report comparison
- **Analysis.css**: Analysis component styles

**Pages (`pages/`):**
- **Dashboard.jsx**: Main dashboard page with navigation
- **Dashboard.css**: Dashboard page layout styles

### Backend Files (`functions/`)

#### Configuration
- **package.json**: Cloud Functions dependencies (Firebase Admin, Document AI, BigQuery, Gemini)
- **.eslintrc.js**: ESLint configuration for Node.js
- **.gitignore**: Functions-specific ignore patterns

#### Source Code (`functions/src/`)

- **index.js**: Express app setup, auth middleware, rate limiting, route handlers
- **extractLabData.js**: Document AI processing and BigQuery storage
- **analyzeReport.js**: Gemini AI explanation generation with trend analysis
- **getTrends.js**: BigQuery queries for historical trends
- **compareReports.js**: Multi-report comparison logic
- **safetyGuardrails.js**: Safety filtering for AI responses

### Database Files (`bigquery/`)

- **schema.sql**: BigQuery table schema, indexes, and views for trend analysis

### Configuration Files (`config/`)

- **document-ai-config.json**: Document AI processor configuration template

## Key File Relationships

### Data Flow

1. **Upload Flow:**
   - `ReportUploader.jsx` → Firebase Storage → `extractLabData.js` → BigQuery → Firestore

2. **Analysis Flow:**
   - `ReportViewer.jsx` → `analyzeReport.js` → `getTrends.js` → `analyzeReport.js` → Gemini → `safetyGuardrails.js` → Frontend

3. **Trend Flow:**
   - `TrendChart.jsx` → `getTrends.js` → BigQuery → Frontend

### Authentication Flow

- `Login.jsx` / `Signup.jsx` → Firebase Auth → `App.jsx` → `Dashboard.jsx`
- All API calls: `api.js` → Auth token → Cloud Functions `verifyAuth` middleware

### Component Hierarchy

```
App.jsx
├── Login.jsx / Signup.jsx (if not authenticated)
└── Dashboard.jsx (if authenticated)
    ├── ReportUploader.jsx
    ├── ReportsList.jsx
    ├── ReportViewer.jsx
    │   ├── TestCard.jsx
    │   └── ExplanationView.jsx
    └── ComparisonView.jsx
```

## Environment Variables

### Frontend (`.env` in `frontend/`)
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_CLOUD_FUNCTIONS_URL`

### Backend (Firebase Functions Config)
- `GCP_PROJECT_ID`
- `DOCUMENT_AI_PROCESSOR_ID`
- `DOCUMENT_AI_LOCATION`
- `BIGQUERY_DATASET`
- `GEMINI_API_KEY`

## Deployment Files

- **firebase.json**: Defines what gets deployed (hosting, functions, rules)
- **firestore.rules**: Deployed with `firebase deploy --only firestore:rules`
- **storage.rules**: Deployed with `firebase deploy --only storage`

## Security Files

- **firestore.rules**: User data isolation rules
- **storage.rules**: File access control rules
- **safetyGuardrails.js**: AI response filtering
- **index.js**: Authentication middleware and rate limiting


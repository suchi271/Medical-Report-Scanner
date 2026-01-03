require('dotenv').config({ path: __dirname + '/.env' });

const { BigQuery } = require("@google-cloud/bigquery");
const bigquery = new BigQuery({ projectId: process.env.GCP_PROJECT_ID || "medical-scanner-app" });

const DATASET_ID = process.env.BIGQUERY_DATASET || "medical_reports";
const TABLE_ID = "lab_results";

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");



admin.initializeApp();

// NOTE: We use production Storage even when testing locally
// because the Storage emulator has issues with the Admin SDK download method

const app = express();
app.use(express.json());
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
app.options("*", cors());
// ---------- Auth ----------
const verifyAuth = async (req, res, next) => {
  try {
    if (req.method === "OPTIONS") return next();

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split("Bearer ")[1];
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch (e) {
    console.error("Auth error:", e);
    res.status(401).json({ error: "Unauthorized" });
  }
};

app.use(verifyAuth);

// ---------- Routes ----------
app.post("/processReport", require("./extractLabData"));
app.post("/analyzeReport", require("./analyzeReport"));
app.post("/getTrends", require("./getTrends"));
app.post("/compareReports", require("./compareReports"));

// ---------- READ REPORT DATA ----------
app.get("/getReportData", async (req, res) => {
  try {
    const userId = req.user.uid;
    const reportId = req.query.reportId;

    if (!reportId) {
      return res.status(400).json({ error: "reportId required" });
    }

    const query = `
      SELECT
        report_id,
        report_date,
        test_name,
        value,
        unit,
        reference_min,
        reference_max,
        status
      FROM \`${DATASET_ID}.${TABLE_ID}\`
      WHERE user_id = @userId
      AND report_id = @reportId
      ORDER BY test_name
    `;

    

    const [rows] = await bigquery.query({
      query,
      params: { userId, reportId },
    });


    res.json(rows);
  } catch (err) {
    console.error("BigQuery read error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- Export ----------
exports.api = functions.https.onRequest((req, res) => {
  cors({
    origin: [
      "http://localhost:3000",
      "https://medical-scanner-app.web.app",
      "https://medical-scanner-app.firebaseapp.com"
    ],
    credentials: true,
  })(req, res, () => app(req, res));
});

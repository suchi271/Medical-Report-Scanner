const { BigQuery } = require("@google-cloud/bigquery");
const bigquery = new BigQuery({ projectId: "medical-scanner-app" });

const DATASET_ID = "medical_reports";
const TABLE_ID = "lab_results";

const { DocumentProcessorServiceClient } = require("@google-cloud/documentai");
const admin = require("firebase-admin");

// ---------- Document AI Client ----------
const documentaiClient = new DocumentProcessorServiceClient({
  apiEndpoint: "us-documentai.googleapis.com",
});

// ---------- Config ----------
const PROCESSOR_ID = process.env.DOCUMENT_AI_PROCESSOR_ID;
const PROJECT_ID = "medical-scanner-app";
const LOCATION = "us";

/* =========================
   MAIN CLOUD FUNCTION
========================= */
module.exports = async (req, res) => {
  try {
    const { pdfUri, userId } = req.body;
    const authenticatedUserId = req.user.uid;

    if (userId !== authenticatedUserId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (!pdfUri) {
      return res.status(400).json({ error: "pdfUri is required" });
    }

    // ---------- Resolve Firebase Storage path ----------
    let filePath = pdfUri;

    if (pdfUri.startsWith("gs://")) {
      filePath = pdfUri.replace(/^gs:\/\//, "");
    } else if (pdfUri.startsWith("https://")) {
      const url = new URL(pdfUri);
      const match = url.pathname.match(/\/o\/(.+)/);
      if (!match) {
        throw new Error(`Invalid Firebase Storage URL: ${pdfUri}`);
      }
      filePath = decodeURIComponent(match[1]);
    }

    // ---------- Download PDF ----------
    const bucket = admin.storage().bucket();
    const file = bucket.file(filePath);
    const [fileBuffer] = await file.download();

    // ---------- Document AI ----------
    const name = `projects/${PROJECT_ID}/locations/${LOCATION}/processors/${PROCESSOR_ID}`;

    const request = {
      name,
      rawDocument: {
        content: fileBuffer,
        mimeType: "application/pdf",
      },
    };

    const [result] = await documentaiClient.processDocument(request);
    const document = result.document;
    const fullText = document?.text || "";

    console.log("===== DOCUMENT AI OCR TEXT START =====");
    console.log(fullText);
    console.log("===== DOCUMENT AI OCR TEXT END =====");

    // ---------- EXTRACT CBC TESTS ----------
    const tests = extractCBCFromText(fullText);
    console.log("Parsed tests:", JSON.stringify(tests, null, 2));

    // ---------- INSERT INTO BIGQUERY ----------
    let insertedCount = 0;
    const reportId = filePath.split("/").pop().replace(".pdf", "");
    if (tests.length > 0) {
      const rowsToInsert = tests.map((test) => ({

        report_id: reportId,

        user_id: userId,
        report_date: new Date().toISOString().split("T")[0],
        test_name: test.test_name,
        value: test.value,
        unit: test.unit,
        reference_min: test.reference_range.min,
        reference_max: test.reference_range.max,
        status: test.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      await bigquery
        .dataset(DATASET_ID)
        .table(TABLE_ID)
        .insert(rowsToInsert);

      insertedCount = rowsToInsert.length;
      console.log(`✅ Inserted ${insertedCount} rows into BigQuery`);
    }

    return res.json({
      status: "completed",
      reportDate: new Date().toISOString(),
      tests,
      debug: {
        extractedCount: tests.length,
        insertedCount,
      },
    });
  } catch (error) {
    console.error("Error processing report:", error);
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/* =========================
   ROBUST CBC EXTRACTION
========================= */
function extractCBCFromText(text) {
  if (!text) return [];

  const lines = text
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const TESTS = [
    {
      name: "Hemoglobin",
      keywords: ["hemoglobin", "hb"],
      unit: "g/dL",
      ref: { min: 13.0, max: 17.0 },
    },
    {
      name: "RBC Count",
      keywords: ["total rbc", "rbc count"],
      unit: "mill/cumm",
      ref: { min: 4.5, max: 5.5 },
    },
    {
      name: "Packed Cell Volume",
      keywords: ["packed cell volume", "pcv"],
      unit: "%",
      ref: { min: 40, max: 50 },
    },
    {
      name: "MCV",
      keywords: ["mean corpuscular volume", "mcv"],
      unit: "fL",
      ref: { min: 83, max: 101 },
    },
    {
      name: "Platelet Count",
      keywords: ["platelet count"],
      unit: "cells/cumm",
      ref: { min: 150000, max: 410000 },
    },
  ];

  const results = [];
  const seenTests = new Set(); // ✅ DEDUPE KEY

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();

    for (const test of TESTS) {
      if (seenTests.has(test.name)) continue; // ✅ skip duplicates

      if (test.keywords.some(k => line.includes(k))) {
        for (let j = i + 1; j <= i + 3 && j < lines.length; j++) {
          const match = lines[j].match(/(\d+(\.\d+)?)/);
          if (match) {
            const value = parseFloat(match[1]);

            let status = "normal";
            if (value < test.ref.min) status = "low";
            if (value > test.ref.max) status = "high";

            results.push({
              test_name: test.name,
              value,
              unit: test.unit,
              reference_range: test.ref,
              status,
            });

            seenTests.add(test.name); // ✅ mark as captured
            break;
          }
        }
      }
    }
  }

  return results;
}


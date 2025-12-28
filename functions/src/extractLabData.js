const { DocumentProcessorServiceClient } = require('@google-cloud/documentai');
const admin = require('firebase-admin');

// ---------- Safe Firebase Admin Init ----------
if (!admin.apps.length) {
  admin.initializeApp();
}

// ---------- Document AI Client ----------
const documentaiClient = new DocumentProcessorServiceClient({
  apiEndpoint: 'us-documentai.googleapis.com',
});

// ---------- Config ----------
const PROCESSOR_ID = process.env.DOCUMENT_AI_PROCESSOR_ID;
const PROJECT_ID = 'medical-scanner-app';
const LOCATION = 'us';

/* =========================
   MAIN CLOUD FUNCTION
========================= */
module.exports = async (req, res) => {
  try {
    const { pdfUri, userId } = req.body;
    const authenticatedUserId = req.user.uid;

    if (userId !== authenticatedUserId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!pdfUri) {
      return res.status(400).json({ error: 'pdfUri is required' });
    }

    // ---------- Resolve Firebase Storage path ----------
    let filePath = pdfUri;

    if (pdfUri.startsWith('gs://')) {
      filePath = pdfUri.replace(/^gs:\/\//, '');
    } else if (pdfUri.startsWith('https://')) {
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
        mimeType: 'application/pdf',
      },
    };

    const [result] = await documentaiClient.processDocument(request);
    const document = result.document;
    const fullText = document?.text || '';

    // ---------- DEBUG OCR OUTPUT ----------
    console.log('===== DOCUMENT AI OCR TEXT START =====');
    console.log(fullText);
    console.log('===== DOCUMENT AI OCR TEXT END =====');

    // ---------- EXTRACT CBC TESTS ----------
    const tests = extractCBCFromText(fullText);

    // ---------- SAFE RESPONSE (DO NOT BREAK FRONTEND) ----------
    return res.json({
      status: 'completed',
      reportDate: new Date().toISOString(),
      tests,

      // Optional debug (safe to ignore in UI)
      debug: {
        extractedCount: tests.length,
      },
    });

  } catch (error) {
    console.error('Error processing report:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

/* =========================
   CBC EXTRACTION LOGIC
========================= */
function extractCBCFromText(text) {
  if (!text) return [];

  const lines = text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const tests = [];

  const patterns = [
    {
      name: 'Hemoglobin',
      regex: /Hemoglobin.*?(\d+(\.\d+)?)/i,
      unit: 'g/dL',
      ref: { min: 13.0, max: 17.0 },
    },
    {
      name: 'RBC Count',
      regex: /Total RBC count.*?(\d+(\.\d+)?)/i,
      unit: 'mill/cumm',
      ref: { min: 4.5, max: 5.5 },
    },
    {
      name: 'Packed Cell Volume',
      regex: /Packed Cell Volume.*?(\d+(\.\d+)?)/i,
      unit: '%',
      ref: { min: 40, max: 50 },
    },
    {
      name: 'MCV',
      regex: /Mean Corpuscular Volume.*?(\d+(\.\d+)?)/i,
      unit: 'fL',
      ref: { min: 83, max: 101 },
    },
    {
      name: 'Platelet Count',
      regex: /Platelet Count.*?(\d+)/i,
      unit: 'cells/cumm',
      ref: { min: 150000, max: 410000 },
    },
  ];

  for (const pattern of patterns) {
    for (const line of lines) {
      const match = line.match(pattern.regex);
      if (match) {
        const value = parseFloat(match[1]);

        let status = 'normal';
        if (value < pattern.ref.min) status = 'low';
        if (value > pattern.ref.max) status = 'high';

        tests.push({
          test_name: pattern.name,
          value,
          unit: pattern.unit,
          reference_range: pattern.ref,
          status,
        });

        break;
      }
    }
  }

  return tests;
}

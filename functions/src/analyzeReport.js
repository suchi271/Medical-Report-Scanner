const { BigQuery } = require('@google-cloud/bigquery');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');
const enforceSafety = require('./safetyGuardrails');

const bigquery = new BigQuery();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const DATASET_ID = process.env.BIGQUERY_DATASET || 'medical_reports';
const MODEL_NAME = 'gemini-2.0-flash-exp';

module.exports = async (req, res) => {
  try {
    const { reportId } = req.body;
    const userId = req.user.uid;

    if (!reportId) {
      return res.status(400).json({ error: 'reportId is required' });
    }

    // Get report data from Firestore
    const reportDoc = await admin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('reports')
      .doc(reportId)
      .get();

    if (!reportDoc.exists) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const reportData = reportDoc.data();
    const extractedData = reportData.extractedData;

    if (!extractedData || !extractedData.tests) {
      return res.status(400).json({ error: 'Report data not available' });
    }

    // Get user context
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    const userContext = userDoc.exists ? userDoc.data() : {};

    // Get trend analysis
    const trendAnalysis = await getTrendAnalysis(userId, extractedData.tests);

    // Generate AI explanation
    const explanation = await generateExplanation(
      extractedData,
      trendAnalysis,
      userContext
    );

    // Apply safety guardrails
    const safeExplanation = enforceSafety(explanation);

    // Prepare response
    const analysis = {
      explanation: safeExplanation,
      trends: trendAnalysis.trends || [],
      insights: trendAnalysis.insights || [],
      report_date: extractedData.report_date,
      test_count: extractedData.tests.length
    };

    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing report:', error);
    res.status(500).json({ error: error.message });
  }
};

async function getTrendAnalysis(userId, currentTests) {
  const trends = [];
  const insights = [];

  for (const test of currentTests) {
    const query = `
      SELECT 
        test_name,
        report_date,
        value,
        reference_min,
        reference_max,
        LAG(value) OVER (PARTITION BY test_name ORDER BY report_date) as previous_value,
        value - LAG(value) OVER (PARTITION BY test_name ORDER BY report_date) as change
      FROM \`${DATASET_ID}.lab_results\`
      WHERE user_id = @userId 
        AND test_name = @testName
      ORDER BY report_date DESC
      LIMIT 5
    `;

    const options = {
      query,
      params: {
        userId,
        testName: test.test_name
      }
    };

    try {
      const [rows] = await bigquery.query(options);

      if (rows.length > 1) {
        const latest = rows[0];
        const previous = rows[1];

        if (previous.previous_value !== null) {
          const percentChange = ((latest.value - previous.previous_value) / previous.previous_value) * 100;
          
          trends.push({
            test_name: test.test_name,
            description: `Value changed from ${previous.previous_value.toFixed(2)} to ${latest.value.toFixed(2)}`,
            change: Math.abs(percentChange).toFixed(1),
            direction: percentChange > 0 ? 'increasing' : 'decreasing'
          });

          // Generate insights for significant changes
          if (Math.abs(percentChange) > 10) {
            insights.push({
              type: 'change',
              title: `Significant change in ${test.test_name}`,
              description: `Your ${test.test_name} has changed by ${Math.abs(percentChange).toFixed(1)}% since your last test. Consider discussing this with your healthcare provider.`
            });
          }
        }
      }

      // Check against personal baseline
      const baselineQuery = `
        SELECT 
          AVG(value) as personal_baseline,
          STDDEV(value) as variability
        FROM \`${DATASET_ID}.lab_results\`
        WHERE user_id = @userId 
          AND test_name = @testName
          AND report_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 YEAR)
      `;

      const baselineOptions = {
        query: baselineQuery,
        params: { userId, testName: test.test_name }
      };

      const [baselineRows] = await bigquery.query(baselineOptions);
      if (baselineRows.length > 0 && baselineRows[0].personal_baseline) {
        const baseline = baselineRows[0].personal_baseline;
        const variability = baselineRows[0].variability || 0;
        const currentValue = test.value;

        if (Math.abs(currentValue - baseline) > 2 * variability) {
          insights.push({
            type: 'baseline',
            title: `Unusual value for ${test.test_name}`,
            description: `Your current value (${currentValue}) differs significantly from your personal baseline (${baseline.toFixed(2)}). This may warrant discussion with your healthcare provider.`
          });
        }
      }
    } catch (error) {
      console.error(`Error analyzing trends for ${test.test_name}:`, error);
    }
  }

  return { trends, insights };
}

async function generateExplanation(structuredData, trendAnalysis, userContext) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const prompt = `
You are a medical educator explaining lab results to a patient. Use the following:

STRUCTURED LAB DATA:
${JSON.stringify(structuredData, null, 2)}

TREND ANALYSIS:
${JSON.stringify(trendAnalysis, null, 2)}

USER CONTEXT:
Age: ${userContext.age || 'Not provided'}, Gender: ${userContext.gender || 'Not provided'}

INSTRUCTIONS:
1. Explain what each test measures in simple terms
2. Interpret the value relative to the reference range
3. Highlight trends (improving, worsening, stable)
4. Identify significant changes from personal baseline
5. Suggest questions to ask the doctor (not advice)
6. Use analogies where helpful

NEVER:
- Diagnose conditions
- Recommend treatments or medications
- Say "you have [disease]"
- Give urgent medical advice

ALWAYS:
- Use plain language
- Acknowledge uncertainty
- Remind to consult doctor for medical decisions

Generate a clear, educational explanation of these lab results.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating explanation:', error);
    throw new Error('Failed to generate explanation');
  }
}


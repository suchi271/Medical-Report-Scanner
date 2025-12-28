const { BigQuery } = require('@google-cloud/bigquery');

const bigquery = new BigQuery();
const DATASET_ID = process.env.BIGQUERY_DATASET || 'medical_reports';

module.exports = async (req, res) => {
  try {
    const { userId, testName } = req.body;
    const authenticatedUserId = req.user.uid;

    // Verify userId matches authenticated user
    if (userId !== authenticatedUserId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (!testName) {
      return res.status(400).json({ error: 'testName is required' });
    }

    // Get trend data
    const trendQuery = `
      SELECT 
        report_date,
        value,
        unit,
        reference_min,
        reference_max,
        status,
        LAG(value) OVER (PARTITION BY test_name ORDER BY report_date) as previous_value,
        value - LAG(value) OVER (PARTITION BY test_name ORDER BY report_date) as change
      FROM \`${DATASET_ID}.lab_results\`
      WHERE user_id = @userId 
        AND test_name = @testName
      ORDER BY report_date ASC
    `;

    const trendOptions = {
      query: trendQuery,
      params: { userId, testName }
    };

    const [trendRows] = await bigquery.query(trendOptions);

    // Get baseline
    const baselineQuery = `
      SELECT 
        AVG(value) as personal_baseline,
        STDDEV(value) as variability,
        MIN(value) as min_value,
        MAX(value) as max_value,
        COUNT(*) as test_count,
        MIN(report_date) as first_test_date,
        MAX(report_date) as last_test_date
      FROM \`${DATASET_ID}.lab_results\`
      WHERE user_id = @userId 
        AND test_name = @testName
        AND report_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 YEAR)
    `;

    const baselineOptions = {
      query: baselineQuery,
      params: { userId, testName }
    };

    const [baselineRows] = await bigquery.query(baselineOptions);
    const baseline = baselineRows[0] || null;

    // Generate summary
    let summary = '';
    if (trendRows.length > 1) {
      const firstValue = trendRows[0].value;
      const lastValue = trendRows[trendRows.length - 1].value;
      const change = ((lastValue - firstValue) / firstValue) * 100;

      if (Math.abs(change) > 5) {
        summary = `Your ${testName} has ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(1)}% over time.`;
      } else {
        summary = `Your ${testName} has remained relatively stable over time.`;
      }
    }

    // Generate alerts for significant changes
    const alerts = [];
    trendRows.forEach((row, index) => {
      if (row.change !== null && Math.abs(row.change) > 10) {
        alerts.push({
          test_name: testName,
          severity: Math.abs(row.change) > 20 ? 'high' : 'medium',
          message: `Significant change detected: ${row.change > 0 ? 'increase' : 'decrease'} of ${Math.abs(row.change).toFixed(2)} from previous test.`
        });
      }
    });

    res.json({
      trends: trendRows,
      baseline: baseline,
      summary: summary,
      alerts: alerts
    });
  } catch (error) {
    console.error('Error getting trends:', error);
    res.status(500).json({ error: error.message });
  }
};


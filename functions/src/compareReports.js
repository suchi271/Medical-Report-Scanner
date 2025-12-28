const { BigQuery } = require('@google-cloud/bigquery');
const admin = require('firebase-admin');

const bigquery = new BigQuery();
const DATASET_ID = process.env.BIGQUERY_DATASET || 'medical_reports';

module.exports = async (req, res) => {
  try {
    const { reportIds } = req.body;
    const userId = req.user.uid;

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 report IDs are required' });
    }

    // Get report data from BigQuery
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
      FROM \`${DATASET_ID}.lab_results\`
      WHERE user_id = @userId 
        AND report_id IN UNNEST(@reportIds)
      ORDER BY report_date ASC, test_name ASC
    `;

    const options = {
      query,
      params: {
        userId,
        reportIds
      }
    };

    const [rows] = await bigquery.query(options);

    // Group by report_id
    const reportsMap = new Map();
    rows.forEach(row => {
      if (!reportsMap.has(row.report_id)) {
        reportsMap.set(row.report_id, {
          report_id: row.report_id,
          report_date: row.report_date,
          tests: []
        });
      }
      reportsMap.get(row.report_id).tests.push({
        test_name: row.test_name,
        value: row.value,
        unit: row.unit,
        reference_min: row.reference_min,
        reference_max: row.reference_max,
        status: row.status
      });
    });

    const reports = Array.from(reportsMap.values());

    // Create comparison table
    const allTestNames = new Set();
    reports.forEach(report => {
      report.tests.forEach(test => {
        allTestNames.add(test.test_name);
      });
    });

    const comparisons = Array.from(allTestNames).map(testName => {
      const values = reports.map(report => {
        const test = report.tests.find(t => t.test_name === testName);
        return test || null;
      });

      // Calculate change between first and last report
      const firstValue = values.find(v => v !== null);
      const lastValue = values[values.length - 1];
      let change = null;
      let changeUnit = '';

      if (firstValue && lastValue && firstValue.value !== lastValue.value) {
        change = lastValue.value - firstValue.value;
        changeUnit = lastValue.unit || '';
      }

      return {
        test_name: testName,
        values: values,
        change: change,
        unit: changeUnit
      };
    });

    res.json({
      reports: reports,
      comparisons: comparisons
    });
  } catch (error) {
    console.error('Error comparing reports:', error);
    res.status(500).json({ error: error.message });
  }
};


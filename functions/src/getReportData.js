const { BigQuery } = require("@google-cloud/bigquery");

const bigquery = new BigQuery();
const DATASET_ID = "medical_reports";
const TABLE_ID = "lab_results";

module.exports = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { reportId } = req.body;

    if (!reportId) {
      return res.status(400).json({ error: "reportId is required" });
    }

    const query = `
      SELECT *
      FROM \`${DATASET_ID}.${TABLE_ID}\`
      WHERE user_id = @userId
        AND report_id = @reportId
      ORDER BY test_name
    `;

    const options = {
      query,
      params: { userId, reportId },
    };

    const [rows] = await bigquery.query(options);

    return res.json(rows);
  } catch (error) {
    console.error("Error reading BigQuery:", error);
    return res.status(500).json({ error: error.message });
  }
};

const { BigQuery } = require('@google-cloud/bigquery');

const bigquery = new BigQuery();

async function testInsert() {
  const datasetId = "medical_reports";
  const tableId = "lab_results";

  const row = {
    report_id: "debug_test",
    user_id: "debug_user",
    report_date: "2026-01-02",
    test_name: "Hemoglobin",
    value: 13.4,
    unit: "g/dL",
    reference_min: 12,
    reference_max: 16,
    status: "normal",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await bigquery
    .dataset(datasetId)
    .table(tableId)
    .insert([row]);

  console.log("✅ BIGQUERY INSERT WORKED");
}

testInsert().catch(err => {
  console.error("❌ BIGQUERY INSERT FAILED", err);
});

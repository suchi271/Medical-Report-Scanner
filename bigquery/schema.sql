-- BigQuery Schema for Lab Results
-- Dataset: medical_reports
-- Table: lab_results

CREATE TABLE IF NOT EXISTS `medical_reports.lab_results` (
  report_id STRING NOT NULL,
  user_id STRING NOT NULL,
  report_date DATE NOT NULL,
  test_name STRING NOT NULL,
  value FLOAT64 NOT NULL,
  unit STRING,
  reference_min FLOAT64,
  reference_max FLOAT64,
  status STRING, -- 'normal', 'low', 'high', 'borderline'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY report_date
CLUSTER BY user_id, test_name;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_test 
ON `medical_reports.lab_results`(user_id, test_name, report_date);

-- View for trend analysis
CREATE OR REPLACE VIEW `medical_reports.trend_analysis` AS
SELECT 
  user_id,
  test_name,
  report_date,
  value,
  unit,
  reference_min,
  reference_max,
  status,
  LAG(value) OVER (PARTITION BY user_id, test_name ORDER BY report_date) as previous_value,
  value - LAG(value) OVER (PARTITION BY user_id, test_name ORDER BY report_date) as change,
  (value - LAG(value) OVER (PARTITION BY user_id, test_name ORDER BY report_date)) / 
    NULLIF(LAG(value) OVER (PARTITION BY user_id, test_name ORDER BY report_date), 0) * 100 as percent_change
FROM `medical_reports.lab_results`
ORDER BY user_id, test_name, report_date;

-- View for personal baselines
CREATE OR REPLACE VIEW `medical_reports.personal_baselines` AS
SELECT 
  user_id,
  test_name,
  AVG(value) as personal_baseline,
  STDDEV(value) as variability,
  MIN(value) as min_value,
  MAX(value) as max_value,
  COUNT(*) as test_count,
  MIN(report_date) as first_test_date,
  MAX(report_date) as last_test_date
FROM `medical_reports.lab_results`
WHERE report_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 2 YEAR)
GROUP BY user_id, test_name;


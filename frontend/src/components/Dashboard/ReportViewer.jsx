import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../config/firebase";
import { analyzeReport } from "../../utils/api";

import TestCard from "./TestCard";
import TrendChart from "./TrendChart";
import ExplanationView from "../Analysis/ExplanationView";

import "./Dashboard.css";

const ReportViewer = ({ userId, reportId }) => {
  const [report, setReport] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    loadReport();
    fetchBigQueryTests();
    // eslint-disable-next-line
  }, [userId, reportId]);

  // -------------------------
  // Load report metadata
  // -------------------------
  const loadReport = async () => {
    try {
      const snap = await getDoc(
        doc(db, "users", userId, "reports", reportId)
      );
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setReport(data);
        if (data.analysis) setAnalysis(data.analysis);
      }
    } catch (err) {
      console.error("Error loading report:", err);
    }
  };

  // -------------------------
  // Fetch BigQuery test data
  // -------------------------
  const fetchBigQueryTests = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();

      const res = await fetch(
  `http://localhost:5001/medical-scanner-app/us-central1/api/getReportData?reportId=${reportId}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);


      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("Expected array, got:", data);
        setTests([]);
        return;
      }

      setTests(data);
    } catch (err) {
      console.error("Error fetching BigQuery data:", err);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // AI Explanation
  // -------------------------
  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await analyzeReport(reportId);
      setAnalysis(result);
      await updateDoc(
        doc(db, "users", userId, "reports", reportId),
        { analysis: result }
      );
    } catch (err) {
      console.error("Analyze error:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  // -------------------------
  // UI
  // -------------------------
  if (loading) return <div className="loading">Loading report...</div>;
  if (!report) return <div className="error-message">Report not found</div>;

  return (
    <div className="report-viewer">
      <div className="report-header-section">
        <h2>{report.fileName || "Lab Report"}</h2>

        {report.reportDate && (
          <p className="report-date">
            Report Date: {new Date(report.reportDate).toLocaleDateString()}
          </p>
        )}

        {!analysis && (
          <button
            className="btn-primary"
            onClick={handleAnalyze}
            disabled={analyzing}
          >
            {analyzing ? "Analyzing..." : "Get AI Explanation"}
          </button>
        )}
      </div>

      {analysis && (
        <div className="safety-disclaimer">
          <strong>⚠️ IMPORTANT DISCLAIMER</strong>
          <p>This tool explains lab values but does NOT:</p>
          <ul>
            <li>✗ Diagnose conditions</li>
            <li>✗ Recommend treatments</li>
            <li>✗ Replace doctors</li>
          </ul>
        </div>
      )}

      <div className="tests-section">
        <h3>Test Results</h3>

        {tests.length === 0 ? (
          <p>No test data found for this report.</p>
        ) : (
          <div className="tests-grid">
            {tests.map((t, i) => (
              <TestCard
                key={i}
                test={{
                  test_name: t.test_name,
                  value: t.value,
                  unit: t.unit,
                  status: t.status,
                  reference_range: {
                    min: t.reference_min,
                    max: t.reference_max,
                  },
                }}
                onClick={() => setSelectedTest(t.test_name)}
                isActive={selectedTest === t.test_name}
              />
            ))}
          </div>
        )}
      </div>

      {selectedTest && (
        <TrendChart userId={userId} testName={selectedTest} />
      )}

      {analysis && (
        <ExplanationView
          analysis={analysis}
          selectedTest={selectedTest}
          onClose={() => setSelectedTest(null)}
        />
      )}
    </div>
  );
};

export default ReportViewer;

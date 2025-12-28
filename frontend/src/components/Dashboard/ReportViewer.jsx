import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { analyzeReport } from '../../utils/api';
import TestCard from './TestCard';
import ExplanationView from '../Analysis/ExplanationView';
import './Dashboard.css';

const ReportViewer = ({ userId, reportId }) => {
  const [report, setReport] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    loadReport();
  }, [userId, reportId]);

  const loadReport = async () => {
    try {
      const reportDoc = await getDoc(
        doc(db, 'users', userId, 'reports', reportId)
      );
      
      if (reportDoc.exists()) {
        const reportData = { id: reportDoc.id, ...reportDoc.data() };
        setReport(reportData);
        
        // Load analysis if available
        if (reportData.analysis) {
          setAnalysis(reportData.analysis);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading report:', error);
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await analyzeReport(reportId);
      setAnalysis(result);
      
      // Save analysis to Firestore
      await updateDoc(
        doc(db, 'users', userId, 'reports', reportId),
        { analysis: result }
      );
    } catch (error) {
      console.error('Error analyzing report:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading report...</div>;
  }

  if (!report) {
    return <div className="error-message">Report not found</div>;
  }

  const extractedData = report.extractedData || {};
  const tests = extractedData.tests || [];

  return (
    <div className="report-viewer">
      <div className="report-header-section">
        <h2>{report.fileName || 'Lab Report'}</h2>
        {report.reportDate && (
          <p className="report-date">
            Report Date: {new Date(report.reportDate).toLocaleDateString()}
          </p>
        )}
        {!analysis && (
          <button
            onClick={handleAnalyze}
            className="btn-primary"
            disabled={analyzing}
          >
            {analyzing ? 'Analyzing...' : 'Get AI Explanation'}
          </button>
        )}
      </div>

      {analysis && (
        <div className="safety-disclaimer">
          <strong>⚠️ IMPORTANT DISCLAIMER</strong>
          <p>
            This tool explains what your lab values mean but does NOT:
          </p>
          <ul>
            <li>✗ Diagnose medical conditions</li>
            <li>✗ Recommend treatments</li>
            <li>✗ Replace your doctor's judgment</li>
          </ul>
          <p>
            ✓ Always discuss your results with your healthcare provider
          </p>
        </div>
      )}

      <div className="tests-section">
        <h3>Test Results</h3>
        <div className="tests-grid">
          {tests.map((test, index) => (
            <TestCard
              key={index}
              test={test}
              onClick={() => setSelectedTest(test)}
            />
          ))}
        </div>
      </div>

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


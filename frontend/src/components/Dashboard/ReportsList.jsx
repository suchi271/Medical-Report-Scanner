import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { format } from 'date-fns';
import './Dashboard.css';

const ReportsList = ({ userId, onSelectReport }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'users', userId, 'reports'),
      orderBy('uploadDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReports(reportsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  if (reports.length === 0) {
    return (
      <div className="empty-state">
        <p>No reports yet. Upload your first lab report to get started.</p>
      </div>
    );
  }

  return (
    <div className="reports-list">
      <h2>Your Lab Reports</h2>
      <div className="reports-grid">
        {reports.map((report) => (
          <div
            key={report.id}
            className="report-card"
            onClick={() => onSelectReport(report.id)}
          >
            <div className="report-header">
              <h3>{report.fileName || 'Lab Report'}</h3>
              <span className={`status-badge ${report.status}`}>
                {report.status}
              </span>
            </div>
            <div className="report-info">
              <p>
                <strong>Uploaded:</strong>{' '}
                {report.uploadDate
                  ? format(report.uploadDate.toDate(), 'MMM dd, yyyy')
                  : 'N/A'}
              </p>
              {report.reportDate && (
                <p>
                  <strong>Report Date:</strong>{' '}
                  {format(report.reportDate.toDate?.() || new Date(report.reportDate), 'MMM dd, yyyy')}
                </p>
              )}
              {report.extractedData?.tests && (
                <p>
                  <strong>Tests:</strong> {report.extractedData.tests.length}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsList;


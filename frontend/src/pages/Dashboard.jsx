import { useState } from 'react';
import ReportUploader from '../components/Upload/ReportUploader';
import ReportsList from '../components/Dashboard/ReportsList';
import ReportViewer from '../components/Dashboard/ReportViewer';
import ComparisonView from '../components/Analysis/ComparisonView';
import './Dashboard.css';

const Dashboard = ({ userId }) => {
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [selectedReportIds, setSelectedReportIds] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'view', 'compare'

  const handleUploadComplete = (reportId) => {
    setSelectedReportId(reportId);
    setViewMode('view');
  };

  const handleSelectReport = (reportId) => {
    setSelectedReportId(reportId);
    setViewMode('view');
  };

  const handleCompareMode = () => {
    setViewMode('compare');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <div className="dashboard-sidebar">
          <div className="sidebar-section">
            <button
              onClick={() => setViewMode('list')}
              className={`sidebar-btn ${viewMode === 'list' ? 'active' : ''}`}
            >
              📋 All Reports
            </button>
            <button
              onClick={() => setViewMode('view')}
              className={`sidebar-btn ${viewMode === 'view' ? 'active' : ''}`}
              disabled={!selectedReportId}
            >
              📄 View Report
            </button>
            <button
              onClick={handleCompareMode}
              className={`sidebar-btn ${viewMode === 'compare' ? 'active' : ''}`}
            >
              🔄 Compare Reports
            </button>
          </div>
        </div>

        <div className="dashboard-main">
          {viewMode === 'list' && (
            <>
              <ReportUploader
                userId={userId}
                onUploadComplete={handleUploadComplete}
              />
              <ReportsList
                userId={userId}
                onSelectReport={handleSelectReport}
              />
            </>
          )}

          {viewMode === 'view' && selectedReportId && (
            <ReportViewer userId={userId} reportId={selectedReportId} />
          )}

          {viewMode === 'compare' && (
            <ComparisonView
              userId={userId}
              reportIds={selectedReportIds}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


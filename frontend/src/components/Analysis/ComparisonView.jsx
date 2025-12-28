import { useState } from 'react';
import { compareReports } from '../../utils/api';
import './Analysis.css';

const ComparisonView = ({ userId, reportIds }) => {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    if (reportIds.length < 2) {
      alert('Please select at least 2 reports to compare');
      return;
    }

    setLoading(true);
    try {
      const result = await compareReports(reportIds);
      setComparison(result);
    } catch (error) {
      console.error('Error comparing reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!reportIds || reportIds.length < 2) {
    return (
      <div className="comparison-view">
        <p>Select at least 2 reports to compare them side by side.</p>
      </div>
    );
  }

  return (
    <div className="comparison-view">
      <div className="comparison-header">
        <h2>Compare Reports</h2>
        <button
          onClick={handleCompare}
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Comparing...' : 'Compare Selected Reports'}
        </button>
      </div>

      {comparison && (
        <div className="comparison-table-container">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Test Name</th>
                {comparison.reports.map((report, index) => (
                  <th key={index}>
                    {new Date(report.report_date).toLocaleDateString()}
                  </th>
                ))}
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {comparison.comparisons.map((comp, index) => (
                <tr key={index}>
                  <td>
                    <strong>{comp.test_name}</strong>
                  </td>
                  {comp.values.map((value, idx) => (
                    <td key={idx}>
                      {value.value} {value.unit}
                      <div className="status-badge-small">{value.status}</div>
                    </td>
                  ))}
                  <td>
                    {comp.change !== null && (
                      <span
                        className={`change-indicator ${
                          comp.change > 0 ? 'increase' : comp.change < 0 ? 'decrease' : 'stable'
                        }`}
                      >
                        {comp.change > 0 ? '↑' : comp.change < 0 ? '↓' : '→'}{' '}
                        {Math.abs(comp.change).toFixed(2)} {comp.unit}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ComparisonView;


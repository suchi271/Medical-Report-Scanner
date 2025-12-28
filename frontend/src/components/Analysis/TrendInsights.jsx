import { useState, useEffect } from 'react';
import { getTrends } from '../../utils/api';
import TrendChart from '../Dashboard/TrendChart';
import './Analysis.css';

const TrendInsights = ({ userId, testName }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, [userId, testName]);

  const loadInsights = async () => {
    try {
      const result = await getTrends(userId, testName);
      setInsights(result);
      setLoading(false);
    } catch (error) {
      console.error('Error loading insights:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading insights...</div>;
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="trend-insights">
      <TrendChart userId={userId} testName={testName} />
      
      {insights.summary && (
        <div className="insights-summary">
          <h3>Trend Summary</h3>
          <p>{insights.summary}</p>
        </div>
      )}

      {insights.alerts && insights.alerts.length > 0 && (
        <div className="insights-alerts">
          <h3>Important Changes</h3>
          <ul>
            {insights.alerts.map((alert, index) => (
              <li key={index} className={`alert ${alert.severity}`}>
                <strong>{alert.test_name}:</strong> {alert.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TrendInsights;


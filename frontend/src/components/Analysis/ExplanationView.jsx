import { useState } from 'react';
import './Analysis.css';

const ExplanationView = ({ analysis, selectedTest, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!analysis) return null;

  const explanation = analysis.explanation || '';
  const trends = analysis.trends || [];
  const insights = analysis.insights || [];

  return (
    <div className="explanation-view">
      <div className="explanation-header">
        <h2>AI-Powered Explanation</h2>
        <div className="tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={activeTab === 'trends' ? 'active' : ''}
            onClick={() => setActiveTab('trends')}
          >
            Trends
          </button>
          <button
            className={activeTab === 'insights' ? 'active' : ''}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </button>
        </div>
      </div>

      <div className="explanation-content">
        {activeTab === 'overview' && (
          <div className="explanation-text">
            <div className="disclaimer-box">
              <strong>⚠️ IMPORTANT DISCLAIMER</strong>
              <p>
                This explanation is for educational purposes only. It does not diagnose
                conditions or recommend treatments. Always consult your healthcare provider
                to discuss your results.
              </p>
            </div>
            <div className="explanation-body">
              {explanation.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="trends-view">
            {trends.length > 0 ? (
              <ul className="trends-list">
                {trends.map((trend, index) => (
                  <li key={index} className="trend-item">
                    <strong>{trend.test_name}:</strong> {trend.description}
                    {trend.change && (
                      <span className={`change ${trend.direction}`}>
                        {trend.direction === 'increasing' ? '↑' : '↓'} {trend.change}%
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No significant trends detected.</p>
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="insights-view">
            {insights.length > 0 ? (
              <ul className="insights-list">
                {insights.map((insight, index) => (
                  <li key={index} className="insight-item">
                    <div className="insight-icon">
                      {insight.type === 'question' ? '❓' : '💡'}
                    </div>
                    <div className="insight-content">
                      <strong>{insight.title}</strong>
                      <p>{insight.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No specific insights available.</p>
            )}
          </div>
        )}
      </div>

      {selectedTest && (
        <div className="selected-test-info">
          <h4>Selected Test: {selectedTest.test_name}</h4>
          <p>
            Value: <strong>{selectedTest.value} {selectedTest.unit}</strong>
          </p>
          {selectedTest.reference_range && (
            <p>
              Reference Range: {selectedTest.reference_range.min} -{' '}
              {selectedTest.reference_range.max} {selectedTest.unit}
            </p>
          )}
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default ExplanationView;


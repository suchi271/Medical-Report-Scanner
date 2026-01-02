import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import { getTrends } from '../../utils/api';
import './Dashboard.css';

const TrendChart = ({ userId, testName }) => {
  const [data, setData] = useState([]);
  const [baseline, setBaseline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendData();
  }, [userId, testName]);

  const loadTrendData = async () => {
    try {
      const result = await getTrends(userId, testName);
      setData(result.trends || []);
      setBaseline(result.baseline);
      setLoading(false);
    } catch (error) {
      console.error('Error loading trends:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading trend data...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="empty-state">
        <p>Not enough data to show trends. Upload more reports to see trends.</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = data.map((item) => ({
  date: new Date(item.report_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  }),
  value: item.value,
  unit: item.unit,
  referenceMin: item.reference_min,
  referenceMax: item.reference_max,
  baseline: baseline?.personal_baseline
}));


  const firstDataPoint = chartData[0];
  const lastDataPoint = chartData[chartData.length - 1];

  return (
    <div className="trend-chart-container">
      <h3>Trend Analysis: {testName}</h3>
      {baseline && (
        <div className="baseline-info">
          <p>
            Personal Baseline: <strong>{baseline.personal_baseline?.toFixed(2)}</strong>{' '}
            {firstDataPoint?.unit || ''}
          </p>
          <p>
            Variability: <strong>{baseline.variability?.toFixed(2)}</strong>
          </p>
        </div>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#667eea"
            strokeWidth={2}
            name="Test Value"
            dot={{ r: 4 }}
          />
          {baseline?.personal_baseline && (
            <Line
              type="monotone"
              dataKey="baseline"
              stroke="#4caf50"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Personal Baseline"
            />
          )}
          <Line
            type="monotone"
            dataKey="referenceMin"
            stroke="#ff9800"
            strokeWidth={1}
            strokeDasharray="3 3"
            name="Reference Min"
          />
          <Line
            type="monotone"
            dataKey="referenceMax"
            stroke="#ff9800"
            strokeWidth={1}
            strokeDasharray="3 3"
            name="Reference Max"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;


import './Dashboard.css';

const TestCard = ({ test, onClick }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'normal':
        return '#4caf50';
      case 'high':
        return '#f44336';
      case 'low':
        return '#ff9800';
      case 'borderline':
        return '#ffc107';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status) => {
    if (!status) {
      if (test.reference_range) {
        const { min, max } = test.reference_range;
        const value = test.value;
        if (value < min) return 'Low';
        if (value > max) return 'High';
        return 'Normal';
      }
      return 'Unknown';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const status = test.status || getStatusLabel();
  const statusColor = getStatusColor(status);

  return (
    <div className="test-card" onClick={onClick}>
      <div className="test-header">
        <h4>{test.test_name}</h4>
        <span
          className="status-indicator"
          style={{ backgroundColor: statusColor }}
        />
      </div>
      <div className="test-value">
        <span className="value">{test.value}</span>
        {test.unit && <span className="unit">{test.unit}</span>}
      </div>
      {test.reference_range && (
        <div className="reference-range">
          Reference: {test.reference_range.min} - {test.reference_range.max}{' '}
          {test.unit}
        </div>
      )}
      <div className="test-status">
        Status: <strong style={{ color: statusColor }}>{getStatusLabel(status)}</strong>
      </div>
    </div>
  );
};

export default TestCard;


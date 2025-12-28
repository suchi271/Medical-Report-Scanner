import './Upload.css';

const UploadProgress = ({ progress }) => {
  return (
    <div className="upload-progress-container">
      <div className="upload-progress-card">
        <div className="progress-spinner">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="spinning"
          >
            <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="30" />
          </svg>
        </div>
        <h3>Uploading Report</h3>
        <p>Please wait while we process your file...</p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="progress-text">{Math.round(progress)}%</p>
      </div>
    </div>
  );
};

export default UploadProgress;


import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { storage, db } from '../../config/firebase';
import { processReport } from '../../utils/api';
import UploadProgress from './UploadProgress';
import './Upload.css';

const ReportUploader = ({ userId, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    setError('');
    setUploading(true);
    setProgress(0);

    try {
      const reportId = `report_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const storageRef = ref(storage, `users/${userId}/reports/${reportId}.pdf`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const pct =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(pct);
        },
        (err) => {
          setError(`Upload failed: ${err.message}`);
          setUploading(false);
        },
        async () => {
          try {
            // 1️⃣ Get file URL
            const downloadURL = await getDownloadURL(
              uploadTask.snapshot.ref
            );

            // 2️⃣ Create Firestore doc (processing)
            await setDoc(
              doc(db, 'users', userId, 'reports', reportId),
              {
                reportId,
                fileName: file.name,
                uploadDate: new Date(),
                status: 'processing',
                storageUrl: downloadURL,
              }
            );

            // 3️⃣ Call backend
            const response = await processReport(downloadURL, userId);

            // 4️⃣ HARDEN response
            const safeResult = response || {};
            const safeReportDate =
              safeResult.reportDate ||
              safeResult.report_date ||
              new Date().toISOString();

            // 5️⃣ Update Firestore (completed)
            await setDoc(
              doc(db, 'users', userId, 'reports', reportId),
              {
                status: 'completed',
                reportDate: safeReportDate,
                extractedData: safeResult,
              },
              { merge: true }
            );

            setUploading(false);
            setProgress(100);
            onUploadComplete?.(reportId);
          } catch (err) {
            console.error(err);
            setError(`Processing failed: ${err.message}`);
            setUploading(false);
          }
        }
      );
    } catch (err) {
      setError(`Error: ${err.message}`);
      setUploading(false);
    }
  }, [userId, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading,
  });

  if (uploading) {
    return <UploadProgress progress={progress} />;
  }

  return (
    <div className="upload-container">
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="upload-content">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <h3>Upload Lab Report</h3>
          <p>
            {isDragActive
              ? 'Drop your PDF here'
              : 'Drag and drop a PDF file, or click to select'}
          </p>
          <p className="upload-hint">Maximum file size: 10MB</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default ReportUploader;

import React, { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useFirestore } from '../../hooks/useFirestore';
import { uploadFile } from '../../services/cloudinaryStorage';
import Loader from '../UI/Loader';
import { DocumentArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { sanitizeInput, sanitizeFileName } from '../../utils/sanitize';

const UploadReport = ({ onUploadComplete }) => {
  const { currentUser } = useAuth();
  const { addDocument } = useFirestore('reports');
  
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [reportType, setReportType] = useState('');
  const [reportDate, setReportDate] = useState('');
  
  const fileInputRef = useRef(null);
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      setError('Only PDF files are supported');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size should not exceed 10MB');
      return;
    }
    // Do NOT try to set selectedFile.name (it's read-only)
    setFile(selectedFile);
    setError('');
    setFilePreview(URL.createObjectURL(selectedFile));
    const fileName = sanitizeInput(selectedFile.name.replace(/\.[^/.]+$/, ''));
    setReportTitle(fileName);
  };
  
  // Helper: Normalize report data for trend analysis
  function normalizeReportData(rawSummary, file, userId, safeTitle, safeDate) {
    let findings = [];
    if (rawSummary && Array.isArray(rawSummary.findings) && rawSummary.findings.length > 0) {
      findings = rawSummary.findings.map(f => ({
        name: f.name || 'Unknown Test',
        value: f.value || '',
        unit: f.unit || '',
        normal: f.normal || '',
      }));
    } else {
      findings = [{ name: 'No findings', value: '', unit: '', normal: '' }];
    }
    return {
      title: safeTitle,
      type: 'Lab Results', // Always set for trend analysis
      date: safeDate,
      fileName: sanitizeFileName(file.name),
      fileSize: file.size,
      fileType: file.type,
      userId,
      uploadedAt: new Date().toISOString(),
      summary: { findings },
      // Add other fields as needed (downloadURL, filePath, etc.)
    };
  }
  
  // Handle file upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    if (!reportTitle.trim()) {
      setError('Please enter a title for the report');
      return;
    }
    // Sanitize inputs
    const safeTitle = sanitizeInput(reportTitle);
    const safeDate = sanitizeInput(reportDate);
    try {
      setLoading(true);
      setError('');
      const filePath = `med4u/reports/${currentUser.uid}/${Date.now()}_${sanitizeFileName(file.name)}`;
      const uploadResult = await uploadFile(file, filePath, (progressValue) => {
        setProgress(progressValue);
      });
      // --- NEW: Summarize and normalize report for trend analysis ---
      let summary = null;
      try {
        // Dynamically import summarizer to avoid circular deps
        const summarizer = await import('../../services/summarizer');
        const text = await summarizer.extractTextFromPDF(uploadResult.downloadURL);
        summary = await summarizer.createEnhancedSummary(text, 'Blood Test');
      } catch (summarizeErr) {
        summary = { findings: [{ name: 'No findings', value: '', unit: '', normal: '' }] };
      }
      const normalizedReport = normalizeReportData(
        summary && summary.findings ? summary : (summary.summary || summary),
        file,
        currentUser.uid,
        safeTitle,
        safeDate
      );
      normalizedReport.filePath = uploadResult.path;
      normalizedReport.downloadURL = uploadResult.downloadURL;
      normalizedReport.storageProvider = 'cloudinary';
      const newReport = await addDocument(normalizedReport);
      // Reset form
      setFile(null);
      if (filePreview) {
        URL.revokeObjectURL(filePreview); // Clean up the preview URL
      }
      setFilePreview(null);
      setProgress(0);
      setReportTitle('');
      setReportType('');
      setReportDate('');
      if (fileInputRef.current) {
        fileInputRef.current.value = null;
      }
      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete(newReport);
      }
    } catch (err) {
      setError('Error uploading file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="upload-report">
      <form onSubmit={handleUpload} className="report-upload-form">
        <div className="form-group">
          <label htmlFor="reportTitle">Report Title</label>
          <input
            type="text"
            id="reportTitle"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reportType">Report Type</label>
          <input
            type="text"
            id="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="reportDate">Report Date</label>
          <input
            type="date"
            id="reportDate"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            required
          />
        </div>
        <div className="form-group file-upload">
          <label htmlFor="file">Upload File (PDF only, max 10MB)</label>
          <input
            type="file"
            id="file"
            accept="application/pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
            required
          />
          {filePreview && (
            <div className="file-preview">
              <embed src={filePreview} type="application/pdf" />
              <button
                type="button"
                onClick={() => {
                  setFilePreview(null);
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = null;
                  }
                }}
                className="remove-preview"
              >
                <XMarkIcon className="icon" />
              </button>
            </div>
          )}
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="form-actions">
          <button type="submit" className="btn-upload" disabled={loading}>
            {loading ? <Loader /> : <DocumentArrowUpIcon className="icon" />}
            {loading ? 'Uploading...' : 'Upload Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadReport;
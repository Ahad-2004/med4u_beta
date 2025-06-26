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
  const [status, setStatus] = useState('');
  
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
      setStatus('Uploading file...');
      setError('');
      const filePath = `med4u/reports/${currentUser.uid}/${Date.now()}_${sanitizeFileName(file.name)}`;
      const uploadResult = await uploadFile(file, filePath, (progressValue) => {
        setProgress(progressValue);
        setStatus(`Uploading file... ${progressValue}%`);
      });
      setStatus('Extracting text from PDF...');
      // --- NEW: Summarize and normalize report for trend analysis ---
      let summary = null;
      try {
        // Dynamically import summarizer to avoid circular deps
        const summarizer = await import('../../services/summarizer');
        const text = await summarizer.extractTextFromPDF(uploadResult.downloadURL);
        setStatus('Analyzing report...');
        summary = await summarizer.createEnhancedSummary(text, 'Blood Test');
      } catch (summarizeErr) {
        summary = { findings: [{ name: 'No findings', value: '', unit: '', normal: '' }] };
      }
      setStatus('Saving report...');
      // --- Ensure findings array is always extracted for trend analysis ---
      const findings = (summary && summary.findings)
        ? summary.findings
        : (summary.enhancedSummary && summary.enhancedSummary.findings)
          ? summary.enhancedSummary.findings
          : (summary.summary && summary.summary.findings)
            ? summary.summary.findings
            : [];
      const normalizedReport = normalizeReportData(
        { findings },
        file,
        currentUser.uid,
        safeTitle,
        safeDate
      );
      normalizedReport.filePath = uploadResult.path;
      normalizedReport.downloadURL = uploadResult.downloadURL;
      normalizedReport.storageProvider = 'cloudinary';
      const newReport = await addDocument(normalizedReport);
      setStatus('Report uploaded and processed!');
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
      setStatus('');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <DocumentArrowUpIcon className="h-6 w-6 mr-2 text-primary-600" /> Upload Medical Report
      </h2>
      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">{error}</div>
      )}
      {status && (
        <div className="bg-blue-50 text-blue-800 p-3 rounded-md mb-4 animate-pulse">{status}</div>
      )}
      <form onSubmit={handleUpload} className="space-y-6">
        <div className={`border-2 border-dashed rounded-lg p-6 text-center ${file ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-700'} hover:border-primary-500 transition-colors duration-200 cursor-pointer`} onClick={() => fileInputRef.current && fileInputRef.current.click()}>
          {file ? (
            <div className="relative">
              <div className="flex items-center justify-center mb-3">
                <DocumentArrowUpIcon className="h-12 w-12 text-primary-500" />
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <button type="button" onClick={e => { e.stopPropagation(); setFile(null); setFilePreview(null); if (fileInputRef.current) fileInputRef.current.value = null; }} className="absolute top-0 right-0 bg-gray-200 dark:bg-gray-700 rounded-full p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"><XMarkIcon className="h-5 w-5" /></button>
              {progress > 0 && progress < 100 && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-3">
                  <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              )}
            </div>
          ) : (
            <>
              <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">Drag and drop your PDF file here</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">or <span className="text-primary-600">browse files</span></p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Supports: PDF only (Max 10MB)</p>
            </>
          )}
          <input type="file" ref={fileInputRef} accept="application/pdf" className="hidden" onChange={handleFileChange} disabled={loading} />
        </div>
        <div>
          <label htmlFor="report-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Report Title *</label>
          <input type="text" id="report-title" value={reportTitle} onChange={e => setReportTitle(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="e.g. Blood Test Results" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Report Type</label>
            <select id="report-type" value={reportType} onChange={e => setReportType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">Select a type</option>
              <option value="Blood Test">Blood Test</option>
              <option value="X-Ray">X-Ray</option>
              <option value="MRI">MRI</option>
              <option value="CT Scan">CT Scan</option>
              <option value="Ultrasound">Ultrasound</option>
              <option value="Pathology">Pathology</option>
              <option value="Prescription">Prescription</option>
              <option value="Discharge Summary">Discharge Summary</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="report-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Report Date</label>
            <input type="date" id="report-date" value={reportDate} onChange={e => setReportDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
        </div>
        <div className="mt-4">
          <button type="submit" disabled={loading || !file} className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (<><Loader size="small" color="white" /><span className="ml-2">Uploading...</span></>) : 'Upload Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadReport;
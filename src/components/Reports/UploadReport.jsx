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
    const safeType = sanitizeInput(reportType);
    const safeDate = sanitizeInput(reportDate);
    try {
      setLoading(true);
      setError('');
      const filePath = `med4u/reports/${currentUser.uid}/${Date.now()}_${sanitizeFileName(file.name)}`;
      const uploadResult = await uploadFile(file, filePath, (progressValue) => {
        setProgress(progressValue);
      });
      const reportData = {
        title: safeTitle,
        type: safeType,
        date: safeDate,
        fileName: sanitizeFileName(file.name),
        fileSize: file.size,
        fileType: file.type,
        filePath: uploadResult.path,
        downloadURL: uploadResult.downloadURL,
        userId: currentUser.uid,
        uploadedAt: new Date().toISOString(),
        storageProvider: 'cloudinary'
      };
      const newReport = await addDocument(reportData);
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
      console.error('Error uploading report:', err);
      setError(`Failed to upload report: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Clear selected file
  const handleClearFile = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview); // Clean up the preview URL
    }
    setFile(null);
    setFilePreview(null);
    setProgress(0);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };
  
  // Trigger file input click
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Upload Medical Report
      </h2>
      
      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleUpload}>
        <div className="space-y-4">
          {/* File upload area */}
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center 
              ${file ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-700'}
              hover:border-primary-500 transition-colors duration-200 cursor-pointer`}
            onClick={handleBrowseClick}
          >
            {file ? (
              <div className="relative">
                <div className="flex items-center justify-center mb-3">
                  <DocumentArrowUpIcon className="h-12 w-12 text-primary-500" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                
                {/* Remove file button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFile();
                  }}
                  className="absolute top-0 right-0 bg-gray-200 dark:bg-gray-700 rounded-full p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
                
                {/* Progress bar for upload */}
                {progress > 0 && progress < 100 && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-3">
                    <div 
                      className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <DocumentArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Drag and drop your PDF file here
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  or <span className="text-primary-600">browse files</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Supports: PDF only (Max 10MB)
                </p>
              </>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={loading}
            />
          </div>
          
          {/* Report details */}
          <div>
            <label htmlFor="report-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Report Title *
            </label>
            <input
              type="text"
              id="report-title"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g. Blood Test Results"
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Report Type
              </label>
              <select
                id="report-type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
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
              <label htmlFor="report-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Report Date
              </label>
              <input
                type="date"
                id="report-date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <button
              type="submit"
              disabled={loading || !file}
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader size="small" color="white" />
                  <span className="ml-2">Uploading...</span>
                </>
              ) : (
                'Upload Report'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UploadReport;
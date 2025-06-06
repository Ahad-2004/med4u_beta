import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import UploadReport from '../components/Reports/UploadReport';
import Modal from '../components/UI/Modal';
import Card from '../components/UI/Card';
import Loader from '../components/UI/Loader';
import { formatDate, formatFileSize } from '../utils/formatting';
import ReportSummary from '../components/Reports/ReportSummary';
import ReportTrends from '../components/Reports/ReportTrends';
import { FiFileText, FiTrendingUp, FiUpload, FiDownload, FiTrash2 } from 'react-icons/fi';

const Reports = () => {
  const { currentUser } = useAuth();
  const { documents: reports, loading, error, getDocuments, deleteDocument } = useFirestore('reports');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('reports');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Fetch reports on component mount
  useEffect(() => {
    const fetchReports = async () => {
      if (currentUser) {
        try {
          await getDocuments([
            { field: 'userId', operator: '==', value: currentUser.uid }
          ], { field: 'uploadedAt', direction: 'desc' });
        } catch (err) {
          console.error('Error fetching reports:', err);
        } finally {
          setIsInitialLoad(false);
        }
      }
    };
    
    fetchReports();
  }, [currentUser, getDocuments]);
  
  // Handle report upload completion
  const handleUploadComplete = async () => {
    setIsUploadModalOpen(false);
    try {
      await getDocuments([
        { field: 'userId', operator: '==', value: currentUser.uid }
      ], { field: 'uploadedAt', direction: 'desc' });
    } catch (err) {
      console.error('Error refreshing reports:', err);
    }
  };
  
  // Handle report deletion
  const handleDeleteReport = async (id) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteDocument(id);
        // Refresh the reports list after deletion
        await getDocuments([
          { field: 'userId', operator: '==', value: currentUser.uid }
        ], { field: 'uploadedAt', direction: 'desc' });
      } catch (err) {
        console.error('Error deleting report:', err);
      }
    }
  };
  
  // Handle opening the report viewer
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setIsViewerOpen(true);
  };
  
  // Show loading state only during initial load
  if (isInitialLoad) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="large" />
      </div>
    );
  }
  
  // --- MOCK DATA FOR BETA TESTING ---
  const mockReports = [
    {
      id: 'mock1',
      title: 'Lab Report May',
      type: 'Lab Results',
      uploadedAt: '2024-05-01T10:00:00Z',
      summary: {
        findings: [
          { name: 'Hemoglobin', value: '13.5', unit: 'g/dL', normal: '12-16' },
          { name: 'Glucose', value: '110', unit: 'mg/dL', normal: '70-110' },
          { name: 'Cholesterol', value: '180', unit: 'mg/dL', normal: '0-200' },
        ]
      }
    },
    {
      id: 'mock2',
      title: 'Lab Report June',
      type: 'Lab Results',
      uploadedAt: '2024-06-01T10:00:00Z',
      summary: {
        findings: [
          { name: 'Hemoglobin', value: '13.8', unit: 'g/dL', normal: '12-16' },
          { name: 'Glucose', value: '120', unit: 'mg/dL', normal: '70-110' },
          { name: 'Cholesterol', value: '190', unit: 'mg/dL', normal: '0-200' },
        ]
      }
    },
    {
      id: 'mock3',
      title: 'Lab Report July',
      type: 'Lab Results',
      uploadedAt: '2024-07-01T10:00:00Z',
      summary: {
        findings: [
          { name: 'Hemoglobin', value: '14.0', unit: 'g/dL', normal: '12-16' },
          { name: 'Glucose', value: '115', unit: 'mg/dL', normal: '70-110' },
          { name: 'Cholesterol', value: '185', unit: 'mg/dL', normal: '0-200' },
        ]
      }
    }
  ];
  
  // --- DEMO DATA: Always use this for trends analysis ---
  const demoReports = [
    {
      id: 'demo1',
      title: 'Lab Report Jan',
      type: 'Lab Results',
      uploadedAt: '2024-01-10T09:00:00Z',
      summary: {
        findings: [
          { name: 'Hemoglobin', value: '13.2', unit: 'g/dL', normal: '12-16' },
          { name: 'Glucose', value: '105', unit: 'mg/dL', normal: '70-110' },
          { name: 'Cholesterol', value: '175', unit: 'mg/dL', normal: '0-200' },
        ]
      }
    },
    {
      id: 'demo2',
      title: 'Lab Report Feb',
      type: 'Lab Results',
      uploadedAt: '2024-02-12T09:00:00Z',
      summary: {
        findings: [
          { name: 'Hemoglobin', value: '13.6', unit: 'g/dL', normal: '12-16' },
          { name: 'Glucose', value: '112', unit: 'mg/dL', normal: '70-110' },
          { name: 'Cholesterol', value: '182', unit: 'mg/dL', normal: '0-200' },
        ]
      }
    },
    {
      id: 'demo3',
      title: 'Lab Report Mar',
      type: 'Lab Results',
      uploadedAt: '2024-03-15T09:00:00Z',
      summary: {
        findings: [
          { name: 'Hemoglobin', value: '13.9', unit: 'g/dL', normal: '12-16' },
          { name: 'Glucose', value: '108', unit: 'mg/dL', normal: '70-110' },
          { name: 'Cholesterol', value: '178', unit: 'mg/dL', normal: '0-200' },
        ]
      }
    },
    {
      id: 'demo4',
      title: 'Lab Report Apr',
      type: 'Lab Results',
      uploadedAt: '2024-04-18T09:00:00Z',
      summary: {
        findings: [
          { name: 'Hemoglobin', value: '14.1', unit: 'g/dL', normal: '12-16' },
          { name: 'Glucose', value: '115', unit: 'mg/dL', normal: '70-110' },
          { name: 'Cholesterol', value: '185', unit: 'mg/dL', normal: '0-200' },
        ]
      }
    },
    {
      id: 'demo5',
      title: 'Lab Report May',
      type: 'Lab Results',
      uploadedAt: '2024-05-20T09:00:00Z',
      summary: {
        findings: [
          { name: 'Hemoglobin', value: '14.0', unit: 'g/dL', normal: '12-16' },
          { name: 'Glucose', value: '118', unit: 'mg/dL', normal: '70-110' },
          { name: 'Cholesterol', value: '188', unit: 'mg/dL', normal: '0-200' },
        ]
      }
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <Card className="p-4">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'reports'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <FiFileText className="mr-3 h-5 w-5" />
                Reports List
              </button>
              <button
                onClick={() => setActiveTab('trends')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'trends'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <FiTrendingUp className="mr-3 h-5 w-5" />
                Trends Analysis
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === 'upload'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <FiUpload className="mr-3 h-5 w-5" />
                Upload Report
              </button>
            </nav>
          </Card>
        </div>

        <div className="w-full md:w-3/4">
          {activeTab === 'reports' && (
            <>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">My Medical Reports</h2>
              
              {error ? (
                <div className="text-red-500 text-center py-5">
                  Failed to load reports: {error}
                </div>
              ) : !reports || reports.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <FiFileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No reports yet</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Get started by uploading your medical reports.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setActiveTab('upload')}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiUpload className="-ml-1 mr-2 h-5 w-5" />
                      Upload Report
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-6 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                      <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {Array.isArray(reports) && reports.map((report) => (
                          <div
                            key={report.id}
                            className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                              selectedReport?.id === report.id
                                ? 'bg-blue-50 dark:bg-blue-900/20'
                                : ''
                            }`}
                            onClick={() => {
                              setSelectedReport(report);
                              setIsViewerOpen(true);
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                  {report.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {report.type || 'Medical Report'} • {formatDate(report.date || report.uploadedAt)}
                                  {report.fileSize && ` • ${formatFileSize(report.fileSize)}`}
                                </p>
                              </div>
                              <div className="flex items-center">
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleViewReport(report);
                                  }}
                                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 ml-2"
                                  title="View report"
                                >
                                  <FiFileText className="h-5 w-5" />
                                </button>
                                <a
                                  href={report.downloadURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 ml-2"
                                  onClick={e => e.stopPropagation()}
                                  title="Download report"
                                >
                                  <FiDownload className="h-5 w-5" />
                                </a>
                                <button
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleDeleteReport(report.id);
                                  }}
                                  className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 ml-2"
                                  title="Delete report"
                                >
                                  <FiTrash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {selectedReport && (
                    <ReportSummary report={selectedReport} />
                  )}
                </>
              )}
            </>
          )}

          {activeTab === 'trends' && (
            <>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Lab Result Trends</h2>
              {/* Use real reports, not demo data */}
              <ReportTrends reports={reports} userId={currentUser?.uid} />
            </>
          )}

          {activeTab === 'upload' && (
            <>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Upload New Report</h2>
              <UploadReport userId={currentUser?.uid} onUploadComplete={handleUploadComplete} />
            </>
          )}
        </div>
      </div>
      
      {/* PDF Viewer Modal */}
      <Modal 
        isOpen={isViewerOpen} 
        onClose={() => setIsViewerOpen(false)}
        title="Report Viewer"
        size="large"
      >
        {selectedReport && (
          <div className="h-[calc(100vh-200px)]">
            {(() => {
              // Use the original URL that works for downloads
              const pdfUrl = selectedReport.downloadURL;
              
              return (
                <div className="flex flex-col h-full">
                  <div className="flex justify-end mb-4">
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiDownload className="mr-2" />
                      Download PDF
                    </a>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-lg p-4">
                    <p className="text-gray-600 mb-4">
                      For security reasons, PDFs must be downloaded to view. Please use the download button above to view the report.
                    </p>
                    <div className="bg-white rounded-lg p-4 shadow">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Report Details</h3>
                      <dl className="grid grid-cols-1 gap-4">
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Title</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedReport.title}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Type</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedReport.type || 'Medical Report'}</dd>
                        </div>
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Date</dt>
                          <dd className="mt-1 text-sm text-gray-900">{formatDate(selectedReport.date || selectedReport.uploadedAt)}</dd>
                        </div>
                        {selectedReport.fileSize && (
                          <div>
                            <dt className="text-sm font-medium text-gray-500">File Size</dt>
                            <dd className="mt-1 text-sm text-gray-900">{formatFileSize(selectedReport.fileSize)}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reports;
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import Card from '../components/UI/Card';
import Loader from '../components/UI/Loader';
import { 
  BeakerIcon, 
  FolderIcon, 
  ExclamationTriangleIcon, 
  DocumentTextIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import Modal from '../components/UI/Modal';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeMedications: 0,
    totalCases: 0,
    importantConditions: 0,
    recentReports: []
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  
  const medicationsFirestore = useFirestore('medications');
  const casesFirestore = useFirestore('cases');
  const conditionsFirestore = useFirestore('conditions');
  const reportsFirestore = useFirestore('reports');
  
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Fetch active medications count
        const medications = await medicationsFirestore.getDocuments([
          { field: 'userId', operator: '==', value: currentUser.uid },
          { field: 'active', operator: '==', value: true }
        ]);
        
        // Fetch total cases
        const cases = await casesFirestore.getDocuments([
          { field: 'userId', operator: '==', value: currentUser.uid }
        ]);
        
        // Fetch important conditions
        const conditions = await conditionsFirestore.getDocuments([
          { field: 'userId', operator: '==', value: currentUser.uid }
        ]);
        
        // Fetch recent reports
        const reports = await reportsFirestore.getDocuments(
          [{ field: 'userId', operator: '==', value: currentUser.uid }],
          { field: 'uploadedAt', direction: 'desc' }
        );
        
        setStats({
          activeMedications: medications.length,
          totalCases: cases.length,
          importantConditions: conditions.length,
          recentReports: reports.slice(0, 3) // Get only the 3 most recent reports
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentUser]);
  
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="large" />
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard
      </h1>
      
      {/* Welcome card */}
      <Card className="mb-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800">
        <h2 className="text-xl font-semibold text-primary-800 dark:text-primary-200">
          Welcome, {currentUser.displayName || 'User'}!
        </h2>
        <p className="text-primary-600 dark:text-primary-300 mt-1">
          Keep track of your medical information all in one place.
        </p>
      </Card>
      
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Active Medications" 
          value={stats.activeMedications} 
          icon={BeakerIcon} 
          linkTo="/medications"
          color="text-blue-500"
          bgColor="bg-blue-100 dark:bg-blue-900/20"
        />
        <StatCard 
          title="Medical Cases" 
          value={stats.totalCases} 
          icon={FolderIcon} 
          linkTo="/cases"
          color="text-indigo-500"
          bgColor="bg-indigo-100 dark:bg-indigo-900/20"
        />
        <StatCard 
          title="Important Conditions" 
          value={stats.importantConditions} 
          icon={ExclamationTriangleIcon} 
          linkTo="/conditions"
          color="text-amber-500"
          bgColor="bg-amber-100 dark:bg-amber-900/20"
        />
      </div>
      
      {/* Recent reports */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Reports
        </h2>
        <Link 
          to="/reports" 
          className="text-sm text-primary-600 hover:text-primary-500 flex items-center"
        >
          View all 
          <ArrowRightIcon className="ml-1 h-4 w-4" />
        </Link>
      </div>
      
      {stats.recentReports.length === 0 ? (
        <Card className="text-center py-8 text-gray-500 dark:text-gray-400">
          <DocumentTextIcon className="mx-auto h-10 w-10 mb-2 text-gray-400" />
          <p>No reports uploaded yet</p>
          <Link 
            to="/reports" 
            className="mt-2 inline-block text-primary-600 hover:text-primary-500"
          >
            Upload your first report
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {stats.recentReports.map(report => (
            <Card key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150">
              <div className="flex items-start">
                <div className="p-2 rounded-md bg-primary-100 dark:bg-primary-900/30 mr-4">
                  <DocumentTextIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {report.type || 'Medical Report'} - {formatDate(report.date || report.uploadedAt)}
                  </p>
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedReport(report);
                    setIsViewerOpen(true);
                  }}
                  className="ml-4 px-3 py-1 text-sm font-medium rounded bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="View report"
                >
                  View report
                </button>
              </div>
            </Card>
          ))}
          {/* Report Viewer Modal */}
          <Modal
            isOpen={isViewerOpen}
            onClose={() => setIsViewerOpen(false)}
            title="Report Viewer"
            size="large"
          >
            {selectedReport && (
              <div className="h-[calc(100vh-200px)]">
                <div className="flex flex-col h-full">
                  <div className="flex justify-end mb-4">
                    <a
                      href={selectedReport.downloadURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
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
                            <dd className="mt-1 text-sm text-gray-900">{(selectedReport.fileSize / 1024 / 1024).toFixed(2)} MB</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      )}
    </div>
  );
};

// Stat card component
const StatCard = ({ title, value, icon: Icon, linkTo, color, bgColor }) => {
  return (
    <Link to={linkTo}>
      <Card className={`hover:shadow-md transition-shadow duration-200 ${bgColor}`}>
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${color} bg-white dark:bg-gray-800 mr-4`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
};

export default Dashboard;
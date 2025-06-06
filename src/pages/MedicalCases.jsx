import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import Card from '../components/UI/Card';
import Loader from '../components/UI/Loader';
import Modal from '../components/UI/Modal';
import { PlusIcon, PencilIcon, TrashIcon, DocumentIcon } from '@heroicons/react/24/outline';

const MedicalCases = () => {
  const { currentUser } = useAuth();
  const { documents: cases, loading, error, getDocuments, addDocument, updateDocument, deleteDocument } = useFirestore('cases');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    status: 'active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewReportModalOpen, setIsViewReportModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Fetch cases on component mount
  useEffect(() => {
    let isMounted = true;
    
    const fetchCases = async () => {
      if (currentUser) {
        try {
          await getDocuments([
            { field: 'userId', operator: '==', value: currentUser.uid }
          ], { field: 'startDate', direction: 'desc' });
        } catch (err) {
          console.error('Error fetching cases:', err);
        }
      }
    };
    
    fetchCases();
    
    return () => {
      isMounted = false;
    };
  }, [currentUser, getDocuments]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear any previous submit errors when user makes changes
    if (submitError) setSubmitError(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const caseData = {
        ...formData,
        userId: currentUser.uid,
        startDate: formData.startDate || new Date().toISOString().split('T')[0]
      };
      
      if (isEditMode && selectedCase) {
        await updateDocument(selectedCase.id, caseData);
      } else {
        await addDocument(caseData);
      }
      
      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        startDate: '',
        status: 'active'
      });
      setIsModalOpen(false);
      setIsEditMode(false);
      setSelectedCase(null);
    } catch (err) {
      console.error('Error saving medical case:', err);
      setSubmitError('Failed to save medical case. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit button click
  const handleEdit = (medicalCase) => {
    setSelectedCase(medicalCase);
    setFormData({
      title: medicalCase.title || '',
      description: medicalCase.description || '',
      startDate: medicalCase.startDate || '',
      status: medicalCase.status || 'active'
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Handle delete button click
  const handleDelete = (medicalCase) => {
    setSelectedCase(medicalCase);
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (selectedCase) {
      try {
        await deleteDocument(selectedCase.id);
        setIsDeleteModalOpen(false);
        setSelectedCase(null);
      } catch (err) {
        console.error('Error deleting case:', err);
        setSubmitError('Failed to delete case. Please try again.');
      }
    }
  };

  // Handle view report
  const handleViewReport = (medicalCase) => {
    setSelectedCase(medicalCase);
    setSelectedReport(medicalCase.report);
    setIsViewReportModalOpen(true);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Medical Cases
        </h1>
        
        <button
          onClick={() => {
            setIsEditMode(false);
            setSelectedCase(null);
            setFormData({
              title: '',
              description: '',
              startDate: '',
              status: 'active'
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Medical Case
        </button>
      </div>
      
      {error ? (
        <div className="text-red-500 text-center py-5">
          Failed to load medical cases: {error}
        </div>
      ) : !cases || cases.length === 0 ? (
        <Card className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No medical cases yet</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Start by adding your first medical case.
          </p>
        </Card>
      ) : (
        <>
          {loading && (
            <div className="flex justify-center py-4">
              <Loader size="small" />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(cases) && cases.map((medicalCase) => (
              <Card key={medicalCase.id} className="hover:shadow-lg transition-shadow duration-200">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {medicalCase.title || 'Untitled Case'}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(medicalCase)}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        title="Edit case"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(medicalCase)}
                        className="text-gray-400 hover:text-red-500"
                        title="Delete case"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {medicalCase.description || 'No description provided'}
                  </p>
                  {medicalCase.startDate && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Started: {new Date(medicalCase.startDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({
            title: '',
            description: '',
            startDate: '',
            status: 'active'
          });
          setIsEditMode(false);
          setSelectedCase(null);
        }}
        title={isEditMode ? 'Edit Medical Case' : 'Add Medical Case'}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
                <option value="ongoing">Ongoing</option>
              </select>
            </div>
          </div>
          
          {submitError && (
            <div className="mt-4 text-red-500 text-sm">
              {submitError}
            </div>
          )}
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setFormData({
                  title: '',
                  description: '',
                  startDate: '',
                  status: 'active'
                });
                setIsEditMode(false);
                setSelectedCase(null);
              }}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCase(null);
        }}
        title="Delete Medical Case"
      >
        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete this medical case? This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedCase(null);
              }}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* View Report Modal */}
      <Modal
        isOpen={isViewReportModalOpen}
        onClose={() => {
          setIsViewReportModalOpen(false);
          setSelectedCase(null);
          setSelectedReport(null);
        }}
        title="Medical Case Report"
      >
        <div className="space-y-4">
          {selectedReport ? (
            <div className="prose dark:prose-invert max-w-none">
              {selectedReport}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No report available for this case.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default MedicalCases; 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import Card from '../components/UI/Card';
import Loader from '../components/UI/Loader';
import Modal from '../components/UI/Modal';
import { PlusIcon, PencilIcon, TrashIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const ImportantConditions = () => {
  const { currentUser } = useAuth();
  const { documents: conditions, loading, error, getDocuments, addDocument, updateDocument, deleteDocument } = useFirestore('conditions');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    severity: 'moderate',
    diagnosedDate: '',
    status: 'active',
    medications: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch conditions on component mount
  useEffect(() => {
    const fetchConditions = async () => {
      if (currentUser) {
        try {
          await getDocuments([
            { field: 'userId', operator: '==', value: currentUser.uid }
          ], { field: 'diagnosedDate', direction: 'desc' });
        } catch (err) {
          console.error('Error fetching conditions:', err);
        }
      }
    };
    
    fetchConditions();
  }, [currentUser, getDocuments]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (submitError) setSubmitError(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const conditionData = {
        ...formData,
        userId: currentUser.uid,
        diagnosedDate: formData.diagnosedDate || new Date().toISOString().split('T')[0]
      };
      
      if (isEditMode && selectedCondition) {
        await updateDocument(selectedCondition.id, conditionData);
      } else {
        await addDocument(conditionData);
      }
      
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        severity: 'moderate',
        diagnosedDate: '',
        status: 'active',
        medications: '',
        notes: ''
      });
      setIsModalOpen(false);
      setIsEditMode(false);
      setSelectedCondition(null);
    } catch (err) {
      console.error('Error saving condition:', err);
      setSubmitError('Failed to save condition. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit button click
  const handleEdit = (condition) => {
    setSelectedCondition(condition);
    setFormData({
      name: condition.name || '',
      description: condition.description || '',
      severity: condition.severity || 'moderate',
      diagnosedDate: condition.diagnosedDate || '',
      status: condition.status || 'active',
      medications: condition.medications || '',
      notes: condition.notes || ''
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Handle delete button click
  const handleDelete = (condition) => {
    setSelectedCondition(condition);
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (selectedCondition) {
      try {
        await deleteDocument(selectedCondition.id);
        setIsDeleteModalOpen(false);
        setSelectedCondition(null);
      } catch (err) {
        console.error('Error deleting condition:', err);
        setSubmitError('Failed to delete condition. Please try again.');
      }
    }
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'severe':
        return 'bg-orange-100 text-orange-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'mild':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Important Conditions
        </h1>
        
        <button
          onClick={() => {
            setIsEditMode(false);
            setSelectedCondition(null);
            setFormData({
              name: '',
              description: '',
              severity: 'moderate',
              diagnosedDate: '',
              status: 'active',
              medications: '',
              notes: ''
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Condition
        </button>
      </div>
      
      {error ? (
        <div className="text-red-500 text-center py-5">
          Failed to load conditions: {error}
        </div>
      ) : !conditions || conditions.length === 0 ? (
        <Card className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No conditions recorded</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Start by adding your first medical condition.
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
            {Array.isArray(conditions) && conditions.map((condition) => (
              <Card key={condition.id} className="hover:shadow-lg transition-shadow duration-200">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {condition.name || 'Unnamed Condition'}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(condition)}
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        title="Edit condition"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(condition)}
                        className="text-gray-400 hover:text-red-500"
                        title="Delete condition"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {condition.description || 'No description provided'}
                  </p>
                  
                  {condition.diagnosedDate && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                    </p>
                  )}
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center">
                      <ExclamationCircleIcon className={`h-5 w-5 mr-2 ${
                        condition.severity === 'critical' ? 'text-red-500' :
                        condition.severity === 'severe' ? 'text-orange-500' :
                        condition.severity === 'moderate' ? 'text-yellow-500' :
                        'text-green-500'
                      }`} />
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getSeverityColor(condition.severity)
                      }`}>
                        {condition.severity ? condition.severity.charAt(0).toUpperCase() + condition.severity.slice(1) : 'Unknown'}
                      </span>
                    </div>
                    
                    {condition.medications && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Medications: {condition.medications}
                      </p>
                    )}
                    
                    {condition.notes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Notes: {condition.notes}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Condition Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSubmitError(null);
          setFormData({
            name: '',
            description: '',
            severity: 'moderate',
            diagnosedDate: '',
            status: 'active',
            medications: '',
            notes: ''
          });
          setIsEditMode(false);
          setSelectedCondition(null);
        }}
        title={isEditMode ? "Edit Condition" : "Add New Condition"}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {submitError && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-3 rounded-md text-sm">
                {submitError}
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Condition Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              ></textarea>
            </div>

            <div>
              <label htmlFor="severity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Severity
              </label>
              <select
                id="severity"
                name="severity"
                value={formData.severity}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isSubmitting}
              >
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label htmlFor="diagnosedDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Diagnosed Date
              </label>
              <input
                type="date"
                id="diagnosedDate"
                name="diagnosedDate"
                value={formData.diagnosedDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="medications" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Medications
              </label>
              <textarea
                id="medications"
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                rows="2"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isSubmitting}
                placeholder="List any medications for this condition"
              ></textarea>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Additional Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isSubmitting}
                placeholder="Any additional information about this condition"
              ></textarea>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setSubmitError(null);
                setFormData({
                  name: '',
                  description: '',
                  severity: 'moderate',
                  diagnosedDate: '',
                  status: 'active',
                  medications: '',
                  notes: ''
                });
                setIsEditMode(false);
                setSelectedCondition(null);
              }}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
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
          setSelectedCondition(null);
        }}
        title="Delete Condition"
      >
        <div className="space-y-4">
          <p className="text-gray-500 dark:text-gray-400">
            Are you sure you want to delete this condition? This action cannot be undone.
          </p>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setSelectedCondition(null);
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
    </div>
  );
};

export default ImportantConditions; 
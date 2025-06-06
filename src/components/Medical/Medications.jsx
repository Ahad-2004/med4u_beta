import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useFirestore } from '../../hooks/useFirestore';
import { PlusIcon, PencilIcon, TrashIcon, LightBulbIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import Card from '../UI/Card';
import Modal from '../UI/Modal';
import Loader from '../UI/Loader';

const Medications = () => {
  const { currentUser } = useAuth();
  const { 
    documents: medications, 
    loading, 
    error, 
    getDocuments, 
    addDocument, 
    updateDocument, 
    deleteDocument,
    setLoading  // Add setLoading to the destructured values
  } = useFirestore('medications');
  
  // Add new state for cases and insights
  const { documents: cases } = useFirestore('cases');
  const [insights, setInsights] = useState([]);
  const [showInsights, setShowInsights] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedication, setEditingMedication] = useState(null);
  const [formData, setFormData] = useState({
    planName: '',
    notes: '',
    startDate: '',
    endDate: '',
    active: true,
    medicines: [
      { name: '', dosage: '', frequency: '', effectiveness: 'neutral', sideEffects: '', relatedConditions: [] }
    ]
  });
  
  // Load medications and analyze cases on component mount
  useEffect(() => {
    const loadMedications = async () => {
      if (currentUser) {
        try {
          await getDocuments([
            { field: 'userId', operator: '==', value: currentUser.uid }
          ], { field: 'planName', direction: 'asc' });
        } catch (err) {
          console.error('Error loading medications:', err);
        }
      }
    };
    
    loadMedications();
  }, [currentUser, getDocuments]);
  
  // Analyze cases and generate insights
  useEffect(() => {
    if (cases && cases.length > 0 && medications && medications.length > 0) {
      generateInsights();
    }
  }, [cases, medications]);
  
  const generateInsights = () => {
    const newInsights = [];

    // Analyze medication effectiveness based on cases
    medications.forEach(medication => {
      const relatedCases = cases.filter(case_ => 
        case_.medications?.includes(medication.name) ||
        case_.conditions?.some(condition => 
          medication.relatedConditions?.includes(condition)
        )
      );

      if (relatedCases.length > 0) {
        // Calculate effectiveness based on case outcomes
        const effectiveness = calculateEffectiveness(relatedCases, medication);
        if (effectiveness) {
          newInsights.push({
            type: 'effectiveness',
            medication: medication.name,
            message: effectiveness,
            severity: 'info'
          });
        }

        // Identify potential interactions
        const interactions = identifyInteractions(medication, medications);
        if (interactions.length > 0) {
          newInsights.push({
            type: 'interaction',
            medication: medication.name,
            message: interactions.join(', '),
            severity: 'warning'
          });
        }
      }
    });

    // Generate medication suggestions based on cases
    const suggestions = generateSuggestions(cases, medications);
    if (suggestions.length > 0) {
      newInsights.push({
        type: 'suggestion',
        message: 'Based on your medical history, you might benefit from:',
        suggestions: suggestions,
        severity: 'info'
      });
    }

    setInsights(newInsights);
  };
  
  const calculateEffectiveness = (cases, medication) => {
    const positiveOutcomes = cases.filter(case_ => 
      case_.outcome === 'improved' || case_.outcome === 'resolved'
    ).length;
    
    const totalCases = cases.length;
    const effectivenessRate = (positiveOutcomes / totalCases) * 100;

    if (effectivenessRate >= 70) {
      return `This medication has shown high effectiveness (${effectivenessRate.toFixed(0)}%) in similar cases.`;
    } else if (effectivenessRate >= 40) {
      return `This medication has shown moderate effectiveness (${effectivenessRate.toFixed(0)}%) in similar cases.`;
    } else {
      return `This medication has shown limited effectiveness (${effectivenessRate.toFixed(0)}%) in similar cases. Consider discussing alternatives with your healthcare provider.`;
    }
  };
  
  const identifyInteractions = (medication, allMedications) => {
    const interactions = [];
    
    // Check for common drug interactions
    const commonInteractions = {
      'paracitamol': ['ibuprofen', 'aspirin'],
      'ibuprofen': ['aspirin', 'paracitamol'],
      'aspirin': ['ibuprofen', 'paracitamol']
    };

    // Check if this medication has known interactions
    if (commonInteractions[medication.name.toLowerCase()]) {
      const interactingMeds = allMedications.filter(med => 
        commonInteractions[medication.name.toLowerCase()].includes(med.name.toLowerCase())
      );

      if (interactingMeds.length > 0) {
        interactions.push(
          `${medication.name} may interact with: ${interactingMeds.map(m => m.name).join(', ')}`
        );
      }
    }

    return interactions;
  };
  
  const generateSuggestions = (cases, currentMedications) => {
    const suggestions = [];
    
    // Analyze cases for common conditions
    const commonConditions = cases.reduce((acc, case_) => {
      case_.conditions?.forEach(condition => {
        acc[condition] = (acc[condition] || 0) + 1;
      });
      return acc;
    }, {});

    // Find conditions that appear frequently but aren't being treated
    Object.entries(commonConditions)
      .filter(([condition, count]) => count >= 2) // Condition appears in at least 2 cases
      .forEach(([condition, count]) => {
        const isBeingTreated = currentMedications.some(med => 
          med.relatedConditions?.includes(condition)
        );

        if (!isBeingTreated) {
          suggestions.push(
            `Consider discussing treatment options for ${condition} with your healthcare provider`
          );
        }
      });

    return suggestions;
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle medicine change
  const handleMedicineChange = (idx, e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const medicines = [...prev.medicines];
      medicines[idx][name] = name === 'relatedConditions' ? value.split(',').map(s => s.trim()) : value;
      return { ...prev, medicines };
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const planData = {
        ...formData,
        userId: currentUser.uid,
        createdAt: new Date().toISOString()
      };
      
      console.log('Submitting medication plan:', planData);
      
      if (editingMedication) {
        // Update existing plan
        await updateDocument(editingMedication.id, planData);
        console.log('Updated plan:', editingMedication.id);
      } else {
        // Add new plan
        const newPlan = await addDocument(planData);
        console.log('Added new plan:', newPlan);
      }
      
      // Reset form and close modal
      handleCloseModal();
      
      // Refresh plans list
      console.log('Refreshing plans list...');
      await getDocuments([
        { field: 'userId', operator: '==', value: currentUser.uid }
      ], { field: 'planName', direction: 'asc' });
    } catch (err) {
      console.error('Error saving medication plan:', err);
    }
  };
  
  // Open modal for adding new plan
  const handleAddMedication = () => {
    setEditingMedication(null);
    setFormData({
      planName: '',
      notes: '',
      startDate: '',
      endDate: '',
      active: true,
      medicines: [
        { name: '', dosage: '', frequency: '', effectiveness: 'neutral', sideEffects: '', relatedConditions: [] }
      ]
    });
    setIsModalOpen(true);
  };
  
  // Open modal for editing existing plan
  const handleEditMedication = (plan) => {
    setEditingMedication(plan);
    setFormData({
      planName: plan.planName || '',
      notes: plan.notes || '',
      startDate: plan.startDate || '',
      endDate: plan.endDate || '',
      active: plan.active !== false,
      medicines: plan.medicines && plan.medicines.length > 0 ? plan.medicines : [
        { name: '', dosage: '', frequency: '', effectiveness: 'neutral', sideEffects: '', relatedConditions: [] }
      ]
    });
    setIsModalOpen(true);
  };
  
  // Handle deleting a plan
  const handleDeleteMedication = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await deleteDocument(id);
        
        // Refresh plans list
        getDocuments([
          { field: 'userId', operator: '==', value: currentUser.uid }
        ], { field: 'planName', direction: 'asc' });
      } catch (err) {
        console.error('Error deleting plan:', err);
      }
    }
  };
  
  // Close modal and reset form
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMedication(null);
    setFormData({
      planName: '',
      notes: '',
      startDate: '',
      endDate: '',
      active: true,
      medicines: [
        { name: '', dosage: '', frequency: '', effectiveness: 'neutral', sideEffects: '', relatedConditions: [] }
      ]
    });
  };
  
  // Add medicine
  const addMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [
        ...prev.medicines,
        { name: '', dosage: '', frequency: '', effectiveness: 'neutral', sideEffects: '', relatedConditions: [] }
      ]
    }));
  };
  
  // Remove medicine
  const removeMedicine = (idx) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== idx)
    }));
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Medications</h1>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => setShowInsights(!showInsights)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <LightBulbIcon className="h-5 w-5 mr-2" />
            {showInsights ? 'Hide Insights' : 'Show Insights'}
          </button>
          <button
            type="button"
            onClick={handleAddMedication}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Plan
          </button>
        </div>
      </div>
      
      {showInsights && (
        <div className="mb-6 space-y-4">
          {insights.length > 0 ? (
            insights.map((insight, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border-l-4 ${
                  insight.severity === 'warning' 
                    ? 'bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20' 
                    : 'bg-blue-50 border-blue-400 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex items-start">
                  <LightBulbIcon className={`h-6 w-6 mr-3 mt-1 ${
                    insight.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                  }`} />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {insight.type === 'suggestion' ? 'Medication Suggestions' : 
                       insight.type === 'effectiveness' ? 'Effectiveness Analysis' :
                       'Potential Interactions'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {insight.message}
                    </p>
                    {insight.suggestions && (
                      <ul className="mt-2 list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                        {insight.suggestions.map((suggestion, idx) => (
                          <li key={idx}>{suggestion}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No insights available yet. Add more plans and medical cases to get personalized insights.
            </div>
          )}
        </div>
      )}
      
      {/* Medications Display */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Your Plans</h2>
        
        {loading && !medications?.length ? (
          <div className="flex justify-center py-10">
            <Loader size="large" />
            <p className="ml-2 text-gray-600">Loading plans...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-5">
            Failed to load plans: {error}
          </div>
        ) : !Array.isArray(medications) ? (
          <div className="text-yellow-500 text-center py-5">
            Plans data is not in the expected format
          </div>
        ) : medications.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No plans found</p>
            <p className="mt-2">Add a plan to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medications.map((doc) => {
              // If new format (planName + medicines array)
              if (doc.planName && Array.isArray(doc.medicines)) {
                return (
                  <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {doc.planName || 'Unnamed Plan'}
                      </h3>
                      <div className="flex space-x-2">
                        <button onClick={() => handleEditMedication(doc)} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDeleteMedication(doc.id)} className="text-gray-400 hover:text-red-500 focus:outline-none">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      {doc.notes && <p className="text-gray-500 dark:text-gray-400 italic">{doc.notes}</p>}
                      {doc.startDate && <p><span className="font-medium">Started:</span> {doc.startDate}</p>}
                      {doc.endDate && <p><span className="font-medium">Until:</span> {doc.endDate}</p>}
                    </div>
                    <div className="mt-2">
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Medicines:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {doc.medicines.map((med, idx) => (
                          <li key={idx} className="ml-2">
                            <span className="font-medium">{med.name}</span> — {med.dosage}, {med.frequency}
                            {med.effectiveness && `, Effectiveness: ${med.effectiveness}`}
                            {med.sideEffects && `, Side Effects: ${med.sideEffects}`}
                            {Array.isArray(med.relatedConditions) && med.relatedConditions.length > 0 && (
                              <span>, Related: {med.relatedConditions.join(', ')}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        <div className={`h-3 w-3 rounded-full mr-2 ${doc.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{doc.active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              // If old format (single medicine at root)
              else if (doc.name) {
                return (
                  <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {doc.planName || doc.name || 'Single Medicine Plan'}
                      </h3>
                      <div className="flex space-x-2">
                        <button onClick={() => handleEditMedication(doc)} className="text-gray-400 hover:text-gray-500 focus:outline-none">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDeleteMedication(doc.id)} className="text-gray-400 hover:text-red-500 focus:outline-none">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      {doc.notes && <p className="text-gray-500 dark:text-gray-400 italic">{doc.notes}</p>}
                      {doc.startDate && <p><span className="font-medium">Started:</span> {doc.startDate}</p>}
                      {doc.endDate && <p><span className="font-medium">Until:</span> {doc.endDate}</p>}
                    </div>
                    <div className="mt-2">
                      <h4 className="font-semibold text-gray-800 dark:text-white mb-1">Medicine:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        <li className="ml-2">
                          <span className="font-medium">{doc.name}</span> — {doc.dosage}, {doc.frequency}
                          {doc.effectiveness && `, Effectiveness: ${doc.effectiveness}`}
                          {doc.sideEffects && `, Side Effects: ${doc.sideEffects}`}
                          {Array.isArray(doc.relatedConditions) && doc.relatedConditions.length > 0 && (
                            <span>, Related: {doc.relatedConditions.join(', ')}</span>
                          )}
                        </li>
                      </ul>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        <div className={`h-3 w-3 rounded-full mr-2 ${doc.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{doc.active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              // Unknown format fallback
              else {
                return null;
              }
            })}
          </div>
        )}
      </div>
      
      {/* Add/Edit Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingMedication ? 'Edit Plan' : 'Add New Plan'}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="planName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Plan Name *
              </label>
              <input
                type="text"
                id="planName"
                name="planName"
                value={formData.planName}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Currently following this plan
              </label>
            </div>
            
            {/* Medicines Array UI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Medicines
              </label>
              {formData.medicines.map((med, idx) => (
                <div key={idx} className="border p-3 rounded mb-3 bg-gray-50 dark:bg-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <input
                      type="text"
                      name="name"
                      placeholder="Medicine Name *"
                      value={med.name}
                      onChange={e => handleMedicineChange(idx, e)}
                      required
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                    <input
                      type="text"
                      name="dosage"
                      placeholder="Dosage (e.g. 10mg)"
                      value={med.dosage}
                      onChange={e => handleMedicineChange(idx, e)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                    <input
                      type="text"
                      name="frequency"
                      placeholder="Frequency (e.g. Twice daily)"
                      value={med.frequency}
                      onChange={e => handleMedicineChange(idx, e)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                    <select
                      name="effectiveness"
                      value={med.effectiveness}
                      onChange={e => handleMedicineChange(idx, e)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                      <option value="positive">Positive</option>
                      <option value="neutral">Neutral</option>
                      <option value="negative">Negative</option>
                    </select>
                    <input
                      type="text"
                      name="relatedConditions"
                      placeholder="Related Conditions (comma-separated)"
                      value={Array.isArray(med.relatedConditions) ? med.relatedConditions.join(', ') : ''}
                      onChange={e => handleMedicineChange(idx, e)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                    <input
                      type="text"
                      name="sideEffects"
                      placeholder="Side Effects"
                      value={med.sideEffects}
                      onChange={e => handleMedicineChange(idx, e)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  {formData.medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(idx)}
                      className="text-xs text-red-500 hover:underline mt-1"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addMedicine}
                className="inline-flex items-center px-2 py-1 border border-primary-600 text-xs font-medium rounded text-primary-600 bg-white hover:bg-primary-50 dark:bg-gray-800 dark:hover:bg-gray-700 mt-2"
              >
                + Add Medicine
              </button>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {editingMedication ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Medications; 
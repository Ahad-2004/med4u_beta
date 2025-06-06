import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { updateProfile } from 'firebase/auth';
import Card from '../components/UI/Card';
import Loader from '../components/UI/Loader';

const Profile = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    birthDate: '',
    bloodType: '',
    allergies: '',
    gender: '',
    height: '',
    weight: '',
    bmi: '',
    enablePeriodTracker: false,
    lastPeriodDate: '',
    cycleLength: '28',
    nextPeriodDate: '',
  });
  const [bmiCategory, setBmiCategory] = useState('');
  
  // Load user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Get user document from Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          // User document exists, use the data
          const userData = userDoc.data();
          
          setFormData({
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            emergencyContact: userData.emergencyContact || '',
            birthDate: userData.birthDate || '',
            bloodType: userData.bloodType || '',
            allergies: userData.allergies || '',
            gender: userData.gender || '',
            height: userData.height || '',
            weight: userData.weight || '',
            bmi: userData.bmi || '',
            enablePeriodTracker: userData.enablePeriodTracker || false,
            lastPeriodDate: userData.lastPeriodDate || '',
            cycleLength: userData.cycleLength || '28',
            nextPeriodDate: userData.nextPeriodDate || '',
          });
        } else {
          // User document doesn't exist yet, use data from auth
          setFormData({
            displayName: currentUser.displayName || '',
            email: currentUser.email || '',
            phone: '',
            address: '',
            emergencyContact: '',
            birthDate: '',
            bloodType: '',
            allergies: '',
            gender: '',
            height: '',
            weight: '',
            bmi: '',
            enablePeriodTracker: false,
            lastPeriodDate: '',
            cycleLength: '28',
            nextPeriodDate: '',
          });
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [currentUser]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (name === 'height' || name === 'weight') {
      const h = name === 'height' ? value : formData.height;
      const w = name === 'weight' ? value : formData.weight;
      if (h && w) {
        const hM = parseFloat(h) / 100;
        const wKg = parseFloat(w);
        if (hM > 0 && wKg > 0) {
          const bmiValue = wKg / (hM * hM);
          let category = '';
          if (bmiValue < 18.5) category = 'Underweight';
          else if (bmiValue < 25) category = 'Normal weight';
          else if (bmiValue < 30) category = 'Overweight';
          else category = 'Obese';
          setFormData(prev => ({ ...prev, bmi: bmiValue.toFixed(1) }));
          setBmiCategory(category);
        } else {
          setFormData(prev => ({ ...prev, bmi: '' }));
          setBmiCategory('');
        }
      } else {
        setFormData(prev => ({ ...prev, bmi: '' }));
        setBmiCategory('');
      }
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      setError('');
      setSuccess('');
      
      // Update display name in Firebase Auth if changed
      if (formData.displayName !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: formData.displayName
        });
      }
      
      // Update user profile in Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: formData.displayName,
        phone: formData.phone,
        address: formData.address,
        emergencyContact: formData.emergencyContact,
        birthDate: formData.birthDate,
        bloodType: formData.bloodType,
        allergies: formData.allergies,
        gender: formData.gender,
        height: formData.height,
        weight: formData.weight,
        bmi: formData.bmi,
        enablePeriodTracker: formData.enablePeriodTracker,
        lastPeriodDate: formData.lastPeriodDate,
        cycleLength: formData.cycleLength,
        nextPeriodDate: formData.nextPeriodDate,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setSuccess('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };
  
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
        Profile
      </h1>
      
      <Card>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-800 rounded-md">
              {success}
            </div>
          )}
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Personal Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 dark:bg-gray-600 dark:border-gray-700 dark:text-gray-300 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Email cannot be changed
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="birthDate"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        id="height"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        min="50"
                        max="250"
                      />
                    </div>
                    <div>
                      <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        min="20"
                        max="300"
                      />
                    </div>
                  </div>
                  {formData.bmi && (
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                      BMI: <span className="font-semibold">{formData.bmi}</span> {bmiCategory && (<span className="ml-2">({bmiCategory})</span>)}
                    </div>
                  )}
                  {formData.gender === 'female' && (
                    <div className="mt-2 flex items-center">
                      <input
                        type="checkbox"
                        id="enablePeriodTracker"
                        name="enablePeriodTracker"
                        checked={formData.enablePeriodTracker}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <label htmlFor="enablePeriodTracker" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enable Period Tracker
                      </label>
                    </div>
                  )}
                  {formData.gender === 'female' && formData.enablePeriodTracker && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">Period Tracking</h4>
                      <div className="space-y-2">
                        <div>
                          <label htmlFor="lastPeriodDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Last Period Date
                          </label>
                          <input
                            type="date"
                            id="lastPeriodDate"
                            name="lastPeriodDate"
                            value={formData.lastPeriodDate}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                        <div>
                          <label htmlFor="cycleLength" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Cycle Length (days)
                          </label>
                          <input
                            type="number"
                            id="cycleLength"
                            name="cycleLength"
                            value={formData.cycleLength}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            min="20"
                            max="40"
                          />
                        </div>
                        {formData.lastPeriodDate && formData.cycleLength && (
                          <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                            Estimated Next Period: <span className="font-semibold">{formData.nextPeriodDate}</span>
                          </div>
                        )}
                        <div className="mt-4">
                          <button
                            type="button"
                            onClick={() => window.location.href = '/personal'}
                            className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            Go to Period Tracker
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Medical Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Medical Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Blood Type
                    </label>
                    <select
                      id="bloodType"
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <option value="">Select blood type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Allergies
                    </label>
                    <textarea
                      id="allergies"
                      name="allergies"
                      rows="4"
                      value={formData.allergies}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="List any allergies you have"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      id="emergencyContact"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Name and phone number"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Address
              </label>
              <textarea
                id="address"
                name="address"
                rows="2"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              ></textarea>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updating}
                className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {updating ? (
                  <>
                    <Loader size="small" color="white" />
                    <span className="ml-2">Saving...</span>
                  </>
                ) : (
                  'Save Profile'
                )}
              </button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Profile; 
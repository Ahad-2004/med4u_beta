import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const useFirestore = (collectionName) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get all documents from a collection
  const getDocuments = async (conditions = [], sortBy = null) => {
    setLoading(true);
    setError(null);
    
    try {
      // Collect all constraints
      let constraints = [];
      if (conditions && conditions.length > 0) {
        conditions.forEach(condition => {
          constraints.push(where(condition.field, condition.operator, condition.value));
        });
      }
      if (sortBy) {
        constraints.push(orderBy(sortBy.field, sortBy.direction || 'asc'));
      }
      const q = constraints.length > 0
        ? query(collection(db, collectionName), ...constraints)
        : collection(db, collectionName);
      
      console.log('Fetching documents with query:', q);
      const querySnapshot = await getDocs(q);
      console.log('Query snapshot:', querySnapshot);
      
      const docs = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore timestamps to ISO strings
        const processedData = Object.entries(data).reduce((acc, [key, value]) => {
          if (value && typeof value === 'object' && 'toDate' in value) {
            acc[key] = value.toDate().toISOString();
          } else {
            acc[key] = value;
          }
          return acc;
        }, {});
        
        return {
          id: doc.id,
          ...processedData
        };
      });
      
      console.log('Processed documents:', docs);
      setDocuments(docs);
      setLoading(false);
      return docs;
    } catch (err) {
      console.error('Error getting documents: ', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // Get a single document by ID
  const getDocument = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Convert Firestore timestamps to ISO strings
        const processedData = Object.entries(data).reduce((acc, [key, value]) => {
          if (value && typeof value === 'object' && 'toDate' in value) {
            acc[key] = value.toDate().toISOString();
          } else {
            acc[key] = value;
          }
          return acc;
        }, {});
        
        const document = { id: docSnap.id, ...processedData };
        setLoading(false);
        return document;
      } else {
        setLoading(false);
        return null;
      }
    } catch (err) {
      console.error('Error getting document: ', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  // Add a new document
  const addDocument = async (data) => {
    setError(null);
    
    try {
      // Add created timestamp
      const documentWithTimestamp = {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, collectionName), documentWithTimestamp);
      // Fetch the new document from Firestore to get server timestamps
      const docSnap = await getDoc(docRef);
      const docData = docSnap.data();
      const processedData = Object.entries(docData).reduce((acc, [key, value]) => {
        if (value && typeof value === 'object' && 'toDate' in value) {
          acc[key] = value.toDate().toISOString();
        } else {
          acc[key] = value;
        }
        return acc;
      }, {});
      const newDoc = {
        id: docRef.id,
        ...processedData
      };
      setDocuments(prevDocs => [newDoc, ...prevDocs]);
      return newDoc;
    } catch (err) {
      console.error('Error adding document: ', err);
      setError(err.message);
      throw err;
    }
  };

  // Update a document
  const updateDocument = async (id, data) => {
    setError(null);
    
    try {
      // Add updated timestamp
      const updatedData = {
        ...data,
        updatedAt: serverTimestamp()
      };
      
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, updatedData);
      
      // Update local state
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc.id === id 
            ? { ...doc, ...data, updatedAt: new Date().toISOString() }
            : doc
        )
      );
      
      return {
        id,
        ...data
      };
    } catch (err) {
      console.error('Error updating document: ', err);
      setError(err.message);
      throw err;
    }
  };

  // Delete a document
  const deleteDocument = async (id) => {
    setError(null);
    
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      
      // Update local state
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
      
      return id;
    } catch (err) {
      console.error('Error deleting document: ', err);
      setError(err.message);
      throw err;
    }
  };

  return {
    documents,
    loading,
    error,
    getDocuments,
    getDocument,
    addDocument,
    updateDocument,
    deleteDocument,
    setLoading
  };
};
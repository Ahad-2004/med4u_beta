import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Generic service for Firestore CRUD operations

// Get a collection with optional filters
export const getCollection = async (collectionName, filters = [], sortField = null, sortDirection = 'asc', limitCount = null) => {
  try {
    let collectionRef = collection(db, collectionName);
    let queryRef = collectionRef;
    
    // Apply filters if provided
    if (filters.length > 0) {
      filters.forEach(filter => {
        queryRef = query(queryRef, where(filter.field, filter.operator, filter.value));
      });
    }
    
    // Apply sorting if provided
    if (sortField) {
      queryRef = query(queryRef, orderBy(sortField, sortDirection));
    }
    
    // Apply limit if provided
    if (limitCount) {
      queryRef = query(queryRef, limit(limitCount));
    }
    
    const querySnapshot = await getDocs(queryRef);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return documents;
  } catch (error) {
    console.error("Error getting collection: ", error);
    throw error;
  }
};

// Get a document by ID
export const getDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnapshot = await getDoc(docRef);
    
    if (docSnapshot.exists()) {
      return {
        id: docSnapshot.id,
        ...docSnapshot.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting document: ", error);
    throw error;
  }
};

// Add a document to a collection
export const addDocument = async (collectionName, data) => {
  try {
    const dataWithTimestamp = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, collectionName), dataWithTimestamp);
    return {
      id: docRef.id,
      ...data
    };
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

// Update a document
export const updateDocument = async (collectionName, documentId, data) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    
    const dataWithTimestamp = {
      ...data,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, dataWithTimestamp);
    return {
      id: documentId,
      ...data
    };
  } catch (error) {
    console.error("Error updating document: ", error);
    throw error;
  }
};

// Delete a document
export const deleteDocument = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
    return documentId;
  } catch (error) {
    console.error("Error deleting document: ", error);
    throw error;
  }
}; 
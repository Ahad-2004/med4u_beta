import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

// Upload a file to Firebase Storage
export const uploadFile = (file, path, progressCallback = null) => {
  return new Promise((resolve, reject) => {
    try {
      // Create storage reference
      const storageRef = ref(storage, path);
      
      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      // Listen for state changes, errors, and completion
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          
          // Call progress callback if provided
          if (progressCallback) {
            progressCallback(progress);
          }
        },
        (error) => {
          // Handle errors
          console.error('Error uploading file:', error);
          reject(error);
        },
        async () => {
          // Upload completed successfully
          // Get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Return file metadata and download URL
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            path,
            downloadURL,
            uploadedAt: new Date().toISOString()
          });
        }
      );
    } catch (error) {
      console.error('Error starting file upload:', error);
      reject(error);
    }
  });
};

// Get the download URL for a file
export const getFileURL = async (path) => {
  try {
    const fileRef = ref(storage, path);
    const url = await getDownloadURL(fileRef);
    return url;
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

// Delete a file from Firebase Storage
export const deleteFile = async (path) => {
  try {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}; 
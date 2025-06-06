// Cloudinary storage service - alternative to Firebase Storage
const CLOUDINARY_UPLOAD_PRESET = 'med4u_uploads'; // Create this in your Cloudinary dashboard
const CLOUDINARY_CLOUD_NAME = 'dnqn5xuyc'; // Replace with your cloud name

// Upload a file to Cloudinary
export const uploadFile = (file, path, progressCallback = null) => {
  return new Promise((resolve, reject) => {
    try {
      // Create form data for the upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', path.split('/').slice(0, -1).join('/'));

      // Create an XMLHttpRequest to track progress
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && progressCallback) {
          const progress = Math.round((event.loaded / event.total) * 100);
          progressCallback(progress);
        }
      });

      // Set up completion handler
      xhr.onload = function() {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            path: response.public_id,
            downloadURL: response.secure_url,
            uploadedAt: new Date().toISOString()
          });
        } else {
          reject(new Error('Upload failed'));
        }
      };

      // Set up error handler
      xhr.onerror = function() {
        reject(new Error('Upload failed'));
      };

      // Open and send the request
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`);
      xhr.send(formData);
    } catch (error) {
      console.error('Error starting file upload:', error);
      reject(error);
    }
  });
};

// Get the download URL for a file (already included in upload response)
export const getFileURL = async (path) => {
  try {
    // With Cloudinary, the URL is directly available from the upload
    // This is just a fallback for consistency with the API
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${path}`;
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

// Delete a file from Cloudinary (requires server-side code due to auth restrictions)
export const deleteFile = async (path) => {
  try {
    console.warn('File deletion from Cloudinary requires a server-side API call');
    // You would need a server endpoint to handle deletion securely
    // For now, we'll return success but note this limitation
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}; 
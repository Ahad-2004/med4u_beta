// Utility functions for formatting data

// Format date to a readable string
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

// Format file size from bytes to human-readable format
export const formatFileSize = (bytes) => {
  if (!bytes) return '';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// Format a phone number with proper spacing
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if the input is of correct length
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phoneNumber;
};

// Format a date of birth to calculate age
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return '';
  
  const dob = new Date(dateOfBirth);
  const today = new Date();
  
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
};

// Format lab results to highlight abnormal values
export const formatLabResult = (value, normalRange) => {
  if (!value || !normalRange) return { value, isAbnormal: false };
  
  // Try to parse the normal range
  let isAbnormal = false;
  
  try {
    // Handle ranges like "70-99" or "< 120" or "> 40"
    if (normalRange.includes('-')) {
      const [min, max] = normalRange.split('-').map(v => parseFloat(v.trim()));
      const numValue = parseFloat(value);
      isAbnormal = numValue < min || numValue > max;
    } else if (normalRange.includes('<')) {
      const max = parseFloat(normalRange.replace('<', '').trim());
      const numValue = parseFloat(value);
      isAbnormal = numValue >= max;
    } else if (normalRange.includes('>')) {
      const min = parseFloat(normalRange.replace('>', '').trim());
      const numValue = parseFloat(value);
      isAbnormal = numValue <= min;
    }
  } catch (error) {
    console.error('Error parsing lab result range:', error);
  }
  
  return { value, isAbnormal };
}; 
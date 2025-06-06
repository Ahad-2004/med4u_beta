import React from 'react';

const Loader = ({ size = 'default', color = 'primary' }) => {
  // Determine size class
  let sizeClass = 'w-8 h-8';
  if (size === 'small') {
    sizeClass = 'w-5 h-5';
  } else if (size === 'large') {
    sizeClass = 'w-12 h-12';
  }
  
  // Determine color class
  let colorClass = 'text-primary-600';
  if (color === 'white') {
    colorClass = 'text-white';
  } else if (color === 'gray') {
    colorClass = 'text-gray-500';
  }
  
  return (
    <div className="flex items-center justify-center">
      <svg 
        className={`animate-spin ${sizeClass} ${colorClass}`} 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        ></circle>
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
};

export default Loader; 
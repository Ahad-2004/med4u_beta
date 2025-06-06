import React from 'react';

const Card = ({ children, className = '', onClick = null }) => {
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-200 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card; 
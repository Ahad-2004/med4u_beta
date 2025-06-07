import React from 'react';

const ProgressBar = ({ progress = 0, label = '', className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="mb-1 text-sm font-medium text-blue-700 dark:text-blue-200">{label}</div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">{progress}%</div>
    </div>
  );
};

export default ProgressBar;

import React from 'react';

const Card = ({ children, className = '', onClick = null, header = null, footer = null, hoverable = false }) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-200 border border-gray-100 dark:border-gray-700 ${hoverable ? 'hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-500' : ''} ${className}`}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-pressed={onClick ? 'false' : undefined}
    >
      {header && <div className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{header}</div>}
      <div>{children}</div>
      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
};

export default Card;
import React, { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'default',
  showCloseButton = true 
}) => {
  const modalRef = useRef(null);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscKey);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Removed focus trap that was stealing focus from input fields
      // setTimeout(() => {
      //   if (modalRef.current) modalRef.current.focus();
      // }, 50);
    }
    return () => {
      window.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  let modalWidth = 'max-w-lg';
  if (size === 'small') modalWidth = 'max-w-md';
  else if (size === 'large') modalWidth = 'max-w-2xl';
  else if (size === 'xl') modalWidth = 'max-w-4xl';
  else if (size === 'full') modalWidth = 'max-w-7xl';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity animate-fadeIn ${isOpen ? '' : 'hidden'}`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className={`relative w-full ${modalWidth} mx-4 my-8 bg-white dark:bg-gray-900 rounded-xl shadow-xl outline-none focus:outline-none transition-all duration-200 animate-fadeInUp`}
        tabIndex={-1}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        )}
        {title && <div className="px-6 pt-6 pb-2 text-xl font-bold text-gray-900 dark:text-white" id="modal-title">{title}</div>}
        <div className="px-6 pb-6 pt-2">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

// Add fadeIn and fadeInUp animations to your Tailwind config if not present.


import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  
  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className="flex items-center p-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <>
          <SunIcon className="h-5 w-5 mr-2" />
          <span className="text-sm">Light</span>
        </>
      ) : (
        <>
          <MoonIcon className="h-5 w-5 mr-2" />
          <span className="text-sm">Dark</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle; 
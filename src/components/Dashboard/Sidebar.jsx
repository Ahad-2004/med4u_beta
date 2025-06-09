import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import {
  HomeIcon,
  UserIcon,
  DocumentTextIcon,
  FolderIcon,
  ExclamationTriangleIcon,
  BeakerIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  CalendarIcon // <-- Add this import
} from '@heroicons/react/24/outline';

const HeartIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 mr-3 flex-shrink-0" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
  </svg>
);

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  
  const closeSidebar = () => {
    setIsOpen(false);
  };
  
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Profile', path: '/profile', icon: UserIcon },
    { name: 'Medications', path: '/medications', icon: BeakerIcon },
    { name: 'Medical Cases', path: '/cases', icon: FolderIcon },
    { name: 'Important Conditions', path: '/conditions', icon: ExclamationTriangleIcon },
    { name: 'Reports', path: '/reports', icon: DocumentTextIcon },
    { name: 'Appointments', path: '/appointments', icon: HeartIcon }, // Use custom HeartIcon
  ];
  
  const NavItem = ({ item, onClick }) => (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={({ isActive }) => 
        `flex items-center p-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
        }`
      }
    >
      <item.icon className="h-6 w-6 mr-3 flex-shrink-0" />
      <span className="text-sm font-medium">{item.name}</span>
    </NavLink>
  );
  
  // Mobile sidebar toggle button
  const MobileMenuButton = () => (
    <button
      type="button"
      onClick={toggleSidebar}
      className="md:hidden inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
    >
      <span className="sr-only">Open sidebar</span>
      <Bars3Icon className="w-6 h-6" />
    </button>
  );
  
  return (
    <>
      {/* Mobile menu button */}
      <div className="flex md:hidden items-center h-16 fixed top-0 left-0 z-40 w-full bg-white dark:bg-gray-900 px-4 shadow-sm">
        <MobileMenuButton />
        <div className="ml-4 font-semibold text-gray-800 dark:text-white">Med4U</div>
      </div>
      
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen transition-transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } w-64 bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <span className="text-xl font-semibold text-gray-800 dark:text-white">Med4U</span>
            <button
              type="button"
              onClick={closeSidebar}
              className="md:hidden p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <span className="sr-only">Close sidebar</span>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* User info */}
          {currentUser && (
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                  {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-white truncate">
                    {currentUser.displayName || currentUser.email}
                  </p>
                  {currentUser.displayName && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {currentUser.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation menu */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavItem key={item.name} item={item} onClick={closeSidebar} />
            ))}
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800 p-2 rounded-lg"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
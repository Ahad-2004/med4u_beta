import React from 'react';
import { Navigate } from 'react-router-dom';
import MainContent from './components/Dashboard/MainContent';

// Auth Components
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ForgotPassword from './components/Auth/ForgotPassword';

// Dashboard Components
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Medications from './components/Medical/Medications';
import MedicalCases from './pages/MedicalCases';
import ImportantConditions from './pages/ImportantConditions';
import Reports from './pages/Reports';
import Personal from './pages/Personal';

// Protected Route wrapper
import ProtectedRoute from './components/Auth/ProtectedRoute';

const routes = [
  {
    path: '/',
    element: <Navigate to="/login" />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainContent />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'profile',
        element: <Profile />,
      },
      {
        path: 'medications',
        element: <Medications />,
      },
      {
        path: 'cases',
        element: <MedicalCases />,
      },
      {
        path: 'conditions',
        element: <ImportantConditions />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'personal',
        element: <React.Suspense fallback={null}>{React.createElement(React.lazy(() => import('./pages/Personal')))}</React.Suspense>,
      },
      {
        path: 'appointments',
        element: <React.Suspense fallback={null}>{React.createElement(React.lazy(() => import('./pages/Appointments')))}</React.Suspense>,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" />,
  },
];

export default routes;
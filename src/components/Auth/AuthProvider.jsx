import React from 'react';
import { AuthProvider as FirebaseAuthProvider } from '../../context/AuthContext';

const AuthProvider = ({ children }) => {
  return (
    <FirebaseAuthProvider>
      {children}
    </FirebaseAuthProvider>
  );
};

export default AuthProvider; 
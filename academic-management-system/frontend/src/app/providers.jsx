import React from 'react';
import { AuthProvider } from '../features/auth/auth.context';
import { AcademicProvider } from '../context/AcademicContext';

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <AcademicProvider>
        {children}
      </AcademicProvider>
    </AuthProvider>
  );
};

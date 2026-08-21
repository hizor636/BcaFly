import { AuthProvider } from '../features/auth/auth.context';

export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

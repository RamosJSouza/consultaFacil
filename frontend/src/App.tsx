import { AuthProvider } from './presentation/contexts/AuthContext';
import { AppRouter } from './presentation/routes';

export const App = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

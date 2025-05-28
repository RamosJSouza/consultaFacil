import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './presentation/contexts/AuthContext';
import { NotificationProvider } from './presentation/contexts/NotificationContext';
import { AppRouter } from './presentation/routes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppRouter />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

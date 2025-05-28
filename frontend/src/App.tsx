import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './presentation/contexts/AuthContext';
import { NotificationProvider } from './presentation/contexts/NotificationContext';
import { AppRouter } from './presentation/routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <AppRouter />
          <ToastContainer 
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

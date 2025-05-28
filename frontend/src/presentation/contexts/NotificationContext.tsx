import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { config } from '../../infrastructure/config';
import type { Notification } from '../../domain/entities/Notification';

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  showToast: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  createdAt: Date;
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const intervalId = setInterval(fetchNotifications, 30000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [user]);

  // Auto-dismiss toasts after 5 seconds
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    toasts.forEach(toast => {
      const timer = setTimeout(() => {
        setToasts(current => current.filter(t => t.id !== toast.id));
      }, 5000);
      
      timers.push(timer);
    });
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${config.apiUrl}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.patch(
        `${config.apiUrl}/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      await axios.delete(`${config.apiUrl}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications([]);
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const addNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const newToast: ToastNotification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      createdAt: new Date()
    };
    
    setToasts(prev => [newToast, ...prev]);
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        markAsRead, 
        clearAll, 
        addNotification,
        showToast
      }}
    >
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-4">
          {toasts.map(toast => (
            <div 
              key={toast.id}
              className={`p-4 rounded-md shadow-lg max-w-md transform transition-all duration-300 ease-in-out ${
                toast.type === 'success' ? 'bg-green-50 border-l-4 border-green-500' :
                toast.type === 'error' ? 'bg-red-50 border-l-4 border-red-500' :
                toast.type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                'bg-blue-50 border-l-4 border-blue-500'
              }`}
            >
              <div className="flex justify-between">
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${
                    toast.type === 'success' ? 'text-green-800' :
                    toast.type === 'error' ? 'text-red-800' :
                    toast.type === 'warning' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {toast.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{toast.message}</p>
                </div>
                <button 
                  onClick={() => setToasts(current => current.filter(t => t.id !== toast.id))}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {children}
    </NotificationContext.Provider>
  );
}; 
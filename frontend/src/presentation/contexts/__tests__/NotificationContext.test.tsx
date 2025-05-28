import { render, screen, act } from '@testing-library/react';
import { NotificationProvider, useNotifications } from '../NotificationContext';
import { useAuth } from '../AuthContext';
import { NotificationService } from '../../../infrastructure/services/NotificationService';

// Mock dependencies
jest.mock('../AuthContext');
jest.mock('../../../infrastructure/services/NotificationService');

// Mock WebSocket
class MockWebSocket {
  onmessage: ((event: { data: string }) => void) | null = null;
  close = jest.fn();
}

interface ExtendedGlobal extends NodeJS.Global {
  WebSocket: jest.Mock;
}

(global as ExtendedGlobal).WebSocket = jest.fn().mockImplementation(() => new MockWebSocket());

describe('NotificationContext', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
  };

  const mockNotifications = [
    {
      id: '1',
      userId: '1',
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'system',
      read: false,
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (NotificationService as jest.Mock).mockImplementation(() => ({
      getNotifications: jest.fn().mockResolvedValue(mockNotifications),
      markAsRead: jest.fn().mockResolvedValue(undefined),
      clearAll: jest.fn().mockResolvedValue(undefined),
    }));
  });

  const TestComponent = () => {
    const { notifications, markAsRead, clearAll } = useNotifications();
    return (
      <div>
        <div data-testid="notification-count">{notifications.length}</div>
        <button onClick={() => markAsRead('1')}>Mark as Read</button>
        <button onClick={clearAll}>Clear All</button>
      </div>
    );
  };

  it('provides notifications to children', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Wait for notifications to load
    await screen.findByTestId('notification-count');
    expect(screen.getByTestId('notification-count')).toHaveTextContent('1');
  });

  it('handles WebSocket notifications', async () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    // Wait for initial notifications to load
    await screen.findByTestId('notification-count');

    // Simulate WebSocket message
    const ws = (global as ExtendedGlobal).WebSocket.mock.results[0].value;
    act(() => {
      ws.onmessage?.({
        data: JSON.stringify({
          id: '2',
          userId: '1',
          title: 'New Notification',
          message: 'This is a new notification',
          type: 'system',
          read: false,
          createdAt: new Date().toISOString(),
        }),
      });
    });

    expect(screen.getByTestId('notification-count')).toHaveTextContent('2');
  });

  it('marks notification as read', async () => {
    const { getByText } = render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await screen.findByTestId('notification-count');
    const markAsReadButton = getByText('Mark as Read');
    await act(async () => {
      markAsReadButton.click();
    });

    const notificationService = (NotificationService as jest.Mock).mock.results[0].value;
    expect(notificationService.markAsRead).toHaveBeenCalledWith('1');
  });

  it('clears all notifications', async () => {
    const { getByText } = render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await screen.findByTestId('notification-count');
    const clearAllButton = getByText('Clear All');
    await act(async () => {
      clearAllButton.click();
    });

    const notificationService = (NotificationService as jest.Mock).mock.results[0].value;
    expect(notificationService.clearAll).toHaveBeenCalled();
    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
  });

  it('handles errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (NotificationService as jest.Mock).mockImplementation(() => ({
      getNotifications: jest.fn().mockRejectedValue(new Error('Failed to fetch')),
      markAsRead: jest.fn().mockRejectedValue(new Error('Failed to mark as read')),
      clearAll: jest.fn().mockRejectedValue(new Error('Failed to clear')),
    }));

    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    await screen.findByTestId('notification-count');
    expect(screen.getByTestId('notification-count')).toHaveTextContent('0');
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
}); 
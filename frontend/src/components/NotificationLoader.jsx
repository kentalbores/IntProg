import { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import axios from '../config/axiosconfig';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Button 
} from '@mui/material';

// Lazy-loaded components
const NotificationList = lazy(() => import('./NotificationList'));
const EmptyNotificationState = lazy(() => import('./EmptyState').then(
  module => ({ default: props => <module.default {...props} type="notifications" /> })
));
const ErrorState = lazy(() => import('./ErrorState'));

// Custom hook for notification fetching with user preferences
const useNotifications = (username, initialPage = 1, pageSize = 10) => {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: pageSize,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchNotifications = async (page = initialPage, reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `/api/notifications/user/${username}?page=${page}&limit=${pageSize}&includePreferences=true`
      );
      
      if (response.data) {
        const { notifications: newNotifications, pagination: newPagination } = response.data;
        
        // Update state based on whether we're refreshing or loading more
        if (reset) {
          setNotifications(newNotifications);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }
        
        setPagination(newPagination);
        setHasMore(newPagination.page < newPagination.pages);
      }
    } catch (err) {
      setError(err.message || 'Failed to load notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (username) {
      fetchNotifications(initialPage, true);
    }
  }, [username]);

  // Function to load more notifications
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchNotifications(pagination.page + 1);
    }
  };

  // Function to refresh notifications
  const refresh = () => {
    fetchNotifications(initialPage, true);
  };

  // Function to mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/mark-all-read', { username });
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  return {
    notifications,
    pagination,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    markAsRead,
    markAllAsRead
  };
};

// Main component with Suspense
const NotificationLoader = ({ username, themeMode }) => {
  const {
    notifications,
    pagination,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    markAsRead,
    markAllAsRead
  } = useNotifications(username);

  // Group notifications by date for better UI organization
  const groupedNotifications = useMemo(() => {
    const groups = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.time);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      
      let groupKey;
      
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = date.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        });
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(notification);
    });
    
    return groups;
  }, [notifications]);

  if (error) {
    return (
      <Suspense fallback={<CircularProgress />}>
        <ErrorState 
          message="Failed to load notifications" 
          onRetry={refresh} 
        />
      </Suspense>
    );
  }

  return (
    <Box>
      {loading && notifications.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress size={40} />
        </Box>
      ) : notifications.length === 0 ? (
        <Suspense fallback={<CircularProgress />}>
          <EmptyNotificationState />
        </Suspense>
      ) : (
        <>
          <Suspense fallback={<CircularProgress />}>
            <NotificationList 
              groupedNotifications={groupedNotifications} 
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              themeMode={themeMode}
            />
          </Suspense>
          
          {hasMore && (
            <Box textAlign="center" mt={2} mb={2}>
              <Button 
                onClick={loadMore} 
                disabled={loading}
                variant="outlined"
                size="small"
              >
                {loading ? <CircularProgress size={20} /> : 'Load More'}
              </Button>
            </Box>
          )}
          
          {pagination.total > 0 && (
            <Typography variant="caption" color="text.secondary" align="center" display="block" mt={1}>
              Showing {notifications.length} of {pagination.total} notifications
            </Typography>
          )}
        </>
      )}
    </Box>
  );
};

export default NotificationLoader; 
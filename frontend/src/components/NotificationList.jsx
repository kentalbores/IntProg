import { memo } from 'react';
import PropTypes from 'prop-types';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import EventIcon from '@mui/icons-material/Event';
import { useNavigate } from 'react-router-dom';

// Memoized to prevent unnecessary re-renders
const NotificationList = memo(({ 
  groupedNotifications, 
  onMarkAsRead, 
  onMarkAllAsRead,
  themeMode 
}) => {
  const navigate = useNavigate();
  
  // Get total count of unread notifications
  const unreadCount = Object.values(groupedNotifications)
    .flat()
    .filter(notification => !notification.read)
    .length;
  
  // Handle click on notification - mark as read and navigate if event
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      onMarkAsRead(notification._id);
    }
    
    // If notification has event data, navigate to event page
    if (notification.eventId || (notification.event && notification.event.id)) {
      const eventId = notification.eventId || notification.event.id;
      navigate(`/event-details/${eventId}`);
    }
  };
  
  return (
    <Box sx={{ mb: 2 }}>
      {/* Header with mark all as read button */}
      {unreadCount > 0 && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 1,
            px: 2,
            py: 1,
            borderRadius: 1,
            bgcolor: themeMode === 'dark' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.05)'
          }}
        >
          <Typography variant="body2" color="primary">
            {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
          </Typography>
          <Button 
            size="small" 
            startIcon={<DoneAllIcon />}
            onClick={onMarkAllAsRead}
          >
            Mark all as read
          </Button>
        </Box>
      )}
      
      {/* Display notifications grouped by date */}
      {Object.entries(groupedNotifications).map(([date, notifications]) => (
        <Paper 
          key={date} 
          elevation={0}
          sx={{ 
            mb: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
          }}
        >
          {/* Date header */}
          <Typography 
            variant="subtitle2" 
            sx={{ 
              px: 2, 
              py: 1,
              bgcolor: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(0,0,0,0.02)',
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8
            }}
          >
            {date}
          </Typography>
          
          <Divider />
          
          {/* Notifications for this date */}
          <List dense disablePadding>
            {notifications.map((notification) => (
              <ListItem
                key={notification._id}
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  py: 1.5,
                  borderBottom: '1px solid',
                  borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  '&:last-child': { borderBottom: 'none' },
                  bgcolor: !notification.read && (themeMode === 'dark' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.05)'),
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                  {/* Unread indicator */}
                  {!notification.read && (
                    <FiberManualRecordIcon 
                      color="primary" 
                      sx={{ 
                        fontSize: 10, 
                        mt: 1.2, 
                        mr: 1.5, 
                        flexShrink: 0 
                      }} 
                    />
                  )}
                  
                  {/* Event icon if notification is related to an event */}
                  {notification.eventId && (
                    <EventIcon 
                      sx={{ 
                        mr: 1.5, 
                        mt: 0.5, 
                        color: 'action.active',
                        opacity: notification.read ? 0.6 : 1,
                        flexShrink: 0 
                      }} 
                      fontSize="small" 
                    />
                  )}
                  
                  <ListItemText
                    primary={
                      <Typography 
                        variant="body2" 
                        sx={{ fontWeight: notification.read ? 400 : 600 }}
                      >
                        {notification.text}
                      </Typography>
                    }
                    secondary={
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        {notification.relativeTime || new Date(notification.time).toLocaleTimeString()}
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                  
                  {/* Mark as read button for unread notifications */}
                  {!notification.read && (
                    <Tooltip title="Mark as read">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notification._id);
                        }}
                        sx={{ 
                          ml: 1,
                          opacity: 0.7,
                          '&:hover': { opacity: 1 } 
                        }}
                      >
                        <DoneAllIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        </Paper>
      ))}
    </Box>
  );
});

NotificationList.propTypes = {
  groupedNotifications: PropTypes.object.isRequired,
  onMarkAsRead: PropTypes.func.isRequired,
  onMarkAllAsRead: PropTypes.func.isRequired,
  themeMode: PropTypes.string
};

NotificationList.displayName = 'NotificationList';

export default NotificationList; 
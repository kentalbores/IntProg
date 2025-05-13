import { useState, useEffect } from 'react';
import axios from "../config/axiosconfig";
import {
  Box,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import UpdateIcon from '@mui/icons-material/Update';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import PropTypes from 'prop-types';

const NotificationsSection = ({ themeMode, onSuccess, onError }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    allPushNotifications: true,
    organizerRegistrations: true,
    eventUpdates: true,
    vendorBookings: true
  });
  
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const username = sessionStorage.getItem('username');
        if (!username) {
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`/api/notifications/settings?username=${username}`);
        
        if (response.data?.settings) {
          setNotifications({
            allPushNotifications: response.data.settings.push_notifications || true,
            organizerRegistrations: response.data.settings.organizer_registrations || true,
            eventUpdates: response.data.settings.event_updates || true,
            vendorBookings: response.data.settings.vendor_bookings || true
          });
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        // Fall back to defaults if there's an error
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotificationSettings();
  }, []);
  
  // Handle notification toggle changes
  const handleNotificationChange = async (setting) => {
    try {
      // Create a new state with the toggled setting
      const newSettings = {
        ...notifications,
        [setting]: !notifications[setting]
      };
      
      // Special handling for the master toggle
      if (setting === 'allPushNotifications') {
        // If turning off all notifications, keep the internal state of each specific notification
        // but they'll be effectively disabled by the master toggle
      }
      
      // Update local state immediately for better UX
      setNotifications(newSettings);
      
      // If we're toggling a specific notification while the master is off, also turn the master on
      if (setting !== 'allPushNotifications' && !notifications.allPushNotifications) {
        setNotifications({
          ...newSettings,
          allPushNotifications: true
        });
      }
      
      // Only show the saving indicator for a moment (actual API call below)
      setSaving(true);
      
      // Make API call to save changes
      const username = sessionStorage.getItem('username');
      const response = await axios.post('/api/notifications/update', {
        username,
        push_notifications: setting === 'allPushNotifications' ? !notifications[setting] : notifications.allPushNotifications,
        organizer_registrations: setting === 'organizerRegistrations' ? !notifications[setting] : notifications.organizerRegistrations,
        event_updates: setting === 'eventUpdates' ? !notifications[setting] : notifications.eventUpdates,
        vendor_bookings: setting === 'vendorBookings' ? !notifications[setting] : notifications.vendorBookings
      });
      
      if (response.status === 200) {
        onSuccess && onSuccess('Notification settings updated');
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      onError && onError('Failed to update notification settings');
      
      // Revert the state change on error
      const username = sessionStorage.getItem('username');
      try {
        const response = await axios.get(`/api/notifications/settings?username=${username}`);
        if (response.data?.settings) {
          setNotifications({
            allPushNotifications: response.data.settings.push_notifications || true,
            organizerRegistrations: response.data.settings.organizer_registrations || true,
            eventUpdates: response.data.settings.event_updates || true,
            vendorBookings: response.data.settings.vendor_bookings || true
          });
        }
      } catch (fetchError) {
        // If we can't fetch the current state, just revert to the previous known state
        console.error('Error fetching notification settings:', fetchError);
      }
    } finally {
      // Hide the saving indicator after a brief delay for better UX
      setTimeout(() => setSaving(false), 500);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: themeMode === 'dark' ? 'white' : 'text.primary' }}>
        <NotificationsIcon sx={{ mr: 1 }} /> Notification Preferences
      </Typography>
      
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        }}
      >
        {/* Master toggle for all notifications */}
        <Box 
          sx={{ 
            p: 3, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            backgroundColor: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight="medium">
              Push Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {notifications.allPushNotifications 
                ? 'You will receive push notifications based on your preferences below' 
                : 'All push notifications are currently disabled'}
            </Typography>
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={notifications.allPushNotifications}
                onChange={() => handleNotificationChange('allPushNotifications')}
                color="primary"
              />
            }
            label=""
          />
        </Box>
        
        <Divider />
        
        {/* Specific notification settings */}
        <List 
          subheader={
            <ListSubheader 
              component="div" 
              sx={{ 
                backgroundColor: 'transparent', 
                color: themeMode === 'dark' ? 'primary.light' : 'primary.main' 
              }}
            >
              Notification Types
            </ListSubheader>
          }
        >
          <ListItem sx={{ py: 1.5 }}>
            <ListItemIcon>
              <PeopleIcon 
                color={notifications.allPushNotifications && notifications.organizerRegistrations ? 'primary' : 'disabled'} 
              />
            </ListItemIcon>
            <ListItemText 
              primary="Event Registrations" 
              secondary="Get notified when users register for your events" 
              sx={{
                opacity: notifications.allPushNotifications ? 1 : 0.5,
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.organizerRegistrations}
                  onChange={() => handleNotificationChange('organizerRegistrations')}
                  disabled={!notifications.allPushNotifications}
                  color="primary"
                />
              }
              label=""
            />
          </ListItem>
          
          <Divider variant="inset" component="li" />
          
          <ListItem sx={{ py: 1.5 }}>
            <ListItemIcon>
              <UpdateIcon 
                color={notifications.allPushNotifications && notifications.eventUpdates ? 'primary' : 'disabled'} 
              />
            </ListItemIcon>
            <ListItemText 
              primary="Event Updates & Reminders" 
              secondary="Get notified about updates to events you're registered for and upcoming event reminders" 
              sx={{
                opacity: notifications.allPushNotifications ? 1 : 0.5,
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.eventUpdates}
                  onChange={() => handleNotificationChange('eventUpdates')}
                  disabled={!notifications.allPushNotifications}
                  color="primary"
                />
              }
              label=""
            />
          </ListItem>
          
          <Divider variant="inset" component="li" />
          
          <ListItem sx={{ py: 1.5 }}>
            <ListItemIcon>
              <BusinessCenterIcon 
                color={notifications.allPushNotifications && notifications.vendorBookings ? 'primary' : 'disabled'} 
              />
            </ListItemIcon>
            <ListItemText 
              primary="Vendor Bookings" 
              secondary="Get notified when your vendor services are booked by organizers" 
              sx={{
                opacity: notifications.allPushNotifications ? 1 : 0.5,
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.vendorBookings}
                  onChange={() => handleNotificationChange('vendorBookings')}
                  disabled={!notifications.allPushNotifications}
                  color="primary"
                />
              }
              label=""
            />
          </ListItem>
        </List>
        
        {saving && (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

NotificationsSection.propTypes = {
  themeMode: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  onError: PropTypes.func
};

export default NotificationsSection; 
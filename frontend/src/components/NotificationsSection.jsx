import { useState, useEffect } from 'react';
import axios from "../config/axiosconfig";
import {
  Box,
  Typography,
  Paper,
  FormControlLabel,
  Switch,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Snackbar
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import UpdateIcon from '@mui/icons-material/Update';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import EmailIcon from '@mui/icons-material/Email';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import AlarmIcon from '@mui/icons-material/Alarm';
import CampaignIcon from '@mui/icons-material/Campaign';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningIcon from '@mui/icons-material/Warning';
import PropTypes from 'prop-types';

const NotificationsSection = ({ themeMode, onSuccess, onError }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingChannel, setSavingChannel] = useState('');
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmSetting, setConfirmSetting] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    // Notification channels
    push_notifications: true,
    email_notifications: true,
    sms_notifications: false,
    
    // Notification types
    organizer_registrations: true,
    event_updates: true,
    vendor_bookings: true,
    event_reminders: true,
    marketing_communications: false
  });
  
  // Critical notification types that should prompt confirmation when disabling
  const criticalNotifications = ['event_updates', 'event_reminders'];
  
  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        setLoading(true);
        const username = sessionStorage.getItem('username');
        if (!username) {
          setLoading(false);
          setErrorMessage('User not logged in');
          setShowError(true);
          return;
        }
        
        const response = await axios.get(`/api/notifications/settings?username=${username}`);
        
        if (response.data?.settings) {
          // Extract all settings from response and update state
          const settings = response.data.settings;
          setNotifications({
            push_notifications: settings.push_notifications !== undefined ? settings.push_notifications : true,
            email_notifications: settings.email_notifications !== undefined ? settings.email_notifications : true,
            sms_notifications: settings.sms_notifications !== undefined ? settings.sms_notifications : false,
            organizer_registrations: settings.organizer_registrations !== undefined ? settings.organizer_registrations : true,
            event_updates: settings.event_updates !== undefined ? settings.event_updates : true,
            vendor_bookings: settings.vendor_bookings !== undefined ? settings.vendor_bookings : true,
            event_reminders: settings.event_reminders !== undefined ? settings.event_reminders : true,
            marketing_communications: settings.marketing_communications !== undefined ? settings.marketing_communications : false
          });
          
          // Check if phone is verified (assuming this comes from the response)
          setIsPhoneVerified(settings.phone_verified || false);
          setPhoneNumber(settings.phone || '');
        }
      } catch (error) {
        console.error('Error fetching notification settings:', error);
        setErrorMessage('Failed to load notification settings. Please try again.');
        setShowError(true);
        onError && onError('Failed to load notification settings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotificationSettings();
    
    // Cleanup function to handle component unmounting
    return () => {
      setSaving(false);
    };
  }, [onError]);
  
  // Handle notification toggle changes
  const handleNotificationChange = async (setting) => {
    // Handle critical notification confirmation
    if (notifications[setting] && criticalNotifications.includes(setting)) {
      setConfirmSetting(setting);
      setConfirmDialogOpen(true);
      return;
    }
    
    // Handle SMS verification if not verified
    if (setting === 'sms_notifications' && !notifications[setting] && !isPhoneVerified) {
      setPhoneDialogOpen(true);
      return;
    }
    
    await updateNotificationSetting(setting);
  };
  
  // Update notification setting after confirmation
  const updateNotificationSetting = async (setting) => {
    try {
      // Set saving state for UI feedback
      setSaving(true);
      setSavingChannel(setting);
      
      // Create a new state with the toggled setting
      const newSettings = {
        ...notifications,
        [setting]: !notifications[setting]
      };
      
      // Update local state immediately for better UX
      setNotifications(newSettings);
      
      // Make API call to save changes
      const username = sessionStorage.getItem('username');
      const response = await axios.post('/api/notifications/update', {
        username,
        ...newSettings
      });
      
      if (response.status === 200) {
        onSuccess && onSuccess(`${setting.replace(/_/g, ' ')} ${newSettings[setting] ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error updating notification settings:', error);
      setErrorMessage('Failed to update notification settings. Please try again.');
      setShowError(true);
      onError && onError('Failed to update notification settings');
      
      // Revert the state change on error
      const username = sessionStorage.getItem('username');
      try {
        const response = await axios.get(`/api/notifications/settings?username=${username}`);
        if (response.data?.settings) {
          const settings = response.data.settings;
          setNotifications({
            push_notifications: settings.push_notifications !== undefined ? settings.push_notifications : true,
            email_notifications: settings.email_notifications !== undefined ? settings.email_notifications : true,
            sms_notifications: settings.sms_notifications !== undefined ? settings.sms_notifications : false,
            organizer_registrations: settings.organizer_registrations !== undefined ? settings.organizer_registrations : true,
            event_updates: settings.event_updates !== undefined ? settings.event_updates : true,
            vendor_bookings: settings.vendor_bookings !== undefined ? settings.vendor_bookings : true,
            event_reminders: settings.event_reminders !== undefined ? settings.event_reminders : true,
            marketing_communications: settings.marketing_communications !== undefined ? settings.marketing_communications : false
          });
        }
      } catch (fetchError) {
        console.error('Error fetching notification settings:', fetchError);
      }
    } finally {
      // Hide the saving indicator after a brief delay for better UX
      setTimeout(() => {
        setSaving(false);
        setSavingChannel('');
      }, 800);
    }
  };
  
  // Handle phone verification
  const handlePhoneVerification = async () => {
    try {
      // Basic phone number validation
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(phoneNumber)) {
        setErrorMessage('Please enter a valid phone number');
        setShowError(true);
        return;
      }
      
      setSaving(true);
      
      // Here you would typically send a verification code to the user's phone
      // and verify it, but for this example we'll just simulate success
      const username = sessionStorage.getItem('username');
      await axios.post('/api/user/update-phone', {
        username,
        phone: phoneNumber
      });
      
      // Update verification status
      setIsPhoneVerified(true);
      
      // Enable SMS notifications
      await updateNotificationSetting('sms_notifications');
      
      setPhoneDialogOpen(false);
      onSuccess && onSuccess('Phone number verified and SMS notifications enabled');
    } catch (error) {
      console.error('Error verifying phone:', error);
      setErrorMessage('Failed to verify phone number. Please try again.');
      setShowError(true);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle confirmation dialog response
  const handleConfirmation = async (confirmed) => {
    setConfirmDialogOpen(false);
    
    if (confirmed && confirmSetting) {
      await updateNotificationSetting(confirmSetting);
    }
    
    setConfirmSetting('');
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
      
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        Customize how and when you want to be notified about events and activities in EventHub.
      </Alert>
      
      {/* Notification Channels */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
          mb: 4
        }}
      >
        <Box 
          sx={{ 
            px: 3, 
            py: 2,
            backgroundColor: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(59, 130, 246, 0.05)',
          }}
        >
          <Typography variant="subtitle1" fontWeight="600">
            Notification Channels
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose how you&apos;d like to receive notifications
          </Typography>
        </Box>
        
        <List sx={{ py: 0 }}>
          {/* Push Notifications */}
          <ListItem 
            sx={{ 
              py: 2, 
              borderBottom: '1px solid', 
              borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
            }}
          >
            <ListItemIcon>
              <NotificationsIcon color={notifications.push_notifications ? 'primary' : 'disabled'} />
            </ListItemIcon>
            <ListItemText 
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2">Push Notifications</Typography>
                  <Chip 
                    label="Browser" 
                    size="small" 
                    sx={{ 
                      height: 20, 
                      fontSize: '0.7rem',
                      bgcolor: themeMode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                      color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                    }} 
                  />
                </Box>
              }
              secondary="Get notifications in your browser" 
            />
            {saving && savingChannel === 'push_notifications' ? (
              <CircularProgress size={24} thickness={4} />
            ) : (
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.push_notifications}
                    onChange={() => handleNotificationChange('push_notifications')}
                    color="primary"
                  />
                }
                label=""
              />
            )}
          </ListItem>
          
          {/* Email Notifications */}
          <ListItem 
            sx={{ 
              py: 2, 
              borderBottom: '1px solid', 
              borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
            }}
          >
            <ListItemIcon>
              <EmailIcon color={notifications.email_notifications ? 'primary' : 'disabled'} />
            </ListItemIcon>
            <ListItemText 
              primary="Email Notifications"
              secondary="Receive updates via email"
            />
            {saving && savingChannel === 'email_notifications' ? (
              <CircularProgress size={24} thickness={4} />
            ) : (
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.email_notifications}
                    onChange={() => handleNotificationChange('email_notifications')}
                    color="primary"
                  />
                }
                label=""
              />
            )}
          </ListItem>
          
          {/* SMS Notifications */}
          <ListItem sx={{ py: 2 }}>
            <ListItemIcon>
              <PhoneAndroidIcon color={notifications.sms_notifications ? 'primary' : 'disabled'} />
            </ListItemIcon>
            <ListItemText 
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2">SMS Notifications</Typography>
                  {!isPhoneVerified && (
                    <Tooltip title="You need to verify your phone number to enable SMS notifications">
                      <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </Tooltip>
                  )}
                </Box>
              }
              secondary={isPhoneVerified 
                ? `Notifications will be sent to ${phoneNumber}` 
                : "Get text messages for important updates"
              } 
            />
            {saving && savingChannel === 'sms_notifications' ? (
              <CircularProgress size={24} thickness={4} />
            ) : (
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.sms_notifications}
                    onChange={() => handleNotificationChange('sms_notifications')}
                    color="primary"
                    disabled={!isPhoneVerified && !notifications.sms_notifications}
                  />
                }
                label=""
              />
            )}
          </ListItem>
        </List>
      </Paper>
      
      {/* Notification Types */}
      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)'
        }}
      >
        <Box 
          sx={{ 
            px: 3, 
            py: 2,
            backgroundColor: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(59, 130, 246, 0.05)',
          }}
        >
          <Typography variant="subtitle1" fontWeight="600">
            Notification Types
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose which notifications you want to receive
          </Typography>
        </Box>
        
        <List sx={{ py: 0 }}>
          {/* Event Registrations */}
          <ListItem 
            sx={{ 
              py: 2, 
              borderBottom: '1px solid', 
              borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
            }}
          >
            <ListItemIcon>
              <PeopleIcon 
                color={
                  (notifications.push_notifications || 
                   notifications.email_notifications || 
                   notifications.sms_notifications) && 
                  notifications.organizer_registrations ? 'primary' : 'disabled'
                } 
              />
            </ListItemIcon>
            <ListItemText 
              primary="Event Registrations" 
              secondary="Get notified when users register for your events" 
              sx={{
                opacity: (notifications.push_notifications || 
                         notifications.email_notifications || 
                         notifications.sms_notifications) ? 1 : 0.6,
              }}
            />
            {saving && savingChannel === 'organizer_registrations' ? (
              <CircularProgress size={24} thickness={4} />
            ) : (
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.organizer_registrations}
                    onChange={() => handleNotificationChange('organizer_registrations')}
                    disabled={!(notifications.push_notifications || 
                              notifications.email_notifications || 
                              notifications.sms_notifications)}
                    color="primary"
                  />
                }
                label=""
              />
            )}
          </ListItem>
          
          {/* Event Updates */}
          <ListItem 
            sx={{ 
              py: 2, 
              borderBottom: '1px solid', 
              borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
            }}
          >
            <ListItemIcon>
              <UpdateIcon 
                color={
                  (notifications.push_notifications || 
                   notifications.email_notifications || 
                   notifications.sms_notifications) && 
                  notifications.event_updates ? 'primary' : 'disabled'
                }
              />
            </ListItemIcon>
            <ListItemText 
              primary="Event Updates" 
              secondary="Get notified about updates to events you're registered for" 
              sx={{
                opacity: (notifications.push_notifications || 
                         notifications.email_notifications || 
                         notifications.sms_notifications) ? 1 : 0.6,
              }}
            />
            {saving && savingChannel === 'event_updates' ? (
              <CircularProgress size={24} thickness={4} />
            ) : (
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.event_updates}
                    onChange={() => handleNotificationChange('event_updates')}
                    disabled={!(notifications.push_notifications || 
                              notifications.email_notifications || 
                              notifications.sms_notifications)}
                    color="primary"
                  />
                }
                label=""
              />
            )}
          </ListItem>
          
          {/* Event Reminders */}
          <ListItem 
            sx={{ 
              py: 2, 
              borderBottom: '1px solid', 
              borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
            }}
          >
            <ListItemIcon>
              <AlarmIcon 
                color={
                  (notifications.push_notifications || 
                   notifications.email_notifications || 
                   notifications.sms_notifications) && 
                  notifications.event_reminders ? 'primary' : 'disabled'
                }
              />
            </ListItemIcon>
            <ListItemText 
              primary="Event Reminders" 
              secondary="Get reminders about upcoming events you're attending" 
              sx={{
                opacity: (notifications.push_notifications || 
                         notifications.email_notifications || 
                         notifications.sms_notifications) ? 1 : 0.6,
              }}
            />
            {saving && savingChannel === 'event_reminders' ? (
              <CircularProgress size={24} thickness={4} />
            ) : (
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.event_reminders}
                    onChange={() => handleNotificationChange('event_reminders')}
                    disabled={!(notifications.push_notifications || 
                              notifications.email_notifications || 
                              notifications.sms_notifications)}
                    color="primary"
                  />
                }
                label=""
              />
            )}
          </ListItem>
          
          {/* Vendor Bookings */}
          <ListItem 
            sx={{ 
              py: 2, 
              borderBottom: '1px solid', 
              borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
            }}
          >
            <ListItemIcon>
              <BusinessCenterIcon 
                color={
                  (notifications.push_notifications || 
                   notifications.email_notifications || 
                   notifications.sms_notifications) && 
                  notifications.vendor_bookings ? 'primary' : 'disabled'
                }
              />
            </ListItemIcon>
            <ListItemText 
              primary="Vendor Bookings" 
              secondary="Get notified when your vendor services are booked by organizers" 
              sx={{
                opacity: (notifications.push_notifications || 
                         notifications.email_notifications || 
                         notifications.sms_notifications) ? 1 : 0.6,
              }}
            />
            {saving && savingChannel === 'vendor_bookings' ? (
              <CircularProgress size={24} thickness={4} />
            ) : (
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.vendor_bookings}
                    onChange={() => handleNotificationChange('vendor_bookings')}
                    disabled={!(notifications.push_notifications || 
                              notifications.email_notifications || 
                              notifications.sms_notifications)}
                    color="primary"
                  />
                }
                label=""
              />
            )}
          </ListItem>
          
          {/* Marketing Communications */}
          <ListItem sx={{ py: 2 }}>
            <ListItemIcon>
              <CampaignIcon 
                color={
                  (notifications.push_notifications || 
                   notifications.email_notifications || 
                   notifications.sms_notifications) && 
                  notifications.marketing_communications ? 'primary' : 'disabled'
                }
              />
            </ListItemIcon>
            <ListItemText 
              primary="Marketing Communications" 
              secondary="Receive promotional content, news and special offers" 
              sx={{
                opacity: (notifications.push_notifications || 
                         notifications.email_notifications || 
                         notifications.sms_notifications) ? 1 : 0.6,
              }}
            />
            {saving && savingChannel === 'marketing_communications' ? (
              <CircularProgress size={24} thickness={4} />
            ) : (
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.marketing_communications}
                    onChange={() => handleNotificationChange('marketing_communications')}
                    disabled={!(notifications.push_notifications || 
                              notifications.email_notifications || 
                              notifications.sms_notifications)}
                    color="primary"
                  />
                }
                label=""
              />
            )}
          </ListItem>
        </List>
      </Paper>
      
      {/* Phone Verification Dialog */}
      <Dialog
        open={phoneDialogOpen}
        onClose={() => setPhoneDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            width: '100%',
            maxWidth: 400
          }
        }}
      >
        <DialogTitle>Verify Your Phone Number</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            To enable SMS notifications, please enter your phone number.
          </Typography>
          <TextField
            fullWidth
            label="Phone Number"
            placeholder="+1 (123) 456-7890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            helperText="Enter your phone number with country code"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhoneDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handlePhoneVerification} 
            variant="contained" 
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirmation Dialog for Critical Notifications */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" /> Disable Important Notification?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This is an important notification type that helps you stay informed about your events.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to disable this notification?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleConfirmation(false)}>
            No, Keep Enabled
          </Button>
          <Button 
            onClick={() => handleConfirmation(true)} 
            color="warning"
          >
            Yes, Disable
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Error Snackbar */}
      <Snackbar
        open={showError}
        autoHideDuration={6000}
        onClose={() => setShowError(false)}
        message={errorMessage}
      />
    </Box>
  );
};

NotificationsSection.propTypes = {
  themeMode: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  onError: PropTypes.func
};

export default NotificationsSection; 
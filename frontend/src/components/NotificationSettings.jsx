import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  Chip,
  Snackbar
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import useNotificationSettings from '../hooks/useNotificationSettings';

const NotificationSettings = ({ username, themeMode }) => {
  const {
    settings,
    loading,
    saving,
    error,
    saveError,
    updateSetting,
    updatePhone,
    refreshSettings
  } = useNotificationSettings(username);

  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Handle notification toggle change
  const handleToggleChange = async (event) => {
    const { name, checked } = event.target;
    
    const result = await updateSetting(name, checked);
    
    if (result.success) {
      setSnackbar({
        open: true,
        message: 'Settings updated successfully',
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: result.error || 'Failed to update settings',
        severity: 'error'
      });
    }
  };

  // Handle phone update
  const handlePhoneUpdate = async () => {
    if (!phone) {
      setPhoneError('Phone number is required');
      return;
    }
    
    // Basic phone validation
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError('Invalid phone number format');
      return;
    }
    
    setPhoneError('');
    const result = await updatePhone(phone);
    
    if (result.success) {
      setPhone('');
      setSnackbar({
        open: true,
        message: 'Phone number updated successfully',
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: result.error || 'Failed to update phone number',
        severity: 'error'
      });
    }
  };

  // Close snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button color="inherit" size="small" onClick={refreshSettings}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {saveError}
        </Alert>
      )}

      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3,
          border: '1px solid',
          borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderRadius: 2
        }}
      >
        <Typography variant="h6" gutterBottom>
          Notification Channels
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Choose how you want to receive notifications.
        </Typography>

        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.push_notifications}
                onChange={handleToggleChange}
                name="push_notifications"
                color="primary"
                disabled={saving}
              />
            }
            label="Push Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.email_notifications}
                onChange={handleToggleChange}
                name="email_notifications"
                color="primary"
                disabled={saving}
              />
            }
            label="Email Notifications"
          />
          <FormControlLabel
            control={
              <Switch
                checked={settings.sms_notifications}
                onChange={handleToggleChange}
                name="sms_notifications"
                color="primary"
                disabled={saving || !settings.phone_verified}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                SMS Notifications
                {!settings.phone_verified && (
                  <Chip 
                    label="Verify phone first" 
                    size="small" 
                    sx={{ ml: 1 }} 
                    color="warning" 
                    variant="outlined"
                  />
                )}
              </Box>
            }
          />
        </Box>

        {/* Phone number section */}
        <Box sx={{ mt: 3, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Phone Number
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {settings.phone ? (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1">
                  {settings.phone}
                </Typography>
                {settings.phone_verified && (
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                    <CheckCircleIcon color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption" color="success.main">
                      Verified
                    </Typography>
                  </Box>
                )}
                <Button 
                  size="small" 
                  sx={{ ml: 2 }}
                  onClick={() => setPhone(settings.phone)}
                >
                  Change
                </Button>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                No phone number set. Add one to enable SMS notifications.
              </Typography>
            )}
          </Box>
          
          {/* Phone update form */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <TextField
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1234567890"
              error={!!phoneError}
              helperText={phoneError}
              disabled={saving}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="contained"
              onClick={handlePhoneUpdate}
              disabled={saving || !phone}
              sx={{ mt: phoneError ? 0 : 0 }}
            >
              {saving ? <CircularProgress size={24} /> : 'Update'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper 
        elevation={0} 
        sx={{ 
          p: 3,
          border: '1px solid',
          borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderRadius: 2
        }}
      >
        <Typography variant="h6" gutterBottom>
          Notification Types
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Choose which types of notifications you want to receive.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={settings.event_updates}
                onChange={handleToggleChange}
                name="event_updates"
                color="primary"
                disabled={saving}
              />
            }
            label="Event Updates"
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 3, mt: -1 }}>
            Get notified when events you&apos;ve registered for are updated.
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.event_reminders}
                onChange={handleToggleChange}
                name="event_reminders"
                color="primary"
                disabled={saving}
              />
            }
            label="Event Reminders"
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 3, mt: -1 }}>
            Receive reminders about upcoming events you&apos;ve registered for.
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.vendor_bookings}
                onChange={handleToggleChange}
                name="vendor_bookings"
                color="primary"
                disabled={saving}
              />
            }
            label="Vendor Bookings"
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 3, mt: -1 }}>
            Get notified about vendor booking requests and updates.
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.organizer_registrations}
                onChange={handleToggleChange}
                name="organizer_registrations"
                color="primary"
                disabled={saving}
              />
            }
            label="Registration Notifications"
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 3, mt: -1 }}>
            For organizers: Get notified when someone registers for your event.
          </Typography>
        </Box>

        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.marketing_communications}
                onChange={handleToggleChange}
                name="marketing_communications"
                color="primary"
                disabled={saving}
              />
            }
            label="Marketing"
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 3, mt: -1 }}>
            Receive news, updates, and promotional offers.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

NotificationSettings.propTypes = {
  username: PropTypes.string.isRequired,
  themeMode: PropTypes.string
};

export default NotificationSettings; 
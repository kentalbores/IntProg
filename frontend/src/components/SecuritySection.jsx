import { useState } from 'react';
import axios from "../config/axiosconfig";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
  Divider,
  InputAdornment,
  IconButton,
  Alert
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SecurityIcon from '@mui/icons-material/Security';
import PropTypes from 'prop-types';

const SecuritySection = ({ themeMode, onSuccess, onError }) => {
  // Password states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Two-factor authentication state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  
  // Loading states
  const [changingPassword, setChangingPassword] = useState(false);
  const [toggling2FA, setToggling2FA] = useState(false);
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Local validation state
  const [passwordError, setPasswordError] = useState('');
  
  // Handle password input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
    
    // Clear error when typing
    if (passwordError) setPasswordError('');
  };
  
  // Toggle password visibility
  const handleClickShowPassword = (field) => {
    switch (field) {
      case 'current':
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case 'new':
        setShowNewPassword(!showNewPassword);
        break;
      case 'confirm':
        setShowConfirmPassword(!showConfirmPassword);
        break;
      default:
        break;
    }
  };
  
  // Handle password change submission
  const handlePasswordSubmit = async () => {
    try {
      // Basic validation
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        setPasswordError('All password fields are required');
        return;
      }
      
      if (passwordData.newPassword.length < 8) {
        setPasswordError('New password must be at least 8 characters long');
        return;
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError('New password and confirmation do not match');
        return;
      }
      
      setChangingPassword(true);
      
      // Make API request to change password
      const response = await axios.post('/api/user/change-password', {
        username: sessionStorage.getItem('username'),
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.status === 200) {
        // Clear form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Show success message
        onSuccess && onSuccess('Password changed successfully');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        setPasswordError('Current password is incorrect');
      } else {
        onError && onError(error.response?.data?.message || 'Failed to change password');
      }
    } finally {
      setChangingPassword(false);
    }
  };
  
  // Handle 2FA toggle
  const handleToggle2FA = async () => {
    try {
      setToggling2FA(true);
      
      // Toggle the 2FA setting
      const newStatus = !twoFactorEnabled;
      
      // API call to update 2FA setting
      const response = await axios.post('/api/user/update-2fa', {
        username: sessionStorage.getItem('username'),
        enabled: newStatus
      });
      
      if (response.status === 200) {
        setTwoFactorEnabled(newStatus);
        onSuccess && onSuccess(`Two-factor authentication ${newStatus ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error updating 2FA setting:', error);
      onError && onError('Failed to update two-factor authentication setting');
    } finally {
      setToggling2FA(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: themeMode === 'dark' ? 'white' : 'text.primary' }}>
        <SecurityIcon sx={{ mr: 1 }} /> Security Settings
      </Typography>
      
      {/* Change Password Section */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          borderRadius: 2,
          mb: 4,
          background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        }}
      >
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Change Password
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          It&apos;s a good practice to change your password regularly to keep your account secure.
        </Typography>
        
        {passwordError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {passwordError}
          </Alert>
        )}
        
        <Box component="form" noValidate>
          <TextField
            fullWidth
            margin="normal"
            label="Current Password"
            name="currentPassword"
            type={showCurrentPassword ? 'text' : 'password'}
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleClickShowPassword('current')}
                    edge="end"
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="New Password"
            name="newPassword"
            type={showNewPassword ? 'text' : 'password'}
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleClickShowPassword('new')}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            fullWidth
            margin="normal"
            label="Confirm New Password"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleClickShowPassword('confirm')}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          
          <Button 
            variant="contained" 
            color="primary"
            sx={{ mt: 2 }}
            onClick={handlePasswordSubmit}
            disabled={changingPassword}
          >
            {changingPassword ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        </Box>
      </Paper>
      
      {/* Two-Factor Authentication Section */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          borderRadius: 2,
          background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        }}
      >
        <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
          Two-Factor Authentication (2FA)
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Add an extra layer of security to your account by enabling two-factor authentication.
          When enabled, you&apos;ll be asked to provide a verification code in addition to your password when logging in.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body1">
              {twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {twoFactorEnabled 
                ? 'Your account has an extra layer of security.' 
                : 'Enable 2FA for added security.'}
            </Typography>
          </Box>
          
          <FormControlLabel
            control={
              <Switch
                checked={twoFactorEnabled}
                onChange={handleToggle2FA}
                disabled={toggling2FA}
                color="primary"
              />
            }
            label=""
          />
        </Box>
        
        {toggling2FA && (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

SecuritySection.propTypes = {
  themeMode: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  onError: PropTypes.func
};

export default SecuritySection; 
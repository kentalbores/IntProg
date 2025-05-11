import { useState, useEffect } from 'react';
import axios from "./config/axiosconfig";
import PropTypes from 'prop-types';
import {
  Button,
  Box,
  Paper,
  Typography,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Switch,
  Snackbar,
  Alert,
  CircularProgress,
  Container,
  Divider
} from "@mui/material";
import Loading from "./components/Loading";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PaletteIcon from "@mui/icons-material/Palette";
import SecurityIcon from "@mui/icons-material/Security";
import Navbar from './components/Navbar';
import NavDrawer from './components/NavDrawer';

const Settings = ({ theme, setTheme, themeMode }) => {
  // State for different settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });
  const [allNotifications, setAllNotifications] = useState([]);
  const [language, setLanguage] = useState('english');
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    dataSharing: true,
  });
  
  // Added states for handling API interactions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  

  // Fetch user settings from API on component mount
  useEffect(() => {
    const getUserSettings = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/settings?username=${sessionStorage.getItem("username")}`
        );
        if (response.data?.settings) {
          const userSettings = response.data.settings;
          
          // Update state with fetched settings
          setNotifications({
            email: userSettings.email_notifications || false,
            push: userSettings.push_notifications || false,
            sms: userSettings.sms_notifications || false,
          });
          
          setLanguage(userSettings.language || 'english');
          
          setPrivacy({
            profileVisibility: userSettings.profile_visibility || 'public',
            dataSharing: userSettings.data_sharing || false,
          });
        } else {
          setLoading(false);
          // If user has no settings yet, keep defaults
          console.log("No settings found for user, using defaults");
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
        setError("Failed to load settings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    getUserSettings();
  }, []);
  
  // Handle notification toggles
  const handleNotificationChange = (type) => {
    setNotifications({
      ...notifications,
      [type]: !notifications[type],
    });
  };
  
  // Handle privacy settings
  const handlePrivacyChange = (setting, value) => {
    setPrivacy({
      ...privacy,
      [setting]: value,
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Prepare data for API
      const settingsData = {
        username: sessionStorage.getItem("username"),
        email_notifications: notifications.email,
        push_notifications: notifications.push,
        sms_notifications: notifications.sms,
        theme: theme,
        language: language,
        profile_visibility: privacy.profileVisibility,
        data_sharing: privacy.dataSharing
      };
      
      // Send data to API
      const response = await axios.post('/api/update-settings', settingsData);
      
      if (response.status === 200) {
        setSuccess(true);
      }
    } catch (err) {
      console.error("Error updating settings:", err);
      setUpdateError(err.response?.data?.message || "Failed to update settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSuccess(false);
    setUpdateError(null);
  };
  
  const user = {
    username: sessionStorage.getItem("username"),
    email: sessionStorage.getItem("email"),
    picture: sessionStorage.getItem("picture"),
  };
  
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: themeMode === 'dark' 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "url('./assets/bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: themeMode === 'dark' ? 0.05 : 0.1,
          zIndex: 0,
        },
      }}
    >
      <Navbar 
        themeMode={themeMode}
        title="Settings"
        showMenuButton={true}
        onMenuClick={() => setDrawerOpen(true)}
        user={user}
        notifications={allNotifications}
      />
      
      <NavDrawer 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        themeMode={themeMode}
      />

      <Container maxWidth="md" sx={{ pt: 4, position: 'relative', zIndex: 1 }}>
        {loading && error === null ? (
          <Loading />
        ) : (
          <div className="overflow-y-hidden overflow-x-hidden">
            {/* Welcome Section */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 3,
                background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: "blur(10px)",
                border: themeMode === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.1)' 
                  : '1px solid rgba(0, 0, 0, 0.05)',
                position: "relative",
                overflow: "hidden"
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "6px",
                  background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                }}
              />
              <Typography variant="h4" gutterBottom sx={{ color: themeMode === 'dark' ? 'primary.light' : 'primary.dark', fontWeight: 700 }}>
                Settings
              </Typography>
              <Typography variant="body1" sx={{ color: themeMode === 'dark' ? 'text.secondary' : 'text.primary' }}>
                Customize your experience and preferences
              </Typography>
            </Paper>

            <form onSubmit={handleSubmit}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: "blur(10px)",
                  border: themeMode === 'dark' 
                    ? '1px solid rgba(255, 255, 255, 0.1)' 
                    : '1px solid rgba(0, 0, 0, 0.05)',
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "6px",
                    background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                  }}
                />

                {/* Notification Settings */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <NotificationsIcon sx={{ mr: 2, color: themeMode === 'dark' ? 'primary.light' : "primary.main" }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ color: themeMode === 'dark' ? 'primary.light' : 'inherit' }}>
                      Notification Preferences
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.email}
                          onChange={() => handleNotificationChange('email')}
                          color="primary"
                        />
                      }
                      label={<span style={{ color: themeMode === 'dark' ? '#e0e0e0' : 'inherit' }}>Email Notifications</span>}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.push}
                          onChange={() => handleNotificationChange('push')}
                          color="primary"
                        />
                      }
                      label={<span style={{ color: themeMode === 'dark' ? '#e0e0e0' : 'inherit' }}>Push Notifications</span>}
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notifications.sms}
                          onChange={() => handleNotificationChange('sms')}
                          color="primary"
                        />
                      }
                      label={<span style={{ color: themeMode === 'dark' ? '#e0e0e0' : 'inherit' }}>SMS Notifications</span>}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 4, borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }} />

                {/* Appearance Settings */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <PaletteIcon sx={{ mr: 2, color: themeMode === 'dark' ? 'primary.light' : "primary.main" }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ color: themeMode === 'dark' ? 'primary.light' : 'inherit' }}>
                      Appearance
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: themeMode === 'dark' ? 'primary.light' : undefined }}>Theme</InputLabel>
                      <Select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        label="Theme"
                        sx={{ 
                          color: themeMode === 'dark' ? '#e0e0e0' : undefined,
                          '.MuiOutlinedInput-notchedOutline': { 
                            borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : undefined 
                          },
                          background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                          borderRadius: 2,
                        }}
                      >
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                        <MenuItem value="system">System Default</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel sx={{ color: themeMode === 'dark' ? 'primary.light' : undefined }}>Language</InputLabel>
                      <Select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        label="Language"
                        sx={{ 
                          color: themeMode === 'dark' ? '#e0e0e0' : undefined,
                          '.MuiOutlinedInput-notchedOutline': { 
                            borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : undefined 
                          },
                          background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                          borderRadius: 2,
                        }}
                      >
                        <MenuItem value="english">English</MenuItem>
                        <MenuItem value="spanish">Spanish</MenuItem>
                        <MenuItem value="french">French</MenuItem>
                        <MenuItem value="german">German</MenuItem>
                        <MenuItem value="japanese">Japanese</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                <Divider sx={{ my: 4, borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }} />

                {/* Privacy Settings */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <SecurityIcon sx={{ mr: 2, color: themeMode === 'dark' ? 'primary.light' : "primary.main" }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ color: themeMode === 'dark' ? 'primary.light' : 'inherit' }}>
                      Privacy
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: themeMode === 'dark' ? 'primary.light' : undefined }}>Profile Visibility</InputLabel>
                      <Select
                        value={privacy.profileVisibility}
                        onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                        label="Profile Visibility"
                        sx={{ 
                          color: themeMode === 'dark' ? '#e0e0e0' : undefined,
                          '.MuiOutlinedInput-notchedOutline': { 
                            borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : undefined 
                          },
                          background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                          borderRadius: 2,
                        }}
                      >
                        <MenuItem value="public">Public</MenuItem>
                        <MenuItem value="contacts">Contacts Only</MenuItem>
                        <MenuItem value="private">Private</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControlLabel
                      control={
                        <Switch
                          checked={privacy.dataSharing}
                          onChange={(e) => handlePrivacyChange('dataSharing', e.target.checked)}
                          color="primary"
                        />
                      }
                      label={<span style={{ color: themeMode === 'dark' ? '#e0e0e0' : 'inherit' }}>Allow data sharing for service improvement</span>}
                    />
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                      color: 'white',
                      '&:hover': {
                        background: "linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)",
                      },
                    }}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
                  </Button>
                </Box>
              </Paper>
            </form>
          </div>
        )}
      </Container>

      {/* Success and Error notifications */}
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success"
          sx={{ 
            width: '100%',
            background: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
            '& .MuiAlert-icon': {
              color: themeMode === 'dark' ? 'success.light' : 'success.main',
            }
          }}
        >
          Settings updated successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!updateError}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="error"
          sx={{ 
            width: '100%',
            background: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
            '& .MuiAlert-icon': {
              color: themeMode === 'dark' ? 'error.light' : 'error.main',
            }
          }}
        >
          {updateError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

Settings.propTypes = {
  theme: PropTypes.string.isRequired,
  setTheme: PropTypes.func.isRequired,
  themeMode: PropTypes.string.isRequired,
};

export default Settings;
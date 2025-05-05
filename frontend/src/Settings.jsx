import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "./config/axiosconfig";
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
  IconButton,
  Switch,
  Snackbar,
  Alert,
  CircularProgress,
  Container,
  AppBar,
  Toolbar,
  ThemeProvider,
  createTheme,
  Divider
} from "@mui/material";
import Loading from "./components/Loading";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PaletteIcon from "@mui/icons-material/Palette";
import SecurityIcon from "@mui/icons-material/Security";
import { useTheme } from '@mui/material/styles';

// Custom theme matching Home page
const getThemeObject = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: "#3a86ff",
      light: "#83b8ff",
      dark: "#0057cb",
    },
    secondary: {
      main: "#ff006e",
      light: "#ff5a9d",
      dark: "#c50054",
    },
    success: {
      main: "#38b000",
      light: "#70e000",
      dark: "#008000",
    },
    background: {
      default: mode === 'dark' ? '#181a1b' : '#f8f9fa',
      paper: mode === 'dark' ? '#23272f' : '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          boxShadow: "none",
          fontWeight: 600,
          padding: "8px 16px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

const Settings = ({ theme, setTheme, themeMode }) => {
  // State for different settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });
  const navigate = useNavigate();
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
  
  const customTheme = useTheme();
  
  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: 6,
        background: themeMode === 'dark' ? '#121212' : "linear-gradient(135deg, #e3ecff 0%, #f5f7fa 100%)",
        margin: 0,
        padding: 0,
        position: 'relative',
      }}
    >
      <AppBar
        position="sticky"
        color="default"
        sx={{
          backgroundColor: themeMode === 'dark' ? '#1e1e1e' : "rgba(0, 0, 0, 0)",
          backdropFilter: "blur(5px)",
          position: 'relative',
          zIndex: 2,
          boxShadow: themeMode === 'dark' ? '0 2px 8px #000' : undefined,
        }}
      >
        <Toolbar>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ mr: 2, color: themeMode === 'dark' ? '#90caf9' : "primary.main" }}
            edge="start"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ flexGrow: 1, color: themeMode === 'dark' ? '#90caf9' : 'primary.main' }}
          >
            Settings
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ pt: 4, position: 'relative', zIndex: 1, background: themeMode === '' ? '#1e1e1e' : 'transparent', color: themeMode === '' ? '#e0e0e0' : 'inherit', borderRadius: 3, boxShadow: themeMode === '' ? 3 : 0 }}>
        {loading && error === null ? (
          <Loading />
        ) : (
          <div className="overflow-y-hidden overflow-x-hidden">
            {/* Welcome Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" gutterBottom sx={{ color: themeMode === 'dark' ? '#90caf9' : 'primary.dark', fontWeight: 700 }}>
                Settings
              </Typography>
              <Typography variant="body1" sx={{ color: themeMode === 'dark' ? '#cccccc' : 'text.secondary' }}>
                Customize your experience and preferences
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  backgroundColor: themeMode === 'dark' ? '#23272f' : theme => theme.palette.background.paper,
                  color: themeMode === 'dark' ? '#e0e0e0' : 'inherit',
                  position: 'relative',
                  zIndex: 2,
                  boxShadow: themeMode === 'dark' ? '0 4px 24px #000' : undefined,
                }}
              >
                {/* Notification Settings */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <NotificationsIcon sx={{ mr: 2, color: themeMode === 'dark' ? '#90caf9' : "primary.main" }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ color: themeMode === 'dark' ? '#90caf9' : 'inherit' }}>
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

                <Divider sx={{ my: 4, borderColor: themeMode === 'dark' ? '#333' : undefined }} />

                {/* Appearance Settings */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <PaletteIcon sx={{ mr: 2, color: themeMode === 'dark' ? '#90caf9' : "primary.main" }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ color: themeMode === 'dark' ? '#90caf9' : 'inherit' }}>
                      Appearance
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: themeMode === 'dark' ? '#90caf9' : undefined }}>Theme</InputLabel>
                      <Select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value)}
                        label="Theme"
                        sx={{ color: themeMode === 'dark' ? '#e0e0e0' : undefined, '.MuiOutlinedInput-notchedOutline': { borderColor: themeMode === 'dark' ? '#333' : undefined } }}
                      >
                        <MenuItem value="light">Light</MenuItem>
                        <MenuItem value="dark">Dark</MenuItem>
                        <MenuItem value="system">System Default</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel sx={{ color: themeMode === 'dark' ? '#90caf9' : undefined }}>Language</InputLabel>
                      <Select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        label="Language"
                        sx={{ color: themeMode === 'dark' ? '#e0e0e0' : undefined, '.MuiOutlinedInput-notchedOutline': { borderColor: themeMode === 'dark' ? '#333' : undefined } }}
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

                <Divider sx={{ my: 4, borderColor: themeMode === 'dark' ? '#333' : undefined }} />

                {/* Privacy Settings */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <SecurityIcon sx={{ mr: 2, color: themeMode === 'dark' ? '#90caf9' : "primary.main" }} />
                    <Typography variant="h6" fontWeight="bold" sx={{ color: themeMode === 'dark' ? '#90caf9' : 'inherit' }}>
                      Privacy
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: themeMode === 'dark' ? '#90caf9' : undefined }}>Profile Visibility</InputLabel>
                      <Select
                        value={privacy.profileVisibility}
                        onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                        label="Profile Visibility"
                        sx={{ color: themeMode === 'dark' ? '#e0e0e0' : undefined, '.MuiOutlinedInput-notchedOutline': { borderColor: themeMode === 'dark' ? '#333' : undefined } }}
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
                    variant={themeMode === 'dark' ? 'outlined' : 'contained'}
                    sx={{
                      background: themeMode === 'dark' ? 'none' : "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                      color: themeMode === 'dark' ? '#90caf9' : undefined,
                      borderColor: themeMode === 'dark' ? '#90caf9' : undefined,
                      boxShadow: themeMode === 'dark' ? '0 0 8px #4776E6' : undefined,
                      '&:hover': {
                        background: themeMode === 'dark' ? '#23272f' : "linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)",
                        color: themeMode === 'dark' ? '#ffffff' : undefined,
                        boxShadow: themeMode === 'dark' ? '0 0 16px #4776E6' : undefined,
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
        <Alert onClose={handleCloseSnackbar} severity="success">
          Settings updated successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!updateError}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {updateError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
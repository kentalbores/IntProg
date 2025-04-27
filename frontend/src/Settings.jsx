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

const Settings = () => {
  // State for different settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
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
          
          setTheme(userSettings.theme || 'light');
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
  
  // Dynamically determine theme mode
  const themeMode = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }, [theme]);

  const dynamicTheme = useMemo(() => getThemeObject(themeMode), [themeMode]);
  
  return (
    <ThemeProvider theme={dynamicTheme}>
      <Box
        sx={{
          minHeight: "100vh",
          pb: 6,
          backgroundImage: "url('./assets/bg.jpg')",
          backgroundSize: "100vw",
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          margin: 0,
          padding: 0,
          backgroundColor: "transparent",
          position: 'relative',
        }}
      >
        <AppBar
          position="sticky"
          color="default"
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0)",
            backdropFilter: "blur(5px)",
            position: 'relative',
            zIndex: 2,
          }}
        >
          <Toolbar>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ mr: 2, color: "primary.main" }}
              edge="start"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="primary.main"
              sx={{ flexGrow: 1 }}
            >
              Settings
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ pt: 4, position: 'relative', zIndex: 1 }}>
          {loading && error === null ? (
            <Loading />
          ) : (
            <div className="overflow-y-hidden overflow-x-hidden">
              {/* Welcome Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom color="primary.dark">
                  Settings
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Customize your experience and preferences
                </Typography>
              </Box>

              <form onSubmit={handleSubmit}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    backgroundColor: theme => theme.palette.background.paper,
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  {/* Notification Settings */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <NotificationsIcon sx={{ mr: 2, color: "primary.main" }} />
                      <Typography variant="h6" fontWeight="bold">
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
                        label="Email Notifications"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notifications.push}
                            onChange={() => handleNotificationChange('push')}
                            color="primary"
                          />
                        }
                        label="Push Notifications"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={notifications.sms}
                            onChange={() => handleNotificationChange('sms')}
                            color="primary"
                          />
                        }
                        label="SMS Notifications"
                      />
                    </Box>
                  </Box>

                  <Divider sx={{ my: 4 }} />

                  {/* Appearance Settings */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <PaletteIcon sx={{ mr: 2, color: "primary.main" }} />
                      <Typography variant="h6" fontWeight="bold">
                        Appearance
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <FormControl fullWidth>
                        <InputLabel>Theme</InputLabel>
                        <Select
                          value={theme}
                          onChange={(e) => setTheme(e.target.value)}
                          label="Theme"
                        >
                          <MenuItem value="light">Light</MenuItem>
                          <MenuItem value="dark">Dark</MenuItem>
                          <MenuItem value="system">System Default</MenuItem>
                        </Select>
                      </FormControl>

                      <FormControl fullWidth>
                        <InputLabel>Language</InputLabel>
                        <Select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          label="Language"
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

                  <Divider sx={{ my: 4 }} />

                  {/* Privacy Settings */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                      <SecurityIcon sx={{ mr: 2, color: "primary.main" }} />
                      <Typography variant="h6" fontWeight="bold">
                        Privacy
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                      <FormControl fullWidth>
                        <InputLabel>Profile Visibility</InputLabel>
                        <Select
                          value={privacy.profileVisibility}
                          onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                          label="Profile Visibility"
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
                        label="Allow data sharing for service improvement"
                      />
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{
                        background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                        "&:hover": {
                          background: "linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)",
                        },
                      }}
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
    </ThemeProvider>
  );
};

export default Settings;
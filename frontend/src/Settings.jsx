import { useState, useEffect } from 'react';
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
  CircularProgress
} from "@mui/material";
import Loading from "./components/Loading";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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
  
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{
        padding: { xs: 2, md: 4 },
      }}
    >
      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: "absolute",
          top: { xs: 12, md: 20 },
          left: { xs: 12, md: 20 },
          color: "#64748B",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            transform: "translateY(-2px)"
          }
        }}
      >
        <ArrowBackIcon />
      </IconButton>
      
      {loading && error === null && 
        <Loading />}
      
      <Paper
        id="myPaper"
        elevation={5}
        sx={{
          padding: { xs: 3, sm: 4 },
          width: { xs: "95%", sm: 600 },
          maxWidth: "95%",
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          position: "relative",
          maxHeight: { xs: "85vh", sm: "700px" },
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "8px",
            borderRadius: "4px"
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "4px"
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#c3cfe2",
            borderRadius: "4px"
          }
        }}
      >
        <Box 
          sx={{ 
            position: "absolute", 
            top: 0, 
            left: 0, 
            right: 0, 
            height: "6px",
          }} 
        />
        
        <Typography 
          variant="h4" 
          fontWeight="600" 
          sx={{ 
            mb: 4,
            color: "#333",
            fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif" 
          }}
        >
          Settings
        </Typography>
      
        <form onSubmit={handleSubmit}>
          <Button
            onClick={() => navigate("/profile")}
            variant="contained"
            fullWidth
            sx={{ 
              marginBottom: 3,
              height: "46px", 
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
              background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
              "&:hover": {
                background: "linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)",
                boxShadow: "0 6px 16px rgba(79, 70, 229, 0.3)"
              }
            }}
          >
            Change Profile Details
          </Button>
          
          {/* Notification Preferences */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              fontWeight="600" 
              sx={{ 
                mb: 2,
                pb: 1,
                borderBottom: "1px solid #e0e0e0",
                color: "#333"
              }}
            >
              Notification Preferences
            </Typography>
            
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
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
          
          {/* Appearance Settings */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              fontWeight="600" 
              sx={{ 
                mb: 2,
                pb: 1,
                borderBottom: "1px solid #e0e0e0",
                color: "#333"
              }}
            >
              Appearance
            </Typography>
            
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="theme-label">Theme</InputLabel>
                <Select
                  labelId="theme-label"
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  label="Theme"
                  sx={{ 
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#6366F1"
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#4F46E5"
                      }
                    }
                  }}
                >
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="system">System Default</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth variant="outlined">
                <InputLabel id="language-label">Language</InputLabel>
                <Select
                  labelId="language-label"
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  label="Language"
                  sx={{ 
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#6366F1"
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#4F46E5"
                      }
                    }
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
          
          {/* Privacy Settings */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h6" 
              fontWeight="600" 
              sx={{ 
                mb: 2,
                pb: 1,
                borderBottom: "1px solid #e0e0e0",
                color: "#333"
              }}
            >
              Privacy
            </Typography>
            
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="profile-visibility-label">Profile Visibility</InputLabel>
                <Select
                  labelId="profile-visibility-label"
                  id="profileVisibility"
                  value={privacy.profileVisibility}
                  onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                  label="Profile Visibility"
                  sx={{ 
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": {
                        borderColor: "#6366F1"
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#4F46E5"
                      }
                    }
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
                label="Allow data sharing for service improvement"
              />
            </Box>
          </Box>
          
          {/* Buttons */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              sx={{ 
                px: 3,
                py: 1,
                borderRadius: 2,
                color: "#64748B",
                borderColor: "#64748B",
                "&:hover": {
                  borderColor: "#4F46E5",
                  backgroundColor: "rgba(79, 70, 229, 0.04)"
                }
              }}
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ 
                px: 3,
                py: 1,
                borderRadius: 2,
                background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                "&:hover": {
                  background: "linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)",
                  boxShadow: "0 6px 16px rgba(79, 70, 229, 0.3)"
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
            </Button>
          </Box>
        </form>
      </Paper>
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
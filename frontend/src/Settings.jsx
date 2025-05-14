import { useState, useEffect } from 'react';
import axios from "./config/axiosconfig";
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  Snackbar,
  Alert,
  Container,
  Tabs,
  Tab,
  Grid,
  Divider,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SecurityIcon from "@mui/icons-material/Security";
import PaletteIcon from "@mui/icons-material/Palette";
import Loading from "./components/Loading";
import Navbar from './components/Navbar';
import NavDrawer from './components/NavDrawer';

// Import our custom components for each section
import ProfileSection from './components/ProfileSection';
import RoleSelectionSection from './components/RoleSelectionSection';
import SecuritySection from './components/SecuritySection';
import NotificationsSection from './components/NotificationsSection';

const Settings = ({ theme, setTheme, themeMode }) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState(0);
  const [activeSettingItem, setActiveSettingItem] = useState('profile');
  
  // States for handling notifications and API interactions
  const [allNotifications] = useState([]);
  const [language, setLanguage] = useState('english');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
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
          setLanguage(userSettings.language || 'english');
        } else {
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
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Reset the active setting item to the first one in each tab
    if (newValue === 0) {
      setActiveSettingItem('profile');
    } else if (newValue === 1) {
      setActiveSettingItem('password');
    } else if (newValue === 2) {
      setActiveSettingItem('notifications');
    }
  };
  
  // Handle setting item selection
  const handleSettingItemClick = (item) => {
    setActiveSettingItem(item);
  };
  
  // Handle success message display
  const handleSuccess = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: "success"
    });
  };
  
  // Handle error message display
  const handleError = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: "error"
    });
  };
  
  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Update theme in language
  const updateTheme = (newTheme) => {
    setTheme(newTheme);
    handleSuccess("Theme updated successfully");
  };
  
  // Get the appropriate theme based on time of day
  const getDynamicThemeColor = () => {
    const currentHour = new Date().getHours();
    // Dark theme from 7 PM (19) to 6 AM (6)
    return (currentHour >= 19 || currentHour < 6) ? 'dark' : 'light';
  };
  
  // Update language
  const updateLanguage = async (newLanguage) => {
    try {
      const username = sessionStorage.getItem("username");
      await axios.post("/api/update-settings", {
        username,
        language: newLanguage
      });
      setLanguage(newLanguage);
      handleSuccess("Language updated successfully");
    } catch (error) {
      console.error("Error updating language:", error);
      handleError("Failed to update language");
    }
  };

  // User info for navbar
  const user = {
    username: sessionStorage.getItem("username"),
    email: sessionStorage.getItem("email"),
    picture: sessionStorage.getItem("picture"),
  };
  
  // Update the appearance section with the new theme options
  const renderAppearanceSection = () => {
        return (
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: themeMode === 'dark' ? 'white' : 'text.primary' }}>
              <PaletteIcon sx={{ mr: 1 }} /> Appearance
            </Typography>
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
                Theme
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Choose how Event Hub looks to you. Select a theme preference.
              </Typography>
          <Box display="flex" mt={2} gap={2} flexWrap="wrap">
                <Paper
                  elevation={theme === 'light' ? 4 : 1}
                  onClick={() => updateTheme('light')}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: theme === 'light' ? '2px solid' : '1px solid',
                    borderColor: theme === 'light' ? 'primary.main' : 'divider',
                    width: 150,
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      bgcolor: "#ffffff", 
                      height: 80, 
                      borderRadius: 1, 
                      mb: 1, 
                      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                  </Box>
                  <Typography variant="body2" fontWeight={theme === 'light' ? 'bold' : 'regular'}>
                    Night
                  </Typography>
                </Paper>
                
                <Paper
                  elevation={theme === 'dark' ? 4 : 1}
                  onClick={() => updateTheme('dark')}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: theme === 'dark' ? '2px solid' : '1px solid',
                    borderColor: theme === 'dark' ? 'primary.main' : 'divider',
                    width: 150,
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      bgcolor: "#rgb(0, 75, 128)", 
                      height: 80, 
                      borderRadius: 1, 
                      mb: 1,
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                  <Typography variant="body2" fontWeight={theme === 'dark' ? 'bold' : 'regular'}>
                    Dark
                  </Typography>
                </Paper>
            
            <Paper
              elevation={theme === 'dynamic' ? 4 : 1}
              onClick={() => updateTheme('dynamic')}
              sx={{
                p: 2,
                borderRadius: 2,
                cursor: 'pointer',
                border: theme === 'dynamic' ? '2px solid' : '1px solid',
                borderColor: theme === 'dynamic' ? 'primary.main' : 'divider',
                width: 150,
                textAlign: 'center',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Box 
                sx={{ 
                  height: 80,
                  borderRadius: 1,
                  mb: 1,
                  position: 'relative',
                  overflow: 'hidden',
                  background: getDynamicThemeColor() === 'dark' ? '#121212' : '#ffffff',
                  boxShadow: getDynamicThemeColor() === 'dark' 
                    ? "inset 0 0 0 1px rgba(255,255,255,0.1)" 
                    : "inset 0 0 0 1px rgba(0,0,0,0.05)",
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Box 
                  sx={{
                    position: 'absolute', 
                    width: '100%', 
                    height: '100%',
                    background: 'linear-gradient(120deg, transparent, rgba(255,255,255,0.2), transparent)',
                    animation: 'shimmer 2s infinite'
                  }}
                />
                <Typography variant="caption" sx={{ zIndex: 1, color: getDynamicThemeColor() === 'dark' ? 'white' : 'black' }}>
                  {new Date().getHours() >= 19 || new Date().getHours() < 6 ? '🌙' : '☀️'}
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={theme === 'dynamic' ? 'bold' : 'regular'}>
                Dynamic
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Changes with time of day
              </Typography>
            </Paper>
                
                <Paper
                  elevation={theme === 'system' ? 4 : 1}
                  onClick={() => updateTheme('system')}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    cursor: 'pointer',
                    border: theme === 'system' ? '2px solid' : '1px solid',
                    borderColor: theme === 'system' ? 'primary.main' : 'divider',
                    width: 150,
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)'
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                      height: 80,
                      borderRadius: 1,
                      mb: 1,
                      background: 'linear-gradient(to right, #ffffff 50%, #121212 50%)',
                      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  />
                  <Typography variant="body2" fontWeight={theme === 'system' ? 'bold' : 'regular'}>
                    System Default
                  </Typography>
                </Paper>
              </Box>
            </Paper>
            
            <Paper
              elevation={1}
              sx={{
                p: 3,
                borderRadius: 2,
                background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              }}
            >
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Language
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Select your preferred language for the application.
              </Typography>
              <Box display="flex" flexWrap="wrap" mt={2} gap={2}>
                {[
                  { code: 'english', name: 'English', flag: '🇺🇸' },
                  { code: 'spanish', name: 'Spanish', flag: '🇪🇸' },
                  { code: 'french', name: 'French', flag: '🇫🇷' },
                  { code: 'german', name: 'German', flag: '🇩🇪' },
                  { code: 'japanese', name: 'Japanese', flag: '🇯🇵' }
                ].map(lang => (
                  <Paper
                    key={lang.code}
                    elevation={language === lang.code ? 4 : 1}
                    onClick={() => updateLanguage(lang.code)}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: language === lang.code ? '2px solid' : '1px solid',
                      borderColor: language === lang.code ? 'primary.main' : 'divider',
                      width: 120,
                      textAlign: 'center',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)'
                      }
                    }}
                  >
                    <Typography variant="h4" mb={1}>
                      {lang.flag}
                    </Typography>
                    <Typography variant="body2" fontWeight={language === lang.code ? 'bold' : 'regular'}>
                      {lang.name}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Box>
        );
  };

  // Modify the renderContent function to use the new appearance section
  const renderContent = () => {
    // Account tab
    if (activeTab === 0) {
      if (activeSettingItem === 'profile') {
        return <ProfileSection themeMode={themeMode} onSuccess={handleSuccess} onError={handleError} />;
      } else if (activeSettingItem === 'roles') {
        return <RoleSelectionSection themeMode={themeMode} onSuccess={handleSuccess} onError={handleError} />;
      } else if (activeSettingItem === 'appearance') {
        return renderAppearanceSection();
      }
    }
    
    // Security tab
    else if (activeTab === 1) {
      return <SecuritySection themeMode={themeMode} onSuccess={handleSuccess} onError={handleError} />;
    }
    
    // Notifications tab
    else if (activeTab === 2) {
      return <NotificationsSection themeMode={themeMode} onSuccess={handleSuccess} onError={handleError} />;
    }
    
    // Fallback
    return <Typography>Select a setting from the sidebar</Typography>;
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
        zIndex: 0,
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
          zIndex: -1,
          pointerEvents: "none",
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
        user={user}
      />

      <Container maxWidth="lg" sx={{ pt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
        {loading && error === null ? (
          <Loading />
        ) : (
          <Box>
            {/* Header Section */}
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
                Customize your account, security, and notification preferences
              </Typography>
            </Paper>

            {/* Tabs Navigation */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    fontSize: '1rem',
                    fontWeight: 500,
                    px: 4,
                    py: 2,
                  },
                  '& .Mui-selected': {
                    fontWeight: 600,
                  }
                }}
              >
                <Tab 
                  icon={<AccountCircleIcon />} 
                  iconPosition="start" 
                  label="Account" 
                  id="settings-tab-0" 
                  aria-controls="settings-tabpanel-0" 
                />
                <Tab 
                  icon={<SecurityIcon />} 
                  iconPosition="start" 
                  label="Security" 
                  id="settings-tab-1" 
                  aria-controls="settings-tabpanel-1" 
                />
                <Tab 
                  icon={<NotificationsIcon />} 
                  iconPosition="start" 
                  label="Notifications" 
                  id="settings-tab-2" 
                  aria-controls="settings-tabpanel-2" 
                />
              </Tabs>
                </Box>

            {/* Content Area */}
            <Grid container spacing={4}>
              {/* Side Navigation for Account Tab */}
              {activeTab === 0 && (
                <Grid item xs={12} md={3}>
                  <Paper
                    elevation={1}
                        sx={{ 
                          borderRadius: 2,
                      overflow: 'hidden',
                      background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    <List component="nav" aria-label="account settings">
                      <ListItemButton
                        selected={activeSettingItem === 'profile'}
                        onClick={() => handleSettingItemClick('profile')}
                        sx={{
                          '&.Mui-selected': {
                            backgroundColor: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.15)' : 'rgba(58, 134, 255, 0.1)',
                            borderLeft: '4px solid',
                            borderLeftColor: 'primary.main',
                            '&:hover': {
                              backgroundColor: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.2)' : 'rgba(58, 134, 255, 0.15)',
                            }
                          }
                        }}
                      >
                        <ListItemIcon>
                          <AccountCircleIcon color={activeSettingItem === 'profile' ? 'primary' : 'inherit'} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Profile" 
                          secondary="Personal information"
                          primaryTypographyProps={{
                            fontWeight: activeSettingItem === 'profile' ? 600 : 400
                          }}
                        />
                      </ListItemButton>
                      
                      <Divider />
                      
                      <ListItemButton
                        selected={activeSettingItem === 'roles'}
                        onClick={() => handleSettingItemClick('roles')}
                        sx={{ 
                          '&.Mui-selected': {
                            backgroundColor: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.15)' : 'rgba(58, 134, 255, 0.1)',
                            borderLeft: '4px solid',
                            borderLeftColor: 'primary.main',
                            '&:hover': {
                              backgroundColor: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.2)' : 'rgba(58, 134, 255, 0.15)',
                            }
                          }
                        }}
                      >
                        <ListItemIcon>
                          <Box sx={{ display: 'flex' }}>
                            <Box component="span" sx={{ fontSize: '1.5rem' }}>👥</Box>
                  </Box>
                        </ListItemIcon>
                        <ListItemText 
                          primary="Role Management" 
                          secondary="Organizer & vendor access"
                          primaryTypographyProps={{
                            fontWeight: activeSettingItem === 'roles' ? 600 : 400
                          }}
                        />
                      </ListItemButton>
                      
                      <Divider />
                      
                      <ListItemButton
                        selected={activeSettingItem === 'appearance'}
                        onClick={() => handleSettingItemClick('appearance')}
                        sx={{ 
                          '&.Mui-selected': {
                            backgroundColor: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.15)' : 'rgba(58, 134, 255, 0.1)',
                            borderLeft: '4px solid',
                            borderLeftColor: 'primary.main',
                            '&:hover': {
                              backgroundColor: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.2)' : 'rgba(58, 134, 255, 0.15)',
                            }
                          }
                        }}
                      >
                        <ListItemIcon>
                          <PaletteIcon color={activeSettingItem === 'appearance' ? 'primary' : 'inherit'} />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Appearance" 
                          secondary="Theme & language"
                          primaryTypographyProps={{
                            fontWeight: activeSettingItem === 'appearance' ? 600 : 400
                          }}
                        />
                      </ListItemButton>
                    </List>
                  </Paper>
                </Grid>
              )}
              
              {/* Main Content Area */}
              <Grid item xs={12} md={activeTab === 0 ? 9 : 12}>
                <div className="overflow-y-hidden overflow-x-hidden">
                  {renderContent()}
                </div>
              </Grid>
            </Grid>
                </Box>
        )}
      </Container>

      {/* Success and Error notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            background: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
            '& .MuiAlert-icon': {
              color: themeMode === 'dark' 
                ? snackbar.severity === 'success' ? 'success.light' : 'error.light'
                : snackbar.severity === 'success' ? 'success.main' : 'error.main',
            }
          }}
        >
          {snackbar.message}
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
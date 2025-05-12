// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import {
  IconButton,
  Avatar,
  Typography,
  Box,
  Divider,
  AppBar,
  Toolbar,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogActions,
  List,
  ListItem,
  Button,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme as muiUseTheme,
  Drawer,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EventIcon from "@mui/icons-material/Event";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../config/axiosconfig";

// Different navigation item sets
const NAVIGATION_ITEMS = {
  // Full set for logged-in users
  full: [
    { path: '/home', label: 'Home', icon: <HomeIcon /> },
    { path: '/event', label: 'Events', icon: <EventIcon /> },
    { path: '/ai-search', label: 'AI Search', icon: <SearchIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
    { path: '/profile', label: 'Profile', icon: <AccountCircleIcon /> },
    { path: '/organizer-events', label: 'My Events', icon: <EventIcon /> },
  ],
  // Limited set for guests
  guest: [
    { path: '/home', label: 'Home', icon: <HomeIcon /> },
    { path: '/event', label: 'Events', icon: <EventIcon /> },
    { path: '/ai-search', label: 'AI Search', icon: <SearchIcon /> },
    { path: '/about', label: 'About', icon: <InfoIcon /> },
  ],
  // Landing page sections
  landing: [
    { path: '#create-event', label: 'Create Event', icon: <EventIcon />, id: 'create-event' },
    { path: '#events', label: 'Events', icon: <EventIcon />, id: 'events' },
    { path: '#about-us', label: 'About Us', icon: <InfoIcon />, id: 'about-us' },
  ]
};

const Navbar = ({
  themeMode,
  showBackButton,
  showMenuButton,
  onMenuClick,
  user,
  landingPage,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = muiUseTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Check if user is logged in
  const isLoggedIn = Boolean(user || sessionStorage.getItem("username"));

  // Determine which navigation items to use
  const navigationItems = landingPage 
    ? NAVIGATION_ITEMS.landing 
    : (isLoggedIn ? NAVIGATION_ITEMS.full : NAVIGATION_ITEMS.guest);

  // For landing page section navigation
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (landingPage) {
      const sectionId = navigationItems[newValue].id;
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate("/profile");
    handleClose();
    setMobileDrawerOpen(false);
  };

  const handleSettings = () => {
    navigate("/settings");
    handleClose();
    setMobileDrawerOpen(false);
  };

  const handleAiSearch = () => {
    navigate("/ai-search");
    handleClose();
    setMobileDrawerOpen(false);
  };

  const handleLogout = () => {
    handleClose();
    setLogoutDialogOpen(true);
    setMobileDrawerOpen(false);
  };

  const confirmLogout = async () => {
    try {
      await axios.post("/logout");
      // Clear all session data
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("picture");
      sessionStorage.removeItem("userId");
      // Navigate to landing page
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLogoutDialogOpen(false);
    }
  };
  
  const handleNavigation = (path) => {
    // If path is a hash (for landing page), use scrollIntoView
    if (path.startsWith('#')) {
      const sectionId = path.substring(1);
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(path);
    }
    setMobileDrawerOpen(false);
  };
  
  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const isActive = (path) => {
    // For landing page hash links
    if (path.startsWith('#')) {
      return false; // We handle active state through the tab state
    }
    return location.pathname === path;
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: "blur(8px)",
          borderBottom: themeMode === 'dark' 
            ? '1px solid rgba(255,255,255,0.1)' 
            : '1px solid rgba(0,0,0,0.05)',
          zIndex: 1200,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 4 } }}>
          {showBackButton && (
            <Tooltip title="Go back">
              <IconButton
                onClick={() => navigate(-1)}
                sx={{ 
                  mr: 2, 
                  color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                  '&:hover': {
                    background: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  }
                }}
                edge="start"
                aria-label="back"
              >
                <ArrowBackIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {showMenuButton && isLoggedIn && (
            <Tooltip title="Menu">
              <IconButton
                onClick={isSmallScreen ? toggleMobileDrawer : onMenuClick}
                sx={{ 
                  mr: 2, 
                  color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                  '&:hover': {
                    background: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  }
                }}
                edge="start"
                aria-label="menu"
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          )}
          
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ 
              flexGrow: { xs: 1, md: 0 },
              color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
              letterSpacing: '-0.5px',
              mr: 3,
              cursor: 'pointer',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              fontFamily: "'Inter', 'Poppins', 'Roboto', sans-serif"
            }}
            onClick={() => navigate('/')}
          >
            EventHub
          </Typography>
          
          {/* Navigation Links - visible on medium and larger screens */}
          {!isSmallScreen && (
            <>
              {landingPage ? (
                // For landing page, use tabs with smooth scroll
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
                  variant={isSmallScreen ? "scrollable" : "standard"}
                  scrollButtons={isSmallScreen ? "auto" : false}
                  centered
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{ flexGrow: 1 }}
                >
                  {navigationItems.map((item, idx) => (
                    <Tab 
                      key={item.id}
                      icon={item.icon}
                      label={item.label}
                      sx={{ 
                        textTransform: "none", 
                        fontWeight: activeTab === idx ? 600 : 400,
                        transition: "all 0.2s ease"
                      }}
                    />
                  ))}
                </Tabs>
              ) : (
                // For regular navigation
                <Box sx={{ flexGrow: 1, display: 'flex', ml: 2 }}>
                  {navigationItems.map((item) => (
                    <Button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)} 
                      startIcon={item.icon}
                      color={isActive(item.path) ? 'primary' : 'inherit'}
                      sx={{
                        mx: 0.5,
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        fontWeight: isActive(item.path) ? 700 : 500,
                        fontSize: '0.95rem',
                        fontFamily: "'Inter', 'Poppins', 'Roboto', sans-serif",
                        color: isActive(item.path) 
                          ? (themeMode === 'dark' ? 'primary.light' : 'primary.main')
                          : (themeMode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'),
                        position: 'relative',
                        textTransform: 'none',
                        '&:hover': {
                          background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        },
                        '&::after': isActive(item.path) ? {
                          content: '""',
                          position: 'absolute',
                          bottom: 5,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '30%',
                          height: 3,
                          borderRadius: 3,
                          backgroundColor: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                        } : {}
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </Box>
              )}
            </>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 'auto' }}>
            {isLoggedIn && (
              <Tooltip title="Notifications">
                <IconButton
                  color="primary"
                  onClick={() => {}}
                  sx={{
                    '&:hover': {
                      background: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    }
                  }}
                  aria-label="notifications"
                >
                  <Badge badgeContent={0} color="secondary">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
            {isLoggedIn ? (
              <Tooltip title="Account">
                <Avatar
                  onClick={handleAvatarClick}
                  sx={{
                    width: 40,
                    height: 40,
                    cursor: "pointer",
                    border: themeMode === 'dark' 
                      ? '2px solid rgba(255,255,255,0.1)' 
                      : '2px solid rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      borderColor: 'primary.main',
                    }
                  }}
                  src={user?.picture || sessionStorage.getItem("picture") || ""}
                  aria-label="account menu"
                >
                  {!user?.picture && !sessionStorage.getItem("picture") &&
                    (user?.username ? user.username.charAt(0).toUpperCase() : "U")}
                </Avatar>
              </Tooltip>
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/login')}
                  sx={{
                    mr: 2, 
                    borderRadius: "8px", 
                    textTransform: "none",
                    px: 2
                  }}
                >
                  Login
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderRadius: "8px", 
                    textTransform: "none",
                    px: 2,
                    boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)",
                    background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)',
                    }
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Avatar Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            background: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            border: themeMode === 'dark' 
              ? '1px solid rgba(255,255,255,0.1)' 
              : '1px solid rgba(0,0,0,0.05)',
            borderRadius: 2,
            minWidth: 200,
            boxShadow: themeMode === 'dark' 
              ? '0 10px 25px rgba(0,0,0,0.3)' 
              : '0 10px 25px rgba(0,0,0,0.1)',
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" fontWeight="bold">
            {user?.username || sessionStorage.getItem("username") || "Guest"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email || sessionStorage.getItem("email") || "guest@example.com"}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProfile} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleSettings} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleAiSearch} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <SearchIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>AI Search</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          handleClose();
          navigate('/organizer-events');
        }} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <EventIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Events</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            background: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            borderRight: themeMode === 'dark' 
              ? '1px solid rgba(255,255,255,0.1)' 
              : '1px solid rgba(0,0,0,0.05)',
          }
        }}
      >
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {isLoggedIn && (
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={user?.picture || sessionStorage.getItem("picture") || ""}
                sx={{ 
                  width: 48, 
                  height: 48,
                  border: themeMode === 'dark' 
                    ? '2px solid rgba(255,255,255,0.1)' 
                    : '2px solid rgba(0,0,0,0.05)',
                  mr: 2
                }}
              >
                {!user?.picture && !sessionStorage.getItem("picture") &&
                  (user?.username ? user.username.charAt(0).toUpperCase() : "U")}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {user?.username || sessionStorage.getItem("username") || "Guest"}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user?.email || sessionStorage.getItem("email") || "guest@example.com"}
                </Typography>
              </Box>
            </Box>
          )}
          
          <Divider sx={{ mb: 2 }} />
          
          <List sx={{ flexGrow: 1 }}>
            {navigationItems.map((item) => (
              <ListItem 
                button 
                key={item.path}
                onClick={() => handleNavigation(item.path)} 
                sx={{ 
                  borderRadius: 2,
                  mb: 1,
                  backgroundColor: isActive(item.path) 
                    ? (themeMode === 'dark' ? 'rgba(58, 134, 255, 0.15)' : 'rgba(58, 134, 255, 0.08)')
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive(item.path) 
                    ? (themeMode === 'dark' ? 'primary.light' : 'primary.main')
                    : 'inherit'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ 
                    fontWeight: isActive(item.path) ? 700 : 500,
                    color: isActive(item.path) 
                      ? (themeMode === 'dark' ? 'primary.light' : 'primary.main')
                      : 'inherit'
                  }}
                />
              </ListItem>
            ))}
          </List>
          
          {isLoggedIn && (
            <>
              <Divider sx={{ my: 2 }} />
              <Button
                variant="outlined"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                fullWidth
                sx={{ 
                  borderRadius: 2,
                  py: 1,
                  justifyContent: 'flex-start',
                  borderColor: themeMode === 'dark' ? 'error.light' : 'error.main',
                  color: themeMode === 'dark' ? 'error.light' : 'error.main',
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Box>
      </Drawer>

      {/* Logout Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        PaperProps={{
          sx: {
            background: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle>Do you want to log out?</DialogTitle>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setLogoutDialogOpen(false)}
            sx={{
              color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
            }}
          >
            No
          </Button>
          <Button
            onClick={confirmLogout}
            variant="contained"
            sx={{
              background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)',
              }
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

Navbar.propTypes = {
  themeMode: PropTypes.string,
  showBackButton: PropTypes.bool,
  showMenuButton: PropTypes.bool,
  onMenuClick: PropTypes.func,
  user: PropTypes.object,
  landingPage: PropTypes.bool,
};

Navbar.defaultProps = {
  showBackButton: false,
  showMenuButton: false,
  landingPage: false,
};

export default Navbar; 
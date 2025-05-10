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
  DialogContent,
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
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../config/axiosconfig";

const NAVIGATION_ITEMS = [
  { path: '/home', label: 'Home', icon: <HomeIcon /> },
  { path: '/event', label: 'Events', icon: <EventIcon /> },
  { path: '/about', label: 'About', icon: <InfoIcon /> },
  { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
  { path: '/profile', label: 'Profile', icon: <AccountCircleIcon /> },
  { path: '/organizer-events', label: 'My Events', icon: <EventIcon /> },
];

const Navbar = ({
  themeMode,
  title,
  showBackButton,
  showMenuButton,
  onMenuClick,
  user,
  notifications,
  fetchNotifications,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = muiUseTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  
  // Check if user is logged in
  const isLoggedIn = Boolean(user || sessionStorage.getItem("username"));
  
  const unreadNotificationsCount = isLoggedIn && notifications 
    ? notifications.filter((notification) => !notification.read).length 
    : 0;

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

  const handleAbout = () => {
    navigate("/about");
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
      await axios.post("/api/auth/logout");
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

  const handleNotificationsClick = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const username = sessionStorage.getItem("username");
      if (username) {
        await axios.put("/api/notifications/read-all", { username });
        if (fetchNotifications) {
          fetchNotifications();
        }
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };
  
  const handleNavigation = (path) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };
  
  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const isActive = (path) => {
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
          
          {showMenuButton && (
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
            variant="h6"
            fontWeight="bold"
            sx={{ 
              flexGrow: { xs: 1, md: 0 },
              color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
              letterSpacing: '-0.5px',
              mr: 3,
              cursor: 'pointer'
            }}
            onClick={() => navigate('/home')}
          >
            {title}
          </Typography>
          
          {/* Navigation Links - visible on medium and larger screens */}
          {!isSmallScreen && (
            <Box sx={{ flexGrow: 1, display: 'flex', ml: 2 }}>
              {NAVIGATION_ITEMS.map((item) => (
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

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 'auto' }}>
            {isLoggedIn && (
              <Tooltip title="Notifications">
                <IconButton
                  color="primary"
                  onClick={handleNotificationsClick}
                  sx={{
                    '&:hover': {
                      background: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    }
                  }}
                  aria-label="notifications"
                >
                  <Badge badgeContent={unreadNotificationsCount} color="secondary">
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
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{
                  background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)',
                  }
                }}
              >
                Login
              </Button>
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
        <MenuItem onClick={handleAbout} sx={{ py: 1.5 }}>
          <ListItemIcon>
            <InfoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>About</ListItemText>
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
            {NAVIGATION_ITEMS.map((item) => (
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

      {/* Notifications Dialog */}
      <Dialog
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '90%', sm: 400 },
            maxWidth: '100%',
            maxHeight: '70vh',
            background: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Notifications</Typography>
            {notifications && notifications.length > 0 && (
              <Button
                color="primary"
                size="small"
                onClick={markAllNotificationsAsRead}
                sx={{
                  color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                }}
              >
                Mark all as read
              </Button>
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <List sx={{ p: 0 }}>
            {notifications && notifications.length > 0 ? (
              notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  sx={{
                    borderLeft: notification.read
                      ? 'none'
                      : '4px solid',
                    borderLeftColor: 'secondary.main',
                    background: notification.read
                      ? 'transparent'
                      : themeMode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.02)',
                    px: 2,
                    py: 1.5,
                    '&:hover': {
                      background: themeMode === 'dark'
                        ? 'rgba(255, 255, 255, 0.05)'
                        : 'rgba(0, 0, 0, 0.02)',
                    }
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2">{notification.text}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notification.time}
                    </Typography>
                  </Box>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ width: '100%', py: 2 }}>
                  No notifications
                </Typography>
              </ListItem>
            )}
          </List>
        </DialogContent>
      </Dialog>

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
  title: PropTypes.string,
  showBackButton: PropTypes.bool,
  showMenuButton: PropTypes.bool,
  onMenuClick: PropTypes.func,
  user: PropTypes.object,
  notifications: PropTypes.array,
  fetchNotifications: PropTypes.func,
};

Navbar.defaultProps = {
  title: "EventHub",
  showBackButton: false,
  showMenuButton: false,
  notifications: [],
};

export default Navbar; 
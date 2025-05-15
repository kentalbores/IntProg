// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect, useMemo } from "react";
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
  useTheme,
  Drawer,
  Tooltip,
  DialogContent,
  CircularProgress,
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
import StoreIcon from "@mui/icons-material/Store";
import BusinessIcon from "@mui/icons-material/Business";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../config/axiosconfig";
import { keyframes } from "@emotion/react";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ErrorIcon from "@mui/icons-material/Error";
import StorefrontIcon from "@mui/icons-material/Storefront";

// Different navigation item sets
const NAVIGATION_ITEMS = {
  // Full set for logged-in users
  full: [
    { path: '/home', label: 'Home', icon: <HomeIcon /> },
    { path: '/event', label: 'Events', icon: <EventIcon /> },
    { path: '/services', label: 'Services', icon: <StorefrontIcon /> },
    { path: '/ai-search', label: 'AI Search', icon: <SearchIcon /> },
  ],
  // Limited set for guests
  guest: [
    { path: '/home', label: 'Home', icon: <HomeIcon /> },
    { path: '/event', label: 'Events', icon: <EventIcon /> },
    { path: '/services', label: 'Services', icon: <StorefrontIcon /> },
    { path: '/ai-search', label: 'AI Search', icon: <SearchIcon /> },
    { path: '/about', label: 'About', icon: <InfoIcon /> },
  ],
  // Landing page sections
  landing: [
    { path: '#create-event', label: 'Create Event', icon: <EventIcon />, id: 'create-event' },
    { path: '#events', label: 'Events', icon: <EventIcon />, id: 'events' },
    { path: '#services', label: 'Services', icon: <StorefrontIcon /> },
    { path: '#about-us', label: 'About Us', icon: <InfoIcon />, id: 'about-us' },
  ],
  // Role-specific items
  organizer: [
    { path: '/organizer-events', label: 'My Events', icon: <BusinessIcon /> },
  ],
  vendor: [
    { path: '/vendor-services', label: 'My Services', icon: <StoreIcon /> },
  ]
};

// Custom keyframes for badge animation
const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const subtleSlideDown = keyframes`
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
`;

// Format notification time to be more user-friendly
const formatNotificationTime = (timestamp) => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffMs = now - notificationTime;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) {
    return 'Just now';
  } else if (diffMin < 60) {
    return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
  } else if (diffDay === 1) {
    return 'Yesterday';
  } else if (diffDay < 7) {
    return `${diffDay} days ago`;
  } else {
    return notificationTime.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

// Group notifications by date
const groupNotificationsByDate = (notifications) => {
  const groups = {};
  
  notifications.forEach(notification => {
    const date = new Date(notification.time);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    let groupKey;
    
    if (date.toDateString() === today.toDateString()) {
      groupKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = 'Yesterday';
    } else {
      groupKey = date.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      });
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    groups[groupKey].push(notification);
  });
  
  return groups;
};

const Navbar = ({
  themeMode,
  showBackButton,
  showMenuButton,
  user,
  landingPage,
  title,
  activities = [],
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [userRoles, setUserRoles] = useState([]);
  
  // Add notification state
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const notificationsOpen = Boolean(notificationsAnchorEl);
  
  // Check if user is logged in
  const isLoggedIn = Boolean(user || sessionStorage.getItem("username"));

  // Fetch user roles if logged in
  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const username = sessionStorage.getItem("username");
        if (username) {
          // Check if roles are already cached in local storage
          const cachedRoles = localStorage.getItem("userRoles");
          if (cachedRoles) {
            // Use cached roles for immediate display
            setUserRoles(JSON.parse(cachedRoles));
          }
          
          // Still fetch from server to ensure up-to-date data
          const response = await axios.get(`/api/user/my-role/${username}`);
          if (response.data && response.data.role) {
            // Handle both array and string responses
            const roles = Array.isArray(response.data.role) 
              ? response.data.role 
              : [response.data.role];
            
            setUserRoles(roles);
            // Cache the roles in local storage for persistence
            localStorage.setItem("userRoles", JSON.stringify(roles));
          }
        }
      } catch (error) {
        console.error("Error fetching user roles:", error);
        // If fetch fails but we have cached roles, keep using them
        const cachedRoles = localStorage.getItem("userRoles");
        if (cachedRoles && !userRoles.length) {
          setUserRoles(JSON.parse(cachedRoles));
        }
      }
    };

    if (isLoggedIn) {
      fetchUserRoles();
    } else {
      // Clear roles if logged out
      setUserRoles([]);
      localStorage.removeItem("userRoles");
    }
  }, [isLoggedIn]);

  // Set selected tab based on current route
  useEffect(() => {
    const allItems = [...NAVIGATION_ITEMS.full];
    
    // Add role-specific items
    if (userRoles.includes('organizer')) {
      allItems.push(...NAVIGATION_ITEMS.organizer);
    }
    if (userRoles.includes('vendor')) {
      allItems.push(...NAVIGATION_ITEMS.vendor);
    }
    
    const currentPath = location.pathname;
    const foundIndex = allItems.findIndex(item => item.path === currentPath);
    if (foundIndex !== -1) {
      setActiveTab(foundIndex);
    }
  }, [location.pathname, userRoles]);

  // Determine which navigation items to use
  const getNavigationItems = () => {
    if (landingPage) return NAVIGATION_ITEMS.landing;
    if (!isLoggedIn) return NAVIGATION_ITEMS.guest;
    
    let items = [...NAVIGATION_ITEMS.full];
    
    // Add role-specific items
    if (userRoles.includes('organizer')) {
      items = [...items, ...NAVIGATION_ITEMS.organizer];
    }
    if (userRoles.includes('vendor')) {
      items = [...items, ...NAVIGATION_ITEMS.vendor];
    }
    
    return items;
  };

  const navigationItems = getNavigationItems();

  // For landing page section navigation
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (landingPage) {
      const sectionId = navigationItems[newValue].id;
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(navigationItems[newValue].path);
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

  // Update notification state to use activities
  useEffect(() => {
    if (activities.length > 0) {
      setNotifications(activities);
      setHasNewNotifications(activities.some(activity => !activity.read));
    }
  }, [activities]);

  // Update markAsRead function
  const markAsRead = async (notificationId) => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      )
    );
    setHasNewNotifications(false);
  };

  // Update markAllAsRead function
  const markAllAsRead = async () => {
    setNotifications(prevNotifications => 
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    setHasNewNotifications(false);
  };

  // Update notification click handler
  const handleNotificationsClick = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
    setHasNewNotifications(false);
  };

  // Add handleNotificationsClose function
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  // Get unread notification count for badge
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(notifications);
  }, [notifications]);

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
          {showBackButton && !location.pathname.includes('/profile') && !location.pathname.includes('/organizer-events') && (
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
                onClick={toggleMobileDrawer}
                sx={{ 
                  mr: 2, 
                  display: { xs: 'flex', md: 'none' },
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
            onClick={() => navigate('/home')}
          >
            {title || "EventHub"}
          </Typography>
          
          {/* Navigation Links - visible on medium and larger screens */}
          {!isMobile && (
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              sx={{ 
                flexGrow: 1,
                marginLeft: 2,
                '.MuiTabs-indicator': {
                  background: 'linear-gradient(90deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)',
                  height: 3,
                },
                '.MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  minWidth: 0,
                  padding: '12px 16px',
                  color: themeMode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)',
                  '&.Mui-selected': {
                    color: themeMode === 'dark' ? 'white' : 'text.primary',
                    fontWeight: 600,
                  }
                }
              }}
            >
              {navigationItems.map((item) => (
                <Tab 
                  key={item.path}
                  icon={item.icon} 
                  iconPosition="start"
                  label={item.label}
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    '& .MuiSvgIcon-root': {
                      marginBottom: '0 !important',
                      marginRight: 1
                    }
                  }}
                />
              ))}
            </Tabs>
          )}

          {/* Spacer to push right items to the edge */}
          <Box sx={{ flexGrow: isMobile ? 0 : 1 }} />
          
          {/* Right side items - notifications and user avatar */}
          {isLoggedIn && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title="Notifications">
                <IconButton 
                  color="inherit"
                  onClick={handleNotificationsClick}
                  sx={{ 
                    mr: { xs: 1, sm: 2 }, 
                    color: notificationsOpen || hasNewNotifications 
                      ? (themeMode === 'dark' ? 'primary.light' : 'primary.main') 
                      : (themeMode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)'),
                    position: 'relative',
                    '&:hover': {
                      background: themeMode === 'dark' 
                        ? 'rgba(71, 118, 230, 0.1)' 
                        : 'rgba(71, 118, 230, 0.05)',
                    }
                  }}
                >
                  <Badge 
                    color="error" 
                    badgeContent={unreadCount > 99 ? '99+' : unreadCount > 0 ? unreadCount : null}
                    sx={{
                      '& .MuiBadge-badge': {
                        animation: hasNewNotifications ? `${pulseAnimation} 2s infinite` : 'none',
                        right: -1,
                        top: 3,
                        fontWeight: 'bold',
                        minWidth: 18,
                        height: 18,
                        padding: '0 4px',
                      }
                    }}
                  >
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Account">
                <IconButton
                  onClick={handleAvatarClick}
                  sx={{ p: 0 }}
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                >
                  <Avatar 
                    src={user?.picture || sessionStorage.getItem("picture") || ""}
                    sx={{ 
                      width: 36, 
                      height: 36,
                      border: '2px solid',
                      borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'
                    }}
                  >
                    {!user?.picture && !sessionStorage.getItem("picture") && 
                      ((user?.username || sessionStorage.getItem("username") || "U").charAt(0).toUpperCase())}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          )}
          
          {!isLoggedIn && (
            <Box>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/login')}
                sx={{ 
                  mr: 2,
                  borderRadius: '8px',
                  borderColor: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                  color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: themeMode === 'dark' ? 'primary.main' : 'primary.dark',
                    background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
                  }
                }}
              >
                Login
              </Button>
              <Button 
                variant="contained" 
                onClick={() => navigate('/login')}
                sx={{ 
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)',
                  textTransform: 'none',
                  boxShadow: themeMode === 'dark' ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 2px 8px rgba(59, 130, 246, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
                  }
                }}
              >
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* User menu dropdown */}
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            border: themeMode === 'dark' 
              ? '1px solid rgba(255,255,255,0.1)' 
              : '1px solid rgba(0,0,0,0.05)',
            borderRadius: 2,
            minWidth: 200,
            boxShadow: themeMode === 'dark' 
              ? '0 4px 20px rgba(0,0,0,0.5)' 
              : '0 4px 20px rgba(0,0,0,0.1)',
            background: themeMode === 'dark' ? '#1e293b' : 'white',
          }
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body1" fontWeight="bold">
            {user?.username || sessionStorage.getItem("username") || "User"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {user?.email || sessionStorage.getItem("email") || "user@example.com"}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 0.5, mb: 0.5, flexWrap: 'wrap' }}>
            {userRoles.includes('organizer') && (
              <Typography 
                variant="caption" 
                sx={{ 
                  bgcolor: 'primary.main',
                  color: 'white',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: '0.7rem'
                }}
              >
                Organizer
              </Typography>
            )}
            {userRoles.includes('vendor') && (
              <Typography 
                variant="caption" 
                sx={{ 
                  bgcolor: 'secondary.main',
                  color: 'white',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: '0.7rem'
                }}
              >
                Vendor
              </Typography>
            )}
          </Box>
        </Box>
        
        <Divider />
        
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      {/* Logout confirmation dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        PaperProps={{
          sx: { 
            borderRadius: 2,
            bgcolor: themeMode === 'dark' ? '#1e293b' : 'white',
          }
        }}
      >
        <DialogTitle>Confirm Logout</DialogTitle>
        <List>
          <ListItem>
            <ListItemText primary="Are you sure you want to log out?" />
          </ListItem>
        </List>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={confirmLogout} 
            color="error"
            variant="contained"
            sx={{
              background: 'linear-gradient(90deg, #ef4444, #f87171)',
              color: 'white',
              ':hover': {
                background: 'linear-gradient(90deg, #dc2626, #ef4444)',
              }
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications popover */}
      <Menu
        id="notifications-menu"
        anchorEl={notificationsAnchorEl}
        open={notificationsOpen}
        onClose={handleNotificationsClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: { xs: '90vw', sm: 400 },
            maxWidth: '100%',
            maxHeight: '70vh',
            overflowY: 'auto',
            border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
            borderRadius: 2,
            boxShadow: themeMode === 'dark' ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.1)',
            background: themeMode === 'dark' ? '#1e293b' : 'white',
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <DialogTitle sx={{ 
          px: 2.5, 
          py: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon fontSize="small" color="primary" />
            <Typography variant="h6" component="div">
              Recent Events
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {notifications.length > 0 && (
              <Tooltip title="Mark all as read">
                <IconButton
                  aria-label="mark all as read"
                  onClick={markAllAsRead}
                  size="small"
                >
                  <DoneAllIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <IconButton
              aria-label="close"
              onClick={handleNotificationsClose}
              edge="end"
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 0 }}>
          {loadingNotifications ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress size={24} sx={{ color: 'primary.main' }} />
              <Typography variant="body2" sx={{ mt: 1.5, color: 'text.secondary' }}>
                Loading notifications...
              </Typography>
            </Box>
          ) : notificationError ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <ErrorIcon sx={{ fontSize: 40, color: 'error.main', opacity: 0.7, mb: 1 }} />
              <Typography variant="body2" color="error" sx={{ mb: 2 }}>
                {notificationError}
              </Typography>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </Box>
          ) : notifications.length > 0 ? (
            <>
              {Object.entries(groupedNotifications).map(([date, dateNotifications], groupIndex) => (
                <Box key={date}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block',
                      py: 1,
                      px: 2.5,
                      bgcolor: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(0,0,0,0.03)',
                      color: 'text.secondary',
                      fontWeight: 600
                    }}
                  >
                    {date}
                  </Typography>
                  
                  <List sx={{ p: 0 }}>
                    {dateNotifications.map((notification, index) => (
                      <ListItem
                        key={notification.id}
                        alignItems="flex-start"
                        sx={{
                          px: 2.5,
                          py: 1.75,
                          bgcolor: notification.read ? 'transparent' : (themeMode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'),
                          borderBottom: '1px solid',
                          borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                          '&:last-child': {
                            borderBottom: groupIndex === Object.keys(groupedNotifications).length - 1 ? 'none' : undefined
                          },
                          '&:hover': {
                            bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                          },
                          animation: `${subtleSlideDown} 0.3s ease forwards`,
                          animationDelay: `${index * 0.05}s`,
                          opacity: 0,
                          cursor: notification.eventId ? 'pointer' : 'default',
                        }}
                        onClick={() => {
                          if (notification.eventId) {
                            navigate(`/events/${notification.eventId}`);
                            handleNotificationsClose();
                            if (!notification.read) {
                              markAsRead(notification.id);
                            }
                          }
                        }}
                        secondaryAction={
                          !notification.read && (
                            <Button 
                              size="small" 
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              sx={{ 
                                textTransform: 'none',
                                fontSize: '0.75rem',
                                lineHeight: 1,
                                minWidth: 0,
                                py: 0.5,
                                px: 1,
                                color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                                '&:hover': {
                                  backgroundColor: themeMode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                                }
                              }}
                            >
                              Mark read
                            </Button>
                          )
                        }
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
                              {!notification.read && (
                                <Box
                                  component="span"
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: 'primary.main',
                                    display: 'inline-block',
                                    mr: 1,
                                    mt: 0.8,
                                    flexShrink: 0,
                                  }}
                                />
                              )}
                              <Typography 
                                variant="body2" 
                                component="span" 
                                fontWeight={notification.read ? 400 : 600}
                                sx={{
                                  color: notification.read 
                                    ? (themeMode === 'dark' ? 'rgba(255,255,255,0.7)' : 'text.primary')
                                    : (themeMode === 'dark' ? 'rgba(255,255,255,0.9)' : 'text.primary')
                                }}
                              >
                                {notification.text}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              component="span"
                              sx={{ display: 'block', mt: 0.5 }}
                            >
                              {formatNotificationTime(notification.time)}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              ))}
            </>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Box sx={{ mb: 2, opacity: 0.7 }}>
                <NotificationsIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
              </Box>
              <Typography variant="body1" color="text.secondary" fontWeight={500}>
                No recent events
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, px: 3, maxWidth: 300, mx: 'auto' }}>
                You haven&apos;t registered for any events yet
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Menu>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
        PaperProps={{
          sx: {
            width: 280,
            background: themeMode === 'dark' ? '#0f172a' : '#ffffff',
            borderRight: themeMode === 'dark' 
              ? '1px solid rgba(255,255,255,0.1)' 
              : '1px solid rgba(0,0,0,0.05)',
          },
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 2,
              border: themeMode === 'dark' 
                ? '2px solid rgba(255,255,255,0.1)' 
                : '2px solid rgba(0,0,0,0.05)',
            }}
            src={user?.picture || sessionStorage.getItem("picture") || ""}
          >
            {!user?.picture && !sessionStorage.getItem("picture") &&
              (user?.username ? user.username.charAt(0).toUpperCase() : "U")}
          </Avatar>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
            {user?.username || sessionStorage.getItem("username") || "Guest"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email || sessionStorage.getItem("email") || "guest@example.com"}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
            {userRoles.includes('organizer') && (
              <Typography 
                variant="caption" 
                sx={{ 
                  bgcolor: 'primary.main',
                  color: 'white',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: '0.7rem'
                }}
              >
                Organizer
              </Typography>
            )}
            {userRoles.includes('vendor') && (
              <Typography 
                variant="caption" 
                sx={{ 
                  bgcolor: 'secondary.main',
                  color: 'white',
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  fontSize: '0.7rem'
                }}
              >
                Vendor
              </Typography>
            )}
          </Box>
        </Box>

        <Divider />

        <List sx={{ px: 2 }}>
          {navigationItems.map((item) => (
            <ListItem
              key={item.path}
              button="true"
              onClick={() => handleNavigation(item.path)}
              sx={{ 
                borderRadius: 2,
                mb: 1,
                cursor: "pointer",
                bgcolor: isActive(item.path) 
                  ? (themeMode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)')
                  : 'transparent',
                '&:hover': { 
                  background: themeMode === 'dark' 
                    ? 'rgba(255,255,255,0.05)' 
                    : 'rgba(0,0,0,0.05)',
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label} 
                primaryTypographyProps={{
                  color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
                  fontWeight: isActive(item.path) ? 600 : 400
                }}
              />
            </ListItem>
          ))}
          
          <Divider sx={{ my: 1 }} />
          
          <ListItem
            button="true"
            onClick={handleProfile}
            sx={{ 
              borderRadius: 2,
              mb: 1,
              cursor: "pointer",
              '&:hover': { 
                background: themeMode === 'dark' 
                  ? 'rgba(255,255,255,0.05)' 
                  : 'rgba(0,0,0,0.05)',
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <AccountCircleIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Profile" 
              primaryTypographyProps={{
                color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
              }}
            />
          </ListItem>
          
          <ListItem
            button="true"
            onClick={handleSettings}
            sx={{ 
              borderRadius: 2,
              mb: 1,
              cursor: "pointer",
              '&:hover': { 
                background: themeMode === 'dark' 
                  ? 'rgba(255,255,255,0.05)' 
                  : 'rgba(0,0,0,0.05)',
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SettingsIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="Settings" 
              primaryTypographyProps={{
                color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
              }}
            />
          </ListItem>
          
          <ListItem
            button="true"
            onClick={handleLogout}
            sx={{ 
              borderRadius: 2,
              cursor: "pointer",
              '&:hover': { 
                background: themeMode === 'dark' 
                  ? 'rgba(255,255,255,0.05)' 
                  : 'rgba(0,0,0,0.05)',
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon color="error" />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{
                color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
              }}
            />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

Navbar.propTypes = {
  themeMode: PropTypes.string,
  showBackButton: PropTypes.bool,
  showMenuButton: PropTypes.bool,
  user: PropTypes.object,
  landingPage: PropTypes.bool,
  title: PropTypes.string,
  activities: PropTypes.array,
};

export default Navbar; 
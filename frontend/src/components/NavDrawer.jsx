// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import axios from "../config/axiosconfig";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  ListItemIcon,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EventIcon from "@mui/icons-material/Event";
import StoreIcon from "@mui/icons-material/Store";
import InfoIcon from "@mui/icons-material/Info";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

const NavDrawer = ({
  themeMode,
  open,
  onClose,
  user,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [userRoles, setUserRoles] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch the user's roles on component mount
  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const username = sessionStorage.getItem("username");
        if (username) {
          const response = await axios.get(`/api/user/my-role/${username}`);
          if (response.data && response.data.role) {
            // Handle both array and string responses
            setUserRoles(Array.isArray(response.data.role) 
              ? response.data.role 
              : [response.data.role]);
          }
        }
      } catch (error) {
        console.error("Error fetching user roles:", error);
      }
    };

    if (open) {
      fetchUserRoles();
    }
  }, [open]);

  const isOrganizer = userRoles.includes('organizer');
  const isVendor = userRoles.includes('vendor');

  const handleAbout = () => {
    navigate("/about");
    onClose();
  };

  const handleSettings = () => {
    navigate("/settings");
    onClose();
  };

  const handleMyEvents = () => {
    navigate("/organizer-events");
    onClose();
  };

  const handleMyServices = () => {
    navigate("/vendor-services");
    onClose();
  };

  const handleLogoutClick = () => {
    onClose();
    // We'll handle logout via props to keep it consistent with the Navbar
    if (typeof onLogout === 'function') {
      onLogout();
    }
  };

  // Don't render if not mobile
  if (!isMobile) {
    return null;
  }

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
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
      </Box>

      <Divider />

      <List sx={{ px: 2 }}>
        <ListItem
          button="true"
          onClick={handleAbout}
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
          <ListItemIcon>
            <InfoIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="About" 
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
          <ListItemIcon>
            <SettingsIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Settings" 
            primaryTypographyProps={{
              color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
            }}
          />
        </ListItem>

        {/* Show My Events only for users with organizer role */}
        {isOrganizer && (
          <ListItem
            button="true"
            onClick={handleMyEvents}
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
            <ListItemIcon>
              <EventIcon color="primary" />
            </ListItemIcon>
            <ListItemText 
              primary="My Events" 
              primaryTypographyProps={{
                color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
              }}
            />
          </ListItem>
        )}

        {/* Show My Services only for users with vendor role */}
        {isVendor && (
          <ListItem
            button="true"
            onClick={handleMyServices}
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
            <ListItemIcon>
              <StoreIcon color="secondary" />
            </ListItemIcon>
            <ListItemText 
              primary="My Services" 
              primaryTypographyProps={{
                color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
              }}
            />
          </ListItem>
        )}

        <ListItem
          button="true"
          onClick={handleLogoutClick}
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
          <ListItemIcon>
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
  );
};

NavDrawer.propTypes = {
  themeMode: PropTypes.string,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  onLogout: PropTypes.func
};

export default NavDrawer; 
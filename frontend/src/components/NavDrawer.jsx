// eslint-disable-next-line no-unused-vars
import React from "react";
import PropTypes from 'prop-types';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Typography,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const NavDrawer = ({
  themeMode,
  open,
  onClose,
  user,
  onLogout,
}) => {
  const navigate = useNavigate();

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

  const handleLogoutClick = () => {
    onClose();
    // We'll handle logout via props to keep it consistent with the Navbar
    if (typeof onLogout === 'function') {
      onLogout();
    }
  };

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
          button
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
          <ListItemText 
            primary="About" 
            primaryTypographyProps={{
              color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
            }}
          />
        </ListItem>
        <ListItem
          button
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
          <ListItemText 
            primary="Settings" 
            primaryTypographyProps={{
              color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
            }}
          />
        </ListItem>
        <ListItem
          button
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
          <ListItemText 
            primary="My Events" 
            primaryTypographyProps={{
              color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
            }}
          />
        </ListItem>
        <ListItem
          button
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
  onLogout: PropTypes.func,
};

export default NavDrawer; 
import React, { useState, useEffect } from "react";
import {
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Divider,
  Container,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import axios from "./config/axiosconfig";
import "./all.css";

const Home = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `/api/userinfo?username=${sessionStorage.getItem("username")}`
        );
        setUser(response.data.user_info);
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUser();
  }, []);

  const handleProfile = () => {
    navigate("/profile");
    setMenuOpen(false);
  };

  const handleAbout = () => {
    navigate("/about");
    setMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true); // Open the confirmation dialog
  };

  const confirmLogout = async () => {
    setLogoutDialogOpen(false);
    try {
      await axios.post(`/logout`);
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
    setMenuOpen(false);
  };

  const handleReserveEvent = () => {
    navigate("/Event"); // Adjust this route based on your setup
  };

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 4 }}>
      {/* Burger Menu Button */}
      <IconButton
        onClick={() => setMenuOpen(true)}
        sx={{ position: "absolute", top: 10, left: 10, color: "rgb(0, 0, 0)" }}
      >
        <MenuIcon fontSize="small" />
      </IconButton>

      {/* Sidebar Drawer */}
      <Drawer
        anchor="left"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(10px)",
            color: "rgb(213, 213, 213)",
            width: 260,
          },
        }}
      >
        <Box sx={{ textAlign: "center", p: 2 }}>
          <Avatar
            sx={{
              width: 70,
              height: 70,
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "rgb(213, 213, 213)",
              fontSize: 28,
              mx: "auto",
            }}
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
          </Avatar>
          <Typography
            variant="h6"
            sx={{ mt: 1, fontWeight: 600, color: "rgb(213, 213, 213)" }}
          >
            {user?.username || "Guest"}
          </Typography>
        </Box>

        <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />

        <List>
          <ListItem button onClick={handleProfile}>
            <ListItemText
              primary="Profile"
              sx={{ color: "rgb(213, 213, 213)" }}
            />
          </ListItem>
          <ListItem button onClick={handleAbout}>
            <ListItemText
              primary="About"
              sx={{ color: "rgb(213, 213, 213)" }}
            />
          </ListItem>
          <ListItem button onClick={handleLogoutClick}>
            <ListItemText
              primary="Logout"
              sx={{ color: "rgb(213, 213, 213)" }}
            />
          </ListItem>
        </List>
      </Drawer>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
      >
        <DialogTitle>Do you want to log out?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)} color="primary">
            No
          </Button>
          <Button onClick={confirmLogout} color="primary" autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Body Content */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Welcome, {user?.firstname || "Guest"}!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Explore upcoming events and make your reservations easily.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ borderRadius: 2 }}
          onClick={handleReserveEvent}
        >
          Reserve an Event
        </Button>
      </Box>
    </Container>
  );
};

export default Home;

import React, { useState } from "react";
import { Button, IconButton, Drawer, List, ListItem, ListItemText } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import axios from "./config/axiosconfig";
import "./all.css";

const Home = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleProfile = () => {
    navigate("/profile");
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post(`/logout`);
      console.log(response.data);
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
    setMenuOpen(false);
  };

  return (
    <div>
      {/* Burger Menu Button */}
      <IconButton onClick={() => setMenuOpen(true)} sx={{ position: "absolute", top: 10, left: 10, color: "rgb(0, 0, 0)" }}>
        <MenuIcon fontSize="small" />
      </IconButton>

      {/* Transparent Sidebar Drawer */}
      <Drawer
        anchor="left"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent black
            backdropFilter: "blur(10px)", // Blurred effect
            color: "rgb(213, 213, 213)", // Custom font color
          },
        }}
      >
        <List sx={{ width: 250 }}>
          <ListItem button onClick={handleProfile}>
            <ListItemText primary="Profile" sx={{ color: "rgb(213, 213, 213)" }} />
          </ListItem>
          <ListItem button onClick={handleLogout}>
            <ListItemText primary="Logout" sx={{ color: "rgb(213, 213, 213)" }} />
          </ListItem>
        </List>
      </Drawer>
    </div>
  );
};

export default Home;

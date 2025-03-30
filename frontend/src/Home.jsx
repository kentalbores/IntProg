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
  Card,
  CardContent,
  Grid,
  Paper
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AddBoxIcon from "@mui/icons-material/AddBox";
import EventIcon from "@mui/icons-material/Event";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useNavigate } from "react-router-dom";
import axios from "./config/axiosconfig";
import "./components/Loading";
import "./all.css";
import Loading from "./components/Loading";

const Home = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Dashboard state
  const [totalEvents, setTotalEvents] = useState(7);
  const [eventsThisMonth, setEventsThisMonth] = useState(3);
  const [activities, setActivities] = useState([
    {
      id: 1,
      text: 'New event added: Film Festival',
      time: 'Today, 9:45 AM',
      icon: <EventIcon />
    },
    {
      id: 2,
      text: 'Updated details: Tech Conference',
      time: 'Yesterday, 3:20 PM',
      icon: <EventIcon />
    },
    {
      id: 3,
      text: 'Registration opened: Food Festival',
      time: 'Mar 22, 11:30 AM',
      icon: <EventIcon />
    }
  ]);
  
  const [nextEvent, setNextEvent] = useState({
    id: 'E001',
    name: 'Music Festival',
    day: '15',
    month: 'APR',
    time: '10:00 AM - 8:00 PM',
    location: 'Central Park'
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const username = sessionStorage.getItem("username");
        if (username) {
          const response = await axios.get(
            `/api/userinfo?username=${username}`
          );
          setUser(response.data.user_info);
        }
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
    setLogoutDialogOpen(true);
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("email");
  };

  const confirmLogout = async () => {
    setLogoutDialogOpen(false);
    try {
      setLoading(true);
      await axios.post(`/logout`);
      navigate("/login");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    setMenuOpen(false);
  };

  const handleAddEvent = () => {
    navigate("/Event");
  };

  const handleViewRegistrations = () => {
    navigate("/registrations");
  };

  const handleViewEventDetails = () => {
    navigate(`/event/${nextEvent.id}`);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Burger Menu Button */}
      <IconButton
        onClick={() => setMenuOpen(true)}
        sx={{ position: "absolute", top: 10, left: 10, color: "rgb(0, 0, 0)" }}
      >
        <MenuIcon />
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
            src={user?.picture || ""}
          >
            {!user?.picture && (user?.username ? user.username.charAt(0).toUpperCase() : "U")}
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

      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Dashboard Header */}
          <Box sx={{ mt: 5, mb: 4, textAlign: "left", pl: 1 }}>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Your Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {user?.firstname || user?.username || "Guest"}!
            </Typography>
          </Box>

          {/* Stats Cards Row */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6}>
              <Paper 
                elevation={2} 
                sx={{ 
                  bgcolor: '#E8F5E9', 
                  height: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Typography variant="h3" color="#2E7D32" fontWeight="bold">
                  {totalEvents}
                </Typography>
                <Typography variant="body2" color="#2E7D32">
                  Total Events
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper 
                elevation={2} 
                sx={{ 
                  bgcolor: '#E3F2FD', 
                  height: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Typography variant="h3" color="#1565C0" fontWeight="bold">
                  {eventsThisMonth}
                </Typography>
                <Typography variant="body2" color="#1565C0">
                  This Month
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Recent Activity Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ textAlign: "left", pl: 1 }}>
              Recent Activity
            </Typography>
            <Card elevation={2}>
              <CardContent>
                {activities.map((activity) => (
                  <Box key={activity.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#EEEEEE', 
                        color: '#757575',
                        mr: 2,
                        width: 36,
                        height: 36
                      }}
                    >
                      {activity.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{activity.text}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>

          {/* Quick Actions Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ textAlign: "left", pl: 1 }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card 
                  elevation={2} 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.02)' }
                  }} 
                  onClick={handleAddEvent}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <AddBoxIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
                    <Typography variant="body1" color="#4CAF50" fontWeight="medium">
                      Add Event
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card 
                  elevation={2} 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.02)' }
                  }} 
                  onClick={handleViewRegistrations}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <EventIcon sx={{ fontSize: 40, color: '#1976D2', mb: 1 }} />
                    <Typography variant="body1" color="#1976D2" fontWeight="medium">
                      My Registrations
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Next Event Card */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ textAlign: "left", pl: 1 }}>
              Next Event
            </Typography>
            <Card elevation={2}>
              <CardContent sx={{ display: 'flex', p: 0 }}>
                <Box 
                  sx={{ 
                    bgcolor: '#4CAF50', 
                    color: 'white', 
                    p: 2, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '70px'
                  }}
                >
                  <Typography variant="h4" fontWeight="bold">
                    {nextEvent.day}
                  </Typography>
                  <Typography variant="body2">
                    {nextEvent.month}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, flexGrow: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {nextEvent.id}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {nextEvent.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {nextEvent.time}
                  </Typography>
                  <Typography variant="body2">
                    {nextEvent.location}
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="small" 
                    sx={{ mt: 2, bgcolor: '#4CAF50', '&:hover': { bgcolor: '#388E3C' } }}
                    onClick={handleViewEventDetails}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </>
      )}
    </Container>
  );
};

export default Home;
import React, { useState, useEffect } from "react";
import {
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Divider,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Button,
  Paper,
  Badge,
  useMediaQuery,
  useTheme,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Menu, MenuItem } from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import EventIcon from "@mui/icons-material/Event";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";
import LogoutIcon from "@mui/icons-material/Logout";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { useNavigate } from "react-router-dom";
import axios from "./config/axiosconfig";
import "./components/Loading";
import Loading from "./components/Loading";
import "./all.css";
import EventMap from "./components/EventMap";

// Custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#3a86ff",
      light: "#83b8ff",
      dark: "#0057cb",
    },
    secondary: {
      main: "#ff006e",
      light: "#ff5a9d",
      dark: "#c50054",
    },
    success: {
      main: "#38b000",
      light: "#70e000",
      dark: "#008000",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          boxShadow: "none",
          fontWeight: 600,
          padding: "8px 16px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: "hidden",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});

const Dashboard = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const customTheme = useTheme();
  const isMobile = useMediaQuery(customTheme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState(null);

  // Dashboard state
  const [userEvents, setUserEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [eventsThisMonth, setEventsThisMonth] = useState(0);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [nextEvent, setNextEvent] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const username = sessionStorage.getItem('username');
        if (!username) {
          navigate('/');
          return;
        }

        // Fetch user's events
        const eventsResponse = await axios.get(`/api/users/${username}/events`);
        const userEvents = eventsResponse.data;
        setUserEvents(userEvents);
        setTotalEvents(userEvents.length);

        // Calculate events this month
        const currentMonth = new Date().getMonth();
        const thisMonthEvents = userEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.getMonth() === currentMonth;
        });
        setEventsThisMonth(thisMonthEvents.length);

        // Set next upcoming event
        const upcomingEvents = userEvents.filter(event => new Date(event.date) > new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setNextEvent(upcomingEvents[0] || null);

        // Create activities from events
        const recentActivities = userEvents.slice(0, 3).map(event => ({
          id: event.event_id,
          text: `Registered for: ${event.name || 'Untitled Event'}`,
          time: new Date(event.date).toLocaleString(),
          icon: <EventIcon />
        }));
        setActivities(recentActivities);

        // Create notifications from events
        const eventNotifications = userEvents.slice(0, 3).map((event, index) => ({
          id: event.event_id,
          text: `Upcoming event: ${event.name}`,
          time: new Date(event.date).toLocaleString(),
          read: false
        }));
        setNotifications(eventNotifications);

        // Set user data
        setUser({
          username: username,
          email: sessionStorage.getItem('email'),
          firstname: sessionStorage.getItem('firstname') || username
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleViewEventDetails = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const handleUnregisterFromEvent = async (eventId) => {
    try {
      const username = sessionStorage.getItem('username');
      await axios.delete('/api/event-users', {
        data: { event_id: eventId, username }
      });
      
      // Refresh user events after unregistering
      const eventsResponse = await axios.get(`/api/users/${username}/events`);
      setUserEvents(eventsResponse.data);
      setTotalEvents(eventsResponse.data.length);
    } catch (error) {
      console.error('Error unregistering from event:', error);
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
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
    handleClose();
  };

  const handleSettings = () => {
    navigate("/settings");
    setMenuOpen(false);
  };

  const handleAbout = () => {
    navigate("/about");
    setMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = async () => {
    setLogoutDialogOpen(false);
    try {
      setLoading(true);
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("email");
      await axios.post(`/logout`);
      navigate("/");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    setMenuOpen(false);
  };

  const handleAddEvent = () => {
    navigate("/add-event");
  };

  const handleViewRegistrations = () => {
    navigate("/registrations");
  };

  const handleNotificationsClick = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  const unreadNotificationsCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <ThemeProvider theme={theme} className="overflow-y-hidden">
      <Box
        sx={{
          minHeight: "100vh",
          pb: 6,
          backgroundColor: 'transparent',
          backgroundImage: "url('./assets/bg.jpg')",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          margin: 0,
          padding: 0,
        }}
      >
        {/* Full-width AppBar instead of Paper */}
        <AppBar
          position="sticky"
          color="default"
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0)",
            backdropFilter: "blur(5px)",
          }}
        >
          <Toolbar>
            <IconButton
              onClick={() => setMenuOpen(true)}
              sx={{ mr: 2, color: "primary.main" }}
              edge="start"
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="primary.main"
              sx={{ flexGrow: 1 }}
            >
              EventHub
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                color="primary"
                sx={{ mr: 1 }}
                onClick={handleNotificationsClick}
                aria-label="show notifications"
              >
                <Badge
                  badgeContent={unreadNotificationsCount}
                  color="secondary"
                >
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  border: "2px solid white",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                }}
                src={user?.picture || sessionStorage.getItem("picture") || ""}
                onClick={handleAvatarClick}
              >
                {!user?.picture && !sessionStorage.getItem("picture") &&
                  (user?.username
                    ? user.username.charAt(0).toUpperCase()
                    : "U")}
              </Avatar>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={handleProfile}>Profile</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Notifications Menu */}
        <Dialog
          open={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          PaperProps={{
            sx: {
              width: { xs: "90%", sm: 400 },
              maxWidth: "100%",
              maxHeight: "70vh",
              borderRadius: 3,
            },
          }}
        >
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">Notifications</Typography>
              <Button
                color="primary"
                size="small"
                onClick={markAllNotificationsAsRead}
              >
                Mark all as read
              </Button>
            </Box>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0 }}>
            <List sx={{ p: 0 }}>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <ListItem
                    key={notification.id}
                    sx={{
                      borderBottom: "1px solid rgba(0,0,0,0.05)",
                      bgcolor: notification.read
                        ? "transparent"
                        : "rgba(58, 134, 255, 0.05)",
                    }}
                  >
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          bgcolor: notification.read
                            ? "rgba(0, 0, 0, 0.08)"
                            : "rgba(58, 134, 255, 0.1)",
                          color: notification.read
                            ? "text.secondary"
                            : "primary.main",
                        }}
                      >
                        <NotificationsIcon />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={notification.text}
                      secondary={notification.time}
                      primaryTypographyProps={{
                        fontWeight: notification.read ? "normal" : "medium",
                      }}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText
                    primary="No notifications yet"
                    secondary="You're all caught up!"
                    sx={{ textAlign: "center" }}
                  />
                </ListItem>
              )}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNotificationsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Container maxWidth="lg" sx={{ pt: 4 }}>
          {/* Sidebar Drawer */}
          <Drawer
            anchor="left"
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            PaperProps={{
              sx: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                color: "white",
                width: 280,
                borderRadius: "0 16px 16px 0",
                boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
              },
            }}
          >
            <Box
              sx={{
                textAlign: "center",
                p: 3,
                backgroundImage:
                  "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 100%)",
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  color: "primary.dark",
                  fontSize: 32,
                  mx: "auto",
                  border: "4px solid rgba(255,255,255,0.2)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                }}
                src={user?.picture || sessionStorage.getItem("picture") || ""}
              >
                {!user?.picture && !sessionStorage.getItem("picture") &&
                  (user?.username
                    ? user.username.charAt(0).toUpperCase()
                    : "U")}
              </Avatar>
              <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
                {user?.username || sessionStorage.getItem("username") || "Guest"}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {user?.email || sessionStorage.getItem("email") || "guest@example.com"}
              </Typography>
            </Box>


        <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />

        
        <List>
          <ListItem button onClick={handleAbout}>
            <ListItemText
              primary="About"
              sx={{ color: "rgb(213, 213, 213)" }}
            />
          </ListItem>
          <ListItem button onClick={handleSettings}>
            <ListItemText
              primary="Settings"
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
            <div className="overflow-y-hidden overflow-x-hidden">
              {/* Welcome Section */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom color="primary.dark">
                  Welcome back, {user?.firstname || user?.username || "Guest"}!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Here's your event dashboard.
                </Typography>
              </Box>

              {/* Stats Cards Row */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      height: "100%",
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#E8F5E9',
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "6px",
                        background:
                          "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: -15,
                        right: -15,
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        bgcolor: "#4CAF50",
                        opacity: 0.1,
                      }}
                    />

                    <Typography
                      variant="body2"
                      color="#2E7D32"
                      fontWeight="medium"
                    >
                      TOTAL EVENTS
                    </Typography>
                    <Typography
                      variant="h3"
                      fontWeight="bold"
                      color="#2E7D32"
                      sx={{ mt: 1 }}
                    >
                      {totalEvents}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <Typography
                        variant="caption"
                        color="#388E3C"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <Box
                          component="span"
                          sx={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "#388E3C",
                            mr: 0.5,
                          }}
                        />
                        All time
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      height: "100%",
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : '#E3F2FD',
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "6px",
                        background:
                          "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: -15,
                        right: -15,
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        bgcolor: "#1976D2",
                        opacity: 0.1,
                      }}
                    />

                    <Typography
                      variant="body2"
                      color="#1565C0"
                      fontWeight="medium"
                    >
                      EVENTS THIS MONTH
                    </Typography>
                    <Typography
                      variant="h3"
                      fontWeight="bold"
                      color="#1565C0"
                      sx={{ mt: 1 }}
                    >
                      {eventsThisMonth}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <Typography
                        variant="caption"
                        color="#1565C0"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        <Box
                          component="span"
                          sx={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "#1565C0",
                            mr: 0.5,
                          }}
                        />
                        April 2025
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Next Event Card */}
              <Paper
                elevation={2}
                sx={{
                  mb: 4,
                  borderRadius: 3,
                  border: "1px solid rgba(0,0,0,0.05)",
                  overflow: "hidden",
                  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : "rgba(255, 255, 255, 0.95)",
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    pb: 1.5,
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6" color="primary.dark">
                    Next Event
                  </Typography>
                  {nextEvent && (
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      onClick={() => handleViewEventDetails(nextEvent.event_id)}
                      sx={{ borderRadius: 4 }}
                    >
                      View Details
                    </Button>
                  )}
                </Box>

                {nextEvent ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "stretch", sm: "center" },
                      p: 0,
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        color: "white",
                        p: 3,
                        display: "flex",
                        flexDirection: { xs: "row", sm: "column" },
                        alignItems: "center",
                        justifyContent: "center",
                        width: { xs: "100%", sm: "120px" },
                        textAlign: "center",
                      }}
                    >
                      <Typography
                        variant="h3"
                        fontWeight="bold"
                        sx={{ mr: { xs: 2, sm: 0 } }}
                      >
                        {new Date(nextEvent.date).getDate()}
                      </Typography>
                      <Typography variant="h6">
                        {new Date(nextEvent.date).toLocaleString('default', { month: 'short' })}
                      </Typography>
                    </Box>

                    <Box sx={{ p: 3, flexGrow: 1 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mb: 0.5 }}
                      >
                        Event ID: {nextEvent.event_id}
                      </Typography>
                      <Typography variant="h5" sx={{ mb: 2 }}>
                        {nextEvent.name || "Untitled Event"}

                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{ display: "flex", alignItems: "center", mb: 1 }}
                          >
                            <AccessTimeIcon
                              sx={{
                                color: "text.secondary",
                                mr: 1,
                                fontSize: 20,
                              }}
                            />
                            <Typography variant="body2">
                              {new Date(nextEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box
                            sx={{ display: "flex", alignItems: "center", mb: 1 }}
                          >
                            <LocationOnIcon
                              sx={{
                                color: "text.secondary",
                                mr: 1,
                                fontSize: 20,
                              }}
                            />
                            <Typography variant="body2">
                              {nextEvent.location || "Location not specified"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <Box
                            sx={{ display: "flex", alignItems: "center", mb: 1 }}
                          >
                            <CalendarMonthIcon
                              sx={{
                                color: "text.secondary",
                                mr: 1,
                                fontSize: 20,
                              }}
                            />
                            <Typography variant="body2">
                              {new Date(nextEvent.date).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </Typography>
                          </Box>
                        </Grid>
                        {nextEvent.description && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {nextEvent.description.length > 150 
                                ? `${nextEvent.description.substring(0, 150)}...` 
                                : nextEvent.description}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ p: 3, textAlign: "center" }}>
                    <Typography variant="body1" color="text.secondary">
                      No upcoming events found.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={handleAddEvent}
                      sx={{ mt: 2 }}
                    >
                      Create New Event
                    </Button>
                  </Box>
                )}
              </Paper>

              {/* Replace Event Actions Card with Tabs */}
              <Paper elevation={2} sx={{ mb: 4, borderRadius: 3 }}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      minHeight: 48,
                    }
                  }}
                >
                  <Tab 
                    icon={<AddBoxIcon />} 
                    label="Create Event" 
                    onClick={handleAddEvent}
                  />
                  <Tab 
                    icon={<CalendarMonthIcon />} 
                    label="My Registrations" 
                    onClick={handleViewRegistrations}
                  />
                  <Tab 
                    icon={<EventIcon />} 
                    label="Browse Events" 
                    onClick={() => navigate("/Event")}
                  />
                </Tabs>
              </Paper>

              <Grid container spacing={3}>
                {/* Recent Activity Section */}
                <Grid item xs={12} md={6}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      height: '100%',
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      backgroundColor: theme.palette.background.paper,
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 2, 
                        background: 'linear-gradient(135deg, #ff006e 0%, #ff5a9d 100%)',
                        color: 'white'
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        Recent Activity
                      </Typography>
                    </Box>
                    <CardContent sx={{ p: 0 }}>
                      <List sx={{ p: 0 }}>
                        {activities.map((activity, index) => (
                          <ListItem
                            key={activity.id}
                            sx={{
                              py: 2,
                              borderBottom: index < activities.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                              transition: 'all 0.2s',
                              '&:hover': { bgcolor: 'rgba(255, 0, 110, 0.05)' }
                            }}
                          >
                            <ListItemIcon sx={{ mr: 1 }}>
                              <Avatar
                                sx={{
                                  bgcolor: 'rgba(255, 0, 110, 0.1)',
                                  color: theme.palette.secondary.main,
                                  width: 40,
                                  height: 40
                                }}
                              >
                                {activity.icon}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={activity.text}
                              secondary={activity.time}
                              primaryTypographyProps={{ fontWeight: 'medium' }}
                            />
                          </ListItem>
                        ))}
                        {activities.length === 0 && (
                          <ListItem>
                            <ListItemText
                              primary="No recent activity"
                              secondary="Your recent activities will appear here"
                              sx={{ textAlign: 'center', py: 3 }}
                            />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Your Events Section */}
                <Grid item xs={12} md={6}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      height: '100%',
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      backgroundColor: theme.palette.background.paper,
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 2, 
                        background: 'linear-gradient(135deg, #38b000 0%, #70e000 100%)',
                        color: 'white'
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        Your Events
                      </Typography>
                    </Box>
                    <CardContent>
                      {userEvents.length > 0 ? (
                        userEvents.map((event) => (
                          <Paper
                            key={event.event_id}
                            elevation={0}
                            sx={{
                              p: 2,
                              mb: 2,
                              backgroundColor: '#f8f9fa',
                              borderRadius: 2,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.2s',
                              '&:hover': { 
                                backgroundColor: 'rgba(56, 176, 0, 0.05)',
                                transform: 'translateX(5px)'
                              }
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {event.name || 'Untitled Event'}

                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <CalendarMonthIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                {new Date(event.date).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Box>
                              <Button
                                size="small"
                                onClick={() => handleViewEventDetails(event.event_id)}
                                sx={{ mr: 1 }}
                                variant="outlined"
                                color="primary"
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                onClick={() => handleUnregisterFromEvent(event.event_id)}
                                variant="outlined"
                              >
                                Unregister
                              </Button>
                            </Box>
                          </Paper>
                        ))
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            You haven't registered for any events yet.
                          </Typography>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={handleAddEvent}
                            sx={{ mt: 2 }}
                          >
                            Create Your First Event
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Statistics Section */}
                <Grid item xs={12} md={6}>
                  <Card 
                    elevation={2}
                    sx={{ 
                      height: '100%',
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      backgroundColor: theme.palette.background.paper,
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
                      }
                    }}
                  >
                    <Box 
                      sx={{ 
                        p: 2, 
                        background: 'linear-gradient(135deg, #8338ec 0%, #a663ff 100%)',
                        color: 'white'
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        Statistics
                      </Typography>
                    </Box>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 3, 
                              backgroundColor: theme.palette.background.paper,
                              borderRadius: 2,
                              textAlign: 'center',
                              transition: 'all 0.2s',
                              '&:hover': { 
                                backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : 'rgba(131, 56, 236, 0.1)',
                                transform: 'scale(1.03)'
                              }
                            }}
                          >
                            <Typography variant="h3" color="primary" fontWeight="bold">
                              {totalEvents}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Events
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              p: 3, 
                              backgroundColor: theme.palette.background.paper,
                              borderRadius: 2,
                              textAlign: 'center',
                              transition: 'all 0.2s',
                              '&:hover': { 
                                backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : 'rgba(131, 56, 236, 0.1)',
                                transform: 'scale(1.03)'
                              }
                            }}
                          >
                            <Typography variant="h3" color="secondary" fontWeight="bold">
                              {eventsThisMonth}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Events This Month
                            </Typography>
                          </Paper>
                        </Grid>
                      </Grid>

                      {nextEvent && (
                        <Box sx={{ mt: 3, p: 2, backgroundColor: 'rgba(131, 56, 236, 0.05)', borderRadius: 2 }}>
                          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            Next Upcoming Event
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <CalendarMonthIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                            {new Date(nextEvent.date).toLocaleDateString()}
                          </Typography>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleViewEventDetails(nextEvent.event_id)}
                            sx={{ mt: 1 }}
                          >
                            View Details
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </div>
          )}
        </Container>

        {/* Add EventMap at the bottom */}
        <EventMap />
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;

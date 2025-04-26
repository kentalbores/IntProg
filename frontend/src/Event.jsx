import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Paper,
  Grid,
  Avatar,
  Chip,
  Divider,
  AppBar,
  Toolbar,
  Badge,
  useTheme,
  createTheme,
  ThemeProvider,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddBoxIcon from "@mui/icons-material/AddBox";
import EventIcon from "@mui/icons-material/Event";
import CategoryIcon from "@mui/icons-material/Category";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import axios from "./config/axiosconfig";
import Loading from "./components/Loading";
import LocationPicker from "./components/LocationPicker";
import StaticMap from "./components/StaticMap";

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

const EventManagement = () => {
  const navigate = useNavigate();
  const customTheme = useTheme();
  const isMobile = useMediaQuery(customTheme.breakpoints.down("sm"));
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: "New registration for Film Festival",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      text: "Event reminder: Tech Conference tomorrow",
      time: "5 hours ago",
      read: false,
    },
  ]);

  // Delete confirmation dialog state
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({
    open: false,
    eventId: null,
    eventName: ""
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    location: "",
    latitude: 10.3518,
    longitude: 123.9053,
    organizer: "",
    price: "",
    description: "",
    category: "",
    image: "https://via.placeholder.com/400x200?text=Event+Image",
    detailImage: "https://via.placeholder.com/800x400?text=Event+Detail+Image",
  });

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isUser, setIsUser] = useState(false);

  const categories = [
    "Conference",
    "Workshop",
    "Seminar",
    "Exhibition",
    "Concert",
    "Sports",
    "Networking",
    "Other",
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);

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

  const handleSelectEvent = (event) => {
    console.log("Selected event:", event);
    if (event && event.event_id) {
      navigate(`/events/${event.event_id}`);
    } else {
      console.error("Invalid event object:", event);
      setSnackbar({
        open: true,
        message: "Invalid event data",
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const handleLocationSelect = (location) => {
    setNewEvent({
      ...newEvent,
      location: location.name || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
      latitude: location.lat,
      longitude: location.lng,
    });
    setPickerOpen(false);

  };

  const userCanDelete = (event) => {
    const username = sessionStorage.getItem('username');
    return !!username; // Return true if there is a logged-in user
  };

  const handleSubmitEvent = async () => {
    // Validate required fields
    if (!newEvent.name || !newEvent.date) {
      setSnackbar({
        open: true,
        message: "Event name and date are required!",
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("/api/event", newEvent);

      const createdEvent = {
        ...newEvent,
        event_id: response.data.event_id,
      };

      setEvents([...events, createdEvent]);

      setSnackbar({
        open: true,
        message: "Event added successfully!",
        severity: "success",
      });

      handleAddEventClose();
    } catch (error) {
      console.error("Error adding event:", error);
      setSnackbar({
        open: true,
        message: "Failed to add event. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete confirmation dialog open
  const handleDeleteConfirmOpen = (event, e) => {
    e.stopPropagation(); // Prevent event details dialog from opening
    setDeleteConfirmDialog({
      open: true,
      eventId: event.event_id,
      eventName: event.name
    });
  };

  // Handle delete confirmation dialog close
  const handleDeleteConfirmClose = () => {
    setDeleteConfirmDialog({
      open: false,
      eventId: null,
      eventName: ""
    });
  };

  // Handle delete event
  const handleDeleteEvent = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/events/${deleteConfirmDialog.eventId}`);
      
      // Update events list by removing the deleted event
      setEvents(events.filter(event => event.event_id !== deleteConfirmDialog.eventId));
      
      setSnackbar({
        open: true,
        message: "Event deleted successfully!",
        severity: "success",
      });
      
      // Close dialogs
      handleDeleteConfirmClose();
      if (selectedEvent && selectedEvent.event_id === deleteConfirmDialog.eventId) {
        setEventDialogOpen(false);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete event. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete from event details
  const handleDeleteFromDetails = () => {
    setDeleteConfirmDialog({
      open: true,
      eventId: selectedEvent.event_id,
      eventName: selectedEvent.name
    });
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/events");
      if (response.data.events) {
        setEvents(response.data.events);
      }

      // Fetch user data
      const username = sessionStorage.getItem("username");
      if (username) {
        const userResponse = await axios.get(`/api/userinfo?username=${username}`);
        setUser(userResponse.data.user_info);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setSnackbar({
        open: true,
        message: "Failed to load data. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredUsers = async (eventId) => {
    try {
      const response = await axios.get(`/api/events/${eventId}/users`);
      setRegisteredUsers(response.data);
      
      // Check if current user is registered
      const username = sessionStorage.getItem('username');
      const isUserRegistered = response.data.some(user => user.username === username);
      setIsRegistered(isUserRegistered);
    } catch (error) {
      console.error('Error fetching registered users:', error);
    }
  };

  const handleRegisterEvent = async (eventId) => {
    try {
      const username = sessionStorage.getItem('username');
      if (!username) {
        setSnackbar({
          open: true,
          message: "Please login to register for events",
          severity: "error",
        });
        return;
      }

      await axios.post('/api/event-users', {
        event_id: eventId,
        username: username
      });

      setIsRegistered(true);
      setSnackbar({
        open: true,
        message: "Successfully registered for the event!",
        severity: "success",
      });

      // Refresh registered users
      fetchRegisteredUsers(eventId);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to register for event",
        severity: "error",
      });
    }
  };

  const handleUnregisterEvent = async (eventId) => {
    try {
      const username = sessionStorage.getItem('username');
      await axios.delete('/api/event-users', {
        data: { event_id: eventId, username }
      });

      setIsRegistered(false);
      setSnackbar({
        open: true,
        message: "Successfully unregistered from the event",
        severity: "success",
      });

      // Refresh registered users
      fetchRegisteredUsers(eventId);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to unregister from event",
        severity: "error",
      });
    }
  };

  // Add this function to filter events
  const filterEvents = (query) => {
    if (!query.trim()) {
      setFilteredEvents(events);
      return;
    }

    const lowercasedQuery = query.toLowerCase();
    const filtered = events.filter((event) => {
      return (
        event.name.toLowerCase().includes(lowercasedQuery) ||
        event.category.toLowerCase().includes(lowercasedQuery) ||
        event.location.toLowerCase().includes(lowercasedQuery) ||
        event.organizer.toLowerCase().includes(lowercasedQuery)
      );
    });
    setFilteredEvents(filtered);
  };

  // Update useEffect to initialize filteredEvents
  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    setFilteredEvents(events);
  }, [events]);

  // Add this function to handle search input changes
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    filterEvents(query);
  };

  const getCategoryColor = (category) => {
    const categoryColors = {
      Conference: "#3a86ff",
      Workshop: "#ff006e",
      Seminar: "#8338ec",
      Exhibition: "#fb5607",
      Concert: "#ffbe0b",
      Sports: "#38b000",
      Networking: "#3a0ca3",
      Other: "#757575"
    };

    return categoryColors[category] || "#757575";
  };

  // Check if user is the organizer of an event
  const userIsOrganizer = (event) => {
    const username = sessionStorage.getItem('username');
    return username === event.organizer;
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          pb: 6,
          backgroundImage: "url('./assets/bg.jpg')",
          backgroundSize: "100vw",
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          margin: 0,
          padding: 0,
        }}
      >
        {loading && <Loading />}

        {/* App Bar */}
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
              onClick={() => navigate(-1)}
              sx={{ mr: 2, color: "primary.main" }}
              edge="start"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="primary.main"
              sx={{ flexGrow: 1 }}
            >
              EventHub
            </Typography>

            {/* Search Bar beside notification icon */}
            <Paper
              elevation={0}
              sx={{
                p: 0.5,
                mx: 2,
                borderRadius: 8,
                background: "rgba(255,255,255,0.95)",
                width: { xs: 120, sm: 200, md: 240 },
                boxShadow: '0 1px 6px rgba(58,134,255,0.07)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <TextField
                variant="outlined"
                placeholder="Search events..."
                value={searchQuery}
                onChange={handleSearchChange}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    searchQuery && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          aria-label="clear search"
                          onClick={() => {
                            setSearchQuery("");
                            setFilteredEvents(events);
                          }}
                          edge="end"
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    )
                  ),
                  sx: {
                    borderRadius: 8,
                    backgroundColor: "rgba(255,255,255,0.8)",
                    fontSize: '0.98rem',
                    height: 36,
                  }
                }}
              />
            </Paper>

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
                src={user?.picture || ""}
                onClick={handleAvatarClick}
              >
                {!user?.picture &&
                  (user?.username
                    ? user.username.charAt(0).toUpperCase()
                    : "U")}
              </Avatar>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Notifications Dialog */}
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
          {/* Page Header */}
          <Paper
            elevation={0}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              background: "rgba(255, 255, 255, 0.9)",
              backgroundImage: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 240, 255, 0.9) 100%)",
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

            <Grid container alignItems="center" spacing={3}>
              <Grid item xs={12} md={8}>
                <Typography variant="h4" fontWeight="bold" color="primary.dark" gutterBottom>
                  Event Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Create, manage, and track your events all in one place. Add new events or view details of existing ones.
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' }, display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddBoxIcon />}
                  onClick={() => navigate("/add-event")}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 8,
                    boxShadow: "0 4px 14px rgba(58, 134, 255, 0.4)",
                    background: "linear-gradient(45deg, #3a86ff 30%, #4776E6 90%)",
                    fontWeight: 600,
                    fontSize: '1rem',
                    mb: { xs: 2, md: 0 },
                    "&:hover": {
                      background: "linear-gradient(45deg, #2a76ef 30%, #3766D6 90%)",
                    }
                  }}
                >
                  Create New Event
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Event Listing */}
          <Typography variant="h5" fontWeight="600" color="primary.dark" sx={{ mb: 3, pl: 1 }}>
            Available Events
          </Typography>

          {filteredEvents.length > 0 ? (
            <Grid container spacing={3}>
              {filteredEvents.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.event_id}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      borderRadius: 3,
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                      }
                    }}
                    onClick={() => handleSelectEvent(event)}
                  >
                    {/* Delete Button for Organizers */}
                    {userIsOrganizer(event) && (
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="delete event"
                        sx={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          zIndex: 2,
                          bgcolor: "rgba(255,255,255,0.9)",
                          '&:hover': {
                            bgcolor: "rgba(255,255,255,1)",
                          }
                        }}
                        onClick={(e) => handleDeleteConfirmOpen(event, e)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                    
                    <Box sx={{ position: "relative", height: 200 }}>
                      <CardMedia
                        component="img"
                        image={event.image || "/default-image.jpg"}
                        alt={event.name}
                        sx={{
                          height: "100%",
                          objectFit: "cover",
                          width: "100%"
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: 16,
                          right: 16,
                          backgroundColor: "white",
                          borderRadius: 2,
                          px: 1.5,
                          py: 0.5,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                          {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'TBD'}
                        </Typography>
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                      <Chip
                        label={event.category || "Uncategorized"}
                        size="small"
                        sx={{
                          mb: 1.5,
                          fontWeight: 500,
                          color: "white",
                          backgroundColor: getCategoryColor(event.category),
                        }}
                      />
                      <Typography variant="h6" fontWeight="600" gutterBottom noWrap>
                        {event.name}
                      </Typography>

                      <Box sx={{ mt: "auto" }}>
                        <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                          <LocationOnIcon sx={{ color: "text.secondary", fontSize: 18, mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }} noWrap>
                            {event.location || "Location TBD"}
                          </Typography>
                        </Box>

                        {event.organizer && (
                          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                            <PersonIcon sx={{ color: "text.secondary", fontSize: 18, mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {event.organizer}
                            </Typography>
                          </Box>
                        )}

                        {event.price && (
                          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                            <AttachMoneyIcon sx={{ color: "text.secondary", fontSize: 18, mr: 0.5 }} />
                            <Typography variant="body2" color="text.secondary">
                              {event.price > 0 ? `$${event.price}` : "Free"}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 5,
                borderRadius: 3,
                textAlign: "center",
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                border: "1px dashed rgba(0,0,0,0.1)"
              }}
            >
              <EventIcon sx={{ fontSize: 60, color: "text.secondary", opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchQuery ? "No events match your search" : "No events found"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchQuery ? "Try adjusting your search terms" : "Create your first event to get started"}
              </Typography>
              {!searchQuery && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddBoxIcon />}
                  onClick={() => navigate("/add-event")}
                >
                  Create New Event
                </Button>
              )}
            </Paper>
          )}

          {/* Event Details Dialog */}
          <Dialog
            open={eventDialogOpen}
            onClose={() => setEventDialogOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                overflow: "hidden",
                maxHeight: "90vh"
              }
            }}
          >
            {selectedEvent && (
              <>
                <Box sx={{ position: "relative", height: 280 }}>
                  <CardMedia
                    component="img"
                    image={selectedEvent.detailImage || "/default-detail.jpg"}
                    alt={selectedEvent.name}
                    sx={{ 
                      height: "100%",
                      objectFit: "cover",
                      width: "100%"
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)",
                      pointerEvents: "none"
                    }}
                  />
                  <IconButton
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      backgroundColor: "white",
                      "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" }
                    }}
                    onClick={() => setEventDialogOpen(false)}
                  >
                    <CloseIcon />
                  </IconButton>

                  
                      

                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      p: 3,
                      width: "100%"
                    }}
                  >
                    <Chip
                      label={selectedEvent.category || "Uncategorized"}
                      size="small"
                      sx={{
                        mb: 1,
                        fontWeight: 500,
                        color: "white",
                        backgroundColor: getCategoryColor(selectedEvent.category),
                      }}
                    />
                    <Typography variant="h4" fontWeight="bold" color="white" gutterBottom>
                      {selectedEvent.name}
                    </Typography>
                  </Box>
                </Box>

                <DialogContent sx={{ p: 4, overflowY: "auto" }}>
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h6" fontWeight="600" gutterBottom color="primary.dark">
                        About This Event
                      </Typography>
                      <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                        {selectedEvent.description || "No description available."}
                      </Typography>

                      {selectedEvent.latitude && selectedEvent.longitude && (
                        <Box sx={{ mt: 4 }}>
                          <Typography variant="h6" fontWeight="600" gutterBottom color="primary.dark">
                            Event Location
                          </Typography>
                          <Box
                            sx={{
                              border: "1px solid #ddd",
                              borderRadius: 2,
                              height: "250px",
                              mb: 2,
                              overflow: "hidden"
                            }}
                          >
                            <StaticMap
                              open={true}
                              embedded={true}
                              onClose={() => {}}
                              latitude={selectedEvent.latitude}
                              longitude={selectedEvent.longitude}
                            />
                          </Box>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: "rgba(0,0,0,0.02)", mb: 3 }}>
                        <Typography variant="subtitle1" fontWeight="600" gutterBottom color="primary.dark">
                          Event Details
                        </Typography>

                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <Avatar sx={{ bgcolor: "rgba(58, 134, 255, 0.1)", width: 36, height: 36, mr: 2 }}>
                              <AccessTimeIcon sx={{ color: "primary.main", fontSize: 20 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Date & Time
                              </Typography>
                              <Typography variant="body1" fontWeight="500">
                                {selectedEvent.date || "Date TBD"}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <Avatar sx={{ bgcolor: "rgba(58, 134, 255, 0.1)", width: 36, height: 36, mr: 2 }}>
                              <LocationOnIcon sx={{ color: "primary.main", fontSize: 20 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Location
                              </Typography>
                              <Typography variant="body1" fontWeight="500">
                                {selectedEvent.location || "Location TBD"}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <Avatar sx={{ bgcolor: "rgba(58, 134, 255, 0.1)", width: 36, height: 36, mr: 2 }}>
                              <CategoryIcon sx={{ color: "primary.main", fontSize: 20 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Category
                              </Typography>
                              <Typography variant="body1" fontWeight="500">
                                {selectedEvent.category || "Uncategorized"}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                            <Avatar sx={{ bgcolor: "rgba(58, 134, 255, 0.1)", width: 36, height: 36, mr: 2 }}>
                              <PersonIcon sx={{ color: "primary.main", fontSize: 20 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Organizer
                              </Typography>
                              <Typography variant="body1" fontWeight="500">
                                {selectedEvent.organizer || "Not specified"}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ bgcolor: "rgba(58, 134, 255, 0.1)", width: 36, height: 36, mr: 2 }}>
                              <AttachMoneyIcon sx={{ color: "primary.main", fontSize: 20 }} />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Price
                              </Typography>
                              <Typography variant="body1" fontWeight="500">
                                {selectedEvent.price ? `$${selectedEvent.price}` : "Free"}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Box sx={{ mt: 3 }}>
                          <Typography variant="subtitle1" fontWeight="600" color="primary.dark" gutterBottom>
                            Registered Users ({registeredUsers.length})
                          </Typography>
                          <List dense>
                            {registeredUsers.map((user) => (
                              <ListItem key={user.username}>
                                <ListItemIcon>
                                  <Avatar sx={{ width: 32, height: 32 }}>
                                    {user.username.charAt(0).toUpperCase()}
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText 
                                  primary={user.username}
                                  secondary={user.email}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </Paper>

                      {isRegistered ? (
                        <Button
                          variant="outlined"
                          color="error"
                          fullWidth
                          size="large"
                          onClick={() => handleUnregisterEvent(selectedEvent.event_id)}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                          }}
                        >
                          UNREGISTER
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          size="large"
                          onClick={() => handleRegisterEvent(selectedEvent.event_id)}
                          sx={{
                            py: 1.5,
                            borderRadius: 2,
                            boxShadow: "0 4px 14px rgba(58, 134, 255, 0.4)",
                            background: "linear-gradient(45deg, #3a86ff 30%, #4776E6 90%)",
                            "&:hover": {
                              background: "linear-gradient(45deg, #2a76ef 30%, #3766D6 90%)",
                            }
                          }}
                        >
                          REGISTER NOW
                        </Button>
                      )}
                      {/* Add Delete Button for organizers */}
                      {isUser && (
                            <Button
                              variant="outlined"
                              color="error"
                              fullWidth
                              size="large"
                              startIcon={<DeleteIcon />}
                              onClick={handleDeleteFromDetails}
                              sx={{
                                mt: 2,
                                py: 1.5,
                                borderRadius: 2,
                                borderWidth: 2,
                                '&:hover': {
                                  borderWidth: 2,
                                  backgroundColor: 'error.light',
                                  color: 'error.contrastText',
                                },
                              }}
                            >
                              DELETE EVENT
                            </Button>
                          )}

                    </Grid>
                  </Grid>
                </DialogContent>
              </>
            )}
          </Dialog>

          {/* Location Picker Dialog */}
          <LocationPicker
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onSelect={handleLocationSelect}
          />

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={handleSnackbarClose}
              severity={snackbar.severity}
              sx={{ width: "100%", borderRadius: 2, boxShadow: "0 3px 10px rgba(0,0,0,0.1)" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default EventManagement;

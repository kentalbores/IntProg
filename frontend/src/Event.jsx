import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import NotificationsIcon from "@mui/icons-material/Notifications";
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
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false);
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
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const handleAddEventOpen = () => {
    setAddEventDialogOpen(true);
  };

  const handleAddEventClose = () => {
    setAddEventDialogOpen(false);
    // Reset form
    setNewEvent({
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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({
      ...newEvent,
      [name]: value,
    });
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

  useEffect(() => {
    fetchEvents();
  }, []);

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
              <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddBoxIcon />}
                  onClick={handleAddEventOpen}
                  sx={{
                    px: 3,
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: "0 4px 14px rgba(58, 134, 255, 0.4)",
                    background: "linear-gradient(45deg, #3a86ff 30%, #4776E6 90%)",
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
            Your Events
          </Typography>

          {events.length > 0 ? (
            <Grid container spacing={3}>
              {events.map((event) => (
                <Grid item xs={12} sm={6} md={4} key={event.event_id}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      borderRadius: 3,
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                      }
                    }}
                    onClick={() => handleSelectEvent(event)}
                  >
                    <Box sx={{ position: "relative" }}>
                      <CardMedia
                        component="img"
                        height="180"
                        image={event.image || "/default-image.jpg"}
                        alt={event.name}
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
                    <CardContent sx={{ p: 3 }}>
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
                No events found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first event to get started
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddBoxIcon />}
                onClick={handleAddEventOpen}
              >
                Create New Event
              </Button>
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
                overflow: "hidden"
              }
            }}
          >
            {selectedEvent && (
              <>
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    height="280"
                    image={selectedEvent.detailImage || "/default-detail.jpg"}
                    alt={selectedEvent.name}
                    sx={{ objectFit: "cover" }}
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

                <DialogContent sx={{ p: 4 }}>
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
                      </Paper>

                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
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
                    </Grid>
                  </Grid>
                </DialogContent>
              </>
            )}
          </Dialog>

          {/* Add Event Dialog */}
          <Dialog
            open={addEventDialogOpen}
            onClose={handleAddEventClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
                overflow: "hidden"
              }
            }}
          >
            <DialogTitle sx={{
              p: 3,
              background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)",
              borderBottom: "1px solid rgba(0,0,0,0.05)"
            }}>
              <Typography variant="h5" fontWeight="600" color="primary.dark">
                Create New Event
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill in the details below to create your event
              </Typography>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3} sx={{ mt: 0.5 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight="600" color="primary.dark" gutterBottom>
                    Basic Information
                  </Typography>
                </Grid>

                <Grid item xs={12} md={8}>
                  <TextField
                    required
                    fullWidth
                    id="name"
                    label="Event Name"
                    name="name"
                    value={newEvent.name}
                    onChange={handleInputChange}
                    variant="outlined"
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    required
                    fullWidth
                    id="date"
                    label="Event Date"
                    name="date"
                    type="date"
                    value={newEvent.date}
                    onChange={handleInputChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      id="category"
                      name="category"
                      value={newEvent.category}
                      label="Category"
                      onChange={handleInputChange}
                      sx={{ borderRadius: 2 }}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="organizer"
                    label="Organizer"
                    name="organizer"
                    value={newEvent.organizer}
                    onChange={handleInputChange}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="price"
                    label="Price ($)"
                    name="price"
                    type="number"
                    value={newEvent.price}
                    onChange={handleInputChange}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mt: 1,
                      mb: 2
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => setPickerOpen(true)}
                      sx={{ borderRadius: 2, height: "100%", py: 1.5 }}
                      startIcon={<LocationOnIcon />}
                    >
                      Select Location
                    </Button>
                    <TextField
                      fullWidth
                      disabled
                      id="location"
                      label="Event Location"
                      name="location"
                      value={newEvent.location}
                      InputProps={{
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Box>

                  {newEvent.latitude && newEvent.longitude && (
                    <Box
                      sx={{
                        mb: 3,
                        mt: 1,
                        border: "1px solid #ddd",
                        borderRadius: 2,
                        height: "200px",
                        overflow: "hidden"
                      }}
                    >
                      <StaticMap
                        open={true}
                        embedded={true}
                        onClose={() => {}}
                        latitude={newEvent.latitude}
                        longitude={newEvent.longitude}
                      />
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight="600" color="primary.dark" gutterBottom>
                    Event Description
                  </Typography>

                  <TextField
                    fullWidth
                    id="description"
                    label="Description"
                    name="description"
                    multiline
                    rows={5}
                    value={newEvent.description}
                    onChange={handleInputChange}
                    placeholder="Provide a detailed description of your event..."
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight="600" color="primary.dark" gutterBottom>
                    Event Images
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="image"
                    label="Card Image URL"
                    name="image"
                    value={newEvent.image}
                    onChange={handleInputChange}
                    helperText="URL for the event card thumbnail"
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                  <Box
                    sx={{
                      mt: 2,
                      height: "120px",
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid #ddd"
                    }}
                  >
                    <img
                      src={newEvent.image}
                      alt="Event thumbnail preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x200?text=Image+Preview";
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="detailImage"
                    label="Detail Image URL"
                    name="detailImage"
                    value={newEvent.detailImage}
                    onChange={handleInputChange}
                    helperText="URL for the larger event detail image"
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                  />
                  <Box
                    sx={{
                      mt: 2,
                      height: "120px",
                      borderRadius: 2,
                      overflow: "hidden",
                      border: "1px solid #ddd"
                    }}
                  >
                    <img
                      src={newEvent.detailImage}
                      alt="Event detail preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/800x400?text=Detail+Image+Preview";
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button 
                onClick={handleAddEventClose}
                variant="outlined"
                sx={{ borderRadius: 2, px: 3 }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitEvent} 
                variant="contained"
                sx={{
                  borderRadius: 2,
                  px: 3,
                  background: "linear-gradient(45deg, #3a86ff 30%, #4776E6 90%)",
                  boxShadow: "0 3px 10px rgba(58, 134, 255, 0.3)",
                }}
              >
                Create Event
              </Button>
            </DialogActions>
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

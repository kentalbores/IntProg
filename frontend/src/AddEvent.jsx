import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Badge,
  useTheme,
  createTheme,
  ThemeProvider,
  useMediaQuery,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddBoxIcon from "@mui/icons-material/AddBox";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useNavigate } from "react-router-dom";
import axios from "./config/axiosconfig";
import LocationPicker from "./components/LocationPicker";
import StaticMap from "./components/StaticMap";
import { useTheme as useMuiTheme } from '@mui/material/styles';

const AddEvent = ({ theme, setTheme, themeMode }) => {
  const navigate = useNavigate();
  const customTheme = useTheme();
  const isMobile = useMediaQuery(customTheme.breakpoints.down("sm"));
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

  const [pickerOpen, setPickerOpen] = useState(false);

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

  const handleLocationSelect = (location) => {
    setNewEvent({
      ...newEvent,
      location: location.name || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
      latitude: location.lat,
      longitude: location.lng,
    });
    setPickerOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({
      ...newEvent,
      [name]: value,
    });
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
      const response = await axios.post("/api/event", newEvent);

      setSnackbar({
        open: true,
        message: "Event added successfully!",
        severity: "success",
      });

      // Navigate back to events page after successful creation
      setTimeout(() => {
        navigate("/Event");
      }, 1500);
    } catch (error) {
      console.error("Error adding event:", error);
      setSnackbar({
        open: true,
        message: "Failed to add event. Please try again.",
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        pb: 6,
        background: themeMode === 'dark' ? customTheme.palette.background.default : "linear-gradient(135deg, #e3ecff 0%, #f5f7fa 100%)",
        margin: 0,
        padding: 0,
      }}
    >
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
              src={user?.picture || sessionStorage.getItem("picture") || ""}
              onClick={handleAvatarClick}
            >
              {!user?.picture && !sessionStorage.getItem("picture") &&
                (user?.username
                  ? user.username.charAt(0).toUpperCase()
                  : "U")}
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ pt: 4, position: 'relative', zIndex: 1, background: themeMode === 'dark' ? '#23272f' : 'transparent' }}>
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
                Create New Event
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Fill in the details below to create your event. All fields marked with * are required.
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Event Form */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
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

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" fontWeight="600" color="primary.dark" gutterBottom>
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
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
              <Typography variant="h6" fontWeight="600" color="primary.dark" gutterBottom>
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
              <Typography variant="h6" fontWeight="600" color="primary.dark" gutterBottom>
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

            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/Event")}
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
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

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
    </Box>
  );
};

export default AddEvent; 
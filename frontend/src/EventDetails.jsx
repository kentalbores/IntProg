import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Button,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "./config/axiosconfig";
import Loading from "./components/Loading";
import StaticMap from "./components/StaticMap";

const EventDetails = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchEventDetails();
    fetchRegisteredUsers();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/events/${eventId}`);
        console.log("Event details response:", response.data);
      
      if (response.data && response.data.event) {
        setEvent(response.data.event);
      } else if (response.data) {
        setEvent(response.data);
      } else {
        console.error("Invalid response format:", response.data);
        setSnackbar({
          open: true,
          message: "Invalid event data format",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      console.error("Error response:", error.response);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to load event details",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredUsers = async () => {
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

  const handleRegister = async () => {
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

      fetchRegisteredUsers();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to register for event",
        severity: "error",
      });
    }
  };

  const handleUnregister = async () => {
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

      fetchRegisteredUsers();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to unregister from event",
        severity: "error",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/events/${eventId}`);
      setSnackbar({
        open: true,
        message: "Event deleted successfully",
        severity: "success",
      });
      navigate("/events");
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to delete event",
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return <Loading />;
  }

  if (!event) {
    return (
      <Container>
        <Typography variant="h5">Event not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {event.name}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {event.description || "No description available."}
            </Typography>

            {event.latitude && event.longitude && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" fontWeight="600" gutterBottom>
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
                    latitude={event.latitude}
                    longitude={event.longitude}
                  />
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: "rgba(0,0,0,0.02)" }}>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Event Details
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar sx={{ bgcolor: "rgba(58, 134, 255, 0.1)", width: 36, height: 36, mr: 2 }}>
                  <AccessTimeIcon sx={{ color: "primary.main", fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Date & Time
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {event.date || "Date TBD"}
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
                    {event.location || "Location TBD"}
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
                    {event.category || "Uncategorized"}
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
                    {event.organizer || "Not specified"}
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
                    {event.price ? `$${event.price}` : "Free"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                Registered Users ({registeredUsers.length})
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {registeredUsers.map((user) => (
                  <Avatar
                    key={user.username}
                    sx={{ width: 32, height: 32 }}
                    title={user.username}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                ))}
              </Box>
            </Box>

            {isRegistered ? (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                size="large"
                onClick={handleUnregister}
                sx={{ mb: 2 }}
              >
                UNREGISTER
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleRegister}
                sx={{ mb: 2 }}
              >
                REGISTER NOW
              </Button>
            )}

            {sessionStorage.getItem('username') === event.organizer && (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                size="large"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                DELETE EVENT
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this event? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EventDetails; 
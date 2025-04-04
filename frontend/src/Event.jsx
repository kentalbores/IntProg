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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import axios from "./config/axiosconfig";
import Loading from "./components/Loading";
import LocationPicker from "./components/LocationPicker";
import StaticMap from "./components/StaticMap";

const EventManagement = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
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
      detailImage:
        "https://via.placeholder.com/800x400?text=Event+Detail+Image",
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
      location:
        location.name ||
        `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
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
    } catch (error) {
      console.error("Error fetching events:", error);
      setSnackbar({
        open: true,
        message: "Failed to load events. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <>
      {loading && <Loading />}
      <Container maxWidth="md" sx={{ textAlign: "center", mt: 4 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ position: "absolute", top: 10, left: 10 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom>
          EVENT MANAGEMENT
        </Typography>
        <Button variant="contained" sx={{ mb: 3 }} onClick={handleAddEventOpen}>
          ADD NEW EVENT
        </Button>
        <Box
          sx={{
            mt: 3,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 2,
          }}
        >
          {events.length > 0 ? (
            events.map((event) => (
              <Card
                key={event.event_id}
                sx={{ maxWidth: 345, cursor: "pointer" }}
                onClick={() => handleSelectEvent(event)}
              >
                <CardMedia
                  component="img"
                  height="150"
                  image={event.image || "/default-image.jpg"}
                  alt={event.name}
                />
                <CardContent>
                  <Typography variant="h6">{event.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.date} - {event.location} (
                    {event.category || "Uncategorized"})
                  </Typography>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body1" sx={{ gridColumn: "1 / -1", mt: 2 }}>
              No events found. Add your first event!
            </Typography>
          )}
        </Box>

        {/* Event Details Dialog */}
        <Dialog
          open={eventDialogOpen}
          onClose={() => setEventDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedEvent && (
            <>
              <DialogTitle>{selectedEvent.name}</DialogTitle>
              <DialogContent>
                <CardMedia
                  component="img"
                  height="200"
                  image={selectedEvent.detailImage || "/default-detail.jpg"}
                  alt={selectedEvent.name}
                />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <strong>Date:</strong> {selectedEvent.date}
                </Typography>
                <Typography variant="body1">
                  <strong>Location:</strong> {selectedEvent.location}
                </Typography>
                <Typography variant="body1">
                  <strong>Category:</strong>{" "}
                  {selectedEvent.category || "Uncategorized"}
                </Typography>
                <Typography variant="body1">
                  <strong>Organizer:</strong> {selectedEvent.organizer}
                </Typography>
                <Typography variant="body1">
                  <strong>Price:</strong> ${selectedEvent.price || "Free"}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <strong>Description:</strong>
                </Typography>
                <Typography variant="body2" paragraph>
                  {selectedEvent.description || "No description available."}
                </Typography>

                {selectedEvent.latitude && selectedEvent.longitude && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Event Location:</strong>
                    </Typography>
                    <Box
                      sx={{
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        height: "250px",
                        mb: 2,
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

                <Button variant="contained" sx={{ mt: 2 }}>
                  RESERVE EVENT
                </Button>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setEventDialogOpen(false)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Add Event Dialog */}
        <Dialog
          open={addEventDialogOpen}
          onClose={handleAddEventClose}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add New Event</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Event Name"
                name="name"
                value={newEvent.name}
                onChange={handleInputChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="date"
                label="Event Date"
                name="date"
                type="date"
                value={newEvent.date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />

              {/* Location picker button and display */}
              <Box sx={{ display: "flex", alignItems: "center", mt: 2, mb: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setPickerOpen(true)}
                  sx={{ mr: 2 }}
                >
                  Select Location
                </Button>
                <Typography variant="body1">
                  {newEvent.location
                    ? `Selected: ${newEvent.location}`
                    : "No location selected"}
                </Typography>
              </Box>

              {newEvent.latitude && newEvent.longitude && (
                <Box
                  sx={{
                    mt: 2,
                    mb: 2,
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    height: "200px",
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

              <TextField
                margin="normal"
                fullWidth
                id="organizer"
                label="Organizer"
                name="organizer"
                value={newEvent.organizer}
                onChange={handleInputChange}
              />
              <TextField
                margin="normal"
                fullWidth
                id="price"
                label="Price ($)"
                name="price"
                type="number"
                value={newEvent.price}
                onChange={handleInputChange}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={newEvent.category}
                  label="Category"
                  onChange={handleInputChange}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                margin="normal"
                fullWidth
                id="image"
                label="Event Image URL"
                name="image"
                value={newEvent.image}
                onChange={handleInputChange}
                helperText="URL for the event card thumbnail"
              />
              <TextField
                margin="normal"
                fullWidth
                id="detailImage"
                label="Detail Image URL"
                name="detailImage"
                value={newEvent.detailImage}
                onChange={handleInputChange}
                helperText="URL for the larger event detail image"
              />
              <TextField
                margin="normal"
                fullWidth
                id="description"
                label="Description"
                name="description"
                multiline
                rows={4}
                value={newEvent.description}
                onChange={handleInputChange}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddEventClose}>Cancel</Button>
            <Button onClick={handleSubmitEvent} variant="contained">
              Add Event
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
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};

export default EventManagement;

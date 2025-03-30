import React, { useState } from "react";
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
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import axios from "./config/axiosconfig";
import { useEffect } from "react";
import Loading from "./components/Loading";

const EventManagement = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  const handleAddNewEvent = () => {
    // Navigate to event creation page
    navigate("/create-event");
  };

  const handleReserveEvent = (eventId) => {
    setLoading(true);
    axios.post(`/api/events/${eventId}/reserve`)
      .then((response) => {
        // Close dialog after successful reservation
        setEventDialogOpen(false);
        // Show success message or update UI accordingly
        alert("Event reserved successfully");
      })
      .catch((error) => {
        console.error("Error reserving event:", error);
        setError("Failed to reserve event. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    axios.get("/api/events")
      .then((response) => {
        if (response.data.events) {
          setEvents(response.data.events);
        }
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setError("Failed to load events. Please refresh the page.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {loading && <Loading />}
      <Container maxWidth="md" sx={{ textAlign: "center", mt: 4, pb: 4 }}>
        <IconButton 
          onClick={() => navigate(-1)} 
          sx={{ position: "absolute", top: 10, left: 10 }}
          aria-label="go back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" gutterBottom>
          EVENT MANAGEMENT
        </Typography>
        <Button 
          variant="contained" 
          sx={{ mb: 3 }} 
          onClick={handleAddNewEvent}
        >
          ADD NEW EVENT
        </Button>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {events.length === 0 && !loading ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            No events found. Click "ADD NEW EVENT" to create one.
          </Alert>
        ) : (
          <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2 }}>
            {events.map((event) => (
              <Card 
                key={event.event_id} 
                sx={{ 
                  maxWidth: 345, 
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "scale(1.03)",
                  },
                }} 
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
                    {event.date} - {event.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {event.category || "Uncategorized"}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Event Details Dialog */}
        <Dialog 
          open={eventDialogOpen} 
          onClose={() => setEventDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          {selectedEvent && (
            <>
              <DialogTitle sx={{ pb: 1 }}>{selectedEvent.name}</DialogTitle>
              <DialogContent dividers>
                <CardMedia 
                  component="img" 
                  sx={{ 
                    borderRadius: 1,
                    mb: 2,
                    maxHeight: 300,
                    objectFit: "cover"
                  }}
                  image={selectedEvent.detailImage || selectedEvent.image || "/default-detail.jpg"} 
                  alt={selectedEvent.name} 
                />
                <Typography variant="body1" paragraph>
                  <strong>Date:</strong> {selectedEvent.date}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Location:</strong> {selectedEvent.location}
                </Typography>
                <Typography variant="body1" paragraph>
                  <strong>Category:</strong> {selectedEvent.category || "Uncategorized"}
                </Typography>
                {selectedEvent.description && (
                  <Typography variant="body1" paragraph>
                    <strong>Description:</strong> {selectedEvent.description}
                  </Typography>
                )}
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button 
                  onClick={() => setEventDialogOpen(false)}
                  color="inherit"
                >
                  CANCEL
                </Button>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => handleReserveEvent(selectedEvent.event_id)}
                  disabled={loading}
                >
                  RESERVE EVENT
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </>
  );
};

export default EventManagement;
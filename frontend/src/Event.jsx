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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import axios from "./config/axiosconfig";
import Loading from "./components/Loading";

const EventManagement = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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
      .catch((error) => console.error("Error fetching events:", error))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {loading ? (<Loading />) : null}
      <Container maxWidth="md" sx={{ textAlign: "center", mt: 4 }}>
      <IconButton onClick={() => navigate(-1)} sx={{ position: "absolute", top: 10, left: 10 }}>
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h4" gutterBottom>
        EVENT MANAGEMENT
      </Typography>
      <Button variant="contained" sx={{ mb: 3 }}>ADD NEW EVENT</Button>
      <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        {events.map((event) => (
          <Card key={event.event_id} sx={{ maxWidth: 345, cursor: "pointer" }} onClick={() => handleSelectEvent(event)}>
            <CardMedia component="img" height="150" image={event.image || "/default-image.jpg"} alt={event.name} />
            <CardContent>
              <Typography variant="h6">{event.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {event.date} - {event.location} ({event.category || "Uncategorized"})
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Event Details Dialog */}
      <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)}>
        {selectedEvent && (
          <>
            <DialogTitle>{selectedEvent.name}</DialogTitle>
            <DialogContent>
              <CardMedia component="img" height="200" image={selectedEvent.detailImage || "/default-detail.jpg"} alt={selectedEvent.name} />
              <Typography>Date: {selectedEvent.date}</Typography>
              <Typography>Location: {selectedEvent.location}</Typography>
              <Typography>Category: {selectedEvent.category || "Uncategorized"}</Typography>
              <Button variant="contained" sx={{ mt: 2 }}>RESERVE EVENT</Button>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
    </>
  );
};

export default EventManagement;
import React, { useState, useEffect } from "react";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { Box, Typography, Paper, IconButton, Button } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import CloseIcon from "@mui/icons-material/Close";
import axios from "../config/axiosconfig";
import { useNavigate } from "react-router-dom";

const mapContainerStyle = { width: "100%", height: "400px" };
const center = { lat: 12.8797, lng: 121.7740 };

const EventMap = () => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCHf7X0jKkx2h0ceUJ4S7l2Pa-l95P1qwA",
  });

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/events');
        console.log('Raw response:', response);
        
        // Extract events array from response data
        const events = response.data.events || [];
        console.log('Processed events:', events);

        if (events.length === 0) {
          setError('No events found');
          return;
        }

        // Process events and create markers
        const validMarkers = events
          .filter(event => {
            // Check if event has valid location data
            if (!event || !event.location) {
              return false;
            }

            // Check if location is in lat,lng format
            const [lat, lng] = event.location.split(',').map(coord => parseFloat(coord.trim()));
            return !isNaN(lat) && !isNaN(lng);
          })
          .map(event => {
            const [lat, lng] = event.location.split(',').map(coord => parseFloat(coord.trim()));
            return {
              id: event.event_id,
              position: { lat, lng },
              event: event
            };
          });

        console.log('Valid markers created:', validMarkers);
        setMarkers(validMarkers);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response,
          data: err.response?.data
        });
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (!isLoaded) {
    return <Box>Loading Map...</Box>;
  }

  if (loading) {
    return <Box>Loading events...</Box>;
  }

  if (error) {
    return <Box color="error.main">{error}</Box>;
  }

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Event Locations
      </Typography>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={6}
        center={center}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={{
              url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                <svg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 24 24' fill='#ff1744'>
                  <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(30, 30),
              anchor: new window.google.maps.Point(12, 24)
            }}
            onClick={() => setSelectedEvent(marker)}
          />
        ))}

        {selectedEvent && (
          <InfoWindow
            position={selectedEvent.position}
            onCloseClick={() => setSelectedEvent(null)}
            options={{
              disableAutoPan: true,
              pixelOffset: new window.google.maps.Size(0, -30),
              closeBoxURL: null
            }}
          >
            <Box sx={{ p: 1 }}>
              <Box sx={{ mb: 1, textAlign: "center" }}>
                <img
                  src={selectedEvent.event.image || "https://via.placeholder.com/220x120?text=Event+Image"}
                  alt={selectedEvent.event.name}
                  style={{
                    width: "100%",
                    maxHeight: 120,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                />
              </Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 0.5 }}>
                {selectedEvent.event.name}
              </Typography>
              <Typography variant="body2">
                {selectedEvent.event.location}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(selectedEvent.event.date).toLocaleDateString()}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="small"
                sx={{ mt: 1, width: '100%' }}
                onClick={() => navigate(`/events/${selectedEvent.event.event_id}`)}
              >
                View Details
              </Button>
            </Box>
          </InfoWindow>
        )}
      </GoogleMap>
    </Paper>
  );
};

export default EventMap; 
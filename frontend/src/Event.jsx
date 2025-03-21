import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
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

const events = [
  {
    id: 1,
    name: "Sinulog Festival",
    date: "2025-01-19",
    location: "Cebu City",
    category: "Cultural",
    image: "https://ih1.redbubble.net/image.5705076938.1407/st,small,507x507-pad,600x600,f8f8f8.jpg",
  },
  {
    id: 2,
    name: "Panagbenga Festival",
    date: "2025-02-01",
    location: "Baguio City",
    category: "Cultural",
    image: "https://cdn.dribbble.com/userupload/16360639/file/original-4e97260f52a92a74186951af6b06781e.png?resize=752x&vertical=center",
  },
  {
    id: 3,
    name: "Ati-Atihan Festival",
    date: "2025-01-10",
    location: "Kalibo, Aklan",
    category: "Cultural",
    image: "https://mir-s3-cdn-cf.behance.net/projects/404/c6bec8209344957.Y3JvcCw1ODQzLDQ1NzAsMTEyOCw0MDQ.png",
  },
  {
    id: 4,
    name: "Pahiyas Festival",
    date: "2025-05-15",
    location: "Lucban, Quezon",
    category: "Cultural",
    image: "https://ih1.redbubble.net/image.5232799542.4027/flat,750x,075,f-pad,750x1000,f8f8f8.jpg",
  },
  {
    id: 5,
    name: "Kadayawan Festival",
    date: "2025-08-17",
    location: "Davao City",
    category: "Cultural",
    image: "https://ih1.redbubble.net/image.5232826320.4813/fposter,small,wall_texture,product,750x1000.jpg",
  },
  {
    id: 6,
    name: "MassKara Festival",
    date: "2025-10-15",
    location: "Bacolod City",
    category: "Cultural",
    image: "https://ih1.redbubble.net/image.5228114490.5889/flat,750x,075,f-pad,750x1000,f8f8f8.jpg",
  },
  {
    id: 7,
    name: "Parol Festival",
    date: "2025-12-16",
    location: "San Fernando, Pampanga",
    category: "Cultural",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPBnOljG2b4YbhKb14BMesth6ij8qyHEh_eA&s",
  },
  {
    id: 8,
    name: "Philippine Hot Air Balloon Fiesta",
    date: "2025-02-08",
    location: "Clark, Pampanga",
    category: "Aviation",
    image: "https://scontent.fceb1-4.fna.fbcdn.net/v/t39.30808-6/327169231_2953978808243599_1194370993540140497_n.png?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeFnEJv2VrBaV8dy7-0uVgYu-iGn49N5SuP6Iafj03lK42eOBQZxjGQpuI0V0d8fi9gyZ_MBPIE9fDLmmdL3Zmr-&_nc_ohc=h9rYD4VTg3kQ7kNvgHn-Sf7&_nc_oc=AdnDAix9Gq-7Dfgk4t1zYV3csEhv7W47ZfyU5H66UrSonq8O-YJXw5CpEV_89gQZ9Gnd-uxkOMk1kM6PabZGc-Ev&_nc_zt=23&_nc_ht=scontent.fceb1-4.fna&_nc_gid=mbU72s5aZ6z6_cxMcb2_NA&oh=00_AYHm4PwS81VZuOli1kbf6Sd_vPvOkyCpsCNjzIViS0sY1Q&oe=67E3264F",
  },
  {
    id: 9,
    name: "Dinagyang Festival",
    date: "2025-01-22",
    location: "Iloilo City",
    category: "Cultural",
    image: "https://ih1.redbubble.net/image.5228347475.1453/flat,750x,075,f-pad,750x1000,f8f8f8.jpg",
  },
  {
    id: 10,
    name: "Obando Fertility Rites",
    date: "2025-05-17",
    location: "Obando, Bulacan",
    category: "Religious",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkJNDxud-LsCloVpvKfddmXQT_9hDtNtk21w&s",
  }
];

const EventManagement = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };

  return (
    <Container maxWidth="md" sx={{ textAlign: "center", mt: 4, color: "#ffffff" }}>
      <IconButton onClick={() => navigate(-1)} sx={{ position: "absolute", top: 10, left: 10, color: "#ffffff" }}>
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h4" gutterBottom sx={{ color: "#000000" }}>
        Event Management
      </Typography>
      <Button variant="contained" sx={{ mb: 3 }}>ADD NEW EVENT</Button>
      <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2 }}>
        {events.map((event) => (
          <Card key={event.id} sx={{ maxWidth: 345, cursor: "pointer" }} onClick={() => handleSelectEvent(event)}>
            <CardMedia component="img" height="150" image={event.image} alt={event.name} />
            <CardContent>
              <Typography variant="h6" sx={{ color: "#000000" }}>{event.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {event.date} - {event.location} ({event.category})
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Event Details Dialog */}
      <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)}>
        <DialogTitle>{selectedEvent?.name}</DialogTitle>
        <DialogContent>
          <Typography>Date: {selectedEvent?.date}</Typography>
          <Typography>Location: {selectedEvent?.location}</Typography>
          <Typography>Category: {selectedEvent?.category}</Typography>
          <Button variant="contained" sx={{ mt: 2 }}>RESERVE EVENT</Button>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default EventManagement;

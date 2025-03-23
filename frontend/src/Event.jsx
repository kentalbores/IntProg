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
    detailImage: "https://image.vigattin.com/box/optimize/86/302_295856883370625942.jpg",
  },
  {
    id: 2,
    name: "Panagbenga Festival",
    date: "2025-02-01",
    location: "Baguio City",
    category: "Cultural",
    image: "https://cdn.dribbble.com/userupload/16360639/file/original-4e97260f52a92a74186951af6b06781e.png?resize=752x&vertical=center",
    detailImage: "https://scontent.fceb1-5.fna.fbcdn.net/v/t39.30808-6/482224944_663181166273978_1113758715936938615_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=cc71e4&_nc_eui2=AeFS02WI-tHM2TTHxj-Yv_RBz2hID728xCbPaEgPvbzEJjBqgxb6wbSJvEJhEdL9FW7GSgfOv7FXJRe001eCwlaq&_nc_ohc=5tF8XW7qdA0Q7kNvgFGncKW&_nc_oc=AdlnTSpdLq5sZgbo44XHDaQpgzGfhYZSDRrIO4KVHt5beK8nfBFYFOgmtmkhYisRv3kju9pQM1QeV0B-fcD3mwB1&_nc_zt=23&_nc_ht=scontent.fceb1-5.fna&_nc_gid=Ol64Ht607ij0IGkDpUu5SQ&oh=00_AYF4z102Dj08GJnSLgPx_0axV4fkc0qL1zZJU3ELT5b7LA&oe=67E53CFB",
  },
  {
    id: 3,
    name: "Ati-Atihan Festival",
    date: "2025-01-10",
    location: "Kalibo, Aklan",
    category: "Cultural",
    image: "https://mir-s3-cdn-cf.behance.net/projects/404/c6bec8209344957.Y3JvcCw1ODQzLDQ1NzAsMTEyOCw0MDQ.png",
    detailImage: "https://www.bookaway.com/blog/wp-content/uploads/2019/11/Ati-Atihan-Festival-Kalibo.jpg",
  },
  {
    id: 4,
    name: "Pahiyas Festival",
    date: "2025-05-15",
    location: "Lucban, Quezon",
    category: "Cultural",
    image: "https://ih1.redbubble.net/image.5232799542.4027/flat,750x,075,f-pad,750x1000,f8f8f8.jpg",
    detailImage: "https://cdn-v2.theculturetrip.com/1200x675/wp-content/uploads/2018/03/8740291211_fdc2361254_k.webp",
  },
  {
    id: 5,
    name: "Kadayawan Festival",
    date: "2025-08-17",
    location: "Davao City",
    category: "Cultural",
    image: "https://ih1.redbubble.net/image.5232826320.4813/fposter,small,wall_texture,product,750x1000.jpg",
    detailImage: "https://flauntingitcharlton.files.wordpress.com/2012/01/kadayawan-festival.jpg",
  },
  {
    id: 6,
    name: "MassKara Festival",
    date: "2025-10-15",
    location: "Bacolod City",
    category: "Cultural",
    image: "https://ih1.redbubble.net/image.5228114490.5889/flat,750x,075,f-pad,750x1000,f8f8f8.jpg",
    detailImage: "https://philippineshiddengems.com/wp-content/uploads/2023/11/MassKara-Festival.jpg",
  },
  {
    id: 7,
    name: "Parol Festival",
    date: "2025-12-16",
    location: "San Fernando, Pampanga",
    category: "Cultural",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPBnOljG2b4YbhKb14BMesth6ij8qyHEh_eA&s",
    detailImage: "https://images.gmanews.tv/webpics/2017/12/ParolFestival_2017_12_15_12_49_46.jpg",
  },
  {
    id: 8,
    name: "Philippine Hot Air Balloon Fiesta",
    date: "2025-02-08",
    location: "Clark, Pampanga",
    category: "Aviation",
    image: "https://scontent.fceb1-4.fna.fbcdn.net/v/t39.30808-6/327169231_2953978808243599_1194370993540140497_n.png?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeFnEJv2VrBaV8dy7-0uVgYu-iGn49N5SuP6Iafj03lK42eOBQZxjGQpuI0V0d8fi9gyZ_MBPIE9fDLmmdL3Zmr-&_nc_ohc=h9rYD4VTg3kQ7kNvgHn-Sf7&_nc_oc=AdnDAix9Gq-7Dfgk4t1zYV3csEhv7W47ZfyU5H66UrSonq8O-YJXw5CpEV_89gQZ9Gnd-uxkOMk1kM6PabZGc-Ev&_nc_zt=23&_nc_ht=scontent.fceb1-4.fna&_nc_gid=mbU72s5aZ6z6_cxMcb2_NA&oh=00_AYHm4PwS81VZuOli1kbf6Sd_vPvOkyCpsCNjzIViS0sY1Q&oe=67E3264F",
    detailImage: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS43rD4U2JoMBH67llsK5STWJjO-zwQRvMNUA&s",
  },
  {
    id: 9,
    name: "Dinagyang Festival",
    date: "2025-01-22",
    location: "Iloilo City",
    category: "Cultural",
    image: "https://ih1.redbubble.net/image.5228347475.1453/flat,750x,075,f-pad,750x1000,f8f8f8.jpg",
    detailImage: "https://thumbs.dreamstime.com/b/dinagyang-festival-iloilo-philippines-jan-participants-dinagyang-festival-iloilo-philippines-january-dinagyang-165189823.jpg",
  },
  {
    id: 10,
    name: "Obando Fertility Rites",
    date: "2025-05-17",
    location: "Obando, Bulacan",
    category: "Religious",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkJNDxud-LsCloVpvKfddmXQT_9hDtNtk21w&s",
    detailImage: "https://aboutbulacan.weebly.com/uploads/6/0/1/1/60117465/7621658.jpg",
  },
  {
    id: 11,
    name: "Ironman Philippines",
    date: "2025-04-29",
    location: "Subic Bay",
    category: "Sports",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8zRk0xcy8JEU4jbLnV9ecqWOsO-MUDZnzVQ&s",
    detailImage: "https://media.philstar.com/photos/2024/05/23/ironman-philippines-subic_2024-05-23_09-55-52.jpg",
  },
  {
    id: 12,
    name: "Lanzones Festival",
    date: "2025-10-21",
    location: "Camiguin",
    category: "Culture",
    image: "https://mindanaoan.com/wp-content/uploads/2014/10/1959866_707504379342030_139551611057845715_n.jpg",
    detailImage: "https://www.rappler.com/tachyon/2022/07/CAMIGUIN-LANZONES-FEST-2019-2-scaled.jpg",
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
    <Container maxWidth="md" sx={{ textAlign: "center", mt: 4 }}>
      <IconButton onClick={() => navigate(-1)} sx={{ position: "absolute", top: 10, left: 10 }}>
        <ArrowBackIcon />
      </IconButton>
      <Typography variant="h4" gutterBottom>
        Event Management
      </Typography>
      <Button variant="contained" sx={{ mb: 3 }}>ADD NEW EVENT</Button>
      <Box sx={{ mt: 3, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
        {events.map((event) => (
          <Card key={event.id} sx={{ maxWidth: 345, cursor: "pointer" }} onClick={() => handleSelectEvent(event)}>
            <CardMedia component="img" height="150" image={event.image} alt={event.name} />
            <CardContent>
              <Typography variant="h6">{event.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {event.date} - {event.location} ({event.category})
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
            <CardMedia component="img" height="200" image={selectedEvent.detailImage} alt={selectedEvent.name} />
              <Typography>Date: {selectedEvent.date}</Typography>
              <Typography>Location: {selectedEvent.location}</Typography>
              <Typography>Category: {selectedEvent.category}</Typography>
              <Button variant="contained" sx={{ mt: 2 }}>RESERVE EVENT</Button>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default EventManagement;

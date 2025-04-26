import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, Container, Grid, Paper, Tabs, Tab } from "@mui/material";
import { useNavigate } from "react-router-dom";
import EventIcon from "@mui/icons-material/Event";
import InfoIcon from "@mui/icons-material/Info";
import AddBoxIcon from "@mui/icons-material/AddBox";

const sections = [
  { label: "Create Event", icon: <AddBoxIcon />, id: "create-event" },
  { label: "Events", icon: <EventIcon />, id: "events" },
  { label: "About Us", icon: <InfoIcon />, id: "about-us" },
];

const Landing = () => {
  const [tab, setTab] = React.useState(0);
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    const section = document.getElementById(sections[newValue].id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%)" }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 4 }}>
        <Toolbar>
          <Typography variant="h5" fontWeight="bold" color="primary" sx={{ flexGrow: 1, letterSpacing: 1 }}>
            EventHub
          </Typography>
          <Button color="primary" variant="outlined" sx={{ mr: 2 }} onClick={() => navigate("/login")}>Login</Button>
          <Button color="primary" variant="contained" onClick={() => navigate("/register")}>Sign Up</Button>
        </Toolbar>
        <Tabs value={tab} onChange={handleTabChange} centered textColor="primary" indicatorColor="primary">
          {sections.map((section, idx) => (
            <Tab key={section.id} icon={section.icon} label={section.label} />
          ))}
        </Tabs>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 6, textAlign: "center", borderRadius: 4, background: "rgba(255,255,255,0.95)" }}>
          <Typography variant="h3" fontWeight="bold" color="primary.main" gutterBottom>
            Plan. Organize. Celebrate.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            The all-in-one platform to create, manage, and discover events effortlessly.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ px: 5, py: 1.5, fontWeight: 600, fontSize: "1.2rem" }}
            onClick={() => navigate("/register")}
          >
            Get Started
          </Button>
        </Paper>
      </Container>

      {/* Sections */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={6}>
          {/* Create Event Section */}
          <Grid item xs={12} md={4} id="create-event">
            <Paper elevation={2} sx={{ p: 4, borderRadius: 3, textAlign: "center", height: "100%" }}>
              <AddBoxIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Create Event
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Easily create and customize your own events. Invite guests, set schedules, and manage everything in one place.
              </Typography>
              <Button variant="contained" color="primary" onClick={() => navigate("/register")}>Create Now</Button>
            </Paper>
          </Grid>
          {/* Events Section */}
          <Grid item xs={12} md={4} id="events">
            <Paper elevation={2} sx={{ p: 4, borderRadius: 3, textAlign: "center", height: "100%" }}>
              <EventIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Events
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Discover upcoming events or browse through a variety of public events. Join and participate with a single click.
              </Typography>
              <Button variant="outlined" color="primary" onClick={() => navigate("/Event")}>Browse Events</Button>
            </Paper>
          </Grid>
          {/* About Us Section */}
          <Grid item xs={12} md={4} id="about-us">
            <Paper elevation={2} sx={{ p: 4, borderRadius: 3, textAlign: "center", height: "100%" }}>
              <InfoIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                About Us
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                EventHub is dedicated to making event planning simple and accessible for everyone. Learn more about our mission and team.
              </Typography>
              <Button variant="text" color="primary" onClick={() => navigate("/about")}>Learn More</Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Landing; 
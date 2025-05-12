import React from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Tabs, 
  Tab,
  useMediaQuery,
  useTheme
} from "@mui/material";
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    const section = document.getElementById(sections[newValue].id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #e0f2fe 0%, #f8fafc 100%)",
      overflow: "hidden",
      position: "relative"
    }}>
      {/* Background decorative elements */}
      <Box 
        sx={{ 
          position: "absolute", 
          width: "500px", 
          height: "500px", 
          borderRadius: "50%", 
          background: "radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0) 70%)", 
          top: "-200px", 
          right: "-100px",
          zIndex: 0 
        }} 
      />
      <Box 
        sx={{ 
          position: "absolute", 
          width: "300px", 
          height: "300px", 
          borderRadius: "50%", 
          background: "radial-gradient(circle, rgba(236,72,153,0.1) 0%, rgba(236,72,153,0) 70%)", 
          bottom: "100px", 
          left: "-100px",
          zIndex: 0 
        }} 
      />

      {/* Navbar */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 4, backgroundColor: "rgba(255,255,255,0.8)", backdropFilter: "blur(8px)" }}>
        <Toolbar>
          <Typography variant="h5" fontWeight="bold" color="primary" sx={{ flexGrow: 1, letterSpacing: 1 }}>
            EventHub
          </Typography>
          <Button 
            color="primary" 
            variant="outlined" 
            sx={{ mr: 2, borderRadius: "8px", textTransform: "none" }} 
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
          <Button 
            color="primary" 
            variant="contained" 
            sx={{ borderRadius: "8px", textTransform: "none", boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)" }} 
            onClick={() => navigate("/login")}
          >
            Sign Up
          </Button>
        </Toolbar>
        <Tabs 
          value={tab} 
          onChange={handleTabChange} 
          centered 
          textColor="primary" 
          indicatorColor="primary"
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
        >
          {sections.map((section, idx) => (
            <Tab 
              key={section.id} 
              icon={section.icon} 
              label={section.label} 
              sx={{ 
                textTransform: "none", 
                fontWeight: tab === idx ? 600 : 400,
                transition: "all 0.2s ease"
              }}
            />
          ))}
        </Tabs>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 8, position: "relative", zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2 }}>
              <Typography 
                variant="h2" 
                fontWeight="800" 
                color="primary.dark" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: "2.5rem", sm: "3rem", md: "3.5rem" },
                  lineHeight: 1.2,
                  background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
                  backgroundClip: "text",
                  textFillColor: "transparent",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                Plan. Organize. Celebrate.
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ mb: 4, maxWidth: "90%", lineHeight: 1.6 }}
              >
                The all-in-one platform to create, manage, and discover events effortlessly.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{ 
                  px: 4, 
                  py: 1.5, 
                  fontWeight: 600, 
                  fontSize: "1.1rem",
                  borderRadius: "12px",
                  textTransform: "none",
                  boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(0,118,255,0.39)"
                  },
                  transition: "all 0.2s ease"
                }}
                onClick={() => navigate("/login")}
              >
                Get Started
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: { xs: "none", md: "block" } }}>
            <Box 
              component="img"
              src="https://miro.medium.com/v2/resize:fit:921/1*qbQTryJnwXs9rXFdCoZxxg.png"
              alt="Event planning"
              sx={{
                width: "100%",
                height: "auto", 
                maxWidth: "500px",
                objectFit: "cover",
                borderRadius: "16px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                transform: "perspective(500px) rotateY(-5deg)",
              }}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Sections */}
      <Container maxWidth="lg" sx={{ py: 6, position: "relative", zIndex: 1 }}>
        <Grid container spacing={4}>
          {/* Create Event Section */}
          <Grid item xs={12} md={4} id="create-event">
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                borderRadius: "16px", 
                textAlign: "center", 
                height: "100%",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                },
                border: "1px solid rgba(0,0,0,0.05)"
              }}
            >
              <Box sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "6px",
                background: "linear-gradient(90deg, #3b82f6, #60a5fa)"
              }} />
              <AddBoxIcon color="primary" sx={{ fontSize: 56, mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Create Event
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, minHeight: "80px" }}>
                Easily create and customize your own events. Invite guests, set schedules, and manage everything in one place.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate("/login")}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  px: 3,
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                }}
              >
                Create Now
              </Button>
            </Paper>
          </Grid>
          
          {/* Events Section */}
          <Grid item xs={12} md={4} id="events">
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                borderRadius: "16px", 
                textAlign: "center", 
                height: "100%",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                },
                border: "1px solid rgba(0,0,0,0.05)"
              }}
            >
              <Box sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "6px",
                background: "linear-gradient(90deg, #8b5cf6, #a78bfa)"
              }} />
              <EventIcon color="primary" sx={{ fontSize: 56, mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Events
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, minHeight: "80px" }}>
                Discover upcoming events or browse through a variety of public events. Join and participate with a single click.
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => navigate("/Event")}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  px: 3
                }}
              >
                Browse Events
              </Button>
            </Paper>
          </Grid>
          
          {/* About Us Section */}
          <Grid item xs={12} md={4} id="about-us">
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                borderRadius: "16px", 
                textAlign: "center", 
                height: "100%",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                },
                border: "1px solid rgba(0,0,0,0.05)"
              }}
            >
              <Box sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "6px",
                background: "linear-gradient(90deg, #ec4899, #f472b6)"
              }} />
              <InfoIcon color="primary" sx={{ fontSize: 56, mb: 2 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                About Us
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, minHeight: "80px" }}>
                EventHub is dedicated to making event planning simple and accessible for everyone. Learn more about our mission and team.
              </Typography>
              <Button 
                variant="text" 
                color="primary" 
                onClick={() => navigate("/about")}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  px: 3
                }}
              >
                Learn More
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 4, 
          textAlign: "center", 
          color: "text.secondary",
          borderTop: "1px solid rgba(0,0,0,0.05)",
          mt: 6,
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(8px)",
          position: "relative",
          zIndex: 1
        }}
      >
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} EventHub. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default Landing;
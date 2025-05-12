import React from "react";
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Button,
  useTheme,
  useMediaQuery,
  keyframes
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EventIcon from "@mui/icons-material/Event";
import InfoIcon from "@mui/icons-material/Info";
import AddBoxIcon from "@mui/icons-material/AddBox";
import Navbar from "./components/Navbar";

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const glow = keyframes`
  0% { text-shadow: 0 0 10px rgba(71, 118, 230, 0.5); }
  50% { text-shadow: 0 0 20px rgba(71, 118, 230, 0.8); }
  100% { text-shadow: 0 0 10px rgba(71, 118, 230, 0.5); }
`;

const sections = [
  { label: "Create Event", icon: <AddBoxIcon />, id: "create-event" },
  { label: "Events", icon: <EventIcon />, id: "events" },
  { label: "About Us", icon: <InfoIcon />, id: "about-us" },
];

const Landing = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      background: isDarkMode 
        ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
        : "linear-gradient(135deg, #e0f2fe 0%, #f8fafc 100%)",
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
      <Navbar 
        themeMode={theme.palette.mode}
        showBackButton={false}
        showMenuButton={false}
      />

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 8, position: "relative", zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2 }}>
              <Typography 
                variant="h1" 
                fontWeight="800" 
                sx={{ 
                  fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4rem" },
                  lineHeight: 1.2,
                  mb: 3,
                  background: "linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)",
                  backgroundClip: "text",
                  textFillColor: "transparent",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: `${glow} 2s ease-in-out infinite`
                }}
              >
                Plan. Organize. Celebrate.
              </Typography>
              <Typography 
                variant="h5" 
                color="text.secondary" 
                sx={{ 
                  mb: 4, 
                  maxWidth: "90%", 
                  lineHeight: 1.6,
                  fontWeight: 400
                }}
              >
                The all-in-one platform to create, manage, and discover events effortlessly.
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
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
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  sx={{ 
                    px: 4, 
                    py: 1.5, 
                    fontWeight: 600, 
                    fontSize: "1.1rem",
                    borderRadius: "12px",
                    textTransform: "none",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(0,118,255,0.2)"
                    },
                    transition: "all 0.2s ease"
                  }}
                  onClick={() => navigate("/Event")}
                >
                  Browse Events
                </Button>
              </Box>
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
                animation: `${float} 3s ease-in-out infinite`
              }}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 6, position: "relative", zIndex: 1 }}>
        <Grid container spacing={4}>
          {sections.map((section, index) => (
            <Grid item xs={12} md={4} key={section.id} id={section.id}>
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
                  border: "1px solid rgba(0,0,0,0.05)",
                  backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'background.paper',
                  backdropFilter: isDarkMode ? 'blur(8px)' : 'none',
                }}
              >
                <Box sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "6px",
                  background: `linear-gradient(90deg, ${index === 0 ? '#3b82f6' : index === 1 ? '#8b5cf6' : '#ec4899'}, ${index === 0 ? '#60a5fa' : index === 1 ? '#a78bfa' : '#f472b6'})`
                }} />
                <Box sx={{ 
                  animation: `${float} 3s ease-in-out infinite`,
                  mb: 2
                }}>
                  {React.cloneElement(section.icon, { 
                    sx: { 
                      fontSize: 56, 
                      color: isDarkMode ? 'primary.light' : 'primary.main',
                      animation: `${glow} 2s ease-in-out infinite`
                    } 
                  })}
                </Box>
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  gutterBottom
                  sx={{ 
                    color: isDarkMode ? 'primary.light' : 'primary.dark',
                    mb: 2
                  }}
                >
                  {section.label}
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 3, 
                    minHeight: "80px",
                    lineHeight: 1.6
                  }}
                >
                  {section.label === "Create Event" 
                    ? "Easily create and customize your own events. Invite guests, set schedules, and manage everything in one place."
                    : section.label === "Events"
                    ? "Discover upcoming events or browse through a variety of public events. Join and participate with a single click."
                    : "EventHub is dedicated to making event planning simple and accessible for everyone. Learn more about our mission and team."}
                </Typography>
                <Button 
                  variant={index === 0 ? "contained" : index === 1 ? "outlined" : "text"}
                  color="primary" 
                  onClick={() => navigate(index === 0 ? "/login" : index === 1 ? "/Event" : "/about")}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    px: 3,
                    boxShadow: index === 0 ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)" : "none",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: index === 0 ? "0 6px 12px rgba(0, 0, 0, 0.15)" : "none"
                    },
                    transition: "all 0.2s ease"
                  }}
                >
                  {index === 0 ? "Create Now" : index === 1 ? "Browse Events" : "Learn More"}
                </Button>
              </Paper>
            </Grid>
          ))}
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
          background: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255,255,255,0.8)',
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
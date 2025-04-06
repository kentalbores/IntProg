import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  IconButton,
  Modal,
  Button,
  Chip,
  Grid,
  Paper,
  Divider,
  Container,
  AppBar,
  Toolbar,
  useTheme,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import QrCodeIcon from "@mui/icons-material/QrCode";
import WorkIcon from "@mui/icons-material/Work";
import { useNavigate } from "react-router-dom";
import "./all.css";

// Custom theme - matching Home.jsx
const theme = createTheme({
  palette: {
    primary: {
      main: "#3a86ff",
      light: "#83b8ff",
      dark: "#0057cb",
    },
    secondary: {
      main: "#ff006e",
      light: "#ff5a9d",
      dark: "#c50054",
    },
    success: {
      main: "#38b000",
      light: "#70e000",
      dark: "#008000",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          boxShadow: "none",
          fontWeight: 600,
          padding: "8px 16px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: "hidden",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});

const featuresList = [
  {
    title: "Event Organization",
    description: "Create and manage events of any size. Set up schedules, manage venues, and handle all logistical aspects from a single dashboard.",
    icon: <EventIcon fontSize="large" />,
  },
  {
    title: "Service Marketplace",
    description: "Discover and hire freelancers and service providers directly on the platform. From caterers to photographers, find everything you need for your event.",
    icon: <WorkIcon fontSize="large" />,
  },
  {
    title: "Guest Management",
    description: "Effortlessly manage guest lists, send invitations, track RSVPs, and communicate updates to attendees all in one place.",
    icon: <PeopleIcon fontSize="large" />,
  },
  {
    title: "Digital Access",
    description: "Generate custom QR codes and embeddable links for your events. Simplify check-ins and provide secure digital access to your event information.",
    icon: <QrCodeIcon fontSize="large" />,
  },
];

const teamMembers = [
  {
    name: "Kent Albores",
    role: "Backend Developer",
    description: "Code is poetry. Security is my game.",
    expertise: ["Node.js", "Database Design", "API Security", "Authentication"],
    contributions: "Developed the secure user authentication system and RESTful API endpoints for event creation and management.",
    image: "https://scontent.fceb3-1.fna.fbcdn.net/v/t39.30808-6/487233326_1495745791382780_6798488270112745849_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHCQ4KN4F0KvmoIfE7g7JIZCy1vvlVh63wLLW--VWHrfCPSJXppo2Bi0Y1cxI79ngQMDWAA9KN7m6MRjbk19ssS&_nc_ohc=aUCIy1gq634Q7kNvgEvOxas&_nc_oc=Adlo5-cPrQt7NdBrulVLlHWKTsUPgkWEKQW2nTW2xfQkuQi8ooZDs6d3wJk28zaUbhs&_nc_zt=23&_nc_ht=scontent.fceb3-1.fna&_nc_gid=HzTXn7Ijme-zLMhAdfVB2w&oh=00_AYG6Lk_xVqMKtQTP9YgpweAtQwQ1WsSMxDuvBWxgd9vWoQ&oe=67EF9C6A",
  },
  {
    name: "Frank Oliver Bentoy",
    role: "Web Developer",
    description: "Bringing designs to life, one line of code at a time.",
    expertise: ["React", "Material UI", "Responsive Design", "Frontend Development"],
    contributions: "Created the responsive user interface and implemented the event browsing and booking features.",
    image: "https://scontent.fceb1-5.fna.fbcdn.net/v/t39.30808-6/480812643_1616201275929231_3210467683300692989_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeEltF4FXTcgsFVk6Lr2qqPtLcQmZM-2gBktxCZkz7aAGXV7_1YZY843vRgEnSJf23hM7FiPZ1cwLdDVocer7qKT&_nc_ohc=-KbiUK68LSUQ7kNvgEm86ze&_nc_oc=Adm54Tcxo9xzBZ_FJTn2BBQu40WEccSEZkxMwZ66lNqnqeWk_vRrwUf34t0pGCa03DDKS0cB_NvdxCG_ljwSfz8T&_nc_zt=23&_nc_ht=scontent.fceb1-5.fna&_nc_gid=nuTnXKEq39bYVwAtiZALng&oh=00_AYF5-WUsIgWgjZi3T5m4cIAvhpShn2BPjqv6I99637qI4w&oe=67E5E3B9",
  },
  {
    name: "Theus Gabriel Mendez",
    role: "Android Developer",
    description: "Life isn't about avoiding thunderstorms, it's about learning how to dance in the rain.",
    expertise: ["React Native", "Mobile UI/UX", "Cross-platform Development", "Push Notifications"],
    contributions: "Developed the companion mobile app for the event management platform, allowing users to receive notifications and manage bookings on the go.",
    image: "https://scontent.fceb1-2.fna.fbcdn.net/v/t1.6435-9/55441090_2276877279035206_8975035979828035584_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeG7FmxKMfMkGf-jqN0-HkEpOVSWWBMj6-Q5VJZYEyPr5LJqTEsM-0K4RtQU_jAAI-UWnlkxrEoTX8VLRX4wNQPW&_nc_ohc=377Axo_iExQQ7kNvgGeYXZ0&_nc_oc=AdlA9SeF6ZIsUsB3fvLQ8YH9MuIDxLGsCSLxvfK0vEnc1InTueuD6I5q7dpfwLWLP17qOJTwvoP3vYvzW2KPuZNv&_nc_zt=23&_nc_ht=scontent.fceb1-2.fna&_nc_gid=qsYmvMBF8YmnFBNcWxewhA&oh=00_AYFODXz43hTIOgfpR42XsBAWyXRbknxt0TcCAS0iZm6mWQ&oe=68078948",
  },
];

const About = () => {
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState(null);
  const [open, setOpen] = useState(false);
  const customTheme = useTheme();
  const isMobile = useMediaQuery(customTheme.breakpoints.down("sm"));

  const handleOpen = (member) => {
    setSelectedMember(member);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <ThemeProvider theme={theme} className="overflow-y-hidden">
      <Box
        sx={{
          minHeight: "100vh",
          pb: 6,
          backgroundImage: "url('./assets/bg.jpg')",
          backgroundSize: "100vw",
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          margin: 0,
          padding: 0,
        }}
      >
        {/* AppBar */}
        <AppBar
          position="sticky"
          color="default"
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0)",
            backdropFilter: "blur(5px)",
          }}
        >
          <Toolbar>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ mr: 2, color: "primary.main" }}
              edge="start"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="primary.main"
              sx={{ flexGrow: 1 }}
            >
              About EventHub
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ pt: 4 }}>
          {/* Hero Section */}
          <Paper
            elevation={2}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "6px",
                background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
              }}
            />
            <Typography variant="h4" fontWeight="bold" gutterBottom color="primary.dark">
              Event Manager
            </Typography>
            <Typography variant="h6" color="text.secondary" mb={3}>
              Revolutionizing how events come to life
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mx: "auto" }}>
              Event Manager is a comprehensive platform designed to transform the event planning process. 
              From conceptualization to execution, our platform provides all the tools necessary to create 
              memorable experiences while eliminating the logistical headaches traditionally associated 
              with event planning.
            </Typography>
          </Paper>

          {/* Features Section */}
          <Typography 
            variant="h5" 
            fontWeight="bold" 
            mb={3} 
            sx={{
              textAlign: "center", 
              color: "primary.dark",
              position: "relative",
              "&:after": {
                content: '""',
                position: "absolute",
                bottom: -8,
                left: "50%",
                transform: "translateX(-50%)",
                width: 60,
                height: 3,
                backgroundColor: "primary.main",
                borderRadius: 1.5,
              }
            }}
          >
            Platform Features
          </Typography>

          <Grid container spacing={3} sx={{ mb: 6 }}>
            {featuresList.map((feature, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Paper
                  elevation={2}
                  sx={{
                    height: "100%",
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <Box sx={{ color: "primary.main", mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Why Choose Section */}
          <Paper
            elevation={2}
            sx={{
              p: 4,
              mb: 6,
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "6px",
                background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
              }}
            />
            <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.dark">
              Why Choose Event Manager?
            </Typography>
            <Typography variant="body1" paragraph>
              Event Manager stands out as the premier solution for event organizers of all scales. Whether you&apos;re planning a small gathering or a large corporate conference, our platform scales to meet your needs.
            </Typography>
            <Typography variant="body1" paragraph>
              With our integrated service marketplace, you can find and hire the perfect vendors for your event directly through our platform. Need catering, photography, or entertainment? Browse qualified professionals, view their portfolios, read reviews, and book their services—all in one place.
            </Typography>
            <Typography variant="body1">
              Our QR code and embedded link technology revolutionizes guest management. Create custom digital invitations, track RSVPs in real-time, and streamline check-ins with our mobile scanning feature. Attendees can receive instant updates, access digital event programs, and provide valuable feedback through our intuitive interface.
            </Typography>
          </Paper>

          {/* Team Section */}
          <Typography 
            variant="h5" 
            fontWeight="bold" 
            mb={3} 
            sx={{
              textAlign: "center", 
              color: "primary.dark",
              position: "relative",
              "&:after": {
                content: '""',
                position: "absolute",
                bottom: -8,
                left: "50%",
                transform: "translateX(-50%)",
                width: 60,
                height: 3,
                backgroundColor: "primary.main",
                borderRadius: 1.5,
              }
            }}
          >
            Meet The Developers
          </Typography>

          <Grid container spacing={3} sx={{ mb: 6 }}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => handleOpen(member)}
                >
                  <CardContent sx={{ textAlign: "center", p: 3 }}>
                    <Avatar
                      src={member.image}
                      alt={member.name}
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        mx: "auto", 
                        mb: 2,
                        border: "3px solid",
                        borderColor: "primary.light",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {member.name}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      {member.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      "{member.description}"
                    </Typography>
                    <Typography variant="caption" color="primary" sx={{ display: "block", mt: 2 }}>
                      Click for more details
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Modal for detailed view */}
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="developer-detail-modal"
          aria-describedby="detailed-information-about-developer"
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: 500,
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: 24,
              p: 4,
            }}
          >
            {selectedMember && (
              <>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Typography id="developer-detail-modal" variant="h5" component="h2" fontWeight="bold" color="primary.dark">
                    {selectedMember.name}
                  </Typography>
                  <IconButton onClick={handleClose} size="small">
                    <CloseIcon />
                  </IconButton>
                </Box>
                
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Avatar
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      mr: 3,
                      border: "3px solid",
                      borderColor: "primary.light",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Box>
                    <Typography variant="h6" color="primary">
                      {selectedMember.role}
                    </Typography>
                    <Typography variant="body1" sx={{ fontStyle: "italic", mt: 1 }}>
                      &quot;{selectedMember.description}&quot;
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="h6" fontWeight="bold" mt={2} color="primary.dark">
                  Expertise
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1, mb: 3 }}>
                  {selectedMember.expertise.map((skill, index) => (
                    <Chip key={index} label={skill} color="primary" variant="outlined" />
                  ))}
                </Box>
                
                <Typography variant="h6" fontWeight="bold" color="primary.dark">
                  Contributions to Event Manager
                </Typography>
                <Typography variant="body1" mt={1}>
                  {selectedMember.contributions}
                </Typography>
                
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                  <Button variant="contained" onClick={handleClose}>
                    Close
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Modal>
      </Box>
    </ThemeProvider>
  );
};

export default About;
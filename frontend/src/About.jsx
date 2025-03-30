import { useState } from "react";
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
  Divider
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import QrCodeIcon from "@mui/icons-material/QrCode";
import WorkIcon from "@mui/icons-material/Work";
import { useNavigate } from "react-router-dom";
import "./all.css"; // Ensure this file contains the background styling

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

  const handleOpen = (member) => {
    setSelectedMember(member);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        padding: { xs: 2, md: 4 },
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Back Button */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: "fixed",
          top: { xs: 12, md: 20 },
          left: { xs: 12, md: 20 },
          color: "#64748B",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          transition: "all 0.2s ease",
          zIndex:1000,
          "&:hover": {
            backgroundColor: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            transform: "translateY(-2px)"
          }
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      {/* Hero Section */}
      <Paper
        elevation={0}
        sx={{
          padding: { xs: 3, md: 6 },
          mb: 6,
          borderRadius: 3,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          textAlign: "center",
        }}
      >
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Event Manager
        </Typography>
        <Typography variant="h5" color="text.secondary" mb={4}>
          Revolutionizing how events come to life
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3} sx={{ maxWidth: 800, mx: "auto" }}>
          Event Manager is a comprehensive platform designed to transform the event planning process. 
          From conceptualization to execution, our platform provides all the tools necessary to create 
          memorable experiences while eliminating the logistical headaches traditionally associated 
          with event planning.
        </Typography>
      </Paper>

      {/* Features Section */}
      <Typography variant="h4" fontWeight="bold" mb={4} 
      sx={{textAlign:"center", boxShadow:20, padding:5, borderRadius:20, backgroundColor:"rgba(67, 148, 255, 0.8)", color:"white"}} >
        Platform Features
      </Typography>

      <Grid container spacing={3} sx={{ mb: 6 }}>
        {featuresList.map((feature, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Paper
              elevation={2}
              sx={{
                height: "100%",
                p: 3,
                display: "flex",
                flexDirection: "column",
                borderRadius: 2,
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

      {/* Additional Description */}
      <Paper
        elevation={1}
        sx={{
          p: 4,
          mb: 6,
          borderRadius: 2,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        }}
      >
        <Typography variant="h5" gutterBottom fontWeight="bold">
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

      {/* Team Section Divider */}
      <Divider sx={{ mb: 6, }}>
        <Chip label="Our Team" color="primary" />
      </Divider>
      <Paper
        id="myPaper"
        elevation={2}
        sx={{
          padding: { xs: 2, sm: 2 },
          textAlign: "center",
          alignSelf: "center",
          borderRadius: 20,
          width:"80%",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        }}
      >
      {/* Team Section Title */}
      <Typography variant="h4" fontWeight="bold" mb={2} 
      sx={{textAlign:"center", boxShadow:20, padding:5, borderRadius:20, backgroundColor:"rgba(67, 148, 255, 0.8)", color:"white"}} >
        Meet The Developers
      </Typography>
      

        {/* Team Members Cards */}
        <Box sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", md: "row" }, 
          gap: 2,
          justifyContent: "center", 
          flexWrap: "wrap",
          maxWidth: 1200, 
          mx: "auto", 
          mb: 8 
        }}>
          {teamMembers.map((member, index) => (
            <Card
              key={index}
              sx={{
                width: { xs: "100%", md: 350 },
                height: { md: 280 },
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                padding: 3,
                borderRadius: 2,
                boxShadow: 3,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: 6,
                },
              }}
              onClick={() => handleOpen(member)}
            >
              <Avatar
                src={member.image}
                alt={member.name}
                sx={{ width: 80, height: 80, marginRight: 2 }}
              />
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  {member.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {member.role}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {member.description}
                </Typography>
                <Typography variant="body2" color="primary" mt={1}>
                  Click for more details
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Paper>
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
                <Typography id="developer-detail-modal" variant="h5" component="h2" fontWeight="bold">
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
                  sx={{ width: 100, height: 100, mr: 3 }}
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
              
              <Typography variant="h6" fontWeight="bold" mt={2}>
                Expertise
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1, mb: 3 }}>
                {selectedMember.expertise.map((skill, index) => (
                  <Chip key={index} label={skill} color="primary" variant="outlined" />
                ))}
              </Box>
              
              <Typography variant="h6" fontWeight="bold">
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
  );
};

export default About;
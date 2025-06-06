import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Button,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Skeleton,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  LocationOn as LocationOnIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "./config/axiosconfig";
import StaticMap from "./components/StaticMap";
import PropTypes from 'prop-types';

const EventDetails = ({ themeMode = 'light' }) => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [qrCode, setQrCode] = useState("");
  
  // Add image loading and modal states
  const [mainImageLoading, setMainImageLoading] = useState(true);
  const [detailImageLoading, setDetailImageLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  // Add getCategoryColor function
  const getCategoryColor = (category) => {
    const categoryColors = {
      "Conference": "#3a86ff",
      "Workshop": "#ff006e",
      "Seminar": "#8338ec",
      "Networking": "#fb5607",
      "Training": "#ffbe0b",
      "Exhibition": "#38b000",
      "Concert": "#3a0ca3",
      "Other": "#757575"
    };

    return categoryColors[category] || "#757575";
  };

  useEffect(() => {
    fetchEventDetails();
    fetchRegisteredUsers();
    generateQRCode();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/events/${eventId}`);
      if (response.data && response.data.event) {
        const eventData = response.data.event;
        setEvent({
          event_id: eventData.event_id,
          name: eventData.name || '',
          date: eventData.date || '',
          location: eventData.location || '',
          organizer: eventData.organizer && typeof eventData.organizer === 'object' 
            ? eventData.organizer.organizer 
            : eventData.organizer || '',
          organizerId: eventData.organizer && typeof eventData.organizer === 'object'
            ? eventData.organizer.organizerId 
            : eventData.organizerId || '',
          price: eventData.price || 0,
          description: eventData.description || '',
          category: eventData.category || '',
          image: eventData.image || '',
          detailImage: eventData.detailImage || ''
        });
      } else {
        console.error("Invalid response format:", response.data);
        setSnackbar({
          open: true,
          message: "Invalid event data format",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to load event details",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRegisteredUsers = async () => {
    try {
      const response = await axios.get(`/api/events/${eventId}/users`);
      setRegisteredUsers(response.data);
      
      // Check if current user is registered
      const username = sessionStorage.getItem('username');
      const isUserRegistered = response.data.some(user => user.username === username);
      setIsRegistered(isUserRegistered);
    } catch (error) {
      console.error('Error fetching registered users:', error);
    }
  };

  const handleRegister = async () => {
    try {
      const username = sessionStorage.getItem('username');
      if (!username) {
        setSnackbar({
          open: true,
          message: "Please login to register for events",
          severity: "error",
        });
        return;
      }

      await axios.post('/api/event-users', {
        event_id: eventId,
        username: username
      });

      setIsRegistered(true);
      setSnackbar({
        open: true,
        message: "Successfully registered for the event!",
        severity: "success",
      });


      fetchRegisteredUsers();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to register for event",
        severity: "error",
      });
    }
  };

  const handleUnregister = async () => {
    try {
      const username = sessionStorage.getItem('username');
      await axios.delete('/api/event-users', {
        data: { event_id: eventId, username }
      });

      setIsRegistered(false);
      setSnackbar({
        open: true,
        message: "Successfully unregistered from the event",
        severity: "success",
      });

      fetchRegisteredUsers();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to unregister from event",
        severity: "error",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/events/${eventId}`);
      setSnackbar({
        open: true,
        message: "Event deleted successfully",
        severity: "success",
      });
      navigate("/events");
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to delete event",
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const generateQRCode = async () => {
    try {
      const response = await axios.post(`/api/qrcode/event/${eventId}`);
      
      if (response.data && response.data.qr_data_url) {
        setQrCode(response.data.qr_data_url);
      }
    } catch (error) {
      console.error("Error generating QR code:", error);
      setSnackbar({
        open: true,
        message: "Failed to generate QR code",
        severity: "error",
      });
    }
  };

  // Function to check if current user is the organizer of this event
  const isEventOrganizer = () => {
    const username = sessionStorage.getItem('username');
    if (!username || !event) return false;
    
    // Check if username matches the organizer identifier
    // This can be either organizerId directly or a match on the username stored in organizer field
    return (
      username === event.organizerId || 
      (typeof event.organizer === 'object' && event.organizer?.username === username)
    );
  };

  // Function to handle opening image modal
  const handleOpenImageModal = (imageUrl) => {
    setCurrentImage(imageUrl);
    setImageModalOpen(true);
  };

  // Function to handle closing image modal
  const handleCloseImageModal = () => {
    setImageModalOpen(false);
  };

  const renderSkeletonContent = () => (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: themeMode === 'dark' 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "url('./assets/bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: themeMode === 'dark' ? 0.05 : 0.1,
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton 
            variant="circular" 
            width={40} 
            height={40} 
            sx={{ 
              borderRadius: 1,
              bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
            }} 
          />
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                mb: 4,
                background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: "blur(10px)",
                border: themeMode === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.1)' 
                  : '1px solid rgba(0, 0, 0, 0.05)',
              }}
            >
              <Skeleton 
                variant="text" 
                width="60%" 
                height={48} 
                sx={{ 
                  mb: 2,
                  bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }} 
              />
              <Skeleton 
                variant="text" 
                width="100%" 
                height={24} 
                sx={{ 
                  mb: 1,
                  bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }} 
              />
              <Skeleton 
                variant="text" 
                width="90%" 
                height={24} 
                sx={{ 
                  mb: 1,
                  bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }} 
              />
              <Skeleton 
                variant="text" 
                width="80%" 
                height={24} 
                sx={{ 
                  mb: 4,
                  bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }} 
              />
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={300} 
                sx={{ 
                  borderRadius: 2, 
                  mb: 4,
                  bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }} 
              />
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={250} 
                sx={{ 
                  borderRadius: 2,
                  bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }} 
              />
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: "blur(10px)",
                border: themeMode === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.1)' 
                  : '1px solid rgba(0, 0, 0, 0.05)',
              }}
            >
              <Skeleton 
                variant="text" 
                width="40%" 
                height={32} 
                sx={{ 
                  mb: 3,
                  bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }} 
              />
              {[1, 2, 3, 4, 5].map((item) => (
                <Box key={item} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Skeleton 
                    variant="circular" 
                    width={36} 
                    height={36} 
                    sx={{ 
                      mr: 2,
                      bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    }} 
                  />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton 
                      variant="text" 
                      width="30%" 
                      height={20} 
                      sx={{ 
                        mb: 0.5,
                        bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      }} 
                    />
                    <Skeleton 
                      variant="text" 
                      width="60%" 
                      height={24} 
                      sx={{ 
                        bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      }} 
                    />
                  </Box>
                </Box>
              ))}
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={1} 
                sx={{ 
                  my: 3,
                  bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }} 
              />
              <Skeleton 
                variant="text" 
                width="50%" 
                height={24} 
                sx={{ 
                  mb: 2,
                  bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }} 
              />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                {[1, 2, 3, 4, 5].map((item) => (
                  <Skeleton 
                    key={item} 
                    variant="circular" 
                    width={32} 
                    height={32} 
                    sx={{ 
                      bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                    }} 
                  />
                ))}
              </Box>
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={1} 
                sx={{ 
                  my: 3,
                  bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }} 
              />
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  display: 'inline-block',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Skeleton 
                  variant="rectangular" 
                  width={200} 
                  height={200} 
                  sx={{ 
                    borderRadius: 2,
                    bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  }} 
                />
              </Box>
              <Skeleton 
                variant="rectangular" 
                width="100%" 
                height={48} 
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }} 
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );

  if (loading) {
    return renderSkeletonContent();
  }

  if (!event) {
    return (
      <Container>
        <Typography variant="h5">Event not found</Typography>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: themeMode === 'dark' 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "url('./assets/bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: themeMode === 'dark' ? 0.05 : 0.1,
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
      <Box sx={{ mb: 4 }}>
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{
              color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
              '&:hover': {
                background: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              }
            }}
          >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
            {/* Main Detail Image */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                mb: 4,
                overflow: 'hidden',
                background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: "blur(10px)",
                border: themeMode === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.1)' 
                  : '1px solid rgba(0, 0, 0, 0.05)',
                height: 400,
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.01)',
                }
              }}
              onClick={() => handleOpenImageModal(event.image)}
            >
              {mainImageLoading && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.5)',
                  }}
                >
                  <CircularProgress size={40} />
                </Box>
              )}
              <Box
                component="img"
                  src={event.image}
                  alt={event.name}
                onLoad={() => setMainImageLoading(false)}
                onError={(e) => {
                  setMainImageLoading(false);
                  e.target.src = "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg";
                }}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 2,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))',
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" color="white">
                  {event.name} - {event.category}
                </Typography>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                mb: 4,
                background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: "blur(10px)",
                border: themeMode === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.1)' 
                  : '1px solid rgba(0, 0, 0, 0.05)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Chip
                  label={event.category}
                  sx={{
                    mr: 2,
                    fontWeight: 600,
                    color: "white",
                    backgroundColor: getCategoryColor(event.category),
                  }}
                />
                <Typography 
                  variant="h4" 
                  fontWeight="bold" 
                  gutterBottom
                  sx={{
                    color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
                  }}
                >
                  {event.name}
                </Typography>
              </Box>
              
              <Typography 
                variant="body1" 
                paragraph
                sx={{
                  color: themeMode === 'dark' ? 'text.secondary' : 'text.primary',
                  mb: 4
                }}
              >
                {event.description || "No description available."}
              </Typography>

              {event.detailImage && (
                <Box sx={{ mt: 4, mb: 4, position: 'relative' }}>
                  {detailImageLoading && (
                    <Skeleton 
                      variant="rectangular" 
                      width="100%" 
                      height={300} 
                      sx={{ 
                        borderRadius: '12px',
                        bgcolor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                      }} 
                    />
                  )}
                  <Box 
                    component="img"
                  src={event.detailImage}
                  alt={`${event.name} details`}
                    onLoad={() => setDetailImageLoading(false)}
                    onClick={() => handleOpenImageModal(event.detailImage)}
                    sx={{ 
                      width: '100%', 
                      borderRadius: '12px',
                      display: detailImageLoading ? 'none' : 'block',
                      boxShadow: themeMode === 'dark' 
                        ? '0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1)'
                        : '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)',
                      cursor: 'pointer',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.01)'
                      }
                    }}
                />
              </Box>
            )}

              {event.latitude && event.longitude && (
              <Box sx={{ mt: 4 }}>
                  <Typography 
                    variant="h5" 
                    fontWeight="bold" 
                    gutterBottom
                    sx={{
                      color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
                    }}
                  >
                  Event Location
                </Typography>
                <Box
                  sx={{
                      border: themeMode === 'dark' 
                        ? '1px solid rgba(255, 255, 255, 0.1)' 
                        : '1px solid rgba(0, 0, 0, 0.05)',
                    borderRadius: 2,
                    height: "250px",
                    mb: 2,
                      overflow: "hidden",
                      boxShadow: themeMode === 'dark' 
                        ? '0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1)'
                        : '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)',
                  }}
                >
                  <StaticMap
                    open={true}
                    embedded={true}
                    onClose={() => {}}
                    latitude={event.latitude}
                    longitude={event.longitude}
                  />
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
                background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: "blur(10px)",
                border: themeMode === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.1)' 
                  : '1px solid rgba(0, 0, 0, 0.05)',
              }}
            >
              <Typography 
                variant="h6" 
                fontWeight="600" 
                gutterBottom
                sx={{
                  color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
                }}
              >
              Event Details
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.2)' : 'rgba(58, 134, 255, 0.1)', 
                      width: 36, 
                      height: 36, 
                      mr: 2 
                    }}
                  >
                    <AccessTimeIcon sx={{ color: themeMode === 'dark' ? 'primary.light' : 'primary.main', fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Date & Time
                  </Typography>
                    <Typography 
                      variant="body1" 
                      fontWeight="500"
                      sx={{
                        color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
                      }}
                    >
                    {event?.date ? new Date(event.date).toLocaleDateString() : "Date TBD"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.2)' : 'rgba(58, 134, 255, 0.1)', 
                      width: 36, 
                      height: 36, 
                      mr: 2 
                    }}
                  >
                    <LocationOnIcon sx={{ color: themeMode === 'dark' ? 'primary.light' : 'primary.main', fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Location
                  </Typography>
                    <Typography 
                      variant="body1" 
                      fontWeight="500"
                      sx={{
                        color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
                      }}
                    >
                    {event?.location || "Location TBD"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.2)' : 'rgba(58, 134, 255, 0.1)', 
                      width: 36, 
                      height: 36, 
                      mr: 2 
                    }}
                  >
                    <CategoryIcon sx={{ color: themeMode === 'dark' ? 'primary.light' : 'primary.main', fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                    <Typography 
                      variant="body1" 
                      fontWeight="500"
                      sx={{
                        color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
                      }}
                    >
                    {event?.category || "Uncategorized"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.2)' : 'rgba(58, 134, 255, 0.1)', 
                      width: 36, 
                      height: 36, 
                      mr: 2 
                    }}
                  >
                    <PersonIcon sx={{ color: themeMode === 'dark' ? 'primary.light' : 'primary.main', fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Organizer
                  </Typography>
                    <Typography 
                      variant="body1" 
                      fontWeight="500"
                      sx={{
                        color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
                      }}
                    >
                    {event?.organizer || "Not specified"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.2)' : 'rgba(58, 134, 255, 0.1)', 
                      width: 36, 
                      height: 36, 
                      mr: 2 
                    }}
                  >
                    <AttachMoneyIcon sx={{ color: themeMode === 'dark' ? 'primary.light' : 'primary.main', fontSize: 20 }} />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Price
                  </Typography>
                    <Typography 
                      variant="body1" 
                      fontWeight="500"
                      sx={{
                        color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
                      }}
                    >
                    {event?.price ? `$${event.price.toFixed(2)}` : "Free"}
                  </Typography>
                </Box>
              </Box>
            </Box>

              <Divider 
                sx={{ 
                  my: 3,
                  borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }} 
              />

            <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="600" 
                  gutterBottom
                  sx={{
                    color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
                  }}
                >
                Registered Users ({registeredUsers.length})
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {registeredUsers.map((user) => (
                  <Avatar
                    key={user.username}
                      sx={{ 
                        width: 32, 
                        height: 32,
                        bgcolor: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.2)' : 'rgba(58, 134, 255, 0.1)',
                        color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                      }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                ))}
              </Box>
            </Box>

              <Divider 
                sx={{ 
                  my: 3,
                  borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                }} 
              />

            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography 
                  variant="subtitle1" 
                  fontWeight="600" 
                  gutterBottom
                  sx={{
                    color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
                  }}
                >
                Event QR Code
              </Typography>
              {qrCode ? (
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      display: 'inline-block',
                    }}
                  >
                <img
                  src={qrCode}
                  alt="Event QR Code"
                      style={{ width: '200px', height: '200px' }}
                    />
                  </Box>
                ) : (
                  <Box 
                    sx={{ 
                      height: '200px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderRadius: 2,
                    }}
                  >
                  <Typography variant="body2" color="text.secondary">
                    Loading QR code...
                  </Typography>
                </Box>
              )}
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  display="block" 
                  sx={{ mt: 1 }}
                >
                Scan to view this event on gitbam.vercel.app
              </Typography>
            </Box>

              {/* Only show register/unregister buttons if not the organizer */}
              {!isEventOrganizer() ? (
                isRegistered ? (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                size="large"
                onClick={handleUnregister}
                    sx={{ 
                      mb: 2,
                      borderColor: themeMode === 'dark' ? 'error.light' : 'error.main',
                      color: themeMode === 'dark' ? 'error.light' : 'error.main',
                      '&:hover': {
                        borderColor: themeMode === 'dark' ? 'error.main' : 'error.dark',
                        background: themeMode === 'dark' ? 'rgba(211, 47, 47, 0.1)' : 'rgba(211, 47, 47, 0.05)',
                      }
                    }}
              >
                UNREGISTER
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                onClick={handleRegister}
                    sx={{ 
                      mb: 2,
                      background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)',
                      }
                    }}
              >
                REGISTER NOW
                  </Button>
                )
              ) : (
                <Button
                  variant="outlined"
                  disabled
                  fullWidth
                  size="large"
                  sx={{ 
                    mb: 2,
                    opacity: 0.7
                  }}
                >
                  YOU ARE THE ORGANIZER
              </Button>
            )}

              {isEventOrganizer() && (
              <Button
                variant="outlined"
                color="error"
                fullWidth
                size="large"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
                  sx={{
                    borderColor: themeMode === 'dark' ? 'error.light' : 'error.main',
                    color: themeMode === 'dark' ? 'error.light' : 'error.main',
                    '&:hover': {
                      borderColor: themeMode === 'dark' ? 'error.main' : 'error.dark',
                      background: themeMode === 'dark' ? 'rgba(211, 47, 47, 0.1)' : 'rgba(211, 47, 47, 0.05)',
                    }
                  }}
              >
                DELETE EVENT
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>

        {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{
            sx: {
              background: themeMode === 'dark' ? '#1e293b' : '#ffffff',
              borderRadius: 3,
            }
          }}
      >
        <DialogTitle>Delete Event</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this event? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
              sx={{
                color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDelete} 
              color="error"
              sx={{
                color: themeMode === 'dark' ? 'error.light' : 'error.main',
              }}
            >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

        {/* Image Modal */}
        <Dialog
          open={imageModalOpen}
          onClose={handleCloseImageModal}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: "blur(10px)",
              overflow: 'hidden',
              p: 0,
            }
          }}
        >
          <Box sx={{ position: 'relative', width: '100%', height: '80vh' }}>
            <IconButton
              onClick={handleCloseImageModal}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                zIndex: 10,
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)',
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box
              component="img"
              src={currentImage}
              alt="Event Image"
              onError={(e) => {
                e.target.src = "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg";
              }}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </Box>
        </Dialog>

        {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
            sx={{ 
              width: "100%",
              background: themeMode === 'dark' ? '#1e293b' : '#ffffff',
              color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
              '& .MuiAlert-icon': {
                color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
              }
            }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
    </Box>
  );
};

EventDetails.propTypes = {
  themeMode: PropTypes.string
};

export default EventDetails; 
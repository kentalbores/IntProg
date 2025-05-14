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
  Card,
  CardContent,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  LocationOn as LocationOnIcon,
  Category as CategoryIcon,
  AttachMoney as AttachMoneyIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Store as StoreIcon,
  Image as ImageIcon,
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "./config/axiosconfig";
import Loading from "./components/Loading";
import PropTypes from 'prop-types';

const ServiceDetails = ({ themeMode = 'light' }) => {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  
  // Add new state for booking functionality
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    eventId: '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [userEvents, setUserEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [bookingErrors, setBookingErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mainImageLoading, setMainImageLoading] = useState(true);
  const [thumbnailImageLoading, setThumbnailImageLoading] = useState(true);
  
  // Image zoom modal states
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState("");

  useEffect(() => {
    fetchServiceDetails();
  }, [serviceId]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/services/${serviceId}`);
      console.log("Service details full response:", response);
      console.log("Service details response data:", response.data);
      
      if (response.data && response.data.service) {
        const serviceData = response.data.service;
        console.log("Service complete data:", serviceData);
        console.log("Service vendor data:", serviceData.vendor);
        console.log("Service pricing options:", serviceData.pricingOptions);
        
        // Look for ObjectID in the service or vendor
        if (serviceData._id) {
          console.log("Service _id:", serviceData._id);
        }
        if (serviceData.vendor && serviceData.vendor._id) {
          console.log("Vendor _id:", serviceData.vendor._id);
        }
        
        setService(response.data.service);
      } else {
        setSnackbar({
          open: true,
          message: "Service not found",
          severity: "error",
        });
        navigate("/services"); // Redirect to services page
      }
    } catch (error) {
      console.error("Error fetching service details:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to load service details",
        severity: "error",
      });
      
      // Redirect to services page after a delay
      setTimeout(() => {
        navigate("/services");
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const username = sessionStorage.getItem('username');
      if (!username) {
        throw new Error("User not logged in");
      }
      
      await axios.delete(`/api/vendors/${username}/services/${serviceId}`);
      setSnackbar({
        open: true,
        message: "Service deleted successfully",
        severity: "success",
      });
      setTimeout(() => {
        navigate("/vendor-services");
      }, 1500);
    } catch (err) {
      console.error("Error deleting service:", err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || "Failed to delete service",
        severity: "error",
      });
    }
    setDeleteDialogOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const userIsVendor = () => {
    if (!service || !service.vendor) return false;
    
    const username = sessionStorage.getItem('username');
    // Assuming the vendor has a username property or can be compared directly
    return username === service.vendor.name;
  };

  const getPricingTypeLabel = (type) => {
    const types = {
      'hourly': 'Per Hour',
      'daily': 'Per Day',
      'fixed': 'Fixed Rate',
      'tiered': 'Tiered Package'
    };
    return types[type] || type;
  };

  const getCategoryColor = (category) => {
    const categoryColors = {
      "Catering": "#3a86ff",
      "Venue": "#ff006e",
      "Photography": "#8338ec",
      "Decoration": "#fb5607",
      "Entertainment": "#ffbe0b",
      "Transportation": "#38b000",
      "Equipment": "#3a0ca3",
      "Other": "#757575"
    };

    return categoryColors[category] || "#757575";
  };

  // Fetch user's events for booking dialog
  const fetchUserEvents = async () => {
    try {
      setLoadingEvents(true);
      const username = sessionStorage.getItem('username');
      if (!username) {
        throw new Error("User not logged in");
      }
      
      // Get the endpoint that works in OrganizerEvents.jsx
      const response = await axios.get(`/api/organizer/events/${username}`);
      
      console.log("Events API response:", response.data);
      
      if (response.data && response.data.events) {
        setUserEvents(response.data.events);
      } else {
        // Fallback to empty array if no events found
        setUserEvents([]);
      }
    } catch (error) {
      console.error("Error fetching user events:", error);
      setSnackbar({
        open: true,
        message: "Failed to load your events. Please try again.",
        severity: "error",
      });
      // Set to empty array on error
      setUserEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Handle opening the booking dialog
  const handleOpenBooking = (pricingOption) => {
    console.log("Selected pricing option:", pricingOption);
    
    // Add an ID to the pricing option if it's missing
    if (!pricingOption.id && !pricingOption._id) {
      // Find the index of this pricing option in the service's options
      const index = service.pricingOptions.findIndex(option => 
        option.label === pricingOption.label && 
        option.amount === pricingOption.amount &&
        option.type === pricingOption.type
      );
      
      // Add an ID based on the index
      pricingOption.id = String(index >= 0 ? index : 0);
    }
    
    setSelectedPricing(pricingOption);
    fetchUserEvents();
    setBookingDialogOpen(true);
  };

  // Handle booking input changes
  const handleBookingChange = (field, value) => {
    setBookingDetails(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user types
    if (bookingErrors[field]) {
      setBookingErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Validate booking form
  const validateBookingForm = () => {
    const errors = {};
    
    if (!bookingDetails.eventId) {
      errors.eventId = 'Please select an event';
    }
    
    if (!bookingDetails.startDate) {
      errors.startDate = 'Please select a start date';
    }
    
    if (selectedPricing?.type !== 'fixed' && !bookingDetails.endDate) {
      errors.endDate = 'Please select an end date';
    }
    
    setBookingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit booking
  const handleSubmitBooking = async () => {
    if (!validateBookingForm()) return;
    
    try {
      setIsSubmitting(true);
      
      // Extract vendor ID from service.vendor - should work with both vendorId (number) or _id (ObjectId string)
      let vendorId = null;
      
      if (service.vendor) {
        console.log("Vendor data in service:", service.vendor);
        if (service.vendor.vendorId) {
          vendorId = service.vendor.vendorId;  // Numeric ID
        } else if (service.vendor._id) {
          vendorId = service.vendor._id;  // MongoDB ObjectID string
        } else if (typeof service.vendor === 'string') {
          vendorId = service.vendor;  // Direct string reference
        } else {
          console.error("Cannot determine vendor ID from service:", service.vendor);
        }
      }
      
      // Make sure we have a string ID for the pricing option
      const pricingId = selectedPricing?.id || 
                        (selectedPricing?._id ? selectedPricing._id : 
                         String(service.pricingOptions.findIndex(p => 
                           p.label === selectedPricing?.label && 
                           p.amount === selectedPricing?.amount)));
      
      const bookingData = {
        eventId: parseInt(bookingDetails.eventId),
        vendorId: vendorId,
        serviceId: parseInt(service.serviceId),
        pricingId: pricingId,
        startDate: bookingDetails.startDate,
        endDate: bookingDetails.endDate || bookingDetails.startDate,
        notes: bookingDetails.notes,
        status: 'pending'
      };
      
      console.log("Booking data being sent:", bookingData);
      
      // Check if required fields are available
      if (!bookingData.vendorId) {
        throw new Error("Vendor ID is missing. Please try again or contact support.");
      }
      
      if (!bookingData.pricingId && bookingData.pricingId !== 0) {
        throw new Error("Pricing option ID is missing. Please try again.");
      }
      
      // Fixed endpoint to match the actual route in event.js router
      const response = await axios.post('/api/events/event-vendors', bookingData);
      console.log("Booking response:", response.data);
      
      setSnackbar({
        open: true,
        message: "Service booked successfully! The vendor will confirm your booking soon.",
        severity: "success",
      });
      
      setBookingDialogOpen(false);
      
      // Reset booking form
      setBookingDetails({
        eventId: '',
        startDate: '',
        endDate: '',
        notes: '',
      });
      
    } catch (error) {
      console.error("Error booking service:", error);
      
      // More detailed error message
      const errorMessage = error.response?.data?.error || error.message || "Failed to book service. Please try again.";
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user is an organizer
  const userIsOrganizer = () => {
    const username = sessionStorage.getItem('username');
    if (!username) return false;
    
    // Get the role from sessionStorage
    const userRole = sessionStorage.getItem('userRole');
    
    // Check if user has organizer role (handling both array and string cases)
    try {
      if (userRole) {
        try {
          // Try to parse as JSON (for array case)
          const parsedRole = JSON.parse(userRole);
          if (Array.isArray(parsedRole)) {
            return parsedRole.includes('organizer');
          }
        } catch {
          // If not JSON, treat as string
          return userRole === 'organizer';
        }
      }
      
      // Fallback to checking localStorage as well
      const roles = localStorage.getItem('userRoles');
      if (roles) {
        try {
          const parsedRoles = JSON.parse(roles);
          return Array.isArray(parsedRoles) && parsedRoles.includes('organizer');
        } catch {
          return false;
        }
      }
    } catch (error) {
      console.error("Error checking organizer role:", error);
    }
    
    return false;
  };

  // Calculate the estimated cost for a booking
  const calculateEstimatedCost = () => {
    if (!selectedPricing || !bookingDetails.startDate) return 0;
    
    // For fixed pricing, just return the amount
    if (selectedPricing.type === 'fixed') {
      return selectedPricing.amount;
    }
    
    // Calculate duration based on start and end dates
    const start = new Date(bookingDetails.startDate);
    const end = bookingDetails.endDate ? new Date(bookingDetails.endDate) : new Date(bookingDetails.startDate);
    
    // Calculate the difference in days
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // Minimum 1 day
    
    if (selectedPricing.type === 'daily') {
      return selectedPricing.amount * diffDays;
    } else if (selectedPricing.type === 'hourly') {
      // Assume 8 hours per day for hourly calculations
      return selectedPricing.amount * diffDays * 8;
    }
    
    return selectedPricing.amount;
  };

  // Handler to open image in modal
  const handleOpenImageModal = (imageSrc) => {
    setModalImage(imageSrc);
    setImageModalOpen(true);
  };

  if (loading) {
    return <Loading />;
  }

  if (!service) {
    return (
      <Container>
        <Typography variant="h5">Service not found</Typography>
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
              onClick={() => handleOpenImageModal(service.detailImage || service.image)}
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
                src={service.detailImage || service.image}
                alt={service.name}
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
                  {service.name} - {service.category}
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
                  label={service.category}
                  sx={{
                    mr: 2,
                    fontWeight: 600,
                    color: "white",
                    backgroundColor: getCategoryColor(service.category),
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
                  {service.name}
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
                {service.description || "No description available."}
              </Typography>

              <Typography 
                variant="h5" 
                fontWeight="bold" 
                gutterBottom
                sx={{
                  color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
                  mb: 3
                }}
              >
                Pricing Options
              </Typography>

              <Grid container spacing={3}>
                {service.pricingOptions.map((option, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card 
                      elevation={0}
                      sx={{
                        borderRadius: 2,
                        height: '100%',
                        background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                        border: themeMode === 'dark' 
                          ? '1px solid rgba(255,255,255,0.1)' 
                          : '1px solid rgba(0,0,0,0.05)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: themeMode === 'dark'
                            ? '0 10px 20px rgba(0,0,0,0.3)'
                            : '0 10px 20px rgba(0,0,0,0.1)',
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" fontWeight="bold">
                            {option.label}
                          </Typography>
                          <Chip 
                            label={getPricingTypeLabel(option.type)} 
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        
                        <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                          ${option.amount}
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            {option.type === 'hourly' && '/ hour'}
                            {option.type === 'daily' && '/ day'}
                          </Typography>
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {option.description || 'No additional details provided.'}
                        </Typography>
                        
                        {/* Only show Book This Option button if user is not the vendor */}
                        {!userIsVendor() ? (
                          <Button 
                            variant="contained" 
                            fullWidth
                            disabled={!isLoggedIn() || !userIsOrganizer()}
                            onClick={() => handleOpenBooking(option)}
                            sx={{
                              mt: 2,
                              borderRadius: 2,
                              py: 1,
                              background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                              '&:hover': {
                                background: "linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)",
                              }
                            }}
                          >
                            {isLoggedIn() 
                              ? userIsOrganizer() 
                                ? "Book this option" 
                                : "Organizer role required"
                              : "Login to book"}
                          </Button>
                        ) : (
                          <Button 
                            variant="outlined" 
                            fullWidth
                            disabled
                            sx={{
                              mt: 2,
                              borderRadius: 2,
                              py: 1,
                              opacity: 0.6
                            }}
                          >
                            Your service
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
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
                Service Details
              </Typography>

              {/* Service Thumbnail Image */}
              <Box 
                sx={{ 
                  width: '100%', 
                  height: 200, 
                  borderRadius: 2, 
                  overflow: 'hidden',
                  mb: 3,
                  border: themeMode === 'dark' 
                    ? '1px solid rgba(255,255,255,0.1)' 
                    : '1px solid rgba(0,0,0,0.05)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  }
                }}
                onClick={() => service.image && !service.image.includes("Placeholder") && handleOpenImageModal(service.image)}
              >
                {thumbnailImageLoading && (
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
                      zIndex: 2,
                    }}
                  >
                    <CircularProgress size={30} />
                  </Box>
                )}
                <Box
                  component="img"
                  src={service.image}
                  alt={service.name}
                  onLoad={() => setThumbnailImageLoading(false)}
                  onError={(e) => {
                    setThumbnailImageLoading(false);
                    e.target.onerror = null;
                    e.target.src = "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg";
                  }}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {(!service.image || service.image.includes("Placeholder")) && !thumbnailImageLoading && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(241, 245, 249, 0.7)',
                      zIndex: 1,
                    }}
                  >
                    <ImageIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No image available
                    </Typography>
                  </Box>
                )}
              </Box>

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
                      {service.category || "Uncategorized"}
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
                    <StoreIcon sx={{ color: themeMode === 'dark' ? 'primary.light' : 'primary.main', fontSize: 20 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Vendor
                    </Typography>
                    <Typography 
                      variant="body1" 
                      fontWeight="500"
                      sx={{
                        color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
                      }}
                    >
                      {service.vendor?.name || "Unknown Vendor"}
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
                      {service.vendor?.address || "Address not provided"}
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
                      Starting Price
                    </Typography>
                    <Typography 
                      variant="body1" 
                      fontWeight="500"
                      sx={{
                        color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
                      }}
                    >
                      ${Math.min(...service.pricingOptions.map(option => option.amount))}
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
                  Contact Vendor
                </Typography>
                {!userIsVendor() ? (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    size="large"
                    sx={{ 
                      mb: 2,
                      background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)',
                      }
                    }}
                  >
                    Contact Now
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    size="large"
                    disabled
                    sx={{ 
                      mb: 2,
                      opacity: 0.6
                    }}
                  >
                    This is your service
                  </Button>
                )}
              </Box>

              {userIsVendor() && (
                <>
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
                      Vendor Actions
                    </Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      size="large"
                      onClick={() => navigate(`/edit-service/${service.serviceId}`)}
                      sx={{ 
                        mb: 2,
                        borderColor: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                        color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                        '&:hover': {
                          borderColor: themeMode === 'dark' ? 'primary.main' : 'primary.dark',
                          background: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.1)' : 'rgba(58, 134, 255, 0.05)',
                        }
                      }}
                    >
                      Edit Service
                    </Button>
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
                      Delete Service
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Add the booking dialog */}
        <Dialog
          open={bookingDialogOpen}
          onClose={() => setBookingDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: "blur(10px)",
            }
          }}
        >
          <DialogTitle 
            sx={{ pb: 1 }}
            component="div"
          >
            <Typography component="div" variant="h5" fontWeight="bold">Book Service</Typography>
            <Typography variant="body2" color="text.secondary">
              {service?.name} - {selectedPricing?.label} (${selectedPricing?.amount} {getPricingTypeLabel(selectedPricing?.type)})
            </Typography>
          </DialogTitle>
          
          <DialogContent sx={{ pb: 2 }}>
            <Typography variant="body2" sx={{ mb: 3 }}>
              You&apos;re about to book <strong>{service?.name}</strong> provided by <strong>{service?.vendor?.name || "Unknown Vendor"}</strong>. Please select which event you want to book this service for and specify the dates needed.
            </Typography>
            
            <Accordion 
              sx={{ 
                mb: 3,
                background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.3)' : 'rgba(241, 245, 249, 0.5)',
                borderRadius: '8px !important',
                '&:before': { display: 'none' },
                boxShadow: 'none',
                border: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{ borderRadius: 2 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <InfoIcon sx={{ mr: 1, color: 'primary.main', fontSize: 20 }} />
                  <Typography variant="subtitle2">How does the booking process work?</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  When you book a service, the vendor will need to confirm your booking. Here&apos;s how the process works:
                </Typography>
                <Box component="ol" sx={{ pl: 2, mt: 1 }}>
                  <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Submit booking request</strong>: Select an event, specify dates, and add any special requirements.
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Vendor review</strong>: The vendor will review your booking details and check availability.
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Confirmation</strong>: Once confirmed, you&apos;ll receive a notification and the service will appear in your event dashboard.
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary">
                    <strong>Communication</strong>: You can message the vendor directly for any specific requirements.
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
            
            {loadingEvents ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={30} />
              </Box>
            ) : userEvents.length === 0 ? (
              <Box sx={{ py: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  You don&apos;t have any events yet. Create an event first to book this service.
                </Alert>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  To book this service, you need to associate it with one of your events. Creating an event allows you to:
                </Typography>
                <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Organize all your event services in one place
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Track bookings and schedules efficiently
                  </Typography>
                  <Typography component="li" variant="body2" color="text.secondary">
                    Manage communication with multiple vendors
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => {
                    setBookingDialogOpen(false);
                    navigate('/add-event');
                  }}
                  sx={{
                    background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                    color: 'white',
                    '&:hover': {
                      background: "linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)",
                    }
                  }}
                >
                  Create Event
                </Button>
              </Box>
            ) : (
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth error={!!bookingErrors.eventId} sx={{ mb: 3 }}>
                  <InputLabel id="event-select-label">Select Event</InputLabel>
                  <Select
                    labelId="event-select-label"
                    value={bookingDetails.eventId}
                    label="Select Event"
                    onChange={(e) => handleBookingChange('eventId', e.target.value)}
                  >
                    {userEvents.map((event) => (
                      <MenuItem key={event.event_id} value={event.event_id}>
                        {event.name} - {new Date(event.date).toLocaleDateString()}
                      </MenuItem>
                    ))}
                  </Select>
                  {bookingErrors.eventId && (
                    <FormHelperText error>{bookingErrors.eventId}</FormHelperText>
                  )}
                </FormControl>
                
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      type="date"
                      value={bookingDetails.startDate}
                      onChange={(e) => handleBookingChange('startDate', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      error={!!bookingErrors.startDate}
                      helperText={bookingErrors.startDate}
                    />
                  </Grid>
                  
                  {selectedPricing?.type !== 'fixed' && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="End Date"
                        type="date"
                        value={bookingDetails.endDate}
                        onChange={(e) => handleBookingChange('endDate', e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        error={!!bookingErrors.endDate}
                        helperText={bookingErrors.endDate}
                      />
                    </Grid>
                  )}
                </Grid>
                
                {bookingDetails.startDate && (
                  <Box 
                    sx={{ 
                      my: 2, 
                      p: 2, 
                      borderRadius: 2, 
                      bgcolor: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.3)' : 'rgba(241, 245, 249, 0.5)',
                      border: themeMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.05)',
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      Estimated Cost
                    </Typography>
                    
                    {selectedPricing?.type === 'fixed' ? (
                      <Typography variant="body2">
                        Fixed rate: <strong>${calculateEstimatedCost()}</strong>
                      </Typography>
                    ) : selectedPricing?.type === 'hourly' ? (
                      <>
                        <Typography variant="body2">
                          ${selectedPricing.amount} × 8 hours × {
                            bookingDetails.endDate 
                              ? Math.ceil(Math.abs(new Date(bookingDetails.endDate) - new Date(bookingDetails.startDate)) / (1000 * 60 * 60 * 24)) || 1
                              : 1
                          } day(s) = <strong>${calculateEstimatedCost()}</strong>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          (Based on standard 8-hour work day)
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2">
                        ${selectedPricing.amount} × {
                          bookingDetails.endDate 
                            ? Math.ceil(Math.abs(new Date(bookingDetails.endDate) - new Date(bookingDetails.startDate)) / (1000 * 60 * 60 * 24)) || 1
                            : 1
                        } day(s) = <strong>${calculateEstimatedCost()}</strong>
                      </Typography>
                    )}
                    
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Note: Final pricing may vary based on actual service duration and any additional services requested.
                    </Typography>
                  </Box>
                )}
                
                <TextField
                  fullWidth
                  label="Additional Notes"
                  multiline
                  rows={4}
                  value={bookingDetails.notes}
                  onChange={(e) => handleBookingChange('notes', e.target.value)}
                  placeholder="Any special requirements or details the vendor should know"
                  sx={{ mb: 2 }}
                />
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setBookingDialogOpen(false)}
              sx={{
                color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained"
              disabled={userEvents.length === 0 || isSubmitting}
              onClick={handleSubmitBooking}
              sx={{
                background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                color: 'white',
                '&:hover': {
                  background: "linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)",
                }
              }}
            >
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </Button>
          </DialogActions>
        </Dialog>

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
          <DialogTitle component="div">Delete Service</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this service? This action cannot be undone.
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
          onClose={() => setImageModalOpen(false)}
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
              onClick={() => setImageModalOpen(false)}
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
              src={modalImage}
              alt="Service Image"
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

// Helper function to check if user is logged in
const isLoggedIn = () => {
  return Boolean(sessionStorage.getItem("username"));
};

ServiceDetails.propTypes = {
  themeMode: PropTypes.string
};

export default ServiceDetails; 
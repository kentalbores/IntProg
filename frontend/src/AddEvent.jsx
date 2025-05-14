import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Divider,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useNavigate, useParams } from "react-router-dom";
import axios from "./config/axiosconfig";
import LocationPicker from "./components/LocationPicker";
import StaticMap from "./components/StaticMap";
import Navbar from "./components/Navbar";
import NavDrawer from "./components/NavDrawer";
import PropTypes from 'prop-types';

const AddEvent = ({ themeMode, isEditMode = false }) => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [user] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [loading, setLoading] = useState(true);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [newEvent, setNewEvent] = useState({
    name: "",
    date: "",
    location: "",
    latitude: 10.3518,
    longitude: 123.9053,
    organizerId: "",
    organizer: "",
    address: "",
    price: "free",
    paidAmount: "",
    description: "",
    category: "",
    image: "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg",
    detailImage: "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg",
  });

  // Validation state
  const [errors, setErrors] = useState({
    description: false,
    price: false,
  });

  const [pickerOpen, setPickerOpen] = useState(false);

  const categories = [
    "Conference",
    "Workshop",
    "Seminar",
    "Exhibition",
    "Concert",
    "Sports",
    "Networking",
    "Other",
  ];

  const handleLocationSelect = (location) => {
    setNewEvent({
      ...newEvent,
      location: location.name || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
      latitude: location.lat,
      longitude: location.lng,
    });
    setPickerOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "price") {
      setNewEvent({
        ...newEvent,
        price: value,
        // Reset paidAmount if switching to free
        paidAmount: value === "free" ? "" : newEvent.paidAmount,
      });
      return;
    }
    
    // Validate description field
    if (name === "description") {
      setErrors({
        ...errors,
        description: value.length < 10,
      });
    }
    
    // Validate price field
    if (name === "paidAmount") {
      const numValue = parseFloat(value);
      setErrors({
        ...errors,
        price: isNaN(numValue) || numValue <= 0,
      });
    }
    
    setNewEvent({
      ...newEvent,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {
      description: (newEvent.description.length < 10),
      price: (newEvent.price === "paid" && (!newEvent.paidAmount || parseFloat(newEvent.paidAmount) <= 0)),
    };
    
    setErrors(newErrors);
    
    // Return true if no errors exist
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmitEvent = async () => {
    // Validate required fields
    if (!newEvent.name || !newEvent.date || !newEvent.category) {
      setSnackbar({
        open: true,
        message: "Event name, date, and category are required!",
        severity: "error",
      });
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: "Please fix all validation errors before submitting!",
        severity: "error",
      });
      return;
    }

    try {
      // Prepare event data
      const eventData = {
        ...newEvent,
        // Set price based on selection
        price: newEvent.price === "free" ? 0 : parseFloat(newEvent.paidAmount),
      };
      
      delete eventData.paidAmount; // Remove extra field
      
      // If in edit mode, add the event_id to the request
      if (isEditMode && eventId) {
        eventData.event_id = parseInt(eventId);
      }
      
      await axios.post("/api/events", eventData);

      setSnackbar({
        open: true,
        message: isEditMode ? "Event updated successfully!" : "Event added successfully!",
        severity: "success",
      });

      // Navigate back to events page after successful operation
      setTimeout(() => {
        navigate("/organizer-events");
      }, 1500);
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} event:`, error);
      setSnackbar({
        open: true,
        message: `Failed to ${isEditMode ? 'update' : 'add'} event. Please try again.`,
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };
  
  // Fetch event data for editing
  const fetchEventForEdit = async (id) => {
    try {
      const response = await axios.get(`/api/events/${id}`);
      if (response.data && response.data.event) {
        const eventData = response.data.event;
        
        // Extract the organizer name if it's an object
        const organizerName = typeof eventData.organizer === 'object' 
          ? eventData.organizer.organizer 
          : eventData.organizer;
        
        // Extract the organizer ID
        const organizerId = typeof eventData.organizer === 'object'
          ? eventData.organizer.organizerId
          : eventData.organizerId;
          
        // Format date for input field
        const formattedDate = eventData.date 
          ? new Date(eventData.date).toISOString().split('T')[0]
          : '';
          
        // Determine if it's a free or paid event
        const priceType = eventData.price === 0 ? "free" : "paid";
        
        // Update newEvent state with fetched data
        setNewEvent({
          ...newEvent,
          name: eventData.name || '',
          date: formattedDate,
          location: eventData.location || '',
          latitude: eventData.latitude || newEvent.latitude,
          longitude: eventData.longitude || newEvent.longitude,
          organizerId: organizerId || '',
          organizer: organizerName || '',
          address: eventData.address || '',
          price: priceType,
          paidAmount: priceType === "paid" ? eventData.price.toString() : '',
          description: eventData.description || '',
          category: eventData.category || '',
          image: eventData.image || newEvent.image,
          detailImage: eventData.detailImage || newEvent.detailImage,
        });
      }
    } catch (error) {
      console.error("Error fetching event for editing:", error);
      setSnackbar({
        open: true,
        message: "Failed to load event data for editing.",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    const checkRole = async () => {
      setLoading(true);
      const username = sessionStorage.getItem("username");
      
      if (!username) {
        navigate("/login");
        return;
      }
      
      try {
        // Get user role
        const roleResponse = await axios.get(`/api/user/my-role/${username}`);
        const userRole = roleResponse.data.role;
        
        // Check if user has organizer role (handling both array and string cases)
        const hasOrganizerRole = Array.isArray(userRole) 
          ? userRole.includes("organizer") 
          : userRole === "organizer";
        
        if (!hasOrganizerRole) {
          // User does not have organizer role, redirect to home
          setSnackbar({
            open: true,
            message: "You need organizer privileges to create events",
            severity: "error",
          });
          
          setTimeout(() => {
            navigate("/home");
          }, 2000);
          return;
        }
        
        setIsOrganizer(true);
        
        // Fetch organizer profile
        try {
          const organizerRes = await axios.get(`/api/organizer/profile/${username}`);
          if (organizerRes.data?.profile) {
            setNewEvent(prev => ({
              ...prev,
              organizerId: organizerRes.data.profile.organizerId,
              organizer: organizerRes.data.profile.name 
            }));
            
            // If in edit mode, fetch the event data
            if (isEditMode && eventId) {
              await fetchEventForEdit(eventId);
            }
          }
        } catch (err) {
          console.error("Error fetching organizer profile:", err);
          // If in edit mode, still try to fetch the event
          if (isEditMode && eventId) {
            await fetchEventForEdit(eventId);
          }
        }
        
      } catch (err) {
        console.error("Error checking user role:", err);
        navigate("/home");
      } finally {
        setLoading(false);
      }
    };
    
    checkRole();
  }, [navigate, isEditMode, eventId]);

  // Redirect if not an organizer and finished loading
  if (!loading && !isOrganizer) {
    return null; // Will redirect in useEffect
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
      {/* Navbar */}
      <Navbar
        themeMode={themeMode}
        title={isEditMode ? "Edit Event" : "Add Event"}
        showBackButton={true}
        onMenuClick={() => setMenuOpen(true)}
        user={user}
      />
      
      {/* NavDrawer */}
      <NavDrawer
        themeMode={themeMode}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
      />

      <Container maxWidth="md" sx={{ pt: 4, position: 'relative', zIndex: 1 }}>
        {/* Page Header */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: "blur(10px)",
            border: themeMode === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(0, 0, 0, 0.05)',
            position: "relative",
            overflow: "hidden"
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

          <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                gutterBottom
                sx={{
                  color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
                }}
              >
                {isEditMode ? "Edit Event" : "Create New Event"}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{
                  color: themeMode === 'dark' ? 'text.secondary' : 'text.primary',
                }}
              >
                {isEditMode 
                  ? "Update the event details below. All fields marked with * are required."
                  : "Fill in the details below to create your event. All fields marked with * are required."}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Event Form */}
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
            position: "relative",
            overflow: "hidden"
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

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography 
                variant="h6" 
                fontWeight="600" 
                gutterBottom
                sx={{
                  color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
                }}
              >
                Basic Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                required
                fullWidth
                id="name"
                label="Event Name"
                name="name"
                value={newEvent.name}
                onChange={handleInputChange}
                variant="outlined"
                InputProps={{
                  sx: { 
                    borderRadius: 2,
                    background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                required
                fullWidth
                id="date"
                label="Event Date"
                name="date"
                type="date"
                value={newEvent.date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  inputProps: { 
                    // Only apply min date constraint for new events, not when editing
                    ...(isEditMode ? {} : { min: new Date().toISOString().split('T')[0] })
                  },
                  sx: { 
                    borderRadius: 2,
                    background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={newEvent.category}
                  label="Category"
                  onChange={handleInputChange}
                  sx={{ 
                    borderRadius: 2,
                    background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel id="price-type-label">Price Type</InputLabel>
                <Select
                  labelId="price-type-label"
                  id="price"
                  name="price"
                  value={newEvent.price}
                  label="Price Type"
                  onChange={handleInputChange}
                  sx={{ 
                    borderRadius: 2,
                    background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  }}
                >
                  <MenuItem value="free">Free Event</MenuItem>
                  <MenuItem value="paid">Paid Event</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {newEvent.price === "paid" && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  id="paidAmount"
                  label="Price ($)"
                  name="paidAmount"
                  type="number"
                  value={newEvent.paidAmount}
                  onChange={handleInputChange}
                  error={errors.price}
                  helperText={errors.price ? "Price must be greater than 0" : ""}
                  InputProps={{
                    sx: { 
                      borderRadius: 2,
                      background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    }
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12} md={newEvent.price === "paid" ? 6 : 12}>
              <TextField
                required
                fullWidth
                id="address"
                label="Address"
                name="address"
                value={newEvent.address}
                onChange={handleInputChange}
                InputProps={{
                  sx: { 
                    borderRadius: 2,
                    background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mt: 1,
                  mb: 2
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setPickerOpen(true)}
                  sx={{ 
                    borderRadius: 2, 
                    height: "100%", 
                    py: 1.5,
                    borderColor: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                    color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                    '&:hover': {
                      borderColor: themeMode === 'dark' ? 'primary.main' : 'primary.dark',
                      background: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.1)' : 'rgba(58, 134, 255, 0.05)',
                    }
                  }}
                  startIcon={<LocationOnIcon />}
                >
                  Select Location
                </Button>
                <TextField
                  fullWidth
                  disabled
                  id="location"
                  label="Event Location"
                  name="location"
                  value={newEvent.location}
                  InputProps={{
                    sx: { 
                      borderRadius: 2,
                      background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    }
                  }}
                />
              </Box>

              {newEvent.latitude && newEvent.longitude && (
                <Box
                  sx={{
                    mb: 3,
                    mt: 1,
                    border: themeMode === 'dark' 
                      ? '1px solid rgba(255,255,255,0.1)' 
                      : '1px solid rgba(0,0,0,0.05)',
                    borderRadius: 2,
                    height: "200px",
                    overflow: "hidden"
                  }}
                >
                  <StaticMap
                    open={true}
                    embedded={true}
                    onClose={() => {}}
                    latitude={newEvent.latitude}
                    longitude={newEvent.longitude}
                  />
                </Box>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography 
                variant="h6" 
                fontWeight="600" 
                gutterBottom
                sx={{
                  color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
                }}
              >
                Event Description
              </Typography>

              <TextField
                fullWidth
                required
                id="description"
                label="Description"
                name="description"
                multiline
                rows={5}
                value={newEvent.description}
                onChange={handleInputChange}
                placeholder="Provide a detailed description of your event..."
                error={errors.description}
                helperText={errors.description ? "Description must be at least 10 characters long" : ""}
                InputProps={{
                  sx: { 
                    borderRadius: 2,
                    background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography 
                variant="h6" 
                fontWeight="600" 
                gutterBottom
                sx={{
                  color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
                }}
              >
                Event Images
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="image"
                label="Card Image URL"
                name="image"
                value={newEvent.image}
                onChange={handleInputChange}
                helperText="URL for the event card thumbnail"
                InputProps={{
                  sx: { 
                    borderRadius: 2,
                    background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              />
              <Box
                sx={{
                  mt: 2,
                  height: "120px",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: themeMode === 'dark' 
                    ? '1px solid rgba(255,255,255,0.1)' 
                    : '1px solid rgba(0,0,0,0.05)',
                }}
              >
                <img
                  src={newEvent.image}
                  alt="Event thumbnail preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                  onError={(e) => {
                    e.target.src = "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg";
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="detailImage"
                label="Detail Image URL"
                name="detailImage"
                value={newEvent.detailImage}
                onChange={handleInputChange}
                helperText="URL for the larger event detail image"
                InputProps={{
                  sx: { 
                    borderRadius: 2,
                    background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              />
              <Box
                sx={{
                  mt: 2,
                  height: "120px",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: themeMode === 'dark' 
                    ? '1px solid rgba(255,255,255,0.1)' 
                    : '1px solid rgba(0,0,0,0.05)',
                }}
              >
                <img
                  src={newEvent.detailImage}
                  alt="Event detail preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                  onError={(e) => {
                    e.target.src = "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg";
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/organizer-events")}
                  sx={{ 
                    borderRadius: 2, 
                    px: 3,
                    borderColor: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                    color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                    '&:hover': {
                      borderColor: themeMode === 'dark' ? 'primary.main' : 'primary.dark',
                      background: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.1)' : 'rgba(58, 134, 255, 0.05)',
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitEvent}
                  variant="contained"
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                    color: 'white',
                    '&:hover': {
                      background: "linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)",
                    }
                  }}
                >
                  {isEditMode ? "Update Event" : "Create Event"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Location Picker Dialog */}
      <LocationPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleLocationSelect}
      />

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
            borderRadius: 2, 
            boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
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
    </Box>
  );
};

AddEvent.propTypes = {
  themeMode: PropTypes.string,
  isEditMode: PropTypes.bool
};

export default AddEvent; 
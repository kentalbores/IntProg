import { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Paper,
  Grid,
  Avatar,
  Chip,
  Divider,
  AppBar,
  Toolbar,
  Badge,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Menu,
  Skeleton,
  Collapse,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddBoxIcon from "@mui/icons-material/AddBox";
import EventIcon from "@mui/icons-material/Event";
import CategoryIcon from "@mui/icons-material/Category";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import axios from "./config/axiosconfig";
import Loading from "./components/Loading";
import LocationPicker from "./components/LocationPicker";
import StaticMap from "./components/StaticMap";
import { useTheme as useMuiTheme } from '@mui/material/styles';
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";
import LogoutIcon from "@mui/icons-material/Logout";
import PropTypes from 'prop-types';
import Navbar from "./components/Navbar";
import NavDrawer from "./components/NavDrawer";

const EventManagement = ({ themeMode }) => {
  const navigate = useNavigate();
  const customTheme = useMuiTheme();
  const isMobile = useMediaQuery(customTheme.breakpoints.down("sm"));
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState([

  ]);

  // Delete confirmation dialog state
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({
    open: false,
    eventId: null,
    eventName: ""
  });

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
    organizer: "",
    price: "",
    description: "",
    category: "",
    image: "https://via.placeholder.com/400x200?text=Event+Image",
    detailImage: "https://via.placeholder.com/800x400?text=Event+Detail+Image",
  });

  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isUser, setIsUser] = useState(false);

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

  const [filters, setFilters] = useState({
    listingType: 'ANY',
    minPrice: 'Any',
    maxPrice: 'Any',
    sortBy: 'date_desc'
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate("/profile");
    handleClose();
  };

  const handleSettings = () => {
    navigate("/settings");
    handleClose();
  };

  const handleAbout = () => {
    navigate("/about");
    handleClose();
  };

  const handleLogout = () => {
    handleClose();
    setLogoutDialogOpen(true);
  };

  const handleNotificationsClick = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const username = sessionStorage.getItem("username");
      if (username) {
        await axios.put("/api/notifications/read-all", { username });
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const unreadNotificationsCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const handleSelectEvent = (event) => {
    console.log("Selected event:", event);
    if (event && event.event_id) {
      navigate(`/events/${event.event_id}`);
    } else {
      console.error("Invalid event object:", event);
      setSnackbar({
        open: true,
        message: "Invalid event data",
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

  const handleLocationSelect = (location) => {
    setNewEvent({
      ...newEvent,
      location: location.name || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
      latitude: location.lat,
      longitude: location.lng,
    });
    setPickerOpen(false);

  };

  const userCanDelete = (event) => {
    const username = sessionStorage.getItem('username');
    return !!username; // Return true if there is a logged-in user
  };

  const handleSubmitEvent = async () => {
    try {
      setLoading(true);
      const username = sessionStorage.getItem("username");
      if (!username) {
        setSnackbar({
          open: true,
          message: "Please login to create events",
          severity: "error",
        });
        return;
      }

      const eventData = {
        ...newEvent,
        organizer: username
      };

      const response = await axios.post("/api/event", eventData);
      
      // Generate QR code for the new event
      const qrResponse = await axios.post(`/api/qrcode/event/${response.data.event_id}`);
      
      setSnackbar({
        open: true,
        message: "Event created successfully!",
        severity: "success",
      });

      handleAddEventClose();
      fetchEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      setSnackbar({
        open: true,
        message: "Failed to create event",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete confirmation dialog open
  const handleDeleteConfirmOpen = (event, e) => {
    e.stopPropagation(); // Prevent event details dialog from opening
    setDeleteConfirmDialog({
      open: true,
      eventId: event.event_id,
      eventName: event.name
    });
  };

  // Handle delete confirmation dialog close
  const handleDeleteConfirmClose = () => {
    setDeleteConfirmDialog({
      open: false,
      eventId: null,
      eventName: ""
    });
  };

  // Handle delete event
  const handleDeleteEvent = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/event/${deleteConfirmDialog.eventId}`);
      
      // Delete associated event plan
      await axios.delete(`/api/event-planner/event/${deleteConfirmDialog.eventId}`);
      
      setSnackbar({
        open: true,
        message: "Event deleted successfully!",
        severity: "success",
      });
      
      handleDeleteConfirmClose();
      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete event",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete from event details
  const handleDeleteFromDetails = () => {
    setDeleteConfirmDialog({
      open: true,
      eventId: selectedEvent.event_id,
      eventName: selectedEvent.name
    });
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/events");
      console.log(response.data);
      if (response.data && response.data.events) {
        setEvents(response.data.events);
        applyFilters(response.data.events, searchQuery, filters);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setSnackbar({
        open: true,
        message: "Failed to load events",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const username = sessionStorage.getItem("username");
      if (username) {
        const response = await axios.get(`/api/userinfo?username=${username}`);
        setUser(response.data.user_info);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const username = sessionStorage.getItem("username");
      if (username) {
        const response = await axios.get(`/api/notifications/user/${username}`);
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const fetchRegisteredUsers = async (eventId) => {
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

  const handleRegisterEvent = async (eventId) => {
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

      // Refresh registered users
      fetchRegisteredUsers(eventId);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to register for event",
        severity: "error",
      });
    }
  };

  const handleUnregisterEvent = async (eventId) => {
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

      // Refresh registered users
      fetchRegisteredUsers(eventId);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to unregister from event",
        severity: "error",
      });
    }
  };

  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      listingType: 'ANY',
      minPrice: 'Any',
      maxPrice: 'Any',
      sortBy: 'date_desc'
    });
    setSearchQuery("");
    setFilteredEvents(events);
  };

  // Update search function
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(events, query, filters);
  };

  // Apply filters
  const applyFilters = (eventsList, query, currentFilters) => {
    // Start with events array
    let filtered = [...eventsList];
    
    // Apply search query
    if (query.trim()) {
      const lowercasedQuery = query.toLowerCase();
      filtered = filtered.filter((event) => {
        return (
          event.name?.toLowerCase().includes(lowercasedQuery) ||
          event.location?.toLowerCase().includes(lowercasedQuery) ||
          event.organizer?.toLowerCase().includes(lowercasedQuery) ||
          event.description?.toLowerCase().includes(lowercasedQuery)
        );
      });
    }
    
    // Apply category filter
    if (currentFilters.listingType !== 'ANY') {
      filtered = filtered.filter(event => 
        event.category === currentFilters.listingType
      );
    }
    
    // Apply price filters
    if (currentFilters.minPrice !== 'Any') {
      const minPrice = parseInt(currentFilters.minPrice);
      filtered = filtered.filter(event => 
        parseInt(event.price || 0) >= minPrice
      );
    }
    
    if (currentFilters.maxPrice !== 'Any') {
      const maxPrice = parseInt(currentFilters.maxPrice);
      filtered = filtered.filter(event => 
        parseInt(event.price || 0) <= maxPrice
      );
    }
    
    // Apply sorting
    switch (currentFilters.sortBy) {
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'price_asc':
        filtered.sort((a, b) => parseInt(a.price || 0) - parseInt(b.price || 0));
        break;
      case 'price_desc':
        filtered.sort((a, b) => parseInt(b.price || 0) - parseInt(a.price || 0));
        break;
      case 'name_asc':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name_desc':
        filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      default:
        // Default sort by recent date
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    setFilteredEvents(filtered);
  };

  // Use this useEffect to apply filters whenever filters or events change
  useEffect(() => {
    if (events.length > 0) {
      applyFilters(events, searchQuery, filters);
    }
  }, [events, filters]);

  const getCategoryColor = (category) => {
    const categoryColors = {
      Conference: "#3a86ff",
      Workshop: "#ff006e",
      Seminar: "#8338ec",
      Exhibition: "#fb5607",
      Concert: "#ffbe0b",
      Sports: "#38b000",
      Networking: "#3a0ca3",
      Other: "#757575"
    };

    return categoryColors[category] || "#757575";
  };

  // Check if user is the organizer of an event
  const userIsOrganizer = (event) => {
    const username = sessionStorage.getItem('username');
    return username === event.organizer;
  };

  // Add missing useEffect for initialization
  useEffect(() => {
    fetchEvents();
    fetchUserData();
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      applyFilters(events, searchQuery, filters);
    }
  }, [events, filters]);

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
      {loading && <Loading />}

      {/* Navbar */}
      <Navbar
        themeMode={themeMode}
        title="Events"
        showMenuButton={true}
        user={user}
        notifications={notifications}
        fetchNotifications={fetchNotifications}
      />

      <Container maxWidth="lg" sx={{ pt: 4, pb: 8, position: 'relative', zIndex: 1 }}>
        {/* Page Header */}
        <Paper
          elevation={0}
          sx={{
            p: 4,
            mb: 4,
            borderRadius: 3,
            background: themeMode === 'dark' 
              ? 'rgba(30, 41, 59, 0.7)' 
              : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: "blur(10px)",
            border: themeMode === 'dark' 
              ? '1px solid rgba(255,255,255,0.1)' 
              : '1px solid rgba(0,0,0,0.05)',
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
            <Grid item xs={12}>
              <Typography 
                variant="h4" 
                fontWeight="bold" 
                className="text-gradient-blue"
                sx={{ 
                  mb: 1
                }}
              >
                Discover Events
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  pb: 6,
                  color: themeMode === 'dark' ? 'text.secondary' : 'text.primary',
                  opacity: 0.8
                }}
              >
                Find and join exciting events happening around you. Browse through our curated selection or search for specific interests.
              </Typography>
            </Grid>
          </Grid>
          {/* Search and Filter Section */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                {/* Search Bar */}
                <Box sx={{ 
                  flexGrow: 1, 
                  maxWidth: { xs: '100%', sm: '400px' },
                  background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  border: themeMode === 'dark' 
                    ? '1px solid rgba(255,255,255,0.1)' 
                    : '1px solid rgba(0,0,0,0.05)',
                }}>
                  <SearchIcon color="primary" />
                  <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Search by name or location..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    InputProps={{
                      disableUnderline: true,
                      sx: { 
                        px: 1, 
                        py: 1,
                        fontSize: '0.98rem',
                      }
                    }}
                  />
                  {searchQuery && (
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchQuery("");
                        setFilteredEvents(events);
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                
                {/* Filter Button */}
                <Button
                  variant="outlined"
                  onClick={() => setShowFilters(!showFilters)}
                  startIcon={showFilters ? <CloseIcon /> : <FilterListIcon />}
                  sx={{
                    borderRadius: 8,
                    px: 2,
                    py: 1,
                    borderColor: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                    color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                    '&:hover': {
                      borderColor: themeMode === 'dark' ? 'primary.main' : 'primary.dark',
                      background: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.1)' : 'rgba(58, 134, 255, 0.05)',
                    }
                  }}
                >
                  {showFilters ? "Hide Filters" : "Filter Events"}
                </Button>
              </Box>
            </Grid>
            
            {/* Filter Section - Collapsible */}
            <Grid item xs={12}>
              <Collapse in={showFilters}>
                <Box sx={{ 
                  p: 2, 
                  background: themeMode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                  borderRadius: 2,
                  mt: 2,
                  border: themeMode === 'dark' 
                    ? '1px solid rgba(255,255,255,0.05)' 
                    : '1px solid rgba(0,0,0,0.03)',
                }}>
                  <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                    Filter Events
                  </Typography>
                  
                  {/* Listing Type Filter */}
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Event Type
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip 
                      label="All" 
                      clickable
                      onClick={() => handleFilterChange('listingType', 'ANY')}
                      color={filters.listingType === 'ANY' ? 'primary' : 'default'}
                      variant={filters.listingType === 'ANY' ? 'filled' : 'outlined'}
                    />
                    <Chip 
                      label="Conference" 
                      clickable
                      onClick={() => handleFilterChange('listingType', 'Conference')}
                      color={filters.listingType === 'Conference' ? 'primary' : 'default'}
                      variant={filters.listingType === 'Conference' ? 'filled' : 'outlined'}
                    />
                    <Chip 
                      label="Workshop" 
                      clickable
                      onClick={() => handleFilterChange('listingType', 'Workshop')}
                      color={filters.listingType === 'Workshop' ? 'primary' : 'default'}
                      variant={filters.listingType === 'Workshop' ? 'filled' : 'outlined'}
                    />
                    <Chip 
                      label="Seminar" 
                      clickable
                      onClick={() => handleFilterChange('listingType', 'Seminar')}
                      color={filters.listingType === 'Seminar' ? 'primary' : 'default'}
                      variant={filters.listingType === 'Seminar' ? 'filled' : 'outlined'}
                    />
                    <Chip 
                      label="Exhibition" 
                      clickable
                      onClick={() => handleFilterChange('listingType', 'Exhibition')}
                      color={filters.listingType === 'Exhibition' ? 'primary' : 'default'}
                      variant={filters.listingType === 'Exhibition' ? 'filled' : 'outlined'}
                    />
                  </Box>
                  
                  {/* Price Range Filter */}
                  <Typography variant="subtitle2" gutterBottom>
                    Price Range
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Min Price</InputLabel>
                        <Select
                          value={filters.minPrice}
                          label="Min Price"
                          onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                        >
                          <MenuItem value="Any">Any</MenuItem>
                          <MenuItem value="0">Free</MenuItem>
                          <MenuItem value="10">$10</MenuItem>
                          <MenuItem value="50">$50</MenuItem>
                          <MenuItem value="100">$100</MenuItem>
                          <MenuItem value="200">$200</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Max Price</InputLabel>
                        <Select
                          value={filters.maxPrice}
                          label="Max Price"
                          onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                        >
                          <MenuItem value="Any">Any</MenuItem>
                          <MenuItem value="50">$50</MenuItem>
                          <MenuItem value="100">$100</MenuItem>
                          <MenuItem value="200">$200</MenuItem>
                          <MenuItem value="500">$500</MenuItem>
                          <MenuItem value="1000">$1000+</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  
                  {/* Sort Options */}
                  <Typography variant="subtitle2" gutterBottom>
                    Sort By
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Sort</InputLabel>
                        <Select
                          value={filters.sortBy}
                          label="Sort"
                          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        >
                          <MenuItem value="date_asc">Date (Earliest First)</MenuItem>
                          <MenuItem value="date_desc">Date (Latest First)</MenuItem>
                          <MenuItem value="price_asc">Price (Low to High)</MenuItem>
                          <MenuItem value="price_desc">Price (High to Low)</MenuItem>
                          <MenuItem value="name_asc">Name (A-Z)</MenuItem>
                          <MenuItem value="name_desc">Name (Z-A)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, alignItems: 'center' }}>
                      <Button 
                        variant="outlined"
                        onClick={resetFilters}
                        startIcon={<RefreshIcon />}
                        sx={{ borderRadius: 2 }}
                      >
                        Reset Filters
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Results Count */}
        <Box sx={{ mb: 2, px: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" className="animate-fadeIn">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} found
          </Typography>
        </Box>

        {/* Event Listings - Enhanced Grid Layout */}
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '300px',
            flexDirection: 'column',
            gap: 2
          }}>
            <div className="loading-spinner" />
            <Typography variant="body1" sx={{ color: themeMode === 'dark' ? 'text.secondary' : 'text.primary' }}>
              Loading events...
            </Typography>
          </Box>
        ) : filteredEvents.length > 0 ? (
          <Grid container spacing={3} className="animate-fadeIn">
            {filteredEvents.map((event, index) => (
              <Grid item key={event.event_id} xs={12} sm={6} md={4} 
                sx={{ 
                  animation: `slideUp 0.5s ease-out forwards ${index * 0.1}s`,
                  opacity: 0,
                  '@keyframes slideUp': {
                    '0%': { transform: 'translateY(20px)', opacity: 0 },
                    '100%': { transform: 'translateY(0)', opacity: 1 }
                  }
                }}
              >
                <Card
                  onClick={() => handleSelectEvent(event)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    overflow: "hidden",
                    cursor: "pointer",
                    position: "relative",
                    background: themeMode === 'dark' 
                      ? 'rgba(30, 41, 59, 0.7)' 
                      : 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: "blur(10px)",
                    border: themeMode === 'dark' 
                      ? '1px solid rgba(255,255,255,0.1)' 
                      : '1px solid rgba(0,0,0,0.05)',
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-10px)",
                      boxShadow: themeMode === 'dark'
                        ? '0 15px 30px rgba(0,0,0,0.5)'
                        : '0 15px 30px rgba(0,0,0,0.15)',
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      height: "4px",
                      background: `linear-gradient(90deg, ${getCategoryColor(event.category)} 0%, ${getCategoryColor(event.category)}88 100%)`,
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    },
                    "&:hover::before": {
                      opacity: 1,
                    }
                  }}
                >
                  {/* Category Chip */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      zIndex: 2,
                    }}
                  >
                    <Chip
                      label={event.category}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        color: "white",
                        backgroundColor: getCategoryColor(event.category),
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        borderRadius: "8px",
                        px: 1,
                        '& .MuiChip-label': {
                          padding: '0 8px',
                        },
                      }}
                    />
                  </Box>

                  {/* Event Image with Gradient Overlay */}
                  <Box sx={{ position: "relative", paddingTop: "56.25%" /* 16:9 aspect ratio */ }}>
                    <CardMedia
                      component="img"
                      image={event.image}
                      alt={event.name}
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "50%",
                        background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
                      }}
                    />
                    
                    {/* Date Badge */}
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 16,
                        right: 16,
                        backgroundColor: "white",
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.5,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="caption" fontWeight="bold" color="primary.main">
                        {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : 'TBD'}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold" color="text.primary" lineHeight={1}>
                        {event.date ? new Date(event.date).getDate() : '--'}
                      </Typography>
                    </Box>
                  </Box>

                  <CardContent sx={{ p: 2.5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      gutterBottom 
                      sx={{ 
                        lineHeight: 1.3,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {event.name}
                    </Typography>
                    
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                      <LocationOnIcon fontSize="small" color="action" sx={{ mr: 0.5, opacity: 0.7 }} />
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {event.location}
                      </Typography>
                    </Box>

                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {event.description}
                    </Typography>

                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                        {event.price > 0 ? `$${event.price}` : "Free"}
                      </Typography>
                      <Chip
                        size="small"
                        label="View Details"
                        clickable
                        color="primary"
                        variant="outlined"
                        sx={{ 
                          borderRadius: 4,
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                          }
                        }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 5,
              borderRadius: 3,
              textAlign: "center",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              border: "1px dashed rgba(0,0,0,0.1)"
            }}
          >
            <EventIcon sx={{ fontSize: 60, color: "text.secondary", opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery ? "No events match your search" : "No events found"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery ? "Try adjusting your search terms" : "There are no events available at the moment"}
            </Typography>
          </Paper>
        )}

        {/* Event Details Dialog */}
        <Dialog
          open={eventDialogOpen}
          onClose={() => setEventDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: "hidden",
              maxHeight: "90vh"
            }
          }}
        >
          {selectedEvent && (
            <>
              <Box sx={{ position: "relative", height: 280 }}>
                <CardMedia
                  component="img"
                  image={selectedEvent.detailImage || "/default-detail.jpg"}
                  alt={selectedEvent.name}
                  sx={{ 
                    height: "100%",
                    objectFit: "cover",
                    width: "100%"
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)",
                    pointerEvents: "none"
                  }}
                />
                <IconButton
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    backgroundColor: "white",
                    "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" }
                  }}
                  onClick={() => setEventDialogOpen(false)}
                >
                  <CloseIcon />
                </IconButton>

                
                    

                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    p: 3,
                    width: "100%"
                  }}
                >
                  <Chip
                    label={selectedEvent.category || "Uncategorized"}
                    size="small"
                    sx={{
                      mb: 1,
                      fontWeight: 500,
                      color: "white",
                      backgroundColor: getCategoryColor(selectedEvent.category),
                    }}
                  />
                  <Typography variant="h4" fontWeight="bold" color="white" gutterBottom>
                    {selectedEvent.name}
                  </Typography>
                </Box>
              </Box>

              <DialogContent sx={{ p: 4, overflowY: "auto" }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" fontWeight="600" gutterBottom color="primary.dark">
                      About This Event
                    </Typography>
                    <Typography variant="body1" paragraph sx={{ mb: 3 }}>
                      {selectedEvent.description || "No description available."}
                    </Typography>

                    {selectedEvent.latitude && selectedEvent.longitude && (
                      <Box sx={{ mt: 4 }}>
                        <Typography variant="h6" fontWeight="600" gutterBottom color="primary.dark">
                          Event Location
                        </Typography>
                        <Box
                          sx={{
                            border: "1px solid #ddd",
                            borderRadius: 2,
                            height: "250px",
                            mb: 2,
                            overflow: "hidden"
                          }}
                        >
                          <StaticMap
                            open={true}
                            embedded={true}
                            onClose={() => {}}
                            latitude={selectedEvent.latitude}
                            longitude={selectedEvent.longitude}
                          />
                        </Box>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: "rgba(0,0,0,0.02)", mb: 3 }}>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom color="primary.dark">
                        Event Details
                      </Typography>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                          <Avatar sx={{ bgcolor: "rgba(58, 134, 255, 0.1)", width: 36, height: 36, mr: 2 }}>
                            <AccessTimeIcon sx={{ color: "primary.main", fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Date & Time
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {selectedEvent.date || "Date TBD"}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                          <Avatar sx={{ bgcolor: "rgba(58, 134, 255, 0.1)", width: 36, height: 36, mr: 2 }}>
                            <LocationOnIcon sx={{ color: "primary.main", fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Location
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {selectedEvent.location || "Location TBD"}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                          <Avatar sx={{ bgcolor: "rgba(58, 134, 255, 0.1)", width: 36, height: 36, mr: 2 }}>
                            <CategoryIcon sx={{ color: "primary.main", fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Category
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {selectedEvent.category || "Uncategorized"}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                          <Avatar sx={{ bgcolor: "rgba(58, 134, 255, 0.1)", width: 36, height: 36, mr: 2 }}>
                            <PersonIcon sx={{ color: "primary.main", fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Organizer
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {selectedEvent.organizer || "Not specified"}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar sx={{ bgcolor: "rgba(58, 134, 255, 0.1)", width: 36, height: 36, mr: 2 }}>
                            <AttachMoneyIcon sx={{ color: "primary.main", fontSize: 20 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Price
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                              {selectedEvent.price ? `$${selectedEvent.price}` : "Free"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" fontWeight="600" color="primary.dark" gutterBottom>
                          Registered Users ({registeredUsers.length})
                        </Typography>
                        <List dense>
                          {registeredUsers.map((user) => (
                            <ListItem key={user.username}>
                              <ListItemIcon>
                                <Avatar sx={{ width: 32, height: 32 }}>
                                  {user.username.charAt(0).toUpperCase()}
                                </Avatar>
                              </ListItemIcon>
                              <ListItemText 
                                primary={user.username}
                                secondary={user.email}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Paper>

                    {isRegistered ? (
                      <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        size="large"
                        onClick={() => handleUnregisterEvent(selectedEvent.event_id)}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
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
                        onClick={() => handleRegisterEvent(selectedEvent.event_id)}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          boxShadow: "0 4px 14px rgba(58, 134, 255, 0.4)",
                          background: "linear-gradient(45deg, #3a86ff 30%, #4776E6 90%)",
                          "&:hover": {
                            background: "linear-gradient(45deg, #2a76ef 30%, #3766D6 90%)",
                          }
                        }}
                      >
                        REGISTER NOW
                      </Button>
                    )}
                    {/* Add Delete Button for organizers */}
                    {isUser && (
                          <Button
                            variant="outlined"
                            color="error"
                            fullWidth
                            size="large"
                            startIcon={<DeleteIcon />}
                            onClick={handleDeleteFromDetails}
                            sx={{
                              mt: 2,
                              py: 1.5,
                              borderRadius: 2,
                              borderWidth: 2,
                              '&:hover': {
                                borderWidth: 2,
                                backgroundColor: 'error.light',
                                color: 'error.contrastText',
                              },
                            }}
                          >
                            DELETE EVENT
                          </Button>
                        )}

                  </Grid>
                </Grid>
              </DialogContent>
            </>
          )}
        </Dialog>

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
            sx={{ width: "100%", borderRadius: 2, boxShadow: "0 3px 10px rgba(0,0,0,0.1)" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

EventManagement.propTypes = {
  themeMode: PropTypes.string.isRequired
};

export default EventManagement;


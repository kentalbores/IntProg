import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddBoxIcon from "@mui/icons-material/AddBox";
import EventIcon from "@mui/icons-material/Event";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import PropTypes from 'prop-types';
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PersonIcon from "@mui/icons-material/Person";
import Loading from "./components/Loading";
import Navbar from "./components/Navbar";
import NavDrawer from "./components/NavDrawer";
import axios from "./config/axiosconfig";

const OrganizerEvents = ({ themeMode }) => {
  const navigate = useNavigate();
  
  // State variables
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
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
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'ALL',
    category: 'ANY',
    sortBy: 'date_desc'
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [eventUsers, setEventUsers] = useState({});
  const username = sessionStorage.getItem("username");

  useEffect(() => {
    // Check user role and fetch organizer profile first
    const checkRoleAndFetchProfile = async () => {
      setLoading(true);
      try {
        if (!username) {
          navigate("/login");
          return;
        }
        
        // Get user role
        const roleResponse = await axios.get(`/api/user/my-role/${username}`);
        const userRole = roleResponse.data.role;
        
        // Check if user has organizer role (handling both array and string cases)
        const hasOrganizerRole = Array.isArray(userRole) 
          ? userRole.includes("organizer") 
          : userRole === "organizer";
        
        if (!hasOrganizerRole) {
          // User does not have organizer role
          setSnackbar({
            open: true,
            message: "You need organizer privileges to view events",
            severity: "error",
          });
          
          setTimeout(() => {
            navigate("/home");
          }, 2000);
          return;
        }
        
        // Fetch organizer profile
        try {
          const organizerRes = await axios.get(`/api/organizer/profile/${username}`);
          if (organizerRes.data?.profile) {
            // After getting profile, fetch events with the organizer ID
            const profile = organizerRes.data.profile;
            fetchEvents(profile.organizerId);
          } else {
            // No profile found, try with username
            fetchEvents(username);
          }
        } catch (err) {
          console.error("Error fetching organizer profile:", err);
          // If error in profile fetch, still try to get events with username
          fetchEvents(username);
        }
      } catch (err) {
        console.error("Error checking user role:", err);
        setSnackbar({
          open: true,
          message: "Error checking permissions. Please try again.",
          severity: "error",
        });
        setLoading(false);
      }
    };
    
    // Fetch events with organizerId 
    const fetchEvents = async (organizerId) => {
      try {
        const response = await axios.get(`/api/organizer/events/${organizerId}`);
        if (response.data?.events) {
          // Process events
          const eventsData = response.data.events.map(event => ({
            ...event
          }));
          
          setEvents(eventsData);
          applyFilters(eventsData, searchQuery, filters);
          
          // Fetch registration counts for each event
          eventsData.forEach(event => {
            fetchEventUsers(event.event_id);
          });
        } else {
          setEvents([]);
          setFilteredEvents([]);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setSnackbar({
          open: true,
          message: "Failed to load events. Please try again.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkRoleAndFetchProfile();
  }, [navigate, username]);
  
  // Fetch users registered for an event
  const fetchEventUsers = async (eventId) => {
    try {
      const response = await axios.get(`/api/events/${eventId}/users`);
      if (response.data) {
        setEventUsers(prev => ({
          ...prev,
          [eventId]: response.data
        }));
      }
    } catch (err) {
      console.error(`Error fetching users for event ${eventId}:`, err);
    }
  };
  
  // Apply filters whenever filters change
  useEffect(() => {
    if (events.length > 0) {
      applyFilters(events, searchQuery, filters);
    }
  }, [events, filters, searchQuery]);

  const handleLogout = () => {
    // Handle logout
    navigate("/");
  };

  const handleDeleteConfirmOpen = (event, e) => {
    e.stopPropagation(); // Prevent event details from opening
    setDeleteConfirmDialog({
      open: true,
      eventId: event.event_id,
      eventName: event.name
    });
  };

  const handleDeleteConfirmClose = () => {
    setDeleteConfirmDialog({
      open: false,
      eventId: null,
      eventName: ""
    });
  };

  const handleDeleteEvent = async () => {
    try {
      if (!username) {
        throw new Error("Username not found");
      }
      
      console.log(`Attempting to delete event for user ${username}, event ID: ${deleteConfirmDialog.eventId}`);
      
      // Match the backend route format exactly: "/:username/:id"
      const response = await axios.delete(`/api/events/${username}/${deleteConfirmDialog.eventId}`);
      
      console.log("Delete response:", response.data);
      
      // Update both states
      const updatedEvents = events.filter(event => event.event_id !== deleteConfirmDialog.eventId);
      setEvents(updatedEvents);
      setFilteredEvents(prev => prev.filter(event => event.event_id !== deleteConfirmDialog.eventId));
      
      setSnackbar({
        open: true,
        message: "Event deleted successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error deleting event:", err);
      
      // Detailed error logging
      console.log("Error status:", err.response?.status);
      console.log("Error data:", err.response?.data);
      
      const errorMessage = err.response?.data?.message || 
                          "Failed to delete event. Please try again.";
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      handleDeleteConfirmClose();
    }
  };

  const handleEditEvent = (event, e) => {
    e.stopPropagation(); // Prevent event details from opening
    // Navigate to edit event page
    navigate(`/edit-event/${event.event_id}`);
  };

  const handleViewEvent = (event, e) => {
    e.stopPropagation(); // Prevent default behavior
    // Navigate to event details page
    navigate(`/events/${event.event_id}`);
  };

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

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
      status: 'ALL',
      category: 'ANY',
      sortBy: 'date_desc'
    });
    setSearchQuery("");
    setFilteredEvents(events);
  };

  // Handle search input changes
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
          event.description?.toLowerCase().includes(lowercasedQuery) ||
          event.category?.toLowerCase().includes(lowercasedQuery)
        );
      });
    }
    
    // Apply category filter
    if (currentFilters.category !== 'ANY') {
      filtered = filtered.filter(event => 
        event.category === currentFilters.category
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
        title="EventHub"
        showBackButton={true}
        showMenuButton={true}
        onMenuClick={() => setMenuOpen(true)}
        user={{username: sessionStorage.getItem("username"), email: sessionStorage.getItem("email")}}
      />
      
      {/* NavDrawer */}
      <NavDrawer
        themeMode={themeMode}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={{username: sessionStorage.getItem("username"), email: sessionStorage.getItem("email")}}
        onLogout={handleLogout}
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
            overflow: "hidden",
            transition: 'transform 0.3s ease'
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
                className="text-gradient-blue"
                sx={{ 
                  mb: 1
                }}
              >
                My Events
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  pb: 6,
                  color: themeMode === 'dark' ? 'text.secondary' : 'text.primary',
                  opacity: 0.8
                }}
              >
                Manage all your events in one place. Create new events, edit details, and track registrations.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' }, display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddBoxIcon />}
                onClick={() => navigate("/add-event")}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 8,
                  boxShadow: "0 4px 14px rgba(58, 134, 255, 0.4)",
                  background: "linear-gradient(45deg, #3a86ff 30%, #4776E6 90%)",
                  fontWeight: 600,
                  fontSize: '1rem',
                  mb: { xs: 2, md: 0 },
                  transition: 'all 0.3s ease',
                  "&:hover": {
                    transform: 'translateY(-5px)',
                    boxShadow: "0 8px 20px rgba(58, 134, 255, 0.5)",
                    background: "linear-gradient(45deg, #2a76ef 30%, #3766D6 90%)",
                  }
                }}
              >
                Create New Event
              </Button>
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
                    placeholder="Search events..."
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
                  
                  {/* Remove status filter and keep only category filter */}
                  <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Category
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip 
                      label="Any" 
                      clickable
                      onClick={() => handleFilterChange('category', 'ANY')}
                      color={filters.category === 'ANY' ? 'primary' : 'default'}
                      variant={filters.category === 'ANY' ? 'filled' : 'outlined'}
                    />
                    <Chip 
                      label="Conference" 
                      clickable
                      onClick={() => handleFilterChange('category', 'Conference')}
                      color={filters.category === 'Conference' ? 'primary' : 'default'}
                      variant={filters.category === 'Conference' ? 'filled' : 'outlined'}
                    />
                    <Chip 
                      label="Workshop" 
                      clickable
                      onClick={() => handleFilterChange('category', 'Workshop')}
                      color={filters.category === 'Workshop' ? 'primary' : 'default'}
                      variant={filters.category === 'Workshop' ? 'filled' : 'outlined'}
                    />
                    <Chip 
                      label="Seminar" 
                      clickable
                      onClick={() => handleFilterChange('category', 'Seminar')}
                      color={filters.category === 'Seminar' ? 'primary' : 'default'}
                      variant={filters.category === 'Seminar' ? 'filled' : 'outlined'}
                    />
                  </Box>
                  
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

        {/* Event Listings - Enhanced */}
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
              Loading your events...
            </Typography>
          </Box>
        ) : filteredEvents.length > 0 ? (
          <Grid container spacing={3} className="animate-fadeIn">
            {filteredEvents.map((event, index) => (
              <Grid item xs={12} key={event.event_id}
                sx={{ 
                  animation: `slideInRight 0.5s ease-out forwards ${index * 0.15}s`,
                  opacity: 0,
                  '@keyframes slideInRight': {
                    '0%': { transform: 'translateX(20px)', opacity: 0 },
                    '100%': { transform: 'translateX(0)', opacity: 1 }
                  }
                }}
              >
                <Card
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: themeMode === 'dark' 
                      ? '0 4px 10px rgba(0,0,0,0.2)' 
                      : '0 4px 10px rgba(0,0,0,0.05)',
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    background: themeMode === 'dark' 
                      ? 'rgba(30, 41, 59, 0.7)' 
                      : 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: "blur(10px)",
                    border: themeMode === 'dark' 
                      ? '1px solid rgba(255,255,255,0.1)' 
                      : '1px solid rgba(0,0,0,0.05)',
                    position: "relative",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: themeMode === 'dark'
                        ? '0 15px 30px rgba(0,0,0,0.4)'
                        : '0 15px 30px rgba(0,0,0,0.15)',
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: "4px",
                      background: `linear-gradient(180deg, ${getCategoryColor(event.category)} 0%, ${getCategoryColor(event.category)}88 100%)`,
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    },
                    "&:hover::before": {
                      opacity: 1,
                    }
                  }}
                >
                  {/* Event Image */}
                  <Box
                    sx={{
                      width: { xs: '100%', md: 250 },
                      height: { xs: 200, md: 'auto' },
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={event.image}
                      alt={event.name}
                      sx={{
                        height: "100%",
                        width: "100%",
                        objectFit: "cover",
                        transition: "transform 0.5s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                        }
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 16,
                        left: 16,
                        backgroundColor: "white",
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.5,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="caption" fontWeight="bold" color="primary.main">
                        {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short' }).toUpperCase() : 'TBD'}
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="text.primary" lineHeight={1}>
                        {event.date ? new Date(event.date).getDate() : '--'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Event Details - Enhanced */}
                  <CardContent 
                    sx={{ 
                      p: 3, 
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={event.category}
                        size="small"
                        sx={{
                          mb: 1.5,
                          fontWeight: 500,
                          color: "white",
                          backgroundColor: getCategoryColor(event.category),
                          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Typography 
                        variant="h5" 
                        fontWeight="600" 
                        gutterBottom
                        sx={{
                          lineHeight: 1.3,
                          color: themeMode === 'dark' ? 'common.white' : 'text.primary'
                        }}
                      >
                        {event.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {event.description}
                      </Typography>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon fontSize="small" color="action" sx={{ opacity: 0.7 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Location
                            </Typography>
                            <Typography variant="body2" fontWeight="500">
                              {event.location}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EventIcon fontSize="small" color="action" sx={{ opacity: 0.7 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Date
                            </Typography>
                            <Typography variant="body2" fontWeight="500">
                              {new Date(event.date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoneyIcon fontSize="small" color="action" sx={{ opacity: 0.7 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Price
                            </Typography>
                            <Typography variant="body2" fontWeight="500">
                              {event.price > 0 ? `$${event.price}` : "Free"}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" color="action" sx={{ opacity: 0.7 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Registrations
                            </Typography>
                            <Typography variant="body2" fontWeight="500">
                              {/* Use actual registration data */}
                              {eventUsers[event.event_id] ? eventUsers[event.event_id].length : 0} attendees
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Action Buttons - Enhanced */}
                    <Box 
                      sx={{ 
                        display: "flex", 
                        justifyContent: "flex-end",
                        gap: 1.5,
                        mt: "auto",
                        flexWrap: { xs: 'wrap', sm: 'nowrap' }
                      }}
                    >
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={(e) => handleViewEvent(event, e)}
                        sx={{
                          borderRadius: 8,
                          px: 2,
                          borderColor: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                          color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 4px 10px rgba(58, 134, 255, 0.2)',
                            borderColor: themeMode === 'dark' ? 'primary.main' : 'primary.dark',
                            background: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.1)' : 'rgba(58, 134, 255, 0.05)',
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={(e) => handleEditEvent(event, e)}
                        sx={{
                          borderRadius: 8,
                          px: 2,
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 4px 10px rgba(255, 0, 110, 0.2)',
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Edit Event
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={(e) => handleDeleteConfirmOpen(event, e)}
                        sx={{
                          borderRadius: 8,
                          px: 2,
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 4px 10px rgba(229, 57, 53, 0.2)',
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        Delete
                      </Button>
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
              background: themeMode === 'dark' 
                ? 'rgba(30, 41, 59, 0.7)' 
                : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: "blur(10px)",
              border: themeMode === 'dark' 
                ? '1px solid rgba(255,255,255,0.1)' 
                : '1px solid rgba(0,0,0,0.05)',
              animation: 'fadeIn 0.5s ease-in-out',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
              }
            }}
          >
            <EventIcon sx={{ fontSize: 60, color: "text.secondary", opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery || Object.values(filters).some(v => v !== 'ALL' && v !== 'ANY' && v !== 'date_desc') 
                ? "No events match your filters" 
                : "You don't have any events yet"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery || Object.values(filters).some(v => v !== 'ALL' && v !== 'ANY' && v !== 'date_desc') 
                ? "Try adjusting your search or filters" 
                : "Create your first event to get started"}
            </Typography>
            {(!searchQuery && !Object.values(filters).some(v => v !== 'ALL' && v !== 'ANY' && v !== 'date_desc')) && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddBoxIcon />}
                onClick={() => navigate("/add-event")}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 8,
                  boxShadow: "0 4px 14px rgba(58, 134, 255, 0.4)",
                  background: "linear-gradient(45deg, #3a86ff 30%, #4776E6 90%)",
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  "&:hover": {
                    transform: 'translateY(-5px)',
                    boxShadow: "0 8px 20px rgba(58, 134, 255, 0.5)",
                    background: "linear-gradient(45deg, #2a76ef 30%, #3766D6 90%)",
                  }
                }}
              >
                Create New Event
              </Button>
            )}
            {(searchQuery || Object.values(filters).some(v => v !== 'ALL' && v !== 'ANY' && v !== 'date_desc')) && (
              <Button
                variant="outlined"
                color="primary"
                startIcon={<RefreshIcon />}
                onClick={resetFilters}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 8,
                  borderColor: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                  color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: themeMode === 'dark' ? 'primary.main' : 'primary.dark',
                    background: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.1)' : 'rgba(58, 134, 255, 0.05)',
                  }
                }}
              >
                Reset Filters
              </Button>
            )}
          </Paper>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmDialog.open}
        onClose={handleDeleteConfirmClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: "blur(10px)",
            border: themeMode === 'dark' 
              ? '1px solid rgba(255,255,255,0.1)' 
              : '1px solid rgba(0,0,0,0.05)',
          }
        }}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title" sx={{ pt: 3 }}>
          Delete Event
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <b>{deleteConfirmDialog.eventName}</b>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleDeleteConfirmClose}
            sx={{ 
              borderRadius: 2,
              color: themeMode === 'dark' ? 'text.secondary' : 'text.primary',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteEvent}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
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
          sx={{ width: "100%", borderRadius: 2, boxShadow: "0 3px 10px rgba(0,0,0,0.1)" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

OrganizerEvents.propTypes = {
  themeMode: PropTypes.string.isRequired,
};

export default OrganizerEvents; 
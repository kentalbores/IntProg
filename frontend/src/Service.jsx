import { useState, useEffect } from "react";
import {
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
  Chip,
  Collapse,
  Button,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import PriceIcon from "@mui/icons-material/Payments";
import { useNavigate } from "react-router-dom";
import axios from "./config/axiosconfig";
import Loading from "./components/Loading";
import Navbar from "./components/Navbar";
import NavDrawer from "./components/NavDrawer";
import PropTypes from 'prop-types';

const Service = ({ themeMode }) => {
  const navigate = useNavigate();
  
  // State variables
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredServices, setFilteredServices] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'ANY',
    priceRange: 'ANY',
    sortBy: 'name_asc'
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetchServices();
    fetchUserData();
  }, []);
  
  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/services");
      if (response.data && response.data.services) {
        setServices(response.data.services);
        applyFilters(response.data.services, searchQuery, filters);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
      setSnackbar({
        open: true,
        message: "Failed to load services",
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
      category: 'ANY',
      priceRange: 'ANY',
      sortBy: 'name_asc'
    });
    setSearchQuery("");
    setFilteredServices(services);
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    applyFilters(services, query, filters);
  };

  // Apply filters
  const applyFilters = (servicesList, query, currentFilters) => {
    // Start with services array
    let filtered = [...servicesList];
    
    // Apply search query
    if (query.trim()) {
      const lowercasedQuery = query.toLowerCase();
      filtered = filtered.filter((service) => {
        return (
          service.name?.toLowerCase().includes(lowercasedQuery) ||
          service.description?.toLowerCase().includes(lowercasedQuery) ||
          service.category?.toLowerCase().includes(lowercasedQuery)
        );
      });
    }
    
    // Apply category filter
    if (currentFilters.category !== 'ANY') {
      filtered = filtered.filter(service => 
        service.category === currentFilters.category
      );
    }
    
    // Apply price range filter
    if (currentFilters.priceRange !== 'ANY') {
      const [min, max] = currentFilters.priceRange.split('-').map(Number);
      
      filtered = filtered.filter(service => {
        // Find the minimum price from all pricing options
        const minPrice = Math.min(...service.pricingOptions.map(option => option.amount));
        return (isNaN(max) ? minPrice >= min : minPrice >= min && minPrice <= max);
      });
    }
    
    // Apply sorting
    switch (currentFilters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => {
          const aMinPrice = Math.min(...a.pricingOptions.map(option => option.amount));
          const bMinPrice = Math.min(...b.pricingOptions.map(option => option.amount));
          return aMinPrice - bMinPrice;
        });
        break;
      case 'price_desc':
        filtered.sort((a, b) => {
          const aMinPrice = Math.min(...a.pricingOptions.map(option => option.amount));
          const bMinPrice = Math.min(...b.pricingOptions.map(option => option.amount));
          return bMinPrice - aMinPrice;
        });
        break;
      case 'name_asc':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name_desc':
        filtered.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      default:
        // Default sort by name ascending
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }
    
    setFilteredServices(filtered);
  };
  
  // Use this useEffect to apply filters whenever filters or services change
  useEffect(() => {
    if (services.length > 0) {
      applyFilters(services, searchQuery, filters);
    }
  }, [services, filters]);

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

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  const handleSelectService = (service) => {
    if (service && service.serviceId) {
      navigate(`/services/${service.serviceId}`);
    } else {
      console.error("Invalid service object:", service);
      setSnackbar({
        open: true,
        message: "Invalid service data",
        severity: "error",
      });
    }
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
        title="Services"
        showMenuButton={true}
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
                Discover Services
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  pb: 6,
                  color: themeMode === 'dark' ? 'text.secondary' : 'text.primary',
                  opacity: 0.8
                }}
              >
                Find and hire services from trusted vendors. Browse our selection or search for specific services.
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
                    placeholder="Search services..."
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
                        setFilteredServices(services);
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
                  {showFilters ? "Hide Filters" : "Filter Services"}
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
                    Filter Services
                  </Typography>
                  
                  {/* Category Filter */}
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
                      label="Catering" 
                      clickable
                      onClick={() => handleFilterChange('category', 'Catering')}
                      color={filters.category === 'Catering' ? 'primary' : 'default'}
                      variant={filters.category === 'Catering' ? 'filled' : 'outlined'}
                    />
                    <Chip 
                      label="Venue" 
                      clickable
                      onClick={() => handleFilterChange('category', 'Venue')}
                      color={filters.category === 'Venue' ? 'primary' : 'default'}
                      variant={filters.category === 'Venue' ? 'filled' : 'outlined'}
                    />
                    <Chip 
                      label="Photography" 
                      clickable
                      onClick={() => handleFilterChange('category', 'Photography')}
                      color={filters.category === 'Photography' ? 'primary' : 'default'}
                      variant={filters.category === 'Photography' ? 'filled' : 'outlined'}
                    />
                    <Chip 
                      label="Decoration" 
                      clickable
                      onClick={() => handleFilterChange('category', 'Decoration')}
                      color={filters.category === 'Decoration' ? 'primary' : 'default'}
                      variant={filters.category === 'Decoration' ? 'filled' : 'outlined'}
                    />
                  </Box>
                  
                  {/* Price Range Filter */}
                  <Typography variant="subtitle2" gutterBottom>
                    Price Range
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Price Range</InputLabel>
                        <Select
                          value={filters.priceRange}
                          label="Price Range"
                          onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                        >
                          <MenuItem value="ANY">Any Price</MenuItem>
                          <MenuItem value="0-50">$0 - $50</MenuItem>
                          <MenuItem value="50-100">$50 - $100</MenuItem>
                          <MenuItem value="100-500">$100 - $500</MenuItem>
                          <MenuItem value="500-1000">$500 - $1000</MenuItem>
                          <MenuItem value="1000-">$1000+</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Sort By</InputLabel>
                        <Select
                          value={filters.sortBy}
                          label="Sort By"
                          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        >
                          <MenuItem value="name_asc">Name (A-Z)</MenuItem>
                          <MenuItem value="name_desc">Name (Z-A)</MenuItem>
                          <MenuItem value="price_asc">Price (Low to High)</MenuItem>
                          <MenuItem value="price_desc">Price (High to Low)</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
            {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} found
          </Typography>
          
          {sessionStorage.getItem("username") && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/add-service")}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                backgroundColor: "primary.main",
                '&:hover': {
                  backgroundColor: "primary.dark",
                }
              }}
            >
              Add Your Service
            </Button>
          )}
        </Box>

        {/* Service Listings */}
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
              Loading services...
            </Typography>
          </Box>
        ) : filteredServices.length > 0 ? (
          <Grid container spacing={3} className="animate-fadeIn">
            {filteredServices.map((service, index) => (
              <Grid item key={service.serviceId} xs={12} sm={6} md={4} 
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
                  onClick={() => handleSelectService(service)}
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
                      background: `linear-gradient(90deg, ${getCategoryColor(service.category)} 0%, ${getCategoryColor(service.category)}88 100%)`,
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
                      label={service.category}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        color: "white",
                        backgroundColor: getCategoryColor(service.category),
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        borderRadius: "8px",
                        px: 1,
                        '& .MuiChip-label': {
                          padding: '0 8px',
                        },
                      }}
                    />
                  </Box>

                  {/* Placeholder Image */}
                  <Box sx={{ position: "relative", paddingTop: "56.25%" /* 16:9 aspect ratio */ }}>
                    <CardMedia
                      component="img"
                      image={`https://source.unsplash.com/random/300x200/?${service.category.toLowerCase()}`}
                      alt={service.name}
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
                    
                    {/* Vendor Name Badge */}
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
                        VENDOR
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold" color="text.primary" lineHeight={1}>
                        {service.vendor.name || 'Unknown'}
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
                      {service.name}
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
                        {service.vendor.address || 'Location not specified'}
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
                      {service.description}
                    </Typography>

                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PriceIcon sx={{ fontSize: 18, mr: 0.5, color: 'primary.main' }} />
                        <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                          ${Math.min(...service.pricingOptions.map(option => option.amount))}+
                        </Typography>
                      </Box>
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
              background: themeMode === 'dark' 
                ? 'rgba(30, 41, 59, 0.7)' 
                : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: "blur(10px)",
              border: themeMode === 'dark' 
                ? '1px solid rgba(255,255,255,0.1)' 
                : '1px solid rgba(0,0,0,0.05)',
            }}
          >
            <CategoryIcon sx={{ fontSize: 60, color: "text.secondary", opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery ? "No services match your search" : "No services found"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery ? "Try adjusting your search terms" : "There are no services available at the moment"}
            </Typography>
          </Paper>
        )}

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

Service.propTypes = {
  themeMode: PropTypes.string.isRequired
};

export default Service; 
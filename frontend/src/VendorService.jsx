import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import AddBoxIcon from "@mui/icons-material/AddBox";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CategoryIcon from "@mui/icons-material/Category";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import StoreIcon from "@mui/icons-material/Store";
import PropTypes from 'prop-types';
import Loading from "./components/Loading";
import Navbar from "./components/Navbar";
import NavDrawer from "./components/NavDrawer";
import axios from "./config/axiosconfig";

const VendorService = ({ themeMode }) => {
  const navigate = useNavigate();
  
  // State variables
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({
    open: false,
    serviceId: null,
    serviceName: ""
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const username = sessionStorage.getItem("username");

  useEffect(() => {
    // Check user role and fetch vendor profile first
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
        
        // Check if user has vendor role (handling both array and string cases)
        const hasVendorRole = Array.isArray(userRole) 
          ? userRole.includes("vendor") 
          : userRole === "vendor";
        
        if (!hasVendorRole) {
          // User does not have vendor role
          setSnackbar({
            open: true,
            message: "You need vendor privileges to view services",
            severity: "error",
          });
          
          setTimeout(() => {
            navigate("/home");
          }, 2000);
          return;
        }
        
        // Fetch vendor services
        fetchVendorServices(username);
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
    
    checkRoleAndFetchProfile();
  }, [navigate, username]);

  const fetchVendorServices = async (username) => {
    try {
      const response = await axios.get(`/api/vendors/${username}/services`);
      if (response.data) {
        setServices(response.data);
      } else {
        setServices([]);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setSnackbar({
        open: true,
        message: "Failed to load services. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirmOpen = (service, e) => {
    e.stopPropagation(); // Prevent event details from opening
    setDeleteConfirmDialog({
      open: true,
      serviceId: service.serviceId,
      serviceName: service.name
    });
  };

  const handleDeleteConfirmClose = () => {
    setDeleteConfirmDialog({
      open: false,
      serviceId: null,
      serviceName: ""
    });
  };

  const handleDeleteService = async () => {
    try {
      if (!username) {
        throw new Error("Username not found");
      }
      
      setLoading(true);
      console.log(`Deleting service: ${deleteConfirmDialog.serviceId}`);
      
      // Delete the service using the API route
      const response = await axios.delete(`/api/vendors/${username}/services/${deleteConfirmDialog.serviceId}`);
      console.log("Delete response:", response.data);
      
      // Update services state
      setServices(prev => prev.filter(service => service.serviceId !== deleteConfirmDialog.serviceId));
      
      setSnackbar({
        open: true,
        message: "Service deleted successfully!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error deleting service:", err);
      
      setSnackbar({
        open: true,
        message: err.response?.data?.error || "Failed to delete service. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
      handleDeleteConfirmClose();
    }
  };

  const handleEditService = (service, e) => {
    e.stopPropagation(); // Prevent event details from opening
    // Navigate to edit service page
    navigate(`/edit-service/${service.serviceId}`);
  };

  const handleViewService = (service, e) => {
    e.stopPropagation(); // Prevent default behavior
    // Navigate to service details page
    navigate(`/services/${service.serviceId}`);
  };

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
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

  const getPricingTypeLabel = (type) => {
    const types = {
      'hourly': 'Per Hour',
      'daily': 'Per Day',
      'fixed': 'Fixed Rate',
      'tiered': 'Tiered Package'
    };
    return types[type] || type;
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
                My Services
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  pb: 6,
                  color: themeMode === 'dark' ? 'text.secondary' : 'text.primary',
                  opacity: 0.8
                }}
              >
                Manage all your services in one place. Create new services, edit details, and track inquiries.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' }, display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddBoxIcon />}
                onClick={() => navigate("/add-service")}
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
                Add New Service
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Results Count */}
        <Box sx={{ mb: 2, px: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" className="animate-fadeIn">
            {services.length} {services.length === 1 ? 'service' : 'services'} found
          </Typography>
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
              Loading your services...
            </Typography>
          </Box>
        ) : services.length > 0 ? (
          <Grid container spacing={3} className="animate-fadeIn">
            {services.map((service, index) => (
              <Grid item xs={12} key={service.serviceId}
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
                      background: `linear-gradient(180deg, ${getCategoryColor(service.category)} 0%, ${getCategoryColor(service.category)}88 100%)`,
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    },
                    "&:hover::before": {
                      opacity: 1,
                    }
                  }}
                >
                  {/* Service Image */}
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
                      image={`https://source.unsplash.com/random/300x200/?${service.category.toLowerCase()}`}
                      alt={service.name}
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
                        PRICING
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="text.primary" lineHeight={1}>
                        ${Math.min(...service.pricingOptions.map(option => option.amount))}+
                      </Typography>
                    </Box>
                  </Box>

                  {/* Service Details */}
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
                        label={service.category}
                        size="small"
                        sx={{
                          mb: 1.5,
                          fontWeight: 500,
                          color: "white",
                          backgroundColor: getCategoryColor(service.category),
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
                        {service.name}
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
                        {service.description}
                      </Typography>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CategoryIcon fontSize="small" color="action" sx={{ opacity: 0.7 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Category
                            </Typography>
                            <Typography variant="body2" fontWeight="500">
                              {service.category}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <StoreIcon fontSize="small" color="action" sx={{ opacity: 0.7 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Status
                            </Typography>
                            <Typography variant="body2" fontWeight="500">
                              {service.available ? "Available" : "Not Available"}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoneyIcon fontSize="small" color="action" sx={{ opacity: 0.7 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Pricing Type
                            </Typography>
                            <Typography variant="body2" fontWeight="500">
                              {service.pricingOptions.length > 0 ? 
                                getPricingTypeLabel(service.pricingOptions[0].type) : "Not specified"}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOnIcon fontSize="small" color="action" sx={{ opacity: 0.7 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Pricing Options
                            </Typography>
                            <Typography variant="body2" fontWeight="500">
                              {service.pricingOptions.length} options
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Action Buttons */}
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
                        onClick={(e) => handleViewService(service, e)}
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
                        onClick={(e) => handleEditService(service, e)}
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
                        Edit Service
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteIcon />}
                        onClick={(e) => handleDeleteConfirmOpen(service, e)}
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
            <CategoryIcon sx={{ fontSize: 60, color: "text.secondary", opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              You don&apos;t have any services yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first service to get started
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddBoxIcon />}
              onClick={() => navigate("/add-service")}
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
              Add New Service
            </Button>
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
          Delete Service
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <b>{deleteConfirmDialog.serviceName}</b>? This action cannot be undone.
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
            onClick={handleDeleteService}
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

VendorService.propTypes = {
  themeMode: PropTypes.string.isRequired,
};

export default VendorService; 
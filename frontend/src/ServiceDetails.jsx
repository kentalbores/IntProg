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
} from "@mui/material";
import {
  LocationOn as LocationOnIcon,
  Category as CategoryIcon,
  AttachMoney as AttachMoneyIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Store as StoreIcon,
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

  useEffect(() => {
    fetchServiceDetails();
  }, [serviceId]);

  const fetchServiceDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/services/${serviceId}`);
      if (response.data && response.data.service) {
        setService(response.data.service);
      } else {
        setSnackbar({
          open: true,
          message: "Service not found",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error fetching service details:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.error || "Failed to load service details",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      const username = sessionStorage.getItem('username');
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
        message: "Failed to delete service",
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
                        
                        <Button 
                          variant="contained" 
                          fullWidth
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
                          Select this option
                        </Button>
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
          <DialogTitle>Delete Service</DialogTitle>
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

ServiceDetails.propTypes = {
  themeMode: PropTypes.string
};

export default ServiceDetails; 
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
  IconButton,
  Card,
  CardContent,
  FormHelperText,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "./config/axiosconfig";
import Navbar from "./components/Navbar";
import NavDrawer from "./components/NavDrawer";
import PropTypes from 'prop-types';
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const AddService = ({ themeMode, isEditMode = false }) => {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVendor, setIsVendor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vendorId, setVendorId] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [serviceData, setServiceData] = useState({
    name: "",
    description: "",
    category: "",
    available: true,
    pricingOptions: [
      {
        type: "fixed",
        label: "Standard Rate",
        amount: 100,
        description: ""
      }
    ],
    image: "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg",
    detailImage: "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg"
  });

  // Validation state
  const [errors, setErrors] = useState({
    name: false,
    description: false,
    category: false,
    pricingOptions: []
  });

  const categories = [
    "Catering",
    "Venue",
    "Photography",
    "Decoration",
    "Entertainment",
    "Transportation",
    "Equipment",
    "Other",
  ];

  const pricingTypes = [
    { value: "fixed", label: "Fixed Rate" },
    { value: "hourly", label: "Per Hour" },
    { value: "daily", label: "Per Day" },
    { value: "tiered", label: "Tiered Package" }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validate required fields
    if (name === "name") {
      setErrors({
        ...errors,
        name: value.trim().length < 3
      });
    }
    
    if (name === "description") {
      setErrors({
        ...errors,
        description: value.trim().length < 10
      });
    }
    
    setServiceData({
      ...serviceData,
      [name]: value
    });
  };

  const handlePricingChange = (index, field, value) => {
    const updatedPricingOptions = [...serviceData.pricingOptions];
    updatedPricingOptions[index] = {
      ...updatedPricingOptions[index],
      [field]: value
    };
    
    // Validate pricing option
    const updatedErrors = [...errors.pricingOptions];
    if (field === "label") {
      updatedErrors[index] = {
        ...updatedErrors[index],
        label: !value.trim()
      };
    } else if (field === "amount") {
      const numValue = parseFloat(value);
      updatedErrors[index] = {
        ...updatedErrors[index],
        amount: isNaN(numValue) || numValue <= 0
      };
    }
    
    setErrors({
      ...errors,
      pricingOptions: updatedErrors
    });
    
    setServiceData({
      ...serviceData,
      pricingOptions: updatedPricingOptions
    });
  };

  const addPricingOption = () => {
    const newPricingOption = {
      type: "fixed",
      label: "Additional Option",
      amount: 50,
      description: ""
    };
    
    const updatedPricingOptions = [...serviceData.pricingOptions, newPricingOption];
    const updatedPricingErrors = [...errors.pricingOptions, { label: false, amount: false }];
    
    setServiceData({
      ...serviceData,
      pricingOptions: updatedPricingOptions
    });
    
    setErrors({
      ...errors,
      pricingOptions: updatedPricingErrors
    });
  };

  const removePricingOption = (index) => {
    if (serviceData.pricingOptions.length <= 1) {
      setSnackbar({
        open: true,
        message: "At least one pricing option is required",
        severity: "error",
      });
      return;
    }
    
    const updatedPricingOptions = serviceData.pricingOptions.filter((_, i) => i !== index);
    const updatedPricingErrors = errors.pricingOptions.filter((_, i) => i !== index);
    
    setServiceData({
      ...serviceData,
      pricingOptions: updatedPricingOptions
    });
    
    setErrors({
      ...errors,
      pricingOptions: updatedPricingErrors
    });
  };

  const validateForm = () => {
    const newErrors = {
      name: !serviceData.name.trim(),
      description: !serviceData.description.trim(),
      category: !serviceData.category.trim(),
      pricingOptions: serviceData.pricingOptions.map(option => ({
        label: !option.label.trim(),
        amount: isNaN(parseFloat(option.amount)) || parseFloat(option.amount) <= 0
      }))
    };

    setErrors(newErrors);
    
    // Return true if no errors exist
    return !newErrors.name && 
           !newErrors.description && 
           !newErrors.category && 
           !newErrors.pricingOptions.some(option => option.label || option.amount);
  };

  const handleSubmitService = async () => {
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
      // Format pricing options to ensure they are valid
      const formattedPricingOptions = serviceData.pricingOptions.map(option => ({
        type: option.type || "fixed",
        label: option.label.trim(),
        amount: parseFloat(option.amount), // Ensure amount is a number
        description: option.description || ""
      }));

      // Create service payload
      const payload = {
        ...serviceData,
        pricingOptions: formattedPricingOptions
      };
      
      // Always include vendorId in the payload
      if (vendorId) {
        payload.vendor = vendorId;
      } else {
        // If vendorId is missing, show error and don't proceed
        setSnackbar({
          open: true,
          message: "Vendor ID is missing. Please reload the page or contact support.",
          severity: "error",
        });
        return;
      }
      
      console.log("Submitting service data:", payload);
      
      // If in edit mode, specify serviceId
      if (isEditMode && serviceId) {
        payload.serviceId = serviceId;
      }
      
      const response = await axios.post("/api/services", payload);
      console.log("Service created/updated:", response.data);

      setSnackbar({
        open: true,
        message: isEditMode ? "Service updated successfully!" : "Service added successfully!",
        severity: "success",
      });

      // Navigate back after successful operation
      setTimeout(() => {
        navigate("/vendor-services");
      }, 1500);
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} service:`, error);
      
      // Display more detailed error information
      const errorMessage = error.response?.data?.error || 
        `Failed to ${isEditMode ? 'update' : 'add'} service. Please try again.`;
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  // Fetch service data for editing
  const fetchServiceForEdit = async (id) => {
    try {
      const response = await axios.get(`/api/services/${id}`);
      if (response.data) {
        const service = response.data;
        
        setServiceData({
          name: service.name || "",
          description: service.description || "",
          category: service.category || "",
          available: service.available !== undefined ? service.available : true,
          pricingOptions: service.pricingOptions && service.pricingOptions.length > 0 ? 
            service.pricingOptions : [
              {
                type: "fixed",
                label: "Standard Rate",
                amount: 100,
                description: ""
              }
            ],
          image: service.image || "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg",
          detailImage: service.detailImage || "https://ralfvanveen.com/wp-content/uploads/2021/06/Placeholder-_-Glossary.svg"
        });
        
        // Initialize pricing options errors array
        setErrors({
          ...errors,
          pricingOptions: new Array(service.pricingOptions?.length || 1).fill({
            label: false,
            amount: false
          })
        });
      }
    } catch (error) {
      console.error("Error fetching service for editing:", error);
      setSnackbar({
        open: true,
        message: "Failed to load service data for editing.",
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
        const roleResponse = await axios.get(`api/user/my-role/${username}`);
        const userRole = roleResponse.data.role;
        
        // Check if user has vendor role (handling both array and string cases)
        const hasVendorRole = Array.isArray(userRole) 
          ? userRole.includes("vendor") 
          : userRole === "vendor";
        
        if (!hasVendorRole) {
          // User does not have vendor role
          setSnackbar({
            open: true,
            message: "You need vendor privileges to create services",
            severity: "error",
          });
          
          setTimeout(() => {
            navigate("/home");
          }, 2000);
          return;
        }
        
        setIsVendor(true);
        
        // Fetch vendor profile
        try {
          const vendorRes = await axios.get(`/api/vendors/profile/${username}`);
          if (vendorRes.data?.profile) {
            setVendorId(vendorRes.data.profile.vendorId);
            
            // If in edit mode, fetch the service data
            if (isEditMode && serviceId) {
              await fetchServiceForEdit(serviceId);
            }
          }
        } catch (err) {
          console.error("Error fetching vendor profile:", err);
          // If in edit mode, still try to fetch the service
          if (isEditMode && serviceId) {
            await fetchServiceForEdit(serviceId);
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
  }, [navigate, isEditMode, serviceId]);

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  // Redirect if not a vendor and finished loading
  if (!loading && !isVendor) {
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
        title={isEditMode ? "Edit Service" : "Add Service"}
        showBackButton={true}
        onMenuClick={() => setMenuOpen(true)}
      />
      
      {/* NavDrawer */}
      <NavDrawer
        themeMode={themeMode}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
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
                {isEditMode ? "Edit Service" : "Create New Service"}
              </Typography>
              <Typography 
                variant="body1" 
                sx={{
                  color: themeMode === 'dark' ? 'text.secondary' : 'text.primary',
                }}
              >
                {isEditMode 
                  ? "Update the service details below. All fields marked with * are required."
                  : "Fill in the details below to create your service. All fields marked with * are required."}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Service Form */}
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
                label="Service Name"
                name="name"
                value={serviceData.name}
                onChange={handleInputChange}
                variant="outlined"
                error={errors.name}
                helperText={errors.name ? "Name must be at least 3 characters" : ""}
                InputProps={{
                  sx: { 
                    borderRadius: 2,
                    background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl 
                fullWidth 
                required
                error={errors.category}
              >
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  name="category"
                  value={serviceData.category}
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
                {errors.category && (
                  <FormHelperText>Category is required</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="description"
                label="Description"
                name="description"
                multiline
                rows={4}
                value={serviceData.description}
                onChange={handleInputChange}
                error={errors.description}
                helperText={errors.description ? "Description must be at least 10 characters" : ""}
                placeholder="Provide a detailed description of your service..."
                InputProps={{
                  sx: { 
                    borderRadius: 2,
                    background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="availability-label">Availability</InputLabel>
                <Select
                  labelId="availability-label"
                  id="available"
                  name="available"
                  value={serviceData.available}
                  label="Availability"
                  onChange={(e) => setServiceData({
                    ...serviceData,
                    available: e.target.value
                  })}
                  sx={{ 
                    borderRadius: 2,
                    background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  }}
                >
                  <MenuItem value={true}>Available</MenuItem>
                  <MenuItem value={false}>Not Available</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography 
                variant="h6" 
                fontWeight="600" 
                gutterBottom
                sx={{
                  color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
                  mt: 2
                }}
              >
                Pricing Options
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Define one or more pricing options for your service. At least one option is required.
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            {serviceData.pricingOptions.map((option, index) => (
              <Grid item xs={12} key={index}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    border: themeMode === 'dark' 
                      ? '1px solid rgba(255,255,255,0.1)' 
                      : '1px solid rgba(0,0,0,0.08)',
                    mb: 2,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="600">
                        Pricing Option {index + 1}
                      </Typography>
                      <IconButton 
                        color="error" 
                        onClick={() => removePricingOption(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel id={`pricing-type-label-${index}`}>Type</InputLabel>
                          <Select
                            labelId={`pricing-type-label-${index}`}
                            value={option.type}
                            label="Type"
                            onChange={(e) => handlePricingChange(index, 'type', e.target.value)}
                            sx={{ 
                              borderRadius: 2,
                              background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                            }}
                          >
                            {pricingTypes.map((type) => (
                              <MenuItem key={type.value} value={type.value}>
                                {type.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          required
                          fullWidth
                          label="Label"
                          value={option.label}
                          onChange={(e) => handlePricingChange(index, 'label', e.target.value)}
                          placeholder="e.g., Basic Package, Per Hour, etc."
                          error={errors.pricingOptions[index]?.label}
                          helperText={errors.pricingOptions[index]?.label ? "Label is required" : ""}
                          sx={{ mb: 2 }}
                          InputProps={{
                            sx: { 
                              borderRadius: 2,
                              background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                            }
                          }}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          required
                          fullWidth
                          label="Amount"
                          type="number"
                          value={option.amount}
                          onChange={(e) => handlePricingChange(index, 'amount', e.target.value)}
                          InputProps={{
                            startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                            sx: { 
                              borderRadius: 2,
                              background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                            }
                          }}
                          error={errors.pricingOptions[index]?.amount}
                          helperText={errors.pricingOptions[index]?.amount ? "Amount must be greater than 0" : ""}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description (Optional)"
                          value={option.description || ''}
                          onChange={(e) => handlePricingChange(index, 'description', e.target.value)}
                          placeholder="Explain what's included in this pricing option"
                          multiline
                          rows={2}
                          InputProps={{
                            sx: { 
                              borderRadius: 2,
                              background: themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<AddCircleIcon />}
                onClick={addPricingOption}
                sx={{ 
                  mt: 1, 
                  mb: 4,
                  borderRadius: 2,
                  borderColor: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                  color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                  '&:hover': {
                    borderColor: themeMode === 'dark' ? 'primary.main' : 'primary.dark',
                    background: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.1)' : 'rgba(58, 134, 255, 0.05)',
                  }
                }}
              >
                Add Another Pricing Option
              </Button>
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
                Service Images
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="image"
                label="Thumbnail Image URL"
                name="image"
                value={serviceData.image}
                onChange={handleInputChange}
                helperText="URL for the service card thumbnail"
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
                  src={serviceData.image}
                  alt="Service thumbnail preview"
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
                value={serviceData.detailImage}
                onChange={handleInputChange}
                helperText="URL for the larger service detail image"
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
                  src={serviceData.detailImage}
                  alt="Service detail preview"
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
                  onClick={() => navigate("/vendor-services")}
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
                  onClick={handleSubmitService}
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
                  {isEditMode ? "Update Service" : "Create Service"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

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

AddService.propTypes = {
  themeMode: PropTypes.string,
  isEditMode: PropTypes.bool
};

export default AddService; 
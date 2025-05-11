import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputAdornment,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DescriptionIcon from "@mui/icons-material/Description";

const VendorSetup = ({ userData, onContinue }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    location: { lat: null, lng: null },
  });

  const [errors, setErrors] = useState({});

  // Initialize form with user data if available
  useEffect(() => {
    if (userData.vendorProfile) {
      setFormData({
        ...formData,
        ...userData.vendorProfile,
      });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onContinue({
        vendorProfile: {
          name: formData.name,
          description: formData.description,
          address: formData.address,
          location: formData.location,
        },
      });
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 700, mx: "auto" }}>
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 3,
          mb: 4,
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom align="center">
          Set Up Your Vendor Profile
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          paragraph
          align="center"
          sx={{ mb: 4 }}
        >
          Tell us about your services and location
        </Typography>

        {/* Vendor Name */}
        <TextField
          fullWidth
          label="Vendor Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          variant="outlined"
          margin="normal"
          error={!!errors.name}
          helperText={errors.name}
          sx={{ mb: 3 }}
          className="form-field-transition"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BusinessIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        {/* Description */}
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          variant="outlined"
          margin="normal"
          multiline
          rows={4}
          error={!!errors.description}
          helperText={
            errors.description ||
            "Describe your services and what you offer to event organizers"
          }
          sx={{ mb: 3 }}
          className="form-field-transition"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <DescriptionIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        {/* Address */}
        <TextField
          fullWidth
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          variant="outlined"
          margin="normal"
          error={!!errors.address}
          helperText={errors.address || "Your business or service location"}
          sx={{ mb: 3 }}
          className="form-field-transition"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOnIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ mt: 2, width: "100%" }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Note: You can add specific services after completing the onboarding process.
          </Typography>
        </FormControl>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleSubmit}
          fullWidth
          sx={{
            py: 1.5,
            mt: 2,
            borderRadius: 2,
            textTransform: "none",
            fontWeight: "bold",
            boxShadow: "0 4px 14px rgba(58, 134, 255, 0.4)",
          }}
        >
          Continue
        </Button>
      </Paper>
    </Box>
  );
};

export default VendorSetup;

import { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
  InputAdornment,
  useTheme,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import PersonIcon from "@mui/icons-material/Person";

const OrganizerSetup = ({ userData, onContinue }) => {
  const [formData, setFormData] = useState({
    type: "individual",
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const theme = useTheme();
  const themeMode = theme.palette.mode;

  // Initialize form with user data if available
  useEffect(() => {
    if (userData.organizerProfile) {
      setFormData({
        ...formData,
        ...userData.organizerProfile,
      });
    }
  }, [userData]);

  const handleTypeChange = (e) => {
    setFormData({
      ...formData,
      type: e.target.value,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.type) {
      newErrors.type = "Please select a type";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 20) {
      newErrors.description = "Description should be at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onContinue({
        organizerProfile: {
          type: formData.type,
          name: formData.name,
          description: formData.description,
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
          background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: "blur(10px)",
          border: themeMode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)' 
            : '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom 
          align="center"
          sx={{
            color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
            fontWeight: 600,
          }}
        >
          Set Up Your Organizer Profile
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          paragraph
          align="center"
          sx={{ mb: 4 }}
        >
          Tell us about how you'll be organizing events
        </Typography>

        {/* Organizer Type Selection */}
        <FormControl
          component="fieldset"
          sx={{ width: "100%", mb: 3 }}
          error={!!errors.type}
        >
          <FormLabel
            component="legend"
            sx={{ 
              mb: 1, 
              color: themeMode === 'dark' ? 'primary.light' : 'primary.dark', 
              fontWeight: 500 
            }}
          >
            Organizer Type
          </FormLabel>
          <RadioGroup
            row
            name="type"
            value={formData.type}
            onChange={handleTypeChange}
          >
            <Box
              sx={{
                display: "flex",
                gap: 2,
                width: "100%",
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  flex: 1,
                  borderColor:
                    formData.type === "organization"
                      ? "primary.main"
                      : "divider",
                  borderWidth: formData.type === "organization" ? 2 : 1,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backgroundColor:
                    formData.type === "organization"
                      ? (themeMode === 'dark' ? 'rgba(58, 134, 255, 0.1)' : 'rgba(58, 134, 255, 0.05)')
                      : (themeMode === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'background.paper'),
                }}
                onClick={() =>
                  setFormData({ ...formData, type: "organization" })
                }
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    value="organization"
                    control={<Radio />}
                    label=""
                    sx={{ m: 0 }}
                  />
                  <Box sx={{ ml: 1, display: "flex", alignItems: "center" }}>
                    <BusinessIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight={500}>
                      Organization
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, ml: 4 }}
                >
                  Company, non-profit, university, etc.
                </Typography>
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  flex: 1,
                  borderColor:
                    formData.type === "individual" ? "primary.main" : "divider",
                  borderWidth: formData.type === "individual" ? 2 : 1,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  backgroundColor:
                    formData.type === "individual"
                      ? (themeMode === 'dark' ? 'rgba(58, 134, 255, 0.1)' : 'rgba(58, 134, 255, 0.05)')
                      : (themeMode === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'background.paper'),
                }}
                onClick={() => setFormData({ ...formData, type: "individual" })}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <FormControlLabel
                    value="individual"
                    control={<Radio />}
                    label=""
                    sx={{ m: 0 }}
                  />
                  <Box sx={{ ml: 1, display: "flex", alignItems: "center" }}>
                    <PersonIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight={500}>
                      Individual
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, ml: 4 }}
                >
                  Personal or individual organizer
                </Typography>
              </Paper>
            </Box>
          </RadioGroup>
          {errors.type && (
            <Typography color="error" variant="caption" sx={{ mt: 1 }}>
              {errors.type}
            </Typography>
          )}
        </FormControl>

        {/* Organizer Name */}
        <TextField
          fullWidth
          label="Organizer Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          variant="outlined"
          margin="normal"
          error={!!errors.name}
          helperText={errors.name}
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              },
              '&:hover fieldset': {
                borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            }
          }}
          className="form-field-transition"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {formData.type === "organization" ? (
                  <BusinessIcon color="action" />
                ) : (
                  <PersonIcon color="action" />
                )}
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
            "Describe your organization or the types of events you plan to organize"
          }
          sx={{ 
            mb: 3,
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
              },
              '&:hover fieldset': {
                borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
              },
            }
          }}
          className="form-field-transition"
        />

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
            background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)',
            },
            boxShadow: themeMode === 'dark' 
              ? "0 4px 14px rgba(58, 134, 255, 0.6)" 
              : "0 4px 14px rgba(58, 134, 255, 0.4)",
          }}
        >
          Continue
        </Button>
      </Paper>
    </Box>
  );
};

export default OrganizerSetup;

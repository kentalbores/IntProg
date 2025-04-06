import { useEffect, useState, useRef } from "react";
import axios from "./config/axiosconfig";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Container,
  CircularProgress,
  Box,
  Divider,
  Avatar,
  Alert,
  TextField,
  Grid,
  Snackbar,
  IconButton,
  AppBar,
  Toolbar,
  useTheme,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import "./all.css";

// Custom theme - matching Home.jsx
const theme = createTheme({
  palette: {
    primary: {
      main: "#3a86ff",
      light: "#83b8ff",
      dark: "#0057cb",
    },
    secondary: {
      main: "#ff006e",
      light: "#ff5a9d",
      dark: "#c50054",
    },
    success: {
      main: "#38b000",
      light: "#70e000",
      dark: "#008000",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          boxShadow: "none",
          fontWeight: 600,
          padding: "8px 16px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          overflow: "hidden",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [success, setSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const customTheme = useTheme();
  const isMobile = useMediaQuery(customTheme.breakpoints.down("sm"));

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await axios.get(
          `/api/userinfo?username=${sessionStorage.getItem("username")}`
        );
        if (response.data?.user_info) {
          setUser(response.data.user_info);
          setFormData(response.data.user_info);
        } else {
          setError("User data not found.");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file is an image and under 5MB
      if (!file.type.startsWith('image/')) {
        setUpdateError("Please select an image file");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setUpdateError("Image size should be less than 5MB");
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async () => {
    try {
      // Create FormData object for file upload
      const formDataObj = new FormData();
      
      // Add user details
      formDataObj.append("username", formData.username);
      formDataObj.append("email", formData.email || "");
      formDataObj.append("firstname", formData.firstname || "");
      formDataObj.append("middlename", formData.middlename || "");
      formDataObj.append("lastname", formData.lastname || "");
      
      // Add image if selected
      if (selectedImage) {
        formDataObj.append("picture", selectedImage);
      }
      
      const response = await axios.post('/api/update-user', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status === 200) {
        // Update user state with the new data
        const updatedUser = { ...formData };
        if (response.data.picture) {
          updatedUser.picture = response.data.picture;
        }
        setUser(updatedUser);
        setSuccess(true);
        setEditMode(false);
        setSelectedImage(null);
        setPreviewImage(null);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setUpdateError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setUpdateError(null);
  };

  return (
    <ThemeProvider theme={theme} className="overflow-y-hidden">
      <Box
        sx={{
          minHeight: "100vh",
          pb: 6,
          backgroundImage: "url('./assets/bg.jpg')",
          backgroundSize: "100vw",
          backgroundAttachment: "fixed",
          backgroundPosition: "center",
          margin: 0,
          padding: 0,
        }}
      >
        {/* AppBar */}
        <AppBar
          position="sticky"
          color="default"
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0)",
            backdropFilter: "blur(5px)",
          }}
        >
          <Toolbar>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{ mr: 2, color: "primary.main" }}
              edge="start"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="primary.main"
              sx={{ flexGrow: 1 }}
            >
              My Profile
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ pt: 4 }}>
          {loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="50vh"
            >
              <CircularProgress size={50} color="primary" />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          ) : (
            <Paper
              elevation={2}
              sx={{
                p: 4,
                borderRadius: 3,
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                position: "relative",
                overflow: "hidden",
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
              
              <Box display="flex" justifyContent="center" mb={4} position="relative">
                {editMode ? (
                  <>
                    <Avatar
                      sx={{
                        width: 120,
                        height: 120,
                        bgcolor: "primary.light",
                        color: "white",
                        fontSize: 48,
                        cursor: "pointer",
                        border: "4px solid white",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      }}
                      src={previewImage || user?.picture || sessionStorage.getItem("picture") || ""}
                      onClick={handleImageClick}
                    >
                      {!previewImage && !user?.picture && !sessionStorage.getItem("picture") && (user?.username ? user.username.charAt(0).toUpperCase() : "U")}
                    </Avatar>
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: "calc(50% - 60px)",
                        backgroundColor: "white",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        "&:hover": { backgroundColor: "#f5f5f5" },
                      }}
                      onClick={handleImageClick}
                    >
                      <AddAPhotoIcon />
                    </IconButton>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                      style={{ display: "none" }}
                    />
                  </>
                ) : (
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      bgcolor: "primary.light",
                      color: "white",
                      fontSize: 48,
                      border: "4px solid white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                    src={user?.picture || sessionStorage.getItem("picture") || ""}
                  >
                    {!user?.picture && !sessionStorage.getItem("picture") && (user?.username ? user.username.charAt(0).toUpperCase() : "U")}
                  </Avatar>
                )}
              </Box>

              {/* Username */}
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 700, 
                  color: "primary.dark",
                  textAlign: "center",
                  mb: 3
                }}
              >
                {user.username}
              </Typography>

              <Divider sx={{ my: 3 }} />

              {editMode ? (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstname"
                      value={formData.firstname || ''}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastname"
                      value={formData.lastname || ''}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Middle Name"
                      name="middlename"
                      value={formData.middlename || ''}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => setEditMode(false)}
                        color="primary"
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="contained" 
                        onClick={handleSubmit}
                        color="primary"
                      >
                        Save Changes
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary">
                        First Name
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {user.firstname || "Not provided"}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary">
                        Last Name
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {user.lastname || "Not provided"}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary">
                        Middle Name
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {user.middlename || "Not provided"}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                      }}
                    >
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {user.email || "Not provided"}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                      <Button 
                        variant="contained" 
                        onClick={() => setEditMode(true)}
                        color="primary"
                      >
                        Edit Profile
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Paper>
          )}

          {/* Snackbar for success/error messages */}
          <Snackbar
            open={success || !!updateError}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={success ? "success" : "error"}
              sx={{ width: '100%' }}
            >
              {success ? "Profile updated successfully!" : updateError}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Profile;
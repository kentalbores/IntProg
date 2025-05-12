import { useEffect, useState, useRef } from "react";
import axios from "./config/axiosconfig";
import {
  Button,
  Typography,
  Container,
  CircularProgress,
  Box,
  Avatar,
  Alert,
  TextField,
  Grid,
  Snackbar,
  IconButton,
  Paper,
  Tabs,
  Tab,
  Chip,
  Stack,
  Divider
} from "@mui/material";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import EditIcon from "@mui/icons-material/Edit";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventNoteIcon from "@mui/icons-material/EventNote";
import BusinessIcon from "@mui/icons-material/Business";
import PeopleIcon from "@mui/icons-material/People";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import VerifiedIcon from "@mui/icons-material/Verified";
import WorkIcon from "@mui/icons-material/Work";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { useNavigate } from "react-router-dom";
import "./all.css";
import Navbar from "./components/Navbar";

// PropTypes
import PropTypes from 'prop-types';

const Profile = ({ themeMode }) => {
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
  
  // Tab state for profiles
  const [tabValue, setTabValue] = useState(0);
  const [organizerProfile, setOrganizerProfile] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [profileError, setProfileError] = useState(null);
  
  // Forms for organizer and vendor profiles
  const [organizerFormData, setOrganizerFormData] = useState({
    name: "",
    type: "individual",
    description: ""
  });
  const [vendorFormData, setVendorFormData] = useState({
    name: "",
    description: "",
    location: { lat: null, long: null },
    address: "",
    services: []
  });
  const [editOrganizerMode, setEditOrganizerMode] = useState(false);
  const [editVendorMode, setEditVendorMode] = useState(false);

  // Mock statistics data (would be fetched from API in a real implementation)
  const userStats = {
    eventsAttended: 0,
    upcomingEvents: 3,
    connections: 0,
    activeSince: "May 2025",
    lastActive: "Today"
  };
  
  const organizerStats = {
    eventsCreated: 8,
    upcomingEvents: 2,
    pastEvents: 6,
    totalAttendees: 350,
    vendorsHired: 15,
    avgEventRating: 4.7
  };
  
  const vendorStats = {
    servicesOffered: 5,
    eventsParticipated: 10,
    totalCustomers: 120,
    avgRating: 4.8,
    upcomingEvents: 3,
    completedJobs: 22
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        const username = sessionStorage.getItem("username");
        if (!username) {
          setError("User not found in session");
          setLoading(false);
          return;
        }

        // Get basic user info
        const response = await axios.get(
          `/api/userinfo?username=${username}`
        );
        
        if (response.data?.user_info) {
          setUser(response.data.user_info);
          setFormData(response.data.user_info);
          
          // Get user role using the dedicated endpoint
          try {
            const roleResponse = await axios.get(`api/user/my-role/${username}`);
            const userRole = roleResponse.data.role;
            
            // If user is an organizer or vendor, fetch those profiles
            if (userRole === "organizer" || userRole === "vendor") {
              fetchProfiles(username);
            }
          } catch (roleErr) {
            console.error("Error fetching user role:", roleErr);
            // If we can't get the role, try to use the one from user info
            if (response.data.user_info.role === "organizer" || response.data.user_info.role === "vendor") {
              fetchProfiles(username);
            }
          }
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

    const fetchProfiles = async (username) => {
      setLoadingProfiles(true);
      try {
        // Fetch organizer profile if exists
        try {
          const organizerRes = await axios.get(`/api/organizer/profile/${username}`);
          if (organizerRes.data?.profile) {
            setOrganizerProfile(organizerRes.data.profile);
            setOrganizerFormData({
              name: organizerRes.data.profile.name || "",
              type: organizerRes.data.profile.type || "individual",
              description: organizerRes.data.profile.description || ""
            });
          }
        } catch (err) {
          if (err.response?.status !== 404) {
            console.error("Error fetching organizer profile:", err);
          }
        }
        
        // Fetch vendor profile if exists
        try {
          const vendorRes = await axios.get(`/api/vendor/profile/${username}`);
          if (vendorRes.data?.profile) {
            setVendorProfile(vendorRes.data.profile);
            setVendorFormData({
              name: vendorRes.data.profile.name || "",
              description: vendorRes.data.profile.description || "",
              location: vendorRes.data.profile.location || { lat: null, long: null },
              address: vendorRes.data.profile.address || "",
              services: vendorRes.data.profile.services || []
            });
          }
        } catch (err) {
          if (err.response?.status !== 404) {
            console.error("Error fetching vendor profile:", err);
          }
        }
      } catch (err) {
        console.error("Error fetching profiles:", err);
        setProfileError("Failed to load profile data.");
      } finally {
        setLoadingProfiles(false);
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

  const handleOrganizerChange = (e) => {
    const { name, value } = e.target;
    setOrganizerFormData({
      ...organizerFormData,
      [name]: value,
    });
  };

  const handleVendorChange = (e) => {
    const { name, value } = e.target;
    setVendorFormData({
      ...vendorFormData,
      [name]: value,
    });
  };

  const handleVendorAddressChange = (e) => {
    const { value } = e.target;
    setVendorFormData({
      ...vendorFormData,
      address: value,
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOrganizerSubmit = async () => {
    try {
      const response = await axios.post('/api/organizer/profile', {
        username: user.username,
        ...organizerFormData
      });
      
      if (response.status === 200) {
        setOrganizerProfile(response.data.profile);
        setEditOrganizerMode(false);
        setSuccess(true);
        
        // Update user role if needed
        if (user.role !== 'organizer') {
          setUser({...user, role: 'organizer'});
        }
      }
    } catch (err) {
      console.error("Error updating organizer profile:", err);
      setUpdateError(err.response?.data?.message || "Failed to update organizer profile");
    }
  };

  const handleVendorSubmit = async () => {
    try {
      const response = await axios.post('/api/vendor/profile', {
        username: user.username,
        ...vendorFormData
      });
      
      if (response.status === 200) {
        setVendorProfile(response.data.profile);
        setEditVendorMode(false);
        setSuccess(true);
        
        // Update user role if needed
        if (user.role !== 'vendor') {
          setUser({...user, role: 'vendor'});
        }
      }
    } catch (err) {
      console.error("Error updating vendor profile:", err);
      setUpdateError(err.response?.data?.message || "Failed to update vendor profile");
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
      }}
    >
      {/* Navbar */}
      <Navbar
        themeMode={themeMode}
        title="Profile"
        showBackButton={true}
        user={user}
      />

      <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
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
          <>
            {/* Profile Header */}
          <Paper
              elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
                background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: "blur(10px)",
                mb: 3,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Decorative top bar */}
            <Box
              sx={{
                  position: 'absolute', 
                top: 0,
                left: 0,
                right: 0,
                  height: '6px', 
                  background: 'linear-gradient(90deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)' 
              }}
            />
            
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              {editMode ? (
                    <Box position="relative" sx={{ display: 'inline-block' }}>
                  <Avatar
                    sx={{
                          width: 180,
                          height: 180,
                          bgcolor: "primary.main",
                      color: "white",
                          fontSize: 60,
                      cursor: "pointer",
                          border: "4px solid",
                          borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                          boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                        }}
                        src={previewImage || user?.picture || ""}
                    onClick={handleImageClick}
                  >
                        {!previewImage && !user?.picture && user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <IconButton
                        size="medium"
                    sx={{
                      position: "absolute",
                          bottom: 8,
                          right: 8,
                      backgroundColor: "white",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          '&:hover': {
                            backgroundColor: '#f5f5f5'
                          }
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
                    </Box>
              ) : (
                <Avatar
                  sx={{
                        width: 180,
                        height: 180,
                        bgcolor: "primary.main",
                    color: "white",
                        fontSize: 60,
                        border: "4px solid",
                        borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                        mx: { xs: 'auto', md: 0 }
                      }}
                      src={user?.picture || ""}
                    >
                      {!user?.picture && user?.username?.charAt(0).toUpperCase()}
                </Avatar>
              )}
                </Grid>

                <Grid item xs={12} md={9}>
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, flexWrap: 'wrap' }}>
                      <Box>
            <Typography 
                          variant="h3" 
              sx={{ 
                fontWeight: 700, 
                            color: themeMode === 'dark' ? 'white' : 'text.primary',
                            mb: 0.5,
                            fontSize: { xs: '2rem', md: '2.5rem' }
                          }}
                        >
                          {`${user.firstname || ''} ${user.lastname || ''}`}
            </Typography>

                        <Typography 
                          variant="h6" 
                          color="text.secondary" 
                          sx={{ mb: 1.5, fontSize: { xs: '1rem', md: '1.25rem' } }}
                        >
                          @{user.username}
                          {user.role === 'organizer' || user.role === 'vendor' ? (
                            <VerifiedIcon sx={{ color: '#3B82F6', ml: 1, fontSize: '1.2rem', verticalAlign: 'text-bottom' }}/>
                          ) : null}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {user.role && (
                            <Chip 
                              label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} 
                              color={user.role === 'guest' ? 'default' : user.role === 'organizer' ? 'primary' : 'secondary'}
                              size="small"
                              sx={{ 
                                borderRadius: 1,
                                fontWeight: 600,
                                px: 1
                              }}
                            />
                          )}
                          {user.email && (
                            <Chip 
                              label={user.email} 
                              size="small"
                              variant="outlined"
                              sx={{ borderRadius: 1 }}
                            />
                          )}
                        </Box>
                      </Box>
                      
                      {!editMode && (
                        <Button 
                          variant="contained" 
                          startIcon={<EditIcon />}
                          onClick={() => setEditMode(true)}
                          sx={{
                            mt: { xs: 2, sm: 0 },
                            backgroundImage: 'linear-gradient(90deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)',
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                              backgroundImage: 'linear-gradient(90deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)',
                            }
                          }}
                        >
                          Edit Profile
                        </Button>
                      )}
                    </Box>
                    
                    {/* User Stats */}
                    <Box 
                      sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr', md: '1fr 1fr 1fr 1fr 1fr' },
                        gap: 2,
                        mt: 2
                      }}
                    >
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <EventNoteIcon sx={{ color: '#3B82F6', mb: 1, fontSize: '2rem' }} />
                        <Typography variant="h5" fontWeight="bold" color="text.primary">{userStats.eventsAttended}</Typography>
                        <Typography variant="body2" color="text.secondary">Events Attended</Typography>
                      </Paper>
                      
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <EmojiEventsIcon sx={{ color: '#8B5CF6', mb: 1, fontSize: '2rem' }} />
                        <Typography variant="h5" fontWeight="bold" color="text.primary">{userStats.upcomingEvents}</Typography>
                        <Typography variant="body2" color="text.secondary">Upcoming Events</Typography>
                      </Paper>
                      
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <PeopleIcon sx={{ color: '#EC4899', mb: 1, fontSize: '2rem' }} />
                        <Typography variant="h5" fontWeight="bold" color="text.primary">{userStats.connections}</Typography>
                        <Typography variant="body2" color="text.secondary">Connections</Typography>
                      </Paper>
                      
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <WorkIcon sx={{ color: '#F59E0B', mb: 1, fontSize: '2rem' }} />
                        <Typography variant="h5" fontWeight="bold" color="text.primary">{userStats.activeSince}</Typography>
                        <Typography variant="body2" color="text.secondary">Active Since</Typography>
                      </Paper>
                      
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gridColumn: { xs: 'span 2', sm: 'span 3', md: 'span 1' }
                        }}
                      >
                        <AssignmentTurnedInIcon sx={{ color: '#10B981', mb: 1, fontSize: '2rem' }} />
                        <Typography variant="h5" fontWeight="bold" color="text.primary">{userStats.lastActive}</Typography>
                        <Typography variant="body2" color="text.secondary">Last Active</Typography>
                      </Paper>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              
              {/* Edit Profile Form */}
              {editMode && (
                <Box sx={{ mt: 4, p: 3, borderRadius: 2, bgcolor: themeMode === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.03)' }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>Edit Profile Information</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstname"
                    value={formData.firstname || ''}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastname"
                    value={formData.lastname || ''}
                    onChange={handleChange}
                    variant="outlined"
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
                  />
                </Grid>
                <Grid item xs={12}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => setEditMode(false)}
                          sx={{ px: 3 }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="contained" 
                          onClick={handleSubmit}
                      sx={{
                            px: 3,
                            backgroundImage: 'linear-gradient(90deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)',
                          }}
                        >
                          Save Changes
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
            
            {/* Profile Tabs */}
            <Paper
              elevation={3}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                mb: 3,
                background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
              }}
            >
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                variant="fullWidth"
                textColor="primary"
                sx={{
                  '.MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                    backgroundImage: 'linear-gradient(90deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)',
                  },
                  '.MuiTab-root': {
                    py: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    '&.Mui-selected': {
                      color: themeMode === 'dark' ? '#3B82F6' : '#2563EB',
                    }
                  }
                }}
              >
                <Tab label="Overview" icon={<PeopleIcon />} iconPosition="start" />
                {(user.role === 'organizer' || organizerProfile) && (
                  <Tab 
                    label="Organizer Profile" 
                    icon={<BusinessIcon />} 
                    iconPosition="start"
                  />
                )}
                {(user.role === 'vendor' || vendorProfile) && (
                  <Tab 
                    label="Vendor Profile" 
                    icon={<WorkIcon />} 
                    iconPosition="start"
                  />
                )}
              </Tabs>
            </Paper>
            
            {/* Tab Content */}
            {tabValue === 0 && (
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                }}
              >
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, display: 'inline-block' }}>
                  Account Information
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Full Name
                        </Typography>
                        <Typography variant="h6" fontWeight="500">
                          {user.firstname ? `${user.firstname} ${user.middlename ? user.middlename + ' ' : ''}${user.lastname || ''}` : "-"}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Username
                        </Typography>
                        <Typography variant="h6" fontWeight="500">
                          {user.username}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Email Address
                        </Typography>
                        <Typography variant="h6" fontWeight="500">
                          {user.email || "-"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Account Role
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Chip 
                            label={user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || "Guest"} 
                            color={user.role === 'guest' ? 'default' : user.role === 'organizer' ? 'primary' : 'secondary'}
                            sx={{ 
                              borderRadius: '4px',
                              fontWeight: 600,
                              fontSize: '1rem',
                              height: 32
                            }}
                          />
                          {user.role === 'organizer' || user.role === 'vendor' ? (
                            <VerifiedIcon sx={{ color: '#3B82F6', ml: 1 }}/>
                          ) : null}
                        </Box>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Member Since
                        </Typography>
                        <Typography variant="h6" fontWeight="500">
                          {userStats.activeSince}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Last Active
                        </Typography>
                        <Typography variant="h6" fontWeight="500">
                          {userStats.lastActive}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 4 }} />
                
                <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, display: 'inline-block' }}>
                  Activity Summary
                </Typography>
                
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                  gap: 3
                }}>
                  <Paper
                    elevation={1}
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      borderLeft: '4px solid #3B82F6',
                      background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EventNoteIcon sx={{ color: '#3B82F6', mr: 1, fontSize: '1.5rem' }} />
                      <Typography variant="h6" fontWeight="600">Events Attended</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>{userStats.eventsAttended}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      You have attended {userStats.eventsAttended} events so far. Participate in events now!
                    </Typography>
                  </Paper>
                  
                  <Paper
                    elevation={1}
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      borderLeft: '4px solid #8B5CF6',
                      background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmojiEventsIcon sx={{ color: '#8B5CF6', mr: 1, fontSize: '1.5rem' }} />
                      <Typography variant="h6" fontWeight="600">Upcoming Events</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>{userStats.upcomingEvents}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      You have {userStats.upcomingEvents} upcoming events scheduled. Get ready!
                    </Typography>
                  </Paper>
                  
                  <Paper
                    elevation={1}
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      borderLeft: '4px solid #EC4899',
                      background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PeopleIcon sx={{ color: '#EC4899', mr: 1, fontSize: '1.5rem' }} />
                      <Typography variant="h6" fontWeight="600">Your Connections</Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>{userStats.connections}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      You are connected with {userStats.connections} people. Expand your network!
                    </Typography>
                  </Paper>
                </Box>
              </Paper>
            )}
            
            {/* Organizer Profile Tab */}
            {tabValue === 1 && (user.role === 'organizer' || organizerProfile) && (
              <Paper
                elevation={3}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography variant="h5" fontWeight="bold" sx={{ borderBottom: '2px solid', borderColor: 'primary.main', pb: 1, display: 'inline-block' }}>
                    Organizer Profile
                  </Typography>
                  {!editOrganizerMode && (
                    <Button 
                      variant="contained" 
                      startIcon={<EditIcon />}
                      onClick={() => setEditOrganizerMode(true)}
                      sx={{
                        backgroundImage: 'linear-gradient(90deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)',
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                          backgroundImage: 'linear-gradient(90deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)',
                        }
                      }}
                    >
                      {organizerProfile ? "Edit Profile" : "Create Profile"}
                    </Button>
                  )}
                </Box>
                
                {loadingProfiles ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress size={40} />
                  </Box>
                ) : editOrganizerMode ? (
                  <Paper
                    elevation={1}
                    sx={{ 
                      p: 3, 
                      borderRadius: 2,
                      background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
                      mb: 4
                    }}
                  >
                    <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                      {organizerProfile ? "Edit Your Organizer Details" : "Create Your Organizer Profile"}
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Organization Name"
                          name="name"
                          value={organizerFormData.name}
                          onChange={handleOrganizerChange}
                          required
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          select
                          fullWidth
                          label="Organization Type"
                          name="type"
                          value={organizerFormData.type}
                          onChange={handleOrganizerChange}
                          required
                          variant="outlined"
                          SelectProps={{
                            native: true,
                          }}
                        >
                          <option value="individual">Individual</option>
                          <option value="company">Company</option>
                          <option value="nonprofit">Non-Profit</option>
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          name="description"
                          value={organizerFormData.description}
                          onChange={handleOrganizerChange}
                          multiline
                          rows={4}
                          variant="outlined"
                          placeholder="Tell us about your organization and the kinds of events you organize..."
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                          <Button 
                            variant="outlined" 
                            onClick={() => setEditOrganizerMode(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="contained" 
                            onClick={handleOrganizerSubmit}
                      sx={{
                              backgroundImage: 'linear-gradient(90deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)',
                      }}
                    >
                      Save Changes
                    </Button>
                  </Box>
                </Grid>
              </Grid>
                  </Paper>
                ) : organizerProfile ? (
                  <>
                    {/* Organizer Stats Summary */}
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr', md: '1fr 1fr 1fr 1fr 1fr 1fr' },
                      gap: 2,
                      mb: 4
                    }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                          textAlign: 'center',
                          background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
                      borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <EventNoteIcon sx={{ color: '#3B82F6', mb: 1, fontSize: '2rem' }} />
                        <Typography variant="h5" fontWeight="bold" color="text.primary">{organizerStats.eventsCreated}</Typography>
                        <Typography variant="body2" color="text.secondary">Events Created</Typography>
                  </Paper>
                      
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                          textAlign: 'center',
                          background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
                      borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <EmojiEventsIcon sx={{ color: '#8B5CF6', mb: 1, fontSize: '2rem' }} />
                        <Typography variant="h5" fontWeight="bold" color="text.primary">{organizerStats.upcomingEvents}</Typography>
                        <Typography variant="body2" color="text.secondary">Upcoming</Typography>
                  </Paper>
                      
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                          textAlign: 'center',
                          background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
                      borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <AssignmentTurnedInIcon sx={{ color: '#10B981', mb: 1, fontSize: '2rem' }} />
                        <Typography variant="h5" fontWeight="bold" color="text.primary">{organizerStats.pastEvents}</Typography>
                        <Typography variant="body2" color="text.secondary">Completed</Typography>
                      </Paper>
                      
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <PeopleIcon sx={{ color: '#EC4899', mb: 1, fontSize: '2rem' }} />
                        <Typography variant="h5" fontWeight="bold" color="text.primary">{organizerStats.totalAttendees}</Typography>
                        <Typography variant="body2" color="text.secondary">Total Attendees</Typography>
                      </Paper>
                      
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <BusinessIcon sx={{ color: '#F59E0B', mb: 1, fontSize: '2rem' }} />
                        <Typography variant="h5" fontWeight="bold" color="text.primary">{organizerStats.vendorsHired}</Typography>
                        <Typography variant="body2" color="text.secondary">Vendors Hired</Typography>
                      </Paper>
                      
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <VerifiedIcon sx={{ color: '#3B82F6', mb: 1, fontSize: '2rem' }} />
                        <Typography variant="h5" fontWeight="bold" color="text.primary">{organizerStats.avgEventRating}</Typography>
                        <Typography variant="body2" color="text.secondary">Avg. Rating</Typography>
                      </Paper>
                    </Box>
                    
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={6}>
                        <Paper
                          elevation={1}
                          sx={{ 
                            p: 3, 
                            borderRadius: 2,
                            height: '100%',
                            borderLeft: '4px solid #3B82F6',
                            background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
                          }}
                        >
                          <Typography variant="h6" fontWeight="600" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                            <BusinessIcon sx={{ mr: 1 }} /> Organization Details
                    </Typography>
                          
                          <Stack spacing={3}>
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Organization Name
                    </Typography>
                              <Typography variant="h6" fontWeight="500">
                                {organizerProfile.name}
                              </Typography>
                            </Box>
                            
                            <Box>
                              <Chip 
                                label={organizerProfile.type.charAt(0).toUpperCase() + organizerProfile.type.slice(1)} 
                                color="primary"
                                size="medium"
                                sx={{ borderRadius: '4px' }}
                              />
                            </Box>
                          
                          </Stack>
                  </Paper>
                </Grid>
                      
                      <Grid item xs={12} md={6}>
                  <Paper
                          elevation={1}
                    sx={{
                            p: 3, 
                      borderRadius: 2,
                            height: '100%',
                            borderLeft: '4px solid #8B5CF6',
                            background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
                          }}
                        >
                          <Typography variant="h6" fontWeight="600" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                            <AssignmentTurnedInIcon sx={{ mr: 1 }} /> About
                    </Typography>
                          
                          <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.7 }}>
                            {organizerProfile.description || "No description provided. Edit your profile to add a description of your organization."}
                    </Typography>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button 
                              variant="outlined" 
                              size="medium"
                              onClick={() => navigate('/add-event')}
                              sx={{ mr: 2 }}
                            >
                              Create Event
                            </Button>
                            <Button 
                              variant="contained" 
                              size="medium"
                              onClick={() => navigate('/organizer-events')}
                              sx={{ 
                                backgroundImage: 'linear-gradient(90deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)',
                              }}
                            >
                              Manage Events
                            </Button>
                          </Box>
                  </Paper>
                </Grid>
                    </Grid>
                  </>
                ) : (
                  <Paper
                    elevation={1}
                    sx={{ 
                      p: 4, 
                      borderRadius: 2,
                      background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
                      textAlign: 'center'
                    }}
                  >
                    <BusinessIcon sx={{ fontSize: 60, color: '#3B82F6', mb: 2 }} />
                    <Typography variant="h5" fontWeight="600" gutterBottom>
                      Become an Event Organizer
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                      Create and manage your own events. As an organizer, you&apos;ll be able to create events, 
                      manage registrations, connect with vendors, and much more!
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={() => setEditOrganizerMode(true)}
                      size="large"
                      sx={{
                        px: 4,
                        py: 1.5,
                        backgroundImage: 'linear-gradient(90deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)',
                        transition: 'all 0.3s',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                          backgroundImage: 'linear-gradient(90deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)',
                        }
                      }}
                    >
                      Create Organizer Profile
                    </Button>
                  </Paper>
                )}
              </Paper>
            )}
            
            {/* Vendor Profile Tab */}
            {tabValue === 2 && (user.role === 'vendor' || vendorProfile) && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: "blur(10px)",
                  border: themeMode === 'dark' 
                    ? '1px solid rgba(255, 255, 255, 0.1)' 
                    : '1px solid rgba(0, 0, 0, 0.05)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">Vendor Profile</Typography>
                  {!editVendorMode && (
                    <Button 
                      variant="outlined" 
                      startIcon={<EditIcon />}
                      onClick={() => setEditVendorMode(true)}
                      size="small"
                    >
                      {vendorProfile ? "Edit" : "Create Profile"}
                    </Button>
                  )}
                  </Box>
                
                {loadingProfiles ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : editVendorMode ? (
                  <Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Business Name"
                          name="name"
                          value={vendorFormData.name}
                          onChange={handleVendorChange}
                          required
                          variant="outlined"
                          size="small"
                        />
                </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Business Address"
                          name="address"
                          value={vendorFormData.address}
                          onChange={handleVendorAddressChange}
                          variant="outlined"
                          size="small"
                        />
              </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          name="description"
                          value={vendorFormData.description}
                          onChange={handleVendorChange}
                          multiline
                          rows={4}
                          variant="outlined"
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                          <Button 
                            variant="outlined" 
                            onClick={() => setEditVendorMode(false)}
                            size="small"
                          >
                            Cancel
                          </Button>
                          <Button 
                            variant="contained" 
                            onClick={handleVendorSubmit}
                            size="small"
                          >
                            Save Changes
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                ) : vendorProfile ? (
                  <Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary">Business Name</Typography>
                      <Typography variant="body1" fontWeight="medium">{vendorProfile.name}</Typography>
                    </Box>
                    {vendorProfile.address && (
                      <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <LocationOnIcon fontSize="small" sx={{ color: 'text.secondary', mt: 0.3 }} />
                        <Typography variant="body1">{vendorProfile.address}</Typography>
                      </Box>
                    )}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary">Description</Typography>
                      <Typography variant="body1">{vendorProfile.description || "No description provided."}</Typography>
                    </Box>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary">Vendor ID</Typography>
                      <Typography variant="body1" fontWeight="medium">{vendorProfile.vendorId || "-"}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Services</Typography>
                      {vendorProfile.services && vendorProfile.services.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {vendorProfile.services.map((service, index) => (
                            <Chip 
                              key={index}
                              label={service.name || `Service ${index + 1}`}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No services listed</Typography>
                      )}
                      
                      <Button 
                        variant="outlined" 
                        size="small"
                        sx={{ mt: 2 }}
                        onClick={() => navigate('/services')} // Assuming you have a services page
                      >
                        Manage Services
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                      You haven't created a vendor profile yet.
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={() => setEditVendorMode(true)}
                      sx={{ mt: 2 }}
                      size="small"
                    >
                      Create Profile
                    </Button>
                  </Box>
            )}
          </Paper>
            )}
          </>
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
            variant="filled"
            sx={{ 
              width: '100%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {success ? "Profile updated successfully!" : updateError}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

Profile.propTypes = {
  themeMode: PropTypes.string
};

export default Profile;
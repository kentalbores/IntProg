import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/axiosconfig";
import {
  Button,
  Typography,
  CircularProgress,
  Box,
  Avatar,
  TextField,
  Grid,
  Paper,
  Divider,
  Chip
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PropTypes from 'prop-types';

const ProfileSection = ({ themeMode, onSuccess, onError }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  
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
          
          // Fetch user roles
          try {
            const roleResponse = await axios.get(`/api/user/my-role/${username}`);
            // Handle both array and string responses
            const roles = Array.isArray(roleResponse.data.role) 
              ? roleResponse.data.role 
              : [roleResponse.data.role];
            setUserRoles(roles);
          } catch (roleErr) {
            console.error("Error fetching user roles:", roleErr);
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

    getUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
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
        setEditMode(false);
        setSelectedImage(null);
        onSuccess && onSuccess("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      onError && onError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleViewProfile = () => {
    navigate("/profile");
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: themeMode === 'dark' ? 'white' : 'text.primary' }}>
        Personal Information
      </Typography>
      
      <Paper
        elevation={1}
        sx={{
          p: 3,
          borderRadius: 2,
          mb: 4,
          background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Avatar
              sx={{
                width: 150,
                height: 150,
                bgcolor: "primary.main",
                color: "white",
                fontSize: 50,
                border: "4px solid",
                borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                mx: { xs: 'auto', md: 0 }
              }}
              src={user?.picture || ""}
            >
              {!user?.picture && user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </Grid>

          <Grid item xs={12} md={9}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600, 
                    color: themeMode === 'dark' ? 'white' : 'text.primary',
                    mb: 0.5
                  }}
                >
                  {`${user.firstname || ''} ${user.lastname || ''}`}
                </Typography>

                <Typography 
                  variant="subtitle1" 
                  color="text.secondary" 
                  sx={{ mb: 1 }}
                >
                  @{user.username}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {user.email || "No email provided"}
                </Typography>
                
                {/* Display roles as chips */}
                {userRoles.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                    {userRoles.map((role, index) => (
                      <Chip 
                        key={index}
                        label={role.charAt(0).toUpperCase() + role.slice(1)} 
                        size="small"
                        color={
                          role === 'organizer' ? 'primary' : 
                          role === 'vendor' ? 'secondary' : 
                          'default'
                        }
                        sx={{ 
                          fontWeight: 500,
                          fontSize: '0.75rem'
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>
              
              <Button 
                variant="contained" 
                startIcon={<AccountCircleIcon />}
                onClick={handleViewProfile}
                size="small"
              >
                View Profile
              </Button>
            </Box>
          </Grid>
        </Grid>
        
        {/* Edit Profile Form */}
        {editMode && (
          <Box sx={{ mt: 4 }}>
            <Divider sx={{ my: 3 }} />
            <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600 }}>Edit Profile</Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstname"
                  value={formData.firstname || ''}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
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
                  size="small"
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
                  size="small"
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
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={() => setEditMode(false)}
                    size="small"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleSubmit}
                    size="small"
                  >
                    Save Changes
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

ProfileSection.propTypes = {
  themeMode: PropTypes.string.isRequired,
  onSuccess: PropTypes.func,
  onError: PropTypes.func
};

export default ProfileSection; 
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "../config/axiosconfig";
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Divider,
  Chip
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PropTypes from 'prop-types';

const RoleSelectionSection = ({ themeMode, onSuccess, onError }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState([]);
  const [processingRole, setProcessingRole] = useState(false);

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const username = sessionStorage.getItem("username");
        if (!username) {
          onError && onError("User not found in session");
          setLoading(false);
          return;
        }

        // Fetch user roles
        const response = await axios.get(`/api/user/my-role/${username}`);
        setUserRoles(Array.isArray(response.data.role) ? response.data.role : [response.data.role]);
      } catch (error) {
        console.error("Error fetching user roles:", error);
        onError && onError("Failed to load user role information");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [onError]);

  const handleRoleSelection = async (role) => {
    try {
      setProcessingRole(true);
      const username = sessionStorage.getItem("username");
      
      // Create a new roles array starting with existing roles
      let newRoles = [...userRoles];
      
      if (role === 'organizer' || role === 'vendor') {
        if (newRoles.includes(role)) {
          // Remove the role if it already exists
          newRoles = newRoles.filter(r => r !== role);
          
          // If removing all roles, set to guest
          if (newRoles.length === 0) {
            newRoles = ['guest'];
          }
        } else {
          // Add the role if it doesn't exist
          newRoles.push(role);
          
          // Remove guest role if present
          newRoles = newRoles.filter(r => r !== 'guest');
        }
      }
      
      console.log("Sending updated roles to API:", newRoles);
      
      // Update user role in the database with the new roles array
      const roleResponse = await axios.post('/api/user/role', { 
        username,
        role: newRoles
      });
      
      if (roleResponse.status === 200) {
        // Show success message
        onSuccess && onSuccess(`Role(s) updated successfully`);
        
        // Update the userRoles state locally
        setUserRoles(newRoles);
      }
      
      // Only reset onboarding status if adding a new role, and make it optional
      if (!userRoles.includes(role) && (role === 'organizer' || role === 'vendor')) {
        try {
          await axios.post('/api/onboarding/reset', { 
            username
          });
          console.log("Onboarding reset successful for role:", role);
        } catch (resetError) {
          // Log the error but don't stop execution
          console.error("Error resetting onboarding status:", resetError);
          console.warn("Continuing despite onboarding reset error");
          // We can still proceed with navigation even if the reset fails
        }
        
        // Wait a moment before redirecting to onboarding
        setTimeout(() => {
          // Set the role in session storage to ensure the onboarding flow knows which setup to show
          sessionStorage.setItem("selectedOnboardingRole", role);
          navigate("/onboarding");
        }, 1500);
      }
    } catch (error) {
      console.error(`Error updating roles:`, error);
      console.error(`Error details:`, error.response?.data || error.message);
      onError && onError(`Failed to update roles. Please try again.`);
    } finally {
      setProcessingRole(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
        <CircularProgress size={40} />
      </Box>
    );
  }

  const isOrganizer = userRoles.includes('organizer');
  const isVendor = userRoles.includes('vendor');
  const isGuest = userRoles.length === 0 || (userRoles.length === 1 && userRoles[0] === 'guest');

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: themeMode === 'dark' ? 'white' : 'text.primary' }}>
        Account Role
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
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Your current roles:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {isGuest && (
              <Chip 
                label="Guest" 
                size="medium" 
                color="default"
                sx={{ fontSize: '0.9rem' }}
              />
            )}
            {isOrganizer && (
              <Chip 
                label="Organizer" 
                size="medium" 
                color="primary"
                icon={<CheckCircleIcon />}
                sx={{ fontSize: '0.9rem' }}
              />
            )}
            {isVendor && (
              <Chip 
                label="Vendor" 
                size="medium" 
                color="secondary"
                icon={<CheckCircleIcon />}
                sx={{ fontSize: '0.9rem' }}
              />
            )}
          </Box>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 3 }}>
          You can be both an organizer and a vendor at the same time. Select or deselect roles below:
        </Typography>

        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%',
                borderColor: isOrganizer ? 'primary.main' : 'divider',
                borderWidth: isOrganizer ? 2 : 1,
                bgcolor: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <BusinessIcon 
                    sx={{ 
                      fontSize: 40, 
                      color: isOrganizer ? 'primary.main' : 'text.secondary',
                      mr: 1
                    }} 
                  />
                  <Typography variant="h6">Organizer</Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  Create and manage events, invite attendees, and hire vendors for your events.
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant={isOrganizer ? "outlined" : "contained"}
                  fullWidth
                  disabled={processingRole}
                  onClick={() => handleRoleSelection('organizer')}
                  color={isOrganizer ? "error" : "primary"}
                >
                  {isOrganizer ? 'Remove Organizer Role' : 'Add Organizer Role'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card 
              variant="outlined" 
              sx={{ 
                height: '100%',
                borderColor: isVendor ? 'secondary.main' : 'divider',
                borderWidth: isVendor ? 2 : 1,
                bgcolor: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.7)',
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <StorefrontIcon 
                    sx={{ 
                      fontSize: 40, 
                      color: isVendor ? 'secondary.main' : 'text.secondary',
                      mr: 1
                    }} 
                  />
                  <Typography variant="h6">Vendor</Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  Offer your services, get hired for events, and grow your business network.
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant={isVendor ? "outlined" : "contained"}
                  fullWidth
                  color={isVendor ? "error" : "secondary"}
                  disabled={processingRole}
                  onClick={() => handleRoleSelection('vendor')}
                >
                  {isVendor ? 'Remove Vendor Role' : 'Add Vendor Role'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
        
        {processingRole && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

RoleSelectionSection.propTypes = {
  themeMode: PropTypes.string,
  onSuccess: PropTypes.func,
  onError: PropTypes.func
};

export default RoleSelectionSection; 
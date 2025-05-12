import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { Navigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import axios from "../../config/axiosconfig";

const OnboardingGuard = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingRequired, setOnboardingRequired] = useState(false);

  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      try {
        const isLoggedIn = Boolean(sessionStorage.getItem("username"));
        if (isLoggedIn) {
          setIsAuthenticated(true);
          
          // Get the username from the session data
          const username = sessionStorage.getItem("username");
          
          if (username) {
            try {
              // Fetch user info to check onboardingCompleted status
              const response = await axios.get(`/api/onboarding/status/${username}`);
              
              // Check if onboarding is needed based on onboardingCompleted field
              setOnboardingRequired(!response.data.onboardingCompleted);
            } catch (error) {
              console.error("Error checking onboarding status:", error);
              setOnboardingRequired(true); // Default to requiring onboarding if check fails
            }
          } 
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Authentication or onboarding check failed:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndOnboarding();
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="body1" sx={{ mt: 3 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If onboarding is not required, redirect to home
  if (!onboardingRequired) {
    return <Navigate to="/home" replace />;
  }

  // If authenticated and onboarding completed, render the children
  return children;
};

OnboardingGuard.propTypes = {
  children: PropTypes.node.isRequired
};

export default OnboardingGuard;

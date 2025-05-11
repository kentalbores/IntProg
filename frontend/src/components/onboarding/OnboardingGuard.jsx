import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import axios from "../../config/axiosconfig";

const OnboardingGuard = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(true);

  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      try {
        // Check if the user is authenticated
        const authResponse = await axios.get("/api/check-auth");

        if (authResponse.data.authenticated) {
          setIsAuthenticated(true);
          
          // Check if onboarding is completed
          const onboardingResponse = await axios.get("/api/onboarding/status");
          setOnboardingCompleted(onboardingResponse.data.onboardingCompleted);
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

  // If onboarding is not complete, redirect to onboarding
  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  // If authenticated and onboarding completed, render the children
  return children;
};

export default OnboardingGuard;

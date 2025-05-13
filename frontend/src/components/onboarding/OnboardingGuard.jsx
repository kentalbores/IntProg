import { useState, useEffect, useMemo } from "react";
import PropTypes from 'prop-types';
import { Navigate } from "react-router-dom";
import { Box, CircularProgress, Typography, useTheme, ThemeProvider, createTheme } from "@mui/material";
import axios from "../../config/axiosconfig";

const OnboardingGuard = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onboardingRequired, setOnboardingRequired] = useState(false);
  const baseTheme = useTheme();

  // Get theme mode from localStorage or use system default
  const themePreference = localStorage.getItem("theme") || "system";  
  const systemTheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  
  // Calculate actual theme mode
  const themeMode = useMemo(() => {
    if (themePreference === "system") {
      return systemTheme;
    }
    if (themePreference === "dynamic") {
      const currentHour = new Date().getHours();
      // Dark theme from 7 PM (19) to 6 AM (6)
      return (currentHour >= 19 || currentHour < 6) ? 'dark' : 'light';
    }
    return themePreference;
  }, [themePreference, systemTheme]);
  
  // Create theme object
  const theme = useMemo(() => {
    return createTheme({
      ...baseTheme,
      palette: {
        mode: themeMode,
      },
    });
  }, [themeMode, baseTheme]);

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
              // Always check with the backend for the most accurate status
              const response = await axios.get(`/api/onboarding/status/${username}`);
              
              // Check if onboarding is needed based on onboardingCompleted field
              const isOnboardingCompleted = response.data.onboardingCompleted;
              
              // Update the sessionStorage with the latest status
              sessionStorage.setItem("onboardingCompleted", isOnboardingCompleted ? "true" : "false");
              
              // Set onboardingRequired based on the backend response
              setOnboardingRequired(!isOnboardingCompleted);
              
              console.log("Onboarding status check:", { 
                username, 
                isOnboardingCompleted, 
                requiresOnboarding: !isOnboardingCompleted 
              });
            } catch (error) {
              console.error("Error checking onboarding status:", error);
              // Clear the cached status to force a new check next time
              sessionStorage.removeItem("onboardingCompleted");
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
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            background: themeMode === 'dark' 
              ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          }}
        >
          <CircularProgress 
            size={60} 
            thickness={4} 
            sx={{
              color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
            }}
          />
          <Typography 
            variant="body1" 
            sx={{ 
              mt: 3,
              color: themeMode === 'dark' ? 'text.primary' : 'text.primary',
            }}
          >
            Loading...
          </Typography>
        </Box>
      </ThemeProvider>
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

  // If authenticated and onboarding is required, render the children
  return children;
};

OnboardingGuard.propTypes = {
  children: PropTypes.node.isRequired
};

export default OnboardingGuard;

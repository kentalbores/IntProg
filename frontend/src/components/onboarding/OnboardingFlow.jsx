import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  LinearProgress,
  Typography,
  Snackbar,
  Alert,
  Paper,
  useTheme,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import axios from "../../config/axiosconfig";
import Navbar from "../../components/Navbar";

// CSS Import
import "./onboarding.css";

// Onboarding Components
import WelcomeScreen from "./WelcomeScreen";
import RoleSelection from "./RoleSelection";
import OrganizerSetup from "./OrganizerSetup";
import VendorSetup from "./VendorSetup";
import CompletionScreen from "./CompletionScreen";

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const baseTheme = useTheme();
  const username = sessionStorage.getItem("username");
  const [userData, setUserData] = useState({
    roles: [],
    organizerProfile: {
      name: "",
      type: "individual",
      description: "",
    },
    vendorProfile: {
      name: "",
      description: "",
      address: "",
      location: { lat: null, lng: null },
      services: [],
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "info",
  });

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

  // Check for selectedOnboardingRole in sessionStorage
  useEffect(() => {
    const selectedRole = sessionStorage.getItem("selectedOnboardingRole");
    
    if (selectedRole) {
      // Set the role in userData - KEEP any existing roles
      setUserData(prev => {
        // Create a new roles array that includes the selected role without duplicates
        const updatedRoles = [...prev.roles];
        if (!updatedRoles.includes(selectedRole)) {
          updatedRoles.push(selectedRole);
        }
        
        return {
          ...prev,
          roles: updatedRoles
        };
      });
      
      // Skip to the appropriate step based on the selected role
      if (selectedRole === "organizer") {
        setActiveStep(2); // Skip to OrganizerSetup
      } else if (selectedRole === "vendor") {
        setActiveStep(3); // Skip to VendorSetup
      }
      
      // Clear the selectedRole from sessionStorage so it's used only once
      sessionStorage.removeItem("selectedOnboardingRole");
    }
  }, []);

  // Calculate progress percentage based on current step and total steps
  const calculateProgress = () => {
    // Get total number of steps based on role selection
    let totalSteps = 3; // Default: Welcome, Role Selection, Completion

    const hasOrganizerRole = userData.roles.includes("organizer");
    const hasVendorRole = userData.roles.includes("vendor");

    if (hasOrganizerRole) totalSteps++;
    if (hasVendorRole) totalSteps++;

    return (activeStep / (totalSteps - 1)) * 100;
  };

  // Submit profile data to the backend
  const submitProfileData = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Handle organizer profile if applicable
      if (userData.roles.includes("organizer")) {
        await axios.post("/api/organizer/profile", {
          username: username,
          name: userData.organizerProfile.name,
          type: userData.organizerProfile.type,
          description: userData.organizerProfile.description,
        });
      }

      // Handle vendor profile if applicable
      if (userData.roles.includes("vendor")) {
        // Create a properly formatted vendor profile object
        const vendorProfileData = {
          username: username,
          name: userData.vendorProfile.name,
          description: userData.vendorProfile.description,
          address: userData.vendorProfile.address,
          location: {
            lat: userData.vendorProfile.location.lat,
            long: userData.vendorProfile.location.lng || userData.vendorProfile.location.long // Support both lng and long
          }
        };
        
        // Call the vendor profile API endpoint
        try {
          console.log("Submitting vendor profile:", vendorProfileData);
          await axios.post("/api/vendors/profile", vendorProfileData);
        } catch (vendorError) {
          console.error("Error saving vendor profile:", vendorError);
          // If first endpoint fails, try the direct endpoint in server.js
          try {
            console.log("Trying alternative endpoint...");
            await axios.post("/api/vendor/profile", vendorProfileData);
          } catch (fallbackError) {
            console.error("All vendor profile endpoints failed:", fallbackError);
            throw fallbackError;
          }
        }
      }

      // Mark onboarding as complete - only sending username, not roles
      // This preserves the roles that were set during role selection
      await axios.post("/api/onboarding/complete", { username });
      
      // Update the onboarding status in session storage
      sessionStorage.setItem("onboardingCompleted", "true");

      // Show success message
      setAlert({
        open: true,
        message: "Profile successfully saved!",
        severity: "success",
      });

      // Redirect after a short delay
      if (data.completionAction === "explore") {
        setTimeout(() => {
          navigate("/event");
        }, 1500);
      } else if (data.completionAction === "dashboard") {
        setTimeout(() => {
          navigate("/home");
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving profile:", error);

      // Show error message
      setAlert({
        open: true,
        message: "Failed to save profile. Please try again.",
        severity: "error",
      });

      setIsSubmitting(false);
    }
  };

  // Handle completion of current step and move to next step
  const handleNext = (data = {}) => {
    // Update userData with new data from current step
    setUserData((prevData) => {
      // Special handling for role selection step
      if (data.role) {
        let newRoles = [...prevData.roles]; // Start with existing roles
        
        if (data.role === "both") {
          // Add both roles if not already present
          if (!newRoles.includes("organizer")) newRoles.push("organizer");
          if (!newRoles.includes("vendor")) newRoles.push("vendor");
        } else if (data.role !== "attendee" && data.role !== "guest") {
          // Add the new role if not already present
          if (!newRoles.includes(data.role)) {
            newRoles.push(data.role);
          }
        }
        
        return { ...prevData, ...data, roles: newRoles };
      }
      return { ...prevData, ...data };
    });

    // Determine next step based on current step and role selection
    if (activeStep === 0) {
      // After welcome screen, go to role selection
      setActiveStep(1);
    } else if (activeStep === 1) {
      // After role selection, route based on selected role
      if (data.role === "attendee" || data.role === "guest") {
        // Skip directly to completion for attendees/guests
        setActiveStep(4);
      } else if (data.role === "organizer") {
        setActiveStep(2);
      } else if (data.role === "vendor") {
        setActiveStep(3);
      } else if (data.role === "both") {
        setActiveStep(2);
      }
    } else if (activeStep === 2) {
      // After organizer setup
      if (userData.roles.includes("vendor")) {
        setActiveStep(3); // Go to vendor setup
      } else {
        setActiveStep(4); // Go to completion
      }
    } else if (activeStep === 3) {
      // After vendor setup, go to completion
      setActiveStep(4);
    } else if (activeStep === 4) {
      // Before redirecting to home, submit the data to the backend
      submitProfileData(data);
    }
  };

  // Display step title based on current step
  const getStepTitle = () => {
    switch (activeStep) {
      case 0:
        return "Welcome";
      case 1:
        return "How will you use the platform?";
      case 2:
        return "Organizer Profile Setup";
      case 3:
        return "Vendor Profile Setup";
      case 4:
        return "All Set!";
      default:
        return "";
    }
  };

  // Render the current step component
  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <WelcomeScreen onContinue={handleNext} />;
      case 1:
        return <RoleSelection onContinue={handleNext} />;
      case 2:
        return <OrganizerSetup userData={userData} onContinue={handleNext} />;
      case 3:
        return <VendorSetup userData={userData} onContinue={handleNext} />;
      case 4:
        return <CompletionScreen onContinue={handleNext} />;
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
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
          title="Onboarding"
          showBackButton={false}
          showMenuButton={false}
        />
        
        <Container maxWidth="md" className="onboarding-container" sx={{ mt: 4, mb: 6, position: 'relative', zIndex: 1 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: 2, 
              overflow: 'hidden',
              mt: 4, 
              mb: 6,
              p: 3,
              background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: "blur(10px)",
              border: themeMode === 'dark' 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(0, 0, 0, 0.05)',
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "80vh",
              }}
            >
              <Box sx={{ mb: 4 }}>
                <LinearProgress
                  variant="determinate"
                  value={calculateProgress()}
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    mb: 2,
                    backgroundColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 5,
                      backgroundImage: "linear-gradient(90deg, #3a86ff, #4776E6)",
                    },
                  }}
                  className="progress-bar-animation"
                />
                <Typography
                  variant="h4"
                  align="center"
                  fontWeight="600"
                  sx={{ color: themeMode === 'dark' ? 'primary.light' : 'primary.dark' }}
                >
                  {getStepTitle()}
                </Typography>
              </Box>

              <Box
                sx={{ flex: 1, display: "flex", flexDirection: "column" }}
                className="step-animation"
              >
                {renderStep()}
              </Box>
            </Box>
          </Paper>

          {/* Alert for profile submission status */}
          <Snackbar
            open={alert.open}
            autoHideDuration={6000}
            onClose={() => setAlert({ ...alert, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={() => setAlert({ ...alert, open: false })}
              severity={alert.severity}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {alert.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default OnboardingFlow;

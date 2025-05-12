import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  LinearProgress,
  Typography,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";
import axios from "../../config/axiosconfig";

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
  const username = sessionStorage.getItem("username");
  const [userData, setUserData] = useState({
    role: "",
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

  // Calculate progress percentage based on current step and total steps
  const calculateProgress = () => {
    // Get total number of steps based on role selection
    let totalSteps = 3; // Default: Welcome, Role Selection, Completion

    if (userData.role === "organizer") totalSteps = 4;
    if (userData.role === "vendor") totalSteps = 4;
    if (userData.role === "both") totalSteps = 5;

    return (activeStep / (totalSteps - 1)) * 100;
  };

  // Submit profile data to the backend
  const submitProfileData = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Handle organizer profile if applicable
      if (userData.role === "organizer" || userData.role === "both") {
        await axios.post("/api/organizer/profile", {
          username: username,
          name: userData.organizerProfile.name,
          type: userData.organizerProfile.type,
          description: userData.organizerProfile.description,
        });
      }

      // Handle vendor profile if applicable
      if (userData.role === "vendor" || userData.role === "both") {
        await axios.post("/api/vendor/profile", {
          username: username,
          name: userData.vendorProfile.name,
          description: userData.vendorProfile.description,
          location: {
            lat: userData.vendorProfile.location.lat,
            long: userData.vendorProfile.location.lng, // Convert lng to long to match schema
          },
          address: userData.vendorProfile.address,
          services: userData.vendorProfile.services,
        });
      }

      // Mark onboarding as complete using the provided API endpoint
      await axios.post("/api/onboarding/complete", { username });

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
    setUserData((prevData) => ({ ...prevData, ...data }));

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
      if (userData.role === "both") {
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
    <Container maxWidth="md" className="onboarding-container">
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          mt: 4, 
          mb: 6,
          p: 3
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
                backgroundColor: "rgba(0, 0, 0, 0.1)",
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
              sx={{ color: "#333" }}
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
  );
};

export default OnboardingFlow;

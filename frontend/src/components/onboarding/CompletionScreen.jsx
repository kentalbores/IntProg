import React, { useEffect } from "react";
import { Box, Typography, Button, Paper, Stack } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ExploreIcon from "@mui/icons-material/Explore";
import DashboardIcon from "@mui/icons-material/Dashboard";
import confetti from "canvas-confetti";

const CompletionScreen = ({ onContinue }) => {
  useEffect(() => {
    // Launch confetti when component mounts
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min, max) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      // Launch confetti from both sides
      confetti({
        particleCount: 3,
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: randomInRange(0, 0.3), y: randomInRange(0.4, 0.6) },
        colors: ["#4776E6", "#8E54E9", "#3a86ff", "#4CAF50"],
      });
      confetti({
        particleCount: 3,
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { x: randomInRange(0.7, 1), y: randomInRange(0.4, 0.6) },
        colors: ["#4776E6", "#8E54E9", "#3a86ff", "#4CAF50"],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleExploreEvents = () => {
    onContinue({ completionAction: "explore" });
  };

  const handleGoToDashboard = () => {
    onContinue({ completionAction: "dashboard" });
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          py: 6,
          px: { xs: 3, sm: 6 },
          borderRadius: 3,
          textAlign: "center",
          maxWidth: 600,
          mx: "auto",
          backgroundColor: "background.paper",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #3a86ff, #4776E6, #8E54E9)",
          },
        }}
      >
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
            position: "relative",
            boxShadow: "0 4px 20px rgba(58, 134, 255, 0.2)",
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 60, color: "#2196F3" }} />
        </Box>

        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          fontWeight="bold"
          sx={{
            background: "linear-gradient(90deg, #3a86ff, #4776E6, #8E54E9)",
            backgroundClip: "text",
            textFillColor: "transparent",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          You're all set!
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          paragraph
          sx={{ mb: 4, fontSize: "1.1rem" }}
        >
          Your profile has been successfully set up. You're ready to start using 
          the platform. You can always edit your profile settings later.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          justifyContent="center"
        >
          <Button
            variant="outlined"
            color="primary"
            size="large"
            startIcon={<ExploreIcon />}
            onClick={handleExploreEvents}
            className="completion-button"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              borderWidth: 2,
              transition: "all 0.3s ease",
              "&:hover": {
                borderWidth: 2,
                transform: "translateY(-3px)",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            Browse Events
          </Button>

          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<DashboardIcon />}
            onClick={handleGoToDashboard}
            className="completion-button"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              background: "linear-gradient(90deg, #3a86ff, #4776E6)",
              boxShadow: "0 4px 14px rgba(58, 134, 255, 0.4)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: "linear-gradient(90deg, #4776E6, #3a86ff)",
                transform: "translateY(-3px)",
                boxShadow: "0 6px 20px rgba(58, 134, 255, 0.6)",
              },
            }}
          >
            Go to Dashboard
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default CompletionScreen;

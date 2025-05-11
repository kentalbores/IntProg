import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import CelebrationIcon from "@mui/icons-material/Celebration";

const WelcomeScreen = ({ onContinue }) => {
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
        elevation={2}
        sx={{
          py: 6,
          px: { xs: 3, sm: 6 },
          borderRadius: 3,
          textAlign: "center",
          maxWidth: 600,
          mx: "auto",
          backgroundColor: "background.paper",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            backgroundColor: "primary.light",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 3,
          }}
        >
          <CelebrationIcon fontSize="large" color="primary" />
        </Box>

        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Welcome to the Event Platform!
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          paragraph
          sx={{ mb: 4 }}
        >
          Thank you for signing up! Let's set up your profile so you can get the
          most out of our platform. We'll guide you through a few quick steps to
          personalize your experience.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => onContinue()}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 600,
            boxShadow: "0 4px 14px rgba(58, 134, 255, 0.4)",
          }}
        >
          Let's Get Started
        </Button>
      </Paper>
    </Box>
  );
};

export default WelcomeScreen;

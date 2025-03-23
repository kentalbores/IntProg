import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import "./all.css"; // Ensure this file has the background style

axios.defaults.baseURL = "https://sysarch.glitch.me";

const ResetPassword = () => {
  const location = useLocation();
  const email = location.state?.email || "";
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    try {
      const response = await axios.post("/api/reset-password", {
        email,
        code: verificationCode,
        newPassword,
      });
      alert(response.data.message || "Password reset successful.");
      navigate("/login");
    } catch (err) {
      alert(
        err.response?.data?.message || "Invalid code or error resetting password."
      );
    }
  };

  return (
    <Box
      className="reset-container"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        position: "relative", // Ensures Back Button stays within this container
      }}
    >
      {/* Back Button Positioned at Top-Left */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
          backgroundColor: "#fff",
          boxShadow: 2,
          "&:hover": { backgroundColor: "#ddd" },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Paper elevation={3} sx={{ padding: 4, width: 370, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Reset Password
        </Typography>

        <TextField
          fullWidth
          required
          label="Verification Code"
          variant="filled"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          sx={{ marginBottom: 2 }}
        />

        <TextField
          fullWidth
          required
          label="New Password"
          type="password"
          variant="filled"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          sx={{ marginBottom: 2 }}
        />

        <Button
          onClick={handleResetPassword}
          variant="contained"
          fullWidth
          sx={{ marginTop: 2 }}
        >
          Submit
        </Button>
      </Paper>
    </Box>
  );
};

export default ResetPassword;

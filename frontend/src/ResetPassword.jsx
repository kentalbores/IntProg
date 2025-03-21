import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TextField, Button, Box, Paper, Typography } from "@mui/material";
import axios from "axios";

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
      navigate("/login"); // Redirect to login page
    } catch (err) {
      alert(err.response?.data?.message || "Invalid code or error resetting password.");
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
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

        <Button onClick={handleResetPassword} variant="contained" fullWidth sx={{ marginTop: 2 }}>
          Submit
        </Button>
      </Paper>
    </Box>
  );
};

export default ResetPassword;

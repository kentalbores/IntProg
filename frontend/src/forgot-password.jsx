import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Paper, Typography } from "@mui/material";
import axios from "axios";
import "./all.css";

axios.defaults.baseURL = "https://sysarch.glitch.me";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    try {
      const response = await axios.post("/api/forgot-password", { email });
      alert(response.data.message || "Check your email for reset instructions.");
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data || "Password reset failed");
      alert(err.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ padding: 4, width: 370, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Forgot Password
        </Typography>
        <TextField
          fullWidth
          required
          label="Email Address"
          variant="filled"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <Button onClick={handleResetPassword} variant="contained" fullWidth sx={{ marginTop: 2 }}>
          Reset Password
        </Button>
        <Button size="small" onClick={() => navigate("/login")} sx={{ marginTop: 2, color: "black" }}>
          Back to Login
        </Button>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;
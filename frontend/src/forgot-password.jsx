import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Paper, Typography } from "@mui/material";
import axios from "axios";

axios.defaults.baseURL = "https://sysarch.glitch.me";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSendEmail = async () => {
    try {
      const response = await axios.post("/api/forgot-password", { email });
      alert(response.data.message || "Verification email sent.");
      navigate("/reset-password", { state: { email } }); // Pass email to next page
    } catch (err) {
      alert(err.response?.data?.message || "Error sending email.");
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

        <Button onClick={handleSendEmail} variant="contained" fullWidth sx={{ marginTop: 2 }}>
          Send Email
        </Button>
      </Paper>
    </Box>
  );
};

export default ForgotPassword;

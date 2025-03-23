import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import "./all.css"; // Ensure this file has background styling

axios.defaults.baseURL = "https://sysarch.glitch.me";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const navigate = useNavigate();

  const handleSendEmail = async () => {
    try {
      const response = await axios.post("/api/sendToEmail", { email });
      alert(response.data.message || "Verification email sent.");
      setCodeSent(true);
    } catch (err) {
      alert(err.response?.data?.message || "Error sending email.");
    }
  };

  const handleResetPassword = async () => {
    try {
      const response = await axios.post("/api/reset-password", {
        email: email,
        password: newPassword,
      });
      alert(response.data.message || "Password reset successful.");
      navigate("/login");
    } catch (err) {
      alert(
        err.response?.data?.message || "Invalid code or error resetting password."
      );
    }
  };

  const handleVerifyCode = async () => {
    console.log(`email:${email} vcode: ${verificationCode}`);
    try {
      const response = await axios.get("/api/verify-code", {
        params: { email, code: verificationCode },
      });

      console.log("Server Response:", response.data);
      if (response.status === 200) {
        alert(response.data.message || "Verification successful.");
        setVerified(true);
      }
    } catch (err) {
      alert(
        err.response?.data?.message || "Invalid code or error verifying."
      );
    }
  };

  return (
    <Box
      className="forgot-password-container"
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        position: "relative", // Keeps the back button inside the container
      }}
    >
      {/* Back Button Positioned at Top-Left */}
      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: "absolute",
          top: 20,
          left: 20,
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Paper elevation={3} sx={{ padding: 4, width: 370, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Forgot Password
        </Typography>

        {!verified ? (
          <div>
            {!codeSent ? (
              <div>
                <TextField
                  fullWidth
                  required
                  label="Email Address"
                  variant="filled"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{ marginBottom: 2 }}
                />
                <Button onClick={handleSendEmail} variant="contained" fullWidth>
                  Send Code
                </Button>
              </div>
            ) : (
              <div>
                <TextField
                  fullWidth
                  required
                  label="Verification Code"
                  variant="filled"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  sx={{ marginBottom: 2 }}
                />
                <Button onClick={handleVerifyCode} variant="contained" fullWidth>
                  Verify
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div>
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
              Change
            </Button>
          </div>
        )}
      </Paper>
    </Box>
  );
};

export default ForgotPassword;

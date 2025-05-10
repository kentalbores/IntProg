import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import "./all.css"; // Ensure this file has background styling
import Navbar from "./components/Navbar";

axios.defaults.baseURL = "https://sysarch.glitch.me";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const navigate = useNavigate();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const handleSendEmail = async () => {
    try {
      setIsSubmitting(true);
      const response = await axios.post("/api/sendToEmail", { email });
      setSnackbar({
        open: true,
        message: response.data.message || "Verification email sent.",
        severity: "success",
      });
      setCodeSent(true);
    } catch (err) {
      setIsSubmitting(false);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Error sending email.",
        severity: "error",
      });
    }
  };

  const handleResetPassword = async () => {
    try {
      setIsSubmitting(true);
      const response = await axios.post("/api/reset-password", {
        email: email,
        password: newPassword,
      });
      setSnackbar({
        open: true,
        message: response.data.message || "Password reset successful.",
        severity: "success",
      });
      navigate("/login");
    } catch (err) {
      setIsSubmitting(false);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Invalid code or error resetting password.",
        severity: "error",
      });
    }
  };

  const handleVerifyCode = async () => {
    console.log(`email:${email} vcode: ${verificationCode}`);
    try {
      setIsSubmitting(true);
      const response = await axios.get("/api/verify-code", {
        params: { email, code: verificationCode },
      });

      console.log("Server Response:", response.data);
      if (response.status === 200) {
        setSnackbar({
          open: true,
          message: response.data.message || "Verification successful.",
          severity: "success",
        });
        setVerified(true);
      }
    } catch (err) {
      setIsSubmitting(false);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Invalid code or error verifying.",
        severity: "success",
      });
    }
  };

  return (
    <Box
      id="myBox"
      className="forgot-password-container"
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        position: "relative"
      }}
    >
      {/* Navbar */}
      <Navbar
        title="Password Recovery"
        showBackButton={true}
        themeMode="light" // Since this page doesn't have theme prop
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          padding: { xs: 2, md: 0 },
        }}
      >
        <Paper
          id="myPaper"
          elevation={5}
          sx={{
            padding: { xs: 3, sm: 4 },
            width: { xs: "95%", sm: 400 },
            maxWidth: "95%",
            textAlign: "center",
            borderRadius: 3,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            backdropFilter: "blur(10px)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <Box 
            sx={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              right: 0, 
              height: "6px",
              background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)" 
            }} 
          />
          
          <Typography 
            variant="h4" 
            fontWeight="600" 
            mb={1}
            sx={{ 
              color: "#333",
              fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif" 
            }}
          >
            Password Recovery
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3, 
              color: "#64748B",
              maxWidth: "95%",
              mx: "auto"
            }}
          >
            {!verified 
              ? (!codeSent 
                ? "Enter your email address to receive a verification code" 
                : "Enter the verification code sent to your email")
              : "Create a new secure password for your account"
            }
          </Typography>
    
          {!verified ? (
            <Box>
              {!codeSent ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <TextField
                    fullWidth
                    required
                    label="Email Address"
                    variant="outlined"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                    sx={{ 
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: "#6366F1"
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#4F46E5"
                        }
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendEmail} 
                    variant="contained" 
                    fullWidth
                    sx={{ 
                      height: "46px", 
                      borderRadius: 2,
                      textTransform: "none",
                      fontSize: "1rem",
                      fontWeight: 600,
                      boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
                      background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                      "&:hover": {
                        background: "linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)",
                        boxShadow: "0 6px 16px rgba(79, 70, 229, 0.3)"
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Send Verification Code"
                    )}
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <TextField
                    fullWidth
                    required
                    label="Verification Code"
                    variant="outlined"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    InputProps={{
                      sx: { 
                        borderRadius: 2,
                        letterSpacing: "0.2em",
                        fontSize: "1.1rem"
                      }
                    }}
                    sx={{ 
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: "#6366F1"
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#4F46E5"
                        }
                      }
                    }}
                  />
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      onClick={() => {
                        setCodeSent(false);
                        setVerificationCode("");
                      }}
                      variant="outlined"
                      sx={{ 
                        flex: 1,
                        height: "46px", 
                        borderRadius: 2,
                        textTransform: "none",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        borderColor: "#64748B",
                        color: "#64748B",
                        "&:hover": {
                          borderColor: "#475569",
                          backgroundColor: "rgba(100, 116, 139, 0.04)"
                        }
                      }}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleVerifyCode} 
                      variant="contained" 
                      sx={{ 
                        flex: 2,
                        height: "46px", 
                        borderRadius: 2,
                        textTransform: "none",
                        fontSize: "1rem",
                        fontWeight: 600,
                        boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
                        background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                        "&:hover": {
                          background: "linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)",
                          boxShadow: "0 6px 16px rgba(79, 70, 229, 0.3)"
                        }
                      }}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Verify Code"
                      )}                    
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                fullWidth
                required
                label="New Password"
                type="password"
                variant="outlined"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  sx: { borderRadius: 2 }
                }}
                sx={{ 
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "&:hover fieldset": {
                      borderColor: "#6366F1"
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#4F46E5"
                    }
                  }
                }}
              />
              <Button
                onClick={handleResetPassword}
                variant="contained"
                fullWidth
                sx={{ 
                  height: "46px", 
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: "1rem",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
                  background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)",
                    boxShadow: "0 6px 16px rgba(79, 70, 229, 0.3)"
                  }
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Reset Password"
                )}
              </Button>
            </Box>
          )}
          
          <Typography variant="body2" sx={{ mt: 3, color: "#64748B" }}>
            Remember your password? 
            <Button 
              onClick={() => navigate("/login")} 
              sx={{ 
                ml: 1, 
                p: 0, 
                fontSize: "0.875rem", 
                color: "#4F46E5",
                fontWeight: 600,
                textTransform: "none"
              }}
            >
              Sign In
            </Button>
          </Typography>
        </Paper>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ 
            width: "100%", 
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            borderRadius: "8px"
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ForgotPassword;

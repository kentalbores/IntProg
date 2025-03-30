import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  TextField,
  Button,
  Box,
  Paper,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import "./all.css";
import axios from "./config/axiosconfig";
import Loading from "./components/Loading";


const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [errors, setErrors] = useState({
    username: false,
    password: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "success"
  });
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log("Current origin:", window.location.origin);
    console.log("Current hostname:", window.location.hostname);
    console.log("Current port:", window.location.port);
  }, []);
  useEffect(() => {
    const username = sessionStorage.getItem("username");
    const email = sessionStorage.getItem("email");
    
    if (username && email) {
      navigate("/home");
    }
  }, [navigate]);

  // Alert display style
  const alertStyle = {
    position: "fixed",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
    minWidth: "300px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    borderRadius: "8px",
    animation: "alertFadeIn 0.3s ease-out",
    "@keyframes alertFadeIn": {
      "0%": { opacity: 0, transform: "translate(-50%, -20px)" },
      "100%": { opacity: 1, transform: "translate(-50%, 0)" }
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {
      username: !credentials.username.trim(),
      password: !credentials.password.trim()
    };
    
    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  // Show alert
  const showAlert = (message, severity = "success") => {
    setAlert({
      show: true,
      message,
      severity
    });
    
    // Auto-dismiss error alerts after 5 seconds
    if (severity === "error") {
      setTimeout(() => {
        setAlert(prev => ({ ...prev, show: false }));
      }, 5000);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoading(true)
      const response = await axios.post("/api/googleLogin", {
        idToken: credentialResponse.credential,
      });
      console.log("Login response:", response.data);
      sessionStorage.setItem("email", response.data.email);
      sessionStorage.setItem("username", response.data.username);
      setAlertMessage("Login Successful");
      setAlertSeverity("success");
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setAlertMessage(error.response?.data?.message || error.message);
      setAlertSeverity("error");
    }
  };

  const handleError = () => {
    console.log("error");
    alert("error");
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    if (!validateForm()) return;
    try {
      setIsSubmitting(true);
      setLoading(true)
      const response = await axios.post(
        "/api/login",
        {
          username: credentials.username,
          password: credentials.password,
        }
        //{ withCredentials: true }
      );

      console.log("Headers:", response.headers);
      console.log("Data:", response.data);
      console.log(response);
      sessionStorage.setItem("username", credentials.username);
      sessionStorage.setItem("email", response.data.email);

      showAlert("Login Successful");

      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          (err.response?.status === 401 ? "Invalid username or password" : 
                          "Login failed. Please try again.");
      console.error(err.response?.data || "Login failed");
      showAlert(errorMessage, "error");
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleForgotPassword = () => {
    navigate("/Forgot-password");
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        padding: { xs: 2, md: 0 }
      }}
      id="myBox"
    >
      <Paper
        id="myPaper"
        elevation={5}
        sx={{
          padding: { xs: 3, sm: 4 },
          width: { xs: "95%", sm: 380 },
          maxWidth: "95%",
          textAlign: "center",
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          overflow: "hidden",
          position: "relative"
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
          mb={3} 
          sx={{ 
            color: "#333",
            fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif" 
          }}
        >
          Login
        </Typography>
        
        <form onSubmit={handleLogin} noValidate>
          <TextField
            fullWidth
            required
            label="Username"
            variant="outlined"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            onBlur={() => {
              if (!credentials.username.trim()) {
                setErrors(prev => ({ ...prev, username: true }));
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!credentials.username.trim()) {
                  setErrors(prev => ({ ...prev, username: true }));
                  return;
                }
                document.getElementById("passwordField")?.focus();
              }
            }}
            error={errors.username}
            helperText={errors.username ? "Username is required" : ""}
            sx={{ 
              marginBottom: 2.5,
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
            inputProps={{
              autoComplete: "username"
            }}
            InputProps={{
              sx: { borderRadius: 2 }
            }}
          />
  
          <TextField
            fullWidth
            required
            label="Password"
            name="password"
            id="passwordField"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            autoComplete="current-password"
            value={credentials.password}
            onChange={handleChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!credentials.password.trim()) {
                  setErrors(prev => ({ ...prev, password: true }));
                  return;
                }
                handleLogin();
              }
            }}
            onBlur={() => {
              if (!credentials.password.trim()) {
                setErrors(prev => ({ ...prev, password: true }));
              }
            }}
            InputProps={{
              sx: { borderRadius: 2 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    aria-label={showPassword ? "hide password" : "show password"}
                    sx={{ color: "#64748B" }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            error={errors.password}
            helperText={errors.password ? "Password is required" : ""}
            sx={{ 
              marginBottom: 3,
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
            type="submit"
            variant="contained"
            fullWidth
            disabled={isSubmitting}
            sx={{ 
              marginBottom: 3,
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
              "Sign In"
            )}
          </Button>
        </form>
        
        <Box 
          sx={{ 
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "12px 0",
            position: "relative",
            "&::before, &::after": {
              content: '""',
              flex: 1,
              borderBottom: "1px solid #E2E8F0"
            },
            "&::before": {
              marginRight: 2
            },
            "&::after": {
              marginLeft: 2
            }
          }}
        >
          <Typography variant="body2" sx={{ color: "#64748B" }}>OR</Typography>
        </Box>
        
        <Box sx={{ margin: "16px 0", display: "flex", justifyContent: "center" }}>
          <GoogleLogin 
            onSuccess={handleGoogleLogin} 
            onError={handleError} 
          />
        </Box>
  
        <Typography variant="body2" sx={{ mt: 1, color: "#64748B" }}>
          Don't have an account? 
          <Button 
            onClick={handleRegister} 
            sx={{ 
              color: "#4F46E5", 
              ml: 1, 
              p: 0, 
              fontSize: "0.875rem", 
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(79, 70, 229, 0.04)"
              }
            }}
          >
          <Box component="span">Register</Box>
          </Button>
          <Button
            onClick={handleForgotPassword}
            sx={{ 
              color: "#4F46E5",  
              fontSize: "0.85rem",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "rgba(100, 116, 139, 0.04)"
              }
            }}
          >
            Forgot Password?
          </Button>
        </Typography>
      </Paper>
      {loading && <Loading />}
      {alert.show && (
        <Alert
          icon={alert.severity === "success" ? <CheckIcon fontSize="inherit" /> : undefined}
          severity={alert.severity}
          onClose={() => setAlert(prev => ({ ...prev, show: false }))}
          sx={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            minWidth: { xs: "85%", sm: "400px" },
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            borderRadius: "8px",
            animation: "alertFadeIn 0.4s ease-out",
            "@keyframes alertFadeIn": {
              "0%": { opacity: 0, transform: "translate(-50%, -20px)" },
              "100%": { opacity: 1, transform: "translate(-50%, 0)" }
            }
          }}
          variant="filled"
        >
          {alert.message}
        </Alert>
      )}
    </Box>
  );
};

export default Login;

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Snackbar,
  Container,
  useTheme,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { Visibility, VisibilityOff, ArrowForward, Email } from "@mui/icons-material";
import axios from "./config/axiosconfig";
import "./AuthPage.css"; // Using the redesigned CSS

const AuthPage = () => {
  const navigate = useNavigate();
  const baseTheme = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState({
    login: false,
    register: false,
    registerConfirm: false,
  });
  const [currentView, setCurrentView] = useState("email"); // "email", "login", or "register"
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [animateTransition, setAnimateTransition] = useState(false);
  
  // Get theme mode from localStorage or use default
  const themeMode = localStorage.getItem("theme") || "light";
  
  // Create theme based on current mode
  const theme = useMemo(() => 
    createTheme({
      ...baseTheme,
      palette: {
        mode: themeMode === "system" 
          ? (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") 
          : themeMode,
        // Rest of palette configuration inherited from baseTheme
      },
    }),
  [themeMode, baseTheme]);

  // Check if user is already logged in
  useEffect(() => {
    const username = sessionStorage.getItem("username");
    if (username) {
      navigate("/onboarding");
    }
  }, [navigate]);

  // Login state
  const [loginCredentials, setLoginCredentials] = useState({
    username: "",
    password: "",
  });
  const [loginErrors, setLoginErrors] = useState({
    username: false,
    password: false,
  });
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    severity: "success",
  });

  // Register state
  const [username, setUsername] = useState("");
  const [enteredPass, setPass] = useState({ pass1: "", pass2: "" });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [userDetails, setUserDetails] = useState({
    email: "",
    fname: "",
    mname: "",
    lname: "",
  });
  const [registerErrors, setRegisterErrors] = useState({
    username: "",
    email: "",
    password: "",
    fname: "",
    lname: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[com]{3}$/;
    return emailRegex.test(email);
  };

  // Handle email input submission
  const handleEmailSubmit = async () => {
    if (!emailInput.trim()) {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(emailInput)) {
      setEmailError("Please enter a valid email address ending with .com");
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if email exists in database
      const response = await axios.post("/api/user/check-email", {
        email: emailInput
      });
      
      // Prepare data for next screen
      if (response.data.exists) {
        // Email exists, prepare login form
        if (response.data.username) {
          setLoginCredentials(prev => ({
            ...prev,
            username: response.data.username
          }));
        }
      } else {
        // Email doesn't exist, prepare register form
        setUserDetails(prev => ({
          ...prev,
          email: emailInput
        }));
      }
      
      // Wait for animation to complete
      setAnimateTransition(true);
      setTimeout(() => {
        setCurrentView(response.data.exists ? "login" : "register");
        setAnimateTransition(false);
      }, 300);
      
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Error checking email. Please try again.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Login functions
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (loginErrors[name]) {
      setLoginErrors((prev) => ({
        ...prev,
        [name]: false,
      }));
    }
  };

  const validateLoginForm = () => {
    const newErrors = {
      username: !loginCredentials.username.trim(),
      password: !loginCredentials.password.trim(),
    };
    setLoginErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const showLoginAlert = (message, severity = "success") => {
    setAlert({
      show: true,
      message,
      severity,
    });
    // Auto-dismiss error alerts after 5 seconds
    if (severity === "error") {
      setTimeout(() => {
        setAlert((prev) => ({ ...prev, show: false }));
      }, 5000);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post("/api/googleLogin", {
        idToken: credentialResponse.credential,
      });
      sessionStorage.setItem("email", response.data.email);
      sessionStorage.setItem("username", response.data.username);
      if (response.data.picture) {
        sessionStorage.setItem("picture", response.data.picture);
      }
      showLoginAlert("Login Successful", "success");
      navigate("/onboarding");
    } catch (error) {
      showLoginAlert(error.response?.data?.message || error.message, "error");
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!validateLoginForm()) return;
    try {
      setIsSubmitting(true);
      const response = await axios.post(
        "/api/login",
        {
          username: loginCredentials.username,
          password: loginCredentials.password,
        }
      );
      sessionStorage.setItem("username", loginCredentials.username);
      sessionStorage.setItem("email", response.data.email);
      sessionStorage.setItem("onboarding", response.data.onboardingCompleted);
      showLoginAlert("Login Successful", "success");
      navigate("/onboarding");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? "Invalid username or password"
          : "Login failed. Please try again.");
      showLoginAlert(errorMessage, "error");
      setIsSubmitting(false);
    }
  };

  // Modified register functions
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    const error = validateUsername(value);
    setRegisterErrors(prev => ({ ...prev, username: error }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPass(prev => ({ ...prev, pass1: value }));
    const error = validatePassword(value);
    setRegisterErrors(prev => ({ ...prev, password: error }));
  };

  const handleRepeatPasswordChange = (e) => {
    setPass((p) => ({ ...p, pass2: e.target.value }));
    setPasswordMatch(enteredPass.pass1 === e.target.value);
  };

  // Validation functions
  const validatePassword = (password) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return "";
  };

  const validateUsername = (username) => {
    if (username.length < 3) {
      return "Username must be at least 3 characters long";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return "";
  };

  const handleRegister = async () => {
    // Validate all fields before submission
    const usernameError = validateUsername(username);
    const passwordError = validatePassword(enteredPass.pass1);
    const nameError = !userDetails.fname.trim();

    if (usernameError || passwordError || nameError || !passwordMatch) {
      setSnackbar({
        open: true,
        message: "Please fix all errors before submitting",
        severity: "error",
      });
      return;
    }

    if (!passwordMatch) {
      return setSnackbar({
        open: true,
        message: "Passwords do not match!",
        severity: "error",
      });
    }
    
    try {
      setIsSubmitting(true);
      const user = {
        action: "add",
        username,
        password: enteredPass.pass1,
        email: userDetails.email,
        firstname: userDetails.fname,
        middlename: userDetails.mname || "",
        lastname: userDetails.lname || "",
      };
      
      await axios.post("/api/user", user);
      setSnackbar({
        open: true,
        message: "Registration successful! You can now log in.",
        severity: "success",
      });
      
      // Auto-switch to login view after successful registration
      setTimeout(() => {
        setAnimateTransition(true);
        setTimeout(() => {
          setLoginCredentials({
            username: username,
            password: "",
          });
          setCurrentView("login");
          setAnimateTransition(false);
        }, 300);
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
        setSnackbar({
          open: true,
        message: errorMessage,
          severity: "error",
        });
      setIsSubmitting(false);
    }
  };

  const handleBackToEmail = () => {
    setAnimateTransition(true);
    setTimeout(() => {
      setCurrentView("email");
      setAnimateTransition(false);
    }, 300);
  };

  // Toggle password visibility
  const handleTogglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <ThemeProvider theme={theme}>
      <Container
        maxWidth={false}
        sx={{ 
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: themeMode === "dark" 
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
            : 'linear-gradient(135deg, #e0f2fe 0%, #f8fafc 100%)',
          position: "relative",
          overflow: "hidden",
          py: 4,
        }}
      >
        {/* Background decorative elements */}
        <Box 
          sx={{ 
            position: "absolute", 
            width: "500px", 
            height: "500px", 
            borderRadius: "50%", 
            background: themeMode === "dark"
              ? "radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0) 70%)"
              : "radial-gradient(circle, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0) 70%)", 
            top: "-200px", 
            right: "-100px" 
          }} 
        />
        <Box 
          sx={{ 
            position: "absolute", 
            width: "300px", 
            height: "300px", 
            borderRadius: "50%", 
            background: themeMode === "dark"
              ? "radial-gradient(circle, rgba(236,72,153,0.2) 0%, rgba(236,72,153,0) 70%)"
              : "radial-gradient(circle, rgba(236,72,153,0.1) 0%, rgba(236,72,153,0) 70%)", 
            bottom: "100px", 
            left: "-100px" 
          }} 
        />

        <Paper
          elevation={5}
          sx={{
            width: "100%",
            maxWidth: 450,
            borderRadius: "16px",
            overflow: "hidden",
            position: "relative",
            boxShadow: themeMode === "dark"
              ? "0 20px 25px -5px rgba(0,0,0,0.3), 0 10px 10px -5px rgba(0,0,0,0.2)"
              : "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            bgcolor: theme.palette.background.paper,
          }}
        >
          <Box 
            sx={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              right: 0,
              height: "6px",
              background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)" 
            }} 
          />
          <Box
            sx={{
              p: 4,
              opacity: animateTransition ? 0 : 1,
              transform: animateTransition ? "translateX(-20px)" : "translateX(0)",
              transition: "opacity 300ms ease, transform 300ms ease",
            }}
          >
            <Typography
              variant="h4"
              fontWeight="bold"
              color="primary"
              align="center"
              gutterBottom
            >
              {currentView === "email" ? "Welcome to EventHub" : 
               currentView === "login" ? "Welcome Back" : "Create Account"}
            </Typography>
            
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ mb: 4 }}
            >
              {currentView === "email" ? "Enter your email to get started" : 
               currentView === "login" ? "Sign in to continue to your account" : "Sign up to start creating events"}
            </Typography>

            {/* Email Input Form */}
            {currentView === "email" && (
              <Box component="form" sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  variant="outlined"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setEmailError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleEmailSubmit();
                    }
                  }}
                  error={!!emailError}
                  helperText={emailError}
                  sx={{ mb: 3 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleEmailSubmit}
                  disabled={isSubmitting}
                  sx={{ 
                    py: 1.5, 
                    mt: 1,
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "1rem"
                  }}
                  endIcon={<ArrowForward />}
                >
                  {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Continue"}
                </Button>
                
                <Box sx={{ mt: 3, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Or continue with
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={() => {
                        setSnackbar({
                          open: true,
                          message: "Google login failed",
                          severity: "error",
                        });
                      }}
                      useOneTap
                    />
                  </Box>
                </Box>
              </Box>
            )}

            {/* Login Form */}
            {currentView === "login" && (
              <Box component="form" noValidate onSubmit={handleLogin} sx={{ mt: 2 }}>
                {alert.show && (
                  <Alert
                    severity={alert.severity}
                    sx={{ mb: 2 }}
                    onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
                  >
                    {alert.message}
                  </Alert>
                )}
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Signing in with email: <strong>{emailInput}</strong>
                </Typography>
                <Button 
                  variant="text" 
                  color="primary" 
                  onClick={handleBackToEmail}
                  sx={{ mb: 2, p: 0, textTransform: "none" }}
                >
                  Change email
                </Button>
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="Username"
                  name="username"
                  value={loginCredentials.username}
                  onChange={handleLoginChange}
                  error={loginErrors.username}
                  helperText={loginErrors.username ? "Username is required" : ""}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="Password"
                  name="password"
                  type={showPassword.login ? "text" : "password"}
                  value={loginCredentials.password}
                  onChange={handleLoginChange}
                  error={loginErrors.password}
                  helperText={loginErrors.password ? "Password is required" : ""}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleTogglePasswordVisibility("login")}
                          edge="end"
                        >
                          {showPassword.login ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  type="submit"
                  disabled={isSubmitting}
                  sx={{
                    py: 1.5, 
                    mt: 1,
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "1rem"
                  }}
                >
                  {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
                </Button>
              </Box>
            )}

            {/* Registration Form */}
            {currentView === "register" && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Creating account with email: <strong>{emailInput}</strong>
                </Typography>
                <Button
                  variant="text" 
                  color="primary" 
                  onClick={handleBackToEmail}
                  sx={{ mb: 2, p: 0, textTransform: "none" }}
                >
                  Change email
                </Button>
                
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={userDetails.fname}
                    onChange={(e) =>
                      setUserDetails((prev) => ({ ...prev, fname: e.target.value }))
                    }
                    error={registerErrors.fname !== ""}
                    helperText={registerErrors.fname}
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={userDetails.lname}
                    onChange={(e) =>
                      setUserDetails((prev) => ({ ...prev, lname: e.target.value }))
                    }
                    error={registerErrors.lname !== ""}
                    helperText={registerErrors.lname}
                    sx={{ mb: 2 }}
                  />
                </Box>
                
                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={handleUsernameChange}
                  error={registerErrors.username !== ""}
                  helperText={registerErrors.username}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword.register ? "text" : "password"}
                  value={enteredPass.pass1}
                  onChange={handlePasswordChange}
                  error={registerErrors.password !== ""}
                  helperText={registerErrors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleTogglePasswordVisibility("register")}
                          edge="end"
                        >
                          {showPassword.register ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPassword.registerConfirm ? "text" : "password"}
                  value={enteredPass.pass2}
                  onChange={handleRepeatPasswordChange}
                  error={!passwordMatch && enteredPass.pass2 !== ""}
                  helperText={
                    !passwordMatch && enteredPass.pass2 !== ""
                      ? "Passwords do not match"
                      : ""
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleTogglePasswordVisibility("registerConfirm")}
                          edge="end"
                        >
                          {showPassword.registerConfirm ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 3 }}
                />
                
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleRegister}
                  disabled={isSubmitting}
                  sx={{ 
                    py: 1.5,
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "1rem"
                  }}
                >
                  {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
        
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ 
              width: "100%",
              bgcolor: theme.palette.background.paper,
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default AuthPage;
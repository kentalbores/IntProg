import { useState } from "react";
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
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "./config/axiosconfig";
import "./AuthPage.css"; // Using the redesigned CSS

const AuthPage = () => {
  const [isRightPanelActive, setIsRightPanelActive] = useState(false);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState({
    login: false,
    register: false,
    registerConfirm: false,
  });

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
      showLoginAlert("Login Successful", "success");
      navigate("/home");
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
      showLoginAlert("Login Successful", "success");
      navigate("/home");
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

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[com]{3}$/;
    return emailRegex.test(email);
  };

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

  // Modified register functions
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    const error = validateUsername(value);
    setRegisterErrors(prev => ({ ...prev, username: error }));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setUserDetails(prev => ({ ...prev, email: value }));
    setRegisterErrors(prev => ({
      ...prev,
      email: validateEmail(value) ? "" : "Please enter a valid email address ending with .com"
    }));
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

  const handleRegister = async () => {
    // Validate all fields before submission
    const usernameError = validateUsername(username);
    const emailError = !validateEmail(userDetails.email);
    const passwordError = validatePassword(enteredPass.pass1);
    const nameError = !userDetails.fname.trim() || !userDetails.lname.trim();

    if (usernameError || emailError || passwordError || nameError || !passwordMatch) {
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
        username,
        password: enteredPass.pass1,
        email: userDetails.email,
        firstname: userDetails.fname,
        middlename: userDetails.mname,
        lastname: userDetails.lname,
      };
      await axios.post("/api/add-user", user);
      setSnackbar({
        open: true,
        message: "Account created successfully!",
        severity: "success",
      });
      setTimeout(() => {
        setIsRightPanelActive(false);
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An error occurred";
      setIsSubmitting(false);
      if (errorMessage.toLowerCase().includes("username already exists")) {
        setSnackbar({
          open: true,
          message: "Username is already taken!",
          severity: "error",
        });
      } else {
        setSnackbar({ open: true, message: errorMessage, severity: "error" });
      }
    }
  };

  return (
    <Box className="auth-container">
      <div className={`container ${isRightPanelActive ? 'right-panel-active' : ''}`}>
        {/* Sign In Container */}
        <div className="form-container sign-in-container">
          <form className="auth-form" onSubmit={handleLogin} noValidate>
            <h2>Sign In</h2>
            <TextField
              fullWidth
              required
              label="Username"
              variant="outlined"
              name="username"
              value={loginCredentials.username}
              onChange={handleLoginChange}
              onBlur={() => {
                if (!loginCredentials.username.trim()) {
                  setLoginErrors((prev) => ({ ...prev, username: true }));
                }
              }}
              error={loginErrors.username}
              helperText={loginErrors.username ? "Username is required" : ""}
              className="form-input"
              inputProps={{
                autoComplete: "username",
              }}
            />
            <TextField
              fullWidth
              required
              label="Password"
              name="password"
              id="passwordField"
              type={showPassword.login ? "text" : "password"}
              variant="outlined"
              autoComplete="current-password"
              value={loginCredentials.password}
              onChange={handleLoginChange}
              onBlur={() => {
                if (!loginCredentials.password.trim()) {
                  setLoginErrors((prev) => ({ ...prev, password: true }));
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(prev => ({ ...prev, login: !prev.login }))}
                      edge="end"
                      aria-label={
                        showPassword.login ? "hide password" : "show password"
                      }
                      sx={{ color: "#64748B" }}
                    >
                      {showPassword.login ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={loginErrors.password}
              helperText={loginErrors.password ? "Password is required" : ""}
              className="form-input"
            />
            <Button
              onClick={() => navigate("/Forgot-password")}
              sx={{
                color: "rgba(79, 70, 229, 0.7)",
                fontSize: "0.85rem",
                textTransform: "none",
                alignSelf: "flex-end",
                marginTop: "8px",
                "&:hover": {
                  color: "rgba(79, 70, 229, 0.4)",
                },
              }}
            >
              Forgot Password?
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              className="gradient-button"
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>
            <Box className="divider">
              <Typography variant="body2" sx={{ color: "rgb(80, 80, 80)" }}>
                OR
              </Typography>
            </Box>
            <Box sx={{ margin: "16px 0", display: "flex", justifyContent: "center" }}>
              <GoogleLogin onSuccess={handleGoogleLogin} />
            </Box>
          </form>
        </div>
        
        {/* Sign Up Container */}
        <div className="form-container sign-up-container">
          <form className="auth-form" noValidate style={{paddingTop: "150px", paddingBottom: "30px"}}>
            <h2>Sign Up</h2>
            <TextField
              fullWidth
              required
              label="Username"
              variant="outlined"
              onChange={handleUsernameChange}
              error={!!registerErrors.username}
              helperText={registerErrors.username}
              className="form-input"
            />
            <TextField
              fullWidth
              required
              label="Email"
              variant="outlined"
              type="email"
              onChange={handleEmailChange}
              error={!!registerErrors.email}
              helperText={registerErrors.email}
              className="form-input"
            />
            <TextField
              fullWidth
              required
              label="Password"
              type={showPassword.register ? "text" : "password"}
              variant="outlined"
              onChange={handlePasswordChange}
              error={!!registerErrors.password}
              helperText={registerErrors.password}
              className="form-input"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(prev => ({ ...prev, register: !prev.register }))}
                      sx={{ color: "#64748B" }}
                    >
                      {showPassword.register ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              required
              label="Repeat Password"
              type={showPassword.registerConfirm ? "text" : "password"}
              variant="outlined"
              onChange={handleRepeatPasswordChange}
              error={!passwordMatch && enteredPass.pass2 !== ""}
              helperText={!passwordMatch && enteredPass.pass2 !== "" ? "Passwords do not match" : ""}
              className="form-input"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(prev => ({ ...prev, registerConfirm: !prev.registerConfirm }))}
                      sx={{ color: "#64748B" }}
                    >
                      {showPassword.registerConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <div className="name-fields-container">
              <TextField
                fullWidth
                required
                label="First Name"
                variant="outlined"
                onChange={(e) =>
                  setUserDetails((p) => ({ ...p, fname: e.target.value }))
                }
                className="form-input"
              />
              <TextField
                fullWidth
                label="Middle Name"
                variant="outlined"
                onChange={(e) =>
                  setUserDetails((p) => ({ ...p, mname: e.target.value }))
                }
                className="form-input"
              />
            </div>
            <TextField
              fullWidth
              required
              label="Last Name"
              variant="outlined"
              onChange={(e) =>
                setUserDetails((p) => ({ ...p, lname: e.target.value }))
              }
              className="form-input"
            />
            <Button
              onClick={handleRegister}
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              className="gradient-button"
            >
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
        </div>
        
        {/* Overlay Container */}
        <div className="overlay-container">
          <div className="overlay">
            {/* Left Panel */}
            <div className="overlay-panel overlay-left">
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                Welcome Back!
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, maxWidth: "80%" }}>
                To keep connected with us please login with your personal info
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => setIsRightPanelActive(false)}
                className="ghost-button"
              >
                Sign In
              </Button>
            </div>
            
            {/* Right Panel */}
            <div className="overlay-panel overlay-right">
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
                Hello, Friend!
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, maxWidth: "80%" }}>
                Enter your personal details and start your journey with us
              </Typography>
              <Button 
                variant="outlined" 
                onClick={() => setIsRightPanelActive(true)}
                className="ghost-button"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alert.show && (
        <Alert
          icon={
            alert.severity === "success" ? (
              <CheckIcon fontSize="inherit" />
            ) : undefined
          }
          severity={alert.severity}
          onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
          className="alert-message"
          variant="filled"
        >
          {alert.message}
        </Alert>
      )}
      
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

export default AuthPage;
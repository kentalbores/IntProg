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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import "./all.css";

axios.defaults.baseURL = "https://sysarch.glitch.me";
axios.defaults.withCredentials = true;

const Login = () => {
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log("Current origin:", window.location.origin);
    console.log("Current hostname:", window.location.hostname);
    console.log("Current port:", window.location.port);
  }, []);

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setLoading(true)
      const response = await axios.post("/api/googleLogin", {
        idToken: credentialResponse.credential,
      });
      console.log("Login response:", response.data);
      sessionStorage.setItem("email", response.data.email);
      sessionStorage.setItem("username", response.data.username);
      alert("Login Successful");
      navigate("/home");
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      alert(
        "Google login failed: " +
          (error.response?.data?.message || error.message)
      );
    }
  };

  const handleError = () => {
    console.log("error");
    alert("error");
  };
  const handleLogin = async () => {
    try {
      setLoading(true)
      const response = await axios.post(
        "/api/login",
        {
          username: name,
          password: pass,
        }
        //{ withCredentials: true }
      );
      console.log("Headers:", response.headers);
      console.log("Data:", response.data);
      console.log(response);
      sessionStorage.setItem("username", name);
      sessionStorage.setItem("email", response.data.email);
      navigate("/home");
    } catch (err) {
      console.error(err.response?.data || "Login failed");
      alert(err.response?.data?.message || "Invalid credentials");
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
      bgcolor="#f5f5f5"
      id="myBox"
    >
      <Paper
        id="myPaper"
        elevation={3}
        sx={{
          padding: 3,
          width: 300, // Decreased width for a more compact box
          textAlign: "center",
          borderRadius: 2, // Slightly rounded edges for a modern look
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Login
        </Typography>

        <TextField
          fullWidth
          required
          label="Username"
          variant="filled"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ marginBottom: 2 }}
        />

        <TextField
          fullWidth
          required
          label="Password"
          type={showPassword ? "text" : "password"}
          variant="filled"
          autoComplete="current-password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ marginBottom: 2 }}
        />

        <Button
          onClick={handleLogin}
          variant="contained"
          fullWidth
          sx={{ marginBottom: 2 }}
        >
          Login
        </Button>
        <GoogleLogin onSuccess={handleGoogleLogin} onError={handleError} />

        <Box display="flex" flexDirection="column" alignItems="center">
          <Button size="small" onClick={handleRegister} sx={{ color: "black" }}>
            Register
          </Button>
          <Button
            size="small"
            onClick={handleForgotPassword}
            sx={{ color: "black", marginTop: -1 }}
          >
            Forgot Password?
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;

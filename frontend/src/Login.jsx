import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import * as material from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import "./all.css";
import axios from "./config/axiosconfig";
import Loading from "./components/Loading";


const Login = () => {
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertSeverity, setAlertSeverity] = useState("success");
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (alertSeverity === "error") {
      setLoading(false);
    }
  }, [alertSeverity]);
  useEffect(() => {
    console.log("Current origin:", window.location.origin);
    console.log("Current hostname:", window.location.hostname);
    console.log("Current port:", window.location.port);
  }, []);
  const alertStyle = {
    position: "absolute",
    top: 20,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 1000,
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
      <material.Alert
        icon={<CheckIcon fontSize="inherit" />}
        severity="success"
        sx={alertStyle}
        onClose={() => setAlertMessage(null)}
      
      >
        Login Successful
      </material.Alert>
      navigate("/home");
    } catch (err) {
      console.error(err.response?.data || "Login failed");
      setAlertMessage(err.response?.data?.message || "Invalid credentials");
      setAlertSeverity("error");
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleForgotPassword = () => {
    navigate("/Forgot-password");
  };

  return (
    <material.Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
      id="myBox"
    >
      <material.Paper
        id="myPaper"
        elevation={3}
        sx={{
          padding: 3,
          width: 300, // Decreased width for a more compact box
          textAlign: "center",
          borderRadius: 2, // Slightly rounded edges for a modern look
        }}
      >
        <material.Typography variant="h5" fontWeight="bold" mb={2}>
          Login
        </material.Typography>

        <material.TextField
          fullWidth
          required
          label="Username"
          variant="filled"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ marginBottom: 2 }}
        />

        <material.TextField
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
              <material.InputAdornment position="end">
                <material.IconButton onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </material.IconButton>
              </material.InputAdornment>
            ),
          }}
          sx={{ marginBottom: 2 }}
        />

        <material.Button
          onClick={handleLogin}
          variant="contained"
          fullWidth
          sx={{ marginBottom: 2 }}
        >
          Login
        </material.Button>
        <GoogleLogin onSuccess={handleGoogleLogin} onError={handleError} />

        <material.Box display="flex" flexDirection="column" alignItems="center">
          <material.Button size="small" onClick={handleRegister} sx={{ color: "black" }}>
            Register
          </material.Button>
          <material.Button
            size="small"
            onClick={handleForgotPassword}
            sx={{ color: "black", marginTop: -1 }}
          >
            Forgot Password?
          </material.Button>
        </material.Box>
      </material.Paper>
      {loading && <Loading />}
      {alertMessage && (
        <material.Alert
          icon={<CheckIcon fontSize="inherit" />}
          severity={alertSeverity}
          onClose={() => setAlertMessage(null)}
          sx={alertStyle}
        >
          {alertMessage}
        </material.Alert>
      )}
      
    </material.Box>
  );
};

export default Login;

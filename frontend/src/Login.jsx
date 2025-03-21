import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const Login = () => {
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("/api/login", {
        username: name,
        password: pass,
      });
      console.log(response);
      localStorage.setItem("username", name);
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
      <Paper id="myPaper" elevation={3} sx={{ padding: 4, width: 370, textAlign: "center" }}>
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
          sx={{ marginTop: 2 }}
        >
          Login
        </Button>

        <Box display="flex" flexDirection="column" alignItems="center" mt={1}>
          <Button size="small" onClick={handleRegister} sx={{ color: "black" }}>
            Register
          </Button>
          <Button size="small" onClick={handleForgotPassword} sx={{ color: "black", marginTop: -1 }}>
            Forgot Password?
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;

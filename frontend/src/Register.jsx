import React, { useState } from "react";
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Typography,
  Box,
  Snackbar,
  Alert
} from "@mui/material";
import { Visibility, VisibilityOff, ArrowBack } from "@mui/icons-material";
import axios from "./config/axiosconfig";
import { useNavigate } from "react-router-dom";
import "./all.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [enteredPass, setPass] = useState({ pass1: "", pass2: "" });
  const [showPassword, setShowPassword] = useState({ pass1: false, pass2: false });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [userDetails, setUserDetails] = useState({ email: "", fname: "", mname: "", lname: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const navigate = useNavigate();

  const isValidUsername = (username) => {
    const usernameRegex = /^[a-zA-Z]+(_[a-zA-Z0-9]+)$/;
    return usernameRegex.test(username);
  };

  const handlePasswordChange = (e) => {
    setPass((p) => ({ ...p, pass1: e.target.value }));
  };

  const handleRepeatPasswordChange = (e) => {
    setPass((p) => ({ ...p, pass2: e.target.value }));
    setPasswordMatch(enteredPass.pass1 === e.target.value);
  };

  const handleRegister = async () => {
    if (!passwordMatch) {
      return setSnackbar({ open: true, message: "Passwords do not match!", severity: "error" });
    }
    if (!isValidUsername(username)) {
      return setSnackbar({ open: true, message: "Username must be Unique!", severity: "error" });
    }
    try {
      const user = {
        username,
        password: enteredPass.pass1,
        email: userDetails.email,
        firstname: userDetails.fname,
        middlename: userDetails.mname,
        lastname: userDetails.lname,
      };
      await axios.post("/api/add-user", user);
      setSnackbar({ open: true, message: "User added successfully!", severity: "success" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An error occurred";
      if (errorMessage.toLowerCase().includes("username already exists")) {
        setSnackbar({ open: true, message: "Username is already taken!", severity: "error" });
      } else {
        setSnackbar({ open: true, message: errorMessage, severity: "error" });
      }
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5" id="myBox">
      <IconButton onClick={() => navigate(-1)} sx={{ alignSelf: "flex-start", margin: 2 }}>
        <ArrowBack />
      </IconButton>
      <Paper id="myPaper2" elevation={3} sx={{ padding: 4, width: 350, textAlign: "center", maxHeight: "500px", overflowY: "auto" }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>Register</Typography>

        <TextField fullWidth required label="Username" variant="filled" onChange={(e) => setUsername(e.target.value)} sx={{ marginBottom: 2 }} />
        <TextField fullWidth required label="Password" type={showPassword.pass1 ? "text" : "password"} variant="filled"
          onChange={handlePasswordChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((prev) => ({ ...prev, pass1: !prev.pass1 }))}>
                  {showPassword.pass1 ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ marginBottom: 1 }}
        />

        <TextField fullWidth required label="Repeat Password" type={showPassword.pass2 ? "text" : "password"} variant="filled"
          onChange={handleRepeatPasswordChange}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((prev) => ({ ...prev, pass2: !prev.pass2 }))}>
                  {showPassword.pass2 ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ marginBottom: 1 }}
        />
        {!passwordMatch && enteredPass.pass2 && <Typography color="red">Passwords do not match!</Typography>}

        <TextField fullWidth required label="Email" variant="filled" onChange={(e) => setUserDetails((p) => ({ ...p, email: e.target.value }))} sx={{ marginBottom: 2 }} />
        <TextField fullWidth required label="First Name" variant="filled" onChange={(e) => setUserDetails((p) => ({ ...p, fname: e.target.value }))} sx={{ marginBottom: 2 }} />
        <TextField fullWidth label="Middle Name" variant="filled" onChange={(e) => setUserDetails((p) => ({ ...p, mname: e.target.value }))} sx={{ marginBottom: 2 }} />
        <TextField fullWidth required label="Last Name" variant="filled" onChange={(e) => setUserDetails((p) => ({ ...p, lname: e.target.value }))} sx={{ marginBottom: 2 }} />

        <Button onClick={handleRegister} variant="contained" fullWidth sx={{ marginTop: 2 }}>Register</Button>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Register;

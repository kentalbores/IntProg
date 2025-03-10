import React, { useState } from "react";
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "./config/axiosconfig";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setName] = useState("");
  const [enteredPass, setPass] = useState({ pass1: "", pass2: "" });
  const [showPassword, setShowPassword] = useState({ pass1: false, pass2: false });
  const [userDetails, setUserDetails] = useState({
    fname: "",
    mname: "",
    lname: "",
  });

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (enteredPass.pass1 !== enteredPass.pass2)
      return alert("Passwords do not match!");
    try {
      const user = {
        username: username,
        password: enteredPass.pass1,
        firstname: userDetails.fname,
        middlename: userDetails.mname,
        lastname: userDetails.lname,
      };
      const response = await axios.post("/api/add-user", user);
      alert("User added!");
      console.log(user);
      console.log(response.data);
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      <Paper elevation={3} sx={{ padding: 4, width: 350, textAlign: "center" }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Register
        </Typography>

        <TextField
          fullWidth
          required
          label="Username"
          variant="filled"
          onChange={(e) => setName(e.target.value)}
          sx={{ marginBottom: 2 }}
        />

        {/* Password Field */}
        <TextField
          fullWidth
          required
          label="Password"
          type={showPassword.pass1 ? "text" : "password"}
          variant="filled"
          autoComplete="new-password"
          onChange={(e) =>
            setPass((p) => ({
              ...p,
              pass1: e.target.value,
            }))
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() =>
                    setShowPassword((prev) => ({ ...prev, pass1: !prev.pass1 }))
                  }
                >
                  {showPassword.pass1 ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ marginBottom: 2 }}
        />

        {/* Repeat Password Field */}
        <TextField
          fullWidth
          required
          label="Repeat Password"
          type={showPassword.pass2 ? "text" : "password"}
          variant="filled"
          autoComplete="new-password"
          onChange={(e) =>
            setPass((p) => ({
              ...p,
              pass2: e.target.value,
            }))
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() =>
                    setShowPassword((prev) => ({ ...prev, pass2: !prev.pass2 }))
                  }
                >
                  {showPassword.pass2 ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ marginBottom: 2 }}
        />

        <TextField
          fullWidth
          required
          label="First Name"
          variant="filled"
          onChange={(e) =>
            setUserDetails((p) => ({
              ...p,
              fname: e.target.value,
            }))
          }
          sx={{ marginBottom: 2 }}
        />
        <TextField
          fullWidth
          label="Middle Name"
          variant="filled"
          onChange={(e) =>
            setUserDetails((p) => ({
              ...p,
              mname: e.target.value,
            }))
          }
          sx={{ marginBottom: 2 }}
        />
        <TextField
          fullWidth
          required
          label="Last Name"
          variant="filled"
          onChange={(e) =>
            setUserDetails((p) => ({
              ...p,
              lname: e.target.value,
            }))
          }
          sx={{ marginBottom: 2 }}
        />

        <Button
          onClick={handleRegister}
          variant="contained"
          color="success"
          fullWidth
          sx={{ marginTop: 2 }}
        >
          Register
        </Button>
      </Paper>
    </Box>
  );
};

export default Register;

import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { TextField, Button } from "@mui/material";
import axios from "axios";

axios.defaults.baseURL = "https://sysarch.glitch.me";
axios.defaults.withCredentials = true;

const Login = () => {
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const checkLogin = async () => {
    try {
      const response = await axios.get("/isLoggedIn", {
        withCredentials: true,
      });
      console.log("sdfsdfsdf", response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "/api/login",
        {
          username: name,
          password: pass,
        },
        { withCredentials: true }
      );
      console.log("Headers:", response.headers);
      console.log("Data:", response.data);
      console.log(response);

      navigate("/home");
    } catch (err) {
      console.log(err.response.data);
      alert(err.response.data.message);
    }
  };
  const handleRegister = () => {
    navigate("/register");
  };
  return (
    <div>
      <TextField
        required
        id="filled-required"
        label="Required"
        defaultValue="username"
        variant="filled"
        onChange={(e) => setName(e.target.value)}
      />
      <TextField
        id="filled-password-input"
        label="Password"
        type="password"
        autoComplete="current-password"
        variant="filled"
        onChange={(e) => setPass(e.target.value)}
      />
      <Button onClick={handleLogin} variant="contained" color="success">
        Login
      </Button>
      <Button size="small" onClick={handleRegister}>
        Register
      </Button>
    </div>
  );
};

export default Login;

import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import axios from "axios";

axios.defaults.baseURL = "https://sysarch.glitch.me";

const Login = () => {
  const navigate = useNavigate();
  const handleLogin = async () => {
    console.log("hell owlord");
    try {
      const response = await axios.post("/api/login", {
        username: "kenji224",
        password: "kenken123",
      });
      console.log(response.data);
      navigate("/home");
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div>
      Login page
      <Button onClick={handleLogin} variant="contained" color="success">
        Login
      </Button>
    </div>
  );
};

export default Login;

import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";

const Login = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    console.log("hell owlord");
    navigate("/home");
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

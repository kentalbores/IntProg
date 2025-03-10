import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";
import axios from "./config/axiosconfig";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setUsername] = useState("");
  const [enteredPass, setEnteredPass] = useState({ pass1: "", pass2: "" });
  const [userDetails, setUserDetails] = useState({ fname: "", mname: "", lname: "" });

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (enteredPass.pass1 !== enteredPass.pass2) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const user = {
        username,
        password: enteredPass.pass1,
        firstname: userDetails.fname,
        middlename: userDetails.mname,
        lastname: userDetails.lname,
      };
      
      const response = await axios.post("/api/add-user", user);
      alert("User added!");
      console.log(user, response.data);
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <TextField
        required
        label="Username"
        variant="filled"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        variant="filled"
        value={enteredPass.pass1}
        onChange={(e) => setEnteredPass((p) => ({ ...p, pass1: e.target.value }))}
      />
      <TextField
        label="Repeat Password"
        type="password"
        variant="filled"
        value={enteredPass.pass2}
        onChange={(e) => setEnteredPass((p) => ({ ...p, pass2: e.target.value }))}
      />
      <TextField
        required
        label="First Name"
        variant="filled"
        value={userDetails.fname}
        onChange={(e) => setUserDetails((p) => ({ ...p, fname: e.target.value }))}
      />
      <TextField
        label="Middle Name"
        variant="filled"
        value={userDetails.mname}
        onChange={(e) => setUserDetails((p) => ({ ...p, mname: e.target.value }))}
      />
      <TextField
        required
        label="Last Name"
        variant="filled"
        value={userDetails.lname}
        onChange={(e) => setUserDetails((p) => ({ ...p, lname: e.target.value }))}
      />
      <Button onClick={handleRegister} variant="contained" color="success">
        Register
      </Button>
    </Box>
  );
};

export default Register;

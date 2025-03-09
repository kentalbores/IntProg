import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import axios from "./config/axiosconfig";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [username, setName] = useState("");
  const [enteredPass, setPass] = useState({ pass1: "", pass2: "" });
  const [userDetails, setUserDetails] = useState({
    fname: "",
    mname: "",
    lname: "",
  });

  const navigate = useNavigate();

  const handleRegister = async () => {
    if (enteredPass.pass1 !== enteredPass.pass2)
      return alert("passwords do not match!");
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
    <div>
      <TextField
        required
        id="filled-required"
        label="Username"
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
        onChange={(e) => {
          setPass((p) => ({
            ...p,
            pass1: e.target.value,
          }));
        }}
      />
      <TextField
        id="filled-password-input2"
        label="Repeat Password"
        type="password"
        autoComplete="current-password"
        variant="filled"
        onChange={(e) => {
          setPass((p) => ({
            ...p,
            pass2: e.target.value,
          }));
        }}
      />
      <TextField
        required
        id="fname"
        label="First Name"
        defaultValue=""
        variant="filled"
        onChange={(e) => {
          setUserDetails((p) => ({
            ...p,
            fname: e.target.value,
          }));
        }}
      />
      <TextField
        id="mname"
        label="Middle Name"
        defaultValue=""
        variant="filled"
        onChange={(e) => {
          setUserDetails((p) => ({
            ...p,
            mname: e.target.value,
          }));
        }}
      />
      <TextField
        required
        id="lname"
        label="Last Name"
        defaultValue=""
        variant="filled"
        onChange={(e) => {
          setUserDetails((p) => ({
            ...p,
            lname: e.target.value,
          }));
        }}
      />
      <Button onClick={handleRegister} variant="contained" color="success">
        Register
      </Button>
    </div>
  );
};

export default Register;

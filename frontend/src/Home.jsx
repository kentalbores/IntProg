import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "./config/axiosconfig";

const Home = () => {
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
  useEffect(() => {
    console.log("Checking login...");
    checkLogin();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await axios.post("/logout", {
        withCredentials: true,
      });
      console.log(response);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div>
      <button onClick={checkLogin}>try me</button>
      <button onClick={handleLogout}>logout</button>
    </div>
  );
};

export default Home;

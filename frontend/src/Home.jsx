import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "./config/axiosconfig"

const Home = () => {

  const navigate = useNavigate()
  const handleProfile = ()=> {
    //console.log(localStorage.getItem("username"))
    navigate("/profile")
  }
  const handleLogout = async () => {
    try{
      const response = await axios.post(`/logout`)
      console.log(response.data)
      navigate("/login")
    }catch(err){
      console.error(err)
    }
  }

  return (
    <div>
      <Button size="small" onClick={handleProfile}>
            Profile
      </Button>
      <Button size="small" onClick={handleLogout}>
            Logout
      </Button>
    </div>
  )
};

export default Home;

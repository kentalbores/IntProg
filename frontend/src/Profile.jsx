import React, { useEffect, useState } from "react";
import axios from "./config/axiosconfig"

const Profile = () => {

  const [user, setUser] = useState({})
  useEffect(()=>{
    const getUserData = async () => {
      try{
        const response = await axios.get(`/api/userinfo?username=${localStorage.getItem("username")}`)
        console.log(response.data)
        setUser(response.data)
      }catch(err){
        console.error(err)
      }
    }
    getUserData()
  },[])

  return <div>
  {user ? <pre>{JSON.stringify(user, null, 2)}</pre> : <p>Loading user data...</p>}
</div>
};

export default Profile;

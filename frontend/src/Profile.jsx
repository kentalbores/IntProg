import React, { useEffect, useState } from "react";
import axios from "./config/axiosconfig";
import { Button, Card, CardContent, Typography, Container } from "@mui/material";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await axios.get(
          `/api/userinfo?username=${localStorage.getItem("username")}`
        );
        setUser(response.data.user_info);
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };
    getUserData();
  }, []);

  if (loading) return <Typography variant="body1">Loading user data...</Typography>;

  return (
    <Container maxWidth="sm" style={{ textAlign: "center", marginTop: "20px" }}>
      <Typography variant="h4" gutterBottom>Profile</Typography>
      <Card variant="outlined" sx={{ padding: 2, boxShadow: 2 }}>
        <CardContent>
          {user ? (
            <>
              <Typography variant="h6"><strong>Username:</strong> {user.username}</Typography>
              <Typography variant="body1"><strong>First Name:</strong> {user.firstname}</Typography>
              <Typography variant="body1"><strong>Middle Name:</strong> {user.middlename}</Typography>
              <Typography variant="body1"><strong>Last Name:</strong> {user.lastname}</Typography>
            </>
          ) : (
            <Typography variant="body1">User not found.</Typography>
          )}
        </CardContent>
      </Card>
      
      {/* Go Back Button */}
      <Button 
        variant="contained" 
        color="primary" 
        sx={{ marginTop: 2 }} 
        onClick={() => window.history.back()}
      >
        Go Back
      </Button>
    </Container>
  );
};

export default Profile;
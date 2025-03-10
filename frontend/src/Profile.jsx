import React, { useEffect, useState } from "react";
import axios from "./config/axiosconfig";
import { Button, Card, CardContent, Typography, Container, CircularProgress, Box } from "@mui/material";

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

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Profile
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      ) : (
        <Card variant="outlined" sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            {user ? (
              <>
                <Typography variant="h6" gutterBottom>
                  <strong>Username:</strong> {user.username}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  <strong>First Name:</strong> {user.firstname}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  <strong>Middle Name:</strong> {user.middlename || "N/A"}
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  <strong>Last Name:</strong> {user.lastname}
                </Typography>
              </>
            ) : (
              <Typography variant="body1" color="error">
                User not found.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
      <Button 
        variant="contained" 
        color="primary" 
        sx={{ mt: 3, borderRadius: 2 }} 
        onClick={() => window.history.back()}
      >
        Go Back
      </Button>
    </Container>
  );
};

export default Profile;
import React, { useEffect, useState } from "react";
import axios from "./config/axiosconfig";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Container,
  CircularProgress,
  Box,
  Divider,
  Avatar,
  Alert,
} from "@mui/material";
import "./all.css";
const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await axios.get(
          `/api/userinfo?username=${sessionStorage.getItem("username")}`
        );
        if (response.data?.user_info) {
          setUser(response.data.user_info);
        } else {
          setError("User data not found.");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 5 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Profile
      </Typography>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="50vh"
        >
          <CircularProgress size={50} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      ) : (
        <Card
          variant="outlined"
          sx={{
            p: 3,
            boxShadow: 3,
            borderRadius: 3,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <CardContent>
            {/* Profile Picture Placeholder */}
            <Box display="flex" justifyContent="center" mb={2}>
              <Avatar
                id="font"
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  color: "black",
                  fontSize: 32,
                }}
              >
                {user.username ? user.username.charAt(0).toUpperCase() : "U"}
              </Avatar>
            </Box>

            {/* Username */}
            <Typography variant="h6" sx={{ fontWeight: 600, color: "black" }}>
              {user.username}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* User Info */}
            <Typography variant="body1" sx={{ color: "black" }}>
              <strong>First Name:</strong> {user.firstname}
            </Typography>
            <Typography variant="body1" sx={{ color: "black" }}>
              <strong>Middle Name:</strong> {user.middlename || "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ color: "black" }}>
              <strong>Last Name:</strong> {user.lastname}
            </Typography>
            <Typography variant="body1" sx={{ color: "black" }}>
              <strong>Email:</strong> {user.email}
            </Typography>
          </CardContent>
        </Card>
      )}

      <Button
        variant="contained"
        color="secondary"
        sx={{ mt: 3, borderRadius: 3, fontWeight: 600 }}
        onClick={() => window.history.back()}
      >
        Go Back
      </Button>
    </Container>
  );
};

export default Profile;

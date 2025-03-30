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
  TextField,
  Grid2,
  Snackbar,
} from "@mui/material";
import "./all.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [success, setSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await axios.get(
          `/api/userinfo?username=${sessionStorage.getItem("username")}`
        );
        if (response.data?.user_info) {
          setUser(response.data.user_info);
          setFormData(response.data.user_info);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('/api/update-user', formData);
      if (response.status === 200) {
        setUser(formData);
        setSuccess(true);
        setEditMode(false);
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setUpdateError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setUpdateError(null);
  };

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
              src={user?.picture || ""}
            >
              {!user?.picture && (user?.username ? user.username.charAt(0).toUpperCase() : "U")}
            </Avatar>
          </Box>


            {/* Username */}
            <Typography variant="h6" sx={{ fontWeight: 600, color: "black" }}>
              {user.username}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {editMode ? (
              <Grid2 container spacing={2}>
                <Grid2 item xs={12}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstname"
                    value={formData.firstname || ''}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid2>
                <Grid2 item xs={12}>
                  <TextField
                    fullWidth
                    label="Middle Name"
                    name="middlename"
                    value={formData.middlename || ''}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid2>
                <Grid2 item xs={12}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastname"
                    value={formData.lastname || ''}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid2>
                <Grid2 item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                </Grid2>
                <Grid2 item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </Button>
                </Grid2>
                <Grid2 item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                  >
                    Save
                  </Button>
                </Grid2>
              </Grid2>
            ) : (
              <>
                {/* User Info */}
                <Typography variant="body1" sx={{ color: "black" }}>
                  <strong>First Name:</strong> {user.firstname}
                </Typography>
                {user.middlename ? (
                  <Typography variant="body1" sx={{ color: "black" }}>
                    <strong>Middle Name:</strong> {user.middlename || "N/A"}
                  </Typography>
                ) : (
                  <div></div>
                )}
                <Typography variant="body1" sx={{ color: "black" }}>
                  <strong>Last Name:</strong> {user.lastname}
                </Typography>
                {user.email && (
                  <Typography variant="body1" sx={{ color: "black" }}>
                    <strong>Email:</strong> {user.email}
                  </Typography>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2, borderRadius: 3, fontWeight: 600 }}
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>
              </>
            )}
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

      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          Profile updated successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!updateError}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {updateError}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;
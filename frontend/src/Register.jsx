import { useState } from "react";
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Typography,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "./config/axiosconfig";
import { useNavigate } from "react-router-dom";
import "./all.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [enteredPass, setPass] = useState({ pass1: "", pass2: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState({
    pass1: false,
    pass2: false,
  });
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [userDetails, setUserDetails] = useState({
    email: "",
    fname: "",
    mname: "",
    lname: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const navigate = useNavigate();

  const isValidUsername = (username) => {
    const usernameRegex = /^[a-zA-Z]+(_[a-zA-Z0-9]+)$/;
    return usernameRegex.test(username);
  };

  const handlePasswordChange = (e) => {
    setPass((p) => ({ ...p, pass1: e.target.value }));
  };

  const handleRepeatPasswordChange = (e) => {
    setPass((p) => ({ ...p, pass2: e.target.value }));
    setPasswordMatch(enteredPass.pass1 === e.target.value);
  };

  const handleRegister = async () => {
    if (!passwordMatch) {
      return setSnackbar({
        open: true,
        message: "Passwords do not match!",
        severity: "error",
      });
    }
    // if (!isValidUsername(username)) {
    //   return setSnackbar({ open: true, message: "Username must be Unique!", severity: "error" });
    // }
    try {
      setIsSubmitting(true);
      const user = {
        username,
        password: enteredPass.pass1,
        email: userDetails.email,
        firstname: userDetails.fname,
        middlename: userDetails.mname,
        lastname: userDetails.lname,
      };
      await axios.post("/api/add-user", user);
      setSnackbar({
        open: true,
        message: "User added successfully!",
        severity: "success",
      });
      setTimeout(() => navigate("/onboarding"), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || "An error occurred";
      setIsSubmitting(false);
      if (errorMessage.toLowerCase().includes("username already exists")) {
        setSnackbar({
          open: true,
          message: "Username is already taken!",
          severity: "error",
        });
      } else {
        setSnackbar({ open: true, message: errorMessage, severity: "error" });
      }
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      sx={{
        padding: { xs: 2, md: 4 },
      }}
      id="myBox"
    >
      <IconButton
        onClick={() => navigate(-1)}
        sx={{
          position: "absolute",
          top: { xs: 12, md: 20 },
          left: { xs: 12, md: 20 },
          color: "#64748B",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "white",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            transform: "translateY(-2px)",
          },
        }}
      >
        <ArrowBackIcon />
      </IconButton>
      <Paper
        id="myPaper"
        elevation={5}
        sx={{
          padding: { xs: 3, sm: 4 },
          width: { xs: "95%", sm: 450 },
          maxWidth: "95%",
          textAlign: "center",
          borderRadius: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          maxHeight: { xs: "85vh", sm: "600px" },
          overflowY: "auto",
          position: "relative",
          "&::-webkit-scrollbar": {
            width: "8px",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#f1f1f1",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#c3cfe2",
            borderRadius: "4px",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
          }}
        />

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography
            variant="h4"
            fontWeight="600"
            sx={{
              flexGrow: 1,
              color: "#333",
              fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
            }}
          >
            Create Account
          </Typography>
        </Box>

        <Typography
          variant="body1"
          sx={{
            mb: 3,
            color: "#64748B",
            maxWidth: "90%",
            mx: "auto",
          }}
        >
          Please fill in your information to get started
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <TextField
            fullWidth
            required
            label="Username"
            variant="outlined"
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              sx: { borderRadius: 2 },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "#6366F1",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#4F46E5",
                },
              },
            }}
          />

          <TextField
            fullWidth
            required
            label="Password"
            type={showPassword.pass1 ? "text" : "password"}
            variant="outlined"
            onChange={handlePasswordChange}
            InputProps={{
              sx: { borderRadius: 2 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        pass1: !prev.pass1,
                      }))
                    }
                    sx={{ color: "#64748B" }}
                  >
                    {showPassword.pass1 ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "#6366F1",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#4F46E5",
                },
              },
            }}
          />

          <TextField
            fullWidth
            required
            label="Repeat Password"
            type={showPassword.pass2 ? "text" : "password"}
            variant="outlined"
            onChange={handleRepeatPasswordChange}
            error={!passwordMatch && enteredPass.pass2 !== ""}
            helperText={
              !passwordMatch && enteredPass.pass2 !== ""
                ? "Passwords do not match"
                : ""
            }
            InputProps={{
              sx: { borderRadius: 2 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() =>
                      setShowPassword((prev) => ({
                        ...prev,
                        pass2: !prev.pass2,
                      }))
                    }
                    sx={{ color: "#64748B" }}
                  >
                    {showPassword.pass2 ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "#6366F1",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#4F46E5",
                },
              },
            }}
          />

          <TextField
            fullWidth
            required
            label="Email"
            variant="outlined"
            type="email"
            onChange={(e) =>
              setUserDetails((p) => ({ ...p, email: e.target.value }))
            }
            InputProps={{
              sx: { borderRadius: 2 },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "#6366F1",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#4F46E5",
                },
              },
            }}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              required
              label="First Name"
              variant="outlined"
              onChange={(e) =>
                setUserDetails((p) => ({ ...p, fname: e.target.value }))
              }
              InputProps={{
                sx: { borderRadius: 2 },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": {
                    borderColor: "#6366F1",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#4F46E5",
                  },
                },
              }}
            />

            <TextField
              fullWidth
              label="Middle Name"
              variant="outlined"
              onChange={(e) =>
                setUserDetails((p) => ({ ...p, mname: e.target.value }))
              }
              InputProps={{
                sx: { borderRadius: 2 },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": {
                    borderColor: "#6366F1",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#4F46E5",
                  },
                },
              }}
            />
          </Box>

          <TextField
            fullWidth
            required
            label="Last Name"
            variant="outlined"
            onChange={(e) =>
              setUserDetails((p) => ({ ...p, lname: e.target.value }))
            }
            InputProps={{
              sx: { borderRadius: 2 },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "#6366F1",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#4F46E5",
                },
              },
            }}
          />

          <Button
            onClick={handleRegister}
            variant="contained"
            fullWidth
            sx={{
              marginTop: 1,
              height: "46px",
              borderRadius: 2,
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)",
              background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
              "&:hover": {
                background: "linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)",
                boxShadow: "0 6px 16px rgba(79, 70, 229, 0.3)",
              },
            }}
          >
            {isSubmitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Create Account"
            )}
          </Button>

          <Typography variant="body2" sx={{ mt: 1, color: "rgb(80, 80, 80)" }}>
            Already have an account?
            <Button
              onClick={() => navigate("/login")}
              sx={{
                ml: 1,
                p: 0,
                fontSize: "0.875rem",
                color: "rgba(79, 70, 229, 0.7)",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  color: "rgba(79, 70, 229, 0.4)",
                },
              }}
            >
              Sign In
            </Button>
          </Typography>
        </Box>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            borderRadius: "8px",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Register;

import React, { useState, useMemo, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Home from "./Home";
import Register from "./Register";
import Profile from "./Profile";
import ForgotPassword from "./Forgot-Password";
import Event from "./Event";
import About from "./About";
import Settings from "./Settings";
import AddEvent from "./AddEvent";
import EventDetails from "./EventDetails";
import Landing from "./Landing";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import axios from "./config/axiosconfig";

const getThemeObject = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: "#3a86ff",
      light: "#83b8ff",
      dark: "#0057cb",
    },
    secondary: {
      main: "#ff006e",
      light: "#ff5a9d",
      dark: "#c50054",
    },
    success: {
      main: "#38b000",
      light: "#70e000",
      dark: "#008000",
    },
    background: {
      default: mode === 'dark' ? '#181a1b' : '#f8f9fa',
      paper: mode === 'dark' ? '#23272f' : '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          boxShadow: "none",
          fontWeight: 600,
          padding: "8px 16px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

const App = () => {
  // Global theme state
  const [theme, setTheme] = useState('light');

  // Fetch user settings on component mount
  useEffect(() => {
    const fetchUserSettings = async () => {
      const username = sessionStorage.getItem('username');
      if (username) {
        try {
          const response = await axios.get(`/api/settings?username=${username}`);
          if (response.data.settings && response.data.settings.theme) {
            setTheme(response.data.settings.theme);
          }
        } catch (error) {
          console.error('Error fetching user settings:', error);
        }
      }
    };

    fetchUserSettings();
  }, []);

  // Dynamically determine theme mode
  const themeMode = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }, [theme]);

  const dynamicTheme = useMemo(() => getThemeObject(themeMode), [themeMode]);

  // Function to update theme in both state and database
  const updateTheme = async (newTheme) => {
    const username = sessionStorage.getItem('username');
    if (username) {
      try {
        await axios.post('/api/update-settings', {
          username,
          theme: newTheme
        });
        setTheme(newTheme);
      } catch (error) {
        console.error('Error updating theme:', error);
      }
    } else {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeProvider theme={dynamicTheme}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login theme={theme} setTheme={updateTheme} themeMode={themeMode} />} />
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home theme={theme} setTheme={updateTheme} themeMode={themeMode} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile theme={theme} setTheme={updateTheme} themeMode={themeMode} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/Event" element={<Event theme={theme} setTheme={updateTheme} themeMode={themeMode} />} />
          <Route path="/About" element={<About themeMode={themeMode} />} />
          <Route path="/Settings" element={<Settings theme={theme} setTheme={updateTheme} themeMode={themeMode} />} />
          <Route path="/add-event" element={<AddEvent theme={theme} setTheme={updateTheme} themeMode={themeMode} />} />
          <Route path="/events/:eventId" element={<EventDetails theme={theme} setTheme={updateTheme} themeMode={themeMode} />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

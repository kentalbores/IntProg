import React, { useState, useMemo } from "react";
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

  // Dynamically determine theme mode
  const themeMode = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme;
  }, [theme]);

  const dynamicTheme = useMemo(() => getThemeObject(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={dynamicTheme}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login theme={theme} setTheme={setTheme} themeMode={themeMode} />} />
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<Home theme={theme} setTheme={setTheme} themeMode={themeMode} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile theme={theme} setTheme={setTheme} themeMode={themeMode} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/Event" element={<Event theme={theme} setTheme={setTheme} themeMode={themeMode} />} />
          <Route path="/About" element={<About themeMode={themeMode} />} />
          <Route path="/Settings" element={<Settings theme={theme} setTheme={setTheme} themeMode={themeMode} />} />
          <Route path="/add-event" element={<AddEvent theme={theme} setTheme={setTheme} themeMode={themeMode} />} />
          <Route path="/events/:eventId" element={<EventDetails theme={theme} setTheme={setTheme} themeMode={themeMode} />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

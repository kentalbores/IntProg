import { useState, useMemo, useEffect } from "react";
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
import OrganizerEvents from "./OrganizerEvents";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import axios from "./config/axiosconfig";
import AiSearch from "./AiSearch";
import OnboardingFlow from "./components/onboarding/OnboardingFlow";
import OnboardingGuard from "./components/onboarding/OnboardingGuard";

const getThemeObject = (mode) =>
  createTheme({
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
      error: {
        main: "#e53935",
        light: "#ff6f60",
        dark: "#ab000d",
      },
      warning: {
        main: "#ffb74d",
        light: "#ffe97d",
        dark: "#c88719",
      },
      info: {
        main: "#29b6f6",
        light: "#73e8ff",
        dark: "#0086c3",
      },
      background: {
        default: mode === "dark" ? "#121212" : "#f8fafc",
        paper: mode === "dark" ? "#1e1e1e" : "#ffffff",
        subtle: mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
        card:
          mode === "dark"
            ? "rgba(30, 41, 59, 0.7)"
            : "rgba(255, 255, 255, 0.7)",
      },
      text: {
        primary: mode === "dark" ? "#e0e0e0" : "#212121",
        secondary: mode === "dark" ? "#a0a0a0" : "#757575",
        disabled: mode === "dark" ? "#6c6c6c" : "#9e9e9e",
      },
      divider: mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
    },
    typography: {
      fontFamily: "'Inter', 'Poppins', 'Roboto', sans-serif",
      h1: {
        fontSize: "2.5rem",
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "-0.01562em",
      },
      h2: {
        fontSize: "2rem",
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "-0.00833em",
      },
      h3: {
        fontSize: "1.75rem",
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "0em",
      },
      h4: {
        fontSize: "1.5rem",
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "-0.00735em",
      },
      h5: {
        fontSize: "1.25rem",
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: "0em",
      },
      h6: {
        fontSize: "1.125rem",
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: "0.0075em",
      },
      subtitle1: {
        fontSize: "1rem",
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: "0.00938em",
      },
      subtitle2: {
        fontSize: "0.875rem",
        fontWeight: 500,
        lineHeight: 1.5,
        letterSpacing: "0.00714em",
      },
      body1: {
        fontSize: "1rem",
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: "0.00938em",
      },
      body2: {
        fontSize: "0.875rem",
        fontWeight: 400,
        lineHeight: 1.5,
        letterSpacing: "0.00714em",
      },
      button: {
        fontSize: "0.875rem",
        fontWeight: 600,
        letterSpacing: "0.02857em",
        textTransform: "none",
      },
      caption: {
        fontSize: "0.75rem",
        fontWeight: 400,
        lineHeight: 1.4,
        letterSpacing: "0.03333em",
      },
    },
    shape: {
      borderRadius: 12,
    },
    spacing: 8,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: "thin",
            "&::-webkit-scrollbar": {
              width: "6px",
              height: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            "&::-webkit-scrollbar-thumb": {
              background:
                mode === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background:
                mode === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 8,
            boxShadow: "none",
            fontWeight: 600,
            padding: "10px 20px",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow:
                mode === "dark"
                  ? "0 6px 20px rgba(0,0,0,0.3)"
                  : "0 6px 20px rgba(0,0,0,0.1)",
            },
          },
          contained: {
            boxShadow:
              mode === "dark"
                ? "0 4px 12px rgba(0,0,0,0.3)"
                : "0 4px 12px rgba(0,0,0,0.1)",
          },
          containedPrimary: {
            background: "linear-gradient(45deg, #3a86ff 30%, #4776E6 90%)",
            "&:hover": {
              background: "linear-gradient(45deg, #2a76ef 30%, #3766D6 90%)",
            },
          },
          containedSecondary: {
            background: "linear-gradient(45deg, #ff006e 30%, #ff5a9d 90%)",
            "&:hover": {
              background: "linear-gradient(45deg, #e0005e 30%, #e0508d 90%)",
            },
          },
          outlined: {
            borderWidth: "1.5px",
            "&:hover": {
              borderWidth: "1.5px",
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "none",
            backdropFilter: "blur(10px)",
            background:
              mode === "dark"
                ? "rgba(15, 23, 42, 0.8)"
                : "rgba(255, 255, 255, 0.8)",
            borderBottom:
              mode === "dark"
                ? "1px solid rgba(255,255,255,0.1)"
                : "1px solid rgba(0,0,0,0.05)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border:
              mode === "dark"
                ? "1px solid rgba(255,255,255,0.1)"
                : "1px solid rgba(0,0,0,0.05)",
            borderRadius: 16,
            transition: "all 0.2s ease-in-out",
          },
          elevation1: {
            boxShadow:
              mode === "dark"
                ? "0 4px 20px rgba(0,0,0,0.3)"
                : "0 4px 20px rgba(0,0,0,0.05)",
          },
          elevation2: {
            boxShadow:
              mode === "dark"
                ? "0 8px 30px rgba(0,0,0,0.4)"
                : "0 8px 30px rgba(0,0,0,0.1)",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backdropFilter: "blur(10px)",
            background:
              mode === "dark"
                ? "rgba(30, 41, 59, 0.7)"
                : "rgba(255, 255, 255, 0.7)",
            boxShadow:
              mode === "dark"
                ? "0 4px 20px rgba(0,0,0,0.3)"
                : "0 4px 20px rgba(0,0,0,0.05)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow:
                mode === "dark"
                  ? "0 10px 30px rgba(0,0,0,0.4)"
                  : "0 10px 30px rgba(0,0,0,0.1)",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                boxShadow:
                  mode === "dark"
                    ? "0 0 0 1px rgba(255,255,255,0.2)"
                    : "0 0 0 1px rgba(0,0,0,0.1)",
              },
              "&.Mui-focused": {
                boxShadow:
                  mode === "dark"
                    ? "0 0 0 2px rgba(58, 134, 255, 0.5)"
                    : "0 0 0 2px rgba(58, 134, 255, 0.3)",
              },
            },
          },
        },
      },
      MuiFormControl: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            fontWeight: 500,
            boxShadow:
              mode === "dark"
                ? "0 2px 8px rgba(0,0,0,0.2)"
                : "0 2px 8px rgba(0,0,0,0.05)",
          },
          filled: {
            background:
              mode === "dark"
                ? "rgba(58, 134, 255, 0.8)"
                : "rgba(58, 134, 255, 0.9)",
            color: "#fff",
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            border:
              mode === "dark"
                ? "2px solid rgba(255,255,255,0.1)"
                : "2px solid rgba(0,0,0,0.05)",
            boxShadow:
              mode === "dark"
                ? "0 2px 10px rgba(0,0,0,0.3)"
                : "0 2px 10px rgba(0,0,0,0.1)",
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 8,
            background: mode === "dark" ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.8)",
            boxShadow:
              mode === "dark"
                ? "0 4px 20px rgba(0,0,0,0.3)"
                : "0 4px 20px rgba(0,0,0,0.1)",
            padding: "8px 16px",
            fontSize: "0.75rem",
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backdropFilter: "blur(10px)",
            background:
              mode === "dark"
                ? "rgba(30, 41, 59, 0.9)"
                : "rgba(255, 255, 255, 0.9)",
            boxShadow:
              mode === "dark"
                ? "0 20px 60px rgba(0,0,0,0.5)"
                : "0 20px 60px rgba(0,0,0,0.1)",
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor:
              mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              background:
                mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px 8px 0 0",
            transition: "all 0.2s ease-in-out",
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            fontWeight: 600,
            boxShadow:
              mode === "dark"
                ? "0 2px 8px rgba(0,0,0,0.4)"
                : "0 2px 8px rgba(0,0,0,0.1)",
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingLeft: { xs: 16, sm: 24, md: 32 },
            paddingRight: { xs: 16, sm: 24, md: 32 },
          },
        },
      },
    },
  });

const App = () => {
  const systemTheme =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const username = sessionStorage.getItem("username");
    const email = sessionStorage.getItem("email");
    const picture = sessionStorage.getItem("picture");
    const userId = sessionStorage.getItem("userId");

    if (username) {
      setUser({
        username,
        email,
        picture,
        userId,
      });

      // Fetch user settings including theme preference
      fetchUserSettings();
    }
  }, []);

  // Calculate theme mode based on theme setting
  const themeMode = useMemo(() => {
    if (theme === "system") {
      return systemTheme;
    }
    return theme;
  }, [theme, systemTheme]);

  // Create theme object
  const themeObject = useMemo(() => {
    return getThemeObject(themeMode);
  }, [themeMode]);

  const fetchUserSettings = async () => {
    const username = sessionStorage.getItem("username");
    if (username) {
      try {
        const response = await axios.get(`/api/settings?username=${username}`);
        if (response.data.settings && response.data.settings.theme) {
          setTheme(response.data.settings.theme);
        }
      } catch (error) {
        console.error("Error fetching user settings:", error);
      }
    }
  };

  const updateTheme = async (newTheme) => {
    const username = sessionStorage.getItem("username");
    if (username) {
      try {
        await axios.post("/api/update-settings", {
          username,
          theme: newTheme,
        });
        setTheme(newTheme);
      } catch (error) {
        console.error("Error updating theme:", error);
      }
    } else {
      setTheme(newTheme);
    }
  };

  // Common props for all pages that use Navbar
  const navbarProps = {
    themeMode,
    user,
  };

  return (
    <ThemeProvider theme={themeObject}>
      <BrowserRouter>
        <div className={themeMode === "dark" ? "dark-mode" : "light-mode"}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/event" element={<Event {...navbarProps} />} />
            <Route path="/home" element={<Home {...navbarProps} />} />
            <Route path="/profile" element={<Profile {...navbarProps} />} />
            <Route path="/about" element={<About {...navbarProps} />} />
            <Route
              path="/settings"
              element={
                <Settings
                  theme={theme}
                  setTheme={updateTheme}
                  themeMode={themeMode}
                  {...navbarProps}
                />
              }
            />
            <Route path="/add-event" element={<AddEvent {...navbarProps} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/organizer-events"
              element={<OrganizerEvents {...navbarProps} />}
            />
            <Route
              path="/events/:eventId"
              element={<EventDetails {...navbarProps} />}
            />
            <Route path="/ai-search" element={<AiSearch {...navbarProps} />} />
            <Route
              path="/onboarding"
              element={
                <OnboardingGuard>
                  <OnboardingFlow />
                </OnboardingGuard>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

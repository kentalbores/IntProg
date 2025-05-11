import { useState, useEffect, useMemo } from "react";
import {
  Typography,
  Box,
  Container,
  Dialog,
  DialogTitle,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Button,
  Paper,
  useMediaQuery,
  useTheme,
  ThemeProvider,
  createTheme,
  Tabs,
  Tab,
  Skeleton,
  Avatar,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import EventIcon from "@mui/icons-material/Event";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useNavigate } from "react-router-dom";
import axios from "./config/axiosconfig";
import "./components/Loading";
import Loading from "./components/Loading";
import "./all.css";
import EventMap from "./components/EventMap";
import { useTheme as useMuiTheme } from '@mui/material/styles';
import Navbar from "./components/Navbar";
import NavDrawer from "./components/NavDrawer";

const Dashboard = ({ theme, setTheme, themeMode = 'light' }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const customTheme = useTheme();
  const isMobile = useMediaQuery(customTheme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState(null);

  // Dashboard state
  const [userEvents, setUserEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [eventsThisMonth, setEventsThisMonth] = useState(0);
  const [activities, setActivities] = useState([]);
  const [nextEvent, setNextEvent] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Add loading state for data fetching
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Create theme based on themeMode
  const themeObject = useMemo(() => createTheme({
  palette: {
      mode: themeMode,
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
        default: themeMode === 'dark' ? '#0f172a' : '#f8fafc',
        paper: themeMode === 'dark' ? '#1e293b' : '#ffffff',
      },
      text: {
        primary: themeMode === 'dark' ? '#f8fafc' : '#0f172a',
        secondary: themeMode === 'dark' ? '#94a3b8' : '#64748b',
    },
  },
  typography: {
      fontFamily: "'Inter', 'Poppins', 'Roboto', 'Arial', sans-serif",
    h4: {
      fontWeight: 700,
        letterSpacing: '-0.025em',
    },
    h5: {
      fontWeight: 600,
        letterSpacing: '-0.025em',
    },
    h6: {
      fontWeight: 600,
        letterSpacing: '-0.025em',
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
    },
  },
  shape: {
      borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
            borderRadius: 6,
            fontWeight: 500,
          padding: "8px 16px",
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "translateY(-1px)",
            },
          },
          contained: {
            boxShadow: "none",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
            border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
            background: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            boxShadow: themeMode === 'dark' 
              ? '0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1)'
              : '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06)',
            transition: "all 0.2s ease",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: themeMode === 'dark'
                ? '0 10px 15px -3px rgba(0,0,0,0.2), 0 4px 6px -2px rgba(0,0,0,0.1)'
                : '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
            },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
            background: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
            background: themeMode === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: "blur(8px)",
            borderBottom: themeMode === 'dark' 
              ? '1px solid rgba(255,255,255,0.1)' 
              : '1px solid rgba(0,0,0,0.05)',
            boxShadow: 'none',
        },
      },
    },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: themeMode === 'dark' ? '#0f172a' : '#ffffff',
            borderRight: themeMode === 'dark' 
              ? '1px solid rgba(255,255,255,0.1)' 
              : '1px solid rgba(0,0,0,0.05)',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          },
        },
      },
    },
  }), [themeMode]);

  // Dashboard data fetching functions
  const fetchUserData = async () => {
    try {
      const username = sessionStorage.getItem('username');
      if (!username) {
        navigate('/');
        return;
      }

      // Fetch user's events
      const eventsResponse = await axios.get(`/api/users/${username}/events`);
      const userEvents = eventsResponse.data;
      setUserEvents(userEvents);
      setTotalEvents(userEvents.length);

      // Calculate events this month
      const currentMonth = new Date().getMonth();
      const thisMonthEvents = userEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getMonth() === currentMonth;
      });
      setEventsThisMonth(thisMonthEvents.length);

      // Set next upcoming event
      const upcomingEvents = userEvents.filter(event => new Date(event.date) > new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setNextEvent(upcomingEvents[0] || null);

      // Create activities from events
      const recentActivities = userEvents.slice(0, 3).map(event => ({
        id: event.event_id,
        text: `Registered for: ${event.name || 'Untitled Event'}`,
        time: new Date(event.date).toLocaleString(),
        icon: <EventIcon />
      }));
      setActivities(recentActivities);

      // Set user data
      setUser({
        username: username,
        email: sessionStorage.getItem('email'),
        firstname: sessionStorage.getItem('firstname') || username
      });

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Use Effect for data loading
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsDataLoading(true);
        await fetchUserData();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleViewEventDetails = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const handleUnregisterFromEvent = async (eventId) => {
    try {
      const username = sessionStorage.getItem('username');
      await axios.delete('/api/event-users', {
        data: { event_id: eventId, username }
      });
      
      // Refresh user events after unregistering
      const eventsResponse = await axios.get(`/api/users/${username}/events`);
      setUserEvents(eventsResponse.data);
      setTotalEvents(eventsResponse.data.length);
    } catch (error) {
      console.error('Error unregistering from event:', error);
    }
  };

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    navigate("/profile");
    handleClose();
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
    handleClose();
  };

  const handleSettings = () => {
    navigate("/settings");
    setMenuOpen(false);
  };

  const handleAbout = () => {
    navigate("/about");
    setMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = async () => {
    setLogoutDialogOpen(false);
    try {
      sessionStorage.removeItem("username");
      sessionStorage.removeItem("email");
      await axios.post(`/logout`);
      navigate("/");
    } catch (err) {
      console.error(err);
    } finally {
    }
    setMenuOpen(false);
  };

  const handleAddEvent = () => {
    navigate("/add-event");
  };

  const handleViewRegistrations = () => {
    navigate("/registrations");
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderSkeletonContent = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Welcome Section Skeleton */}
      <Box>
        <Skeleton variant="text" width={200} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={300} height={24} />
      </Box>

      {/* Stats Overview Skeleton */}
      <Grid container spacing={3}>
        {[1, 2, 3].map((item) => (
          <Grid item xs={12} md={4} key={item}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: "blur(10px)",
                border: themeMode === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.1)' 
                  : '1px solid rgba(0, 0, 0, 0.05)',
                borderRadius: 3,
              }}
            >
              <Skeleton variant="text" width={120} height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width={80} height={48} sx={{ mb: 2 }} />
              <Skeleton variant="text" width={140} height={20} />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid Skeleton */}
      <Grid container spacing={3}>
        {/* Next Event Card Skeleton */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: "blur(10px)",
              border: themeMode === 'dark' 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(0, 0, 0, 0.05)',
              borderRadius: 3,
            }}
          >
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton variant="text" width={150} height={32} />
              <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 2 }} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
              <Skeleton variant="rectangular" width={120} height={120} sx={{ borderRadius: 2 }} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
                <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="50%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="70%" height={24} />
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions Skeleton */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: "blur(10px)",
              border: themeMode === 'dark' 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(0, 0, 0, 0.05)',
              borderRadius: 3,
            }}
          >
            <Skeleton variant="text" width={120} height={32} sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} variant="rectangular" height={48} sx={{ borderRadius: 2 }} />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity Skeleton */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: "blur(10px)",
              border: themeMode === 'dark' 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(0, 0, 0, 0.05)',
              borderRadius: 3,
            }}
          >
            <Skeleton variant="text" width={120} height={32} sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3].map((item) => (
                <Box
                  key={item}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    background: themeMode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Your Events Skeleton */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: "blur(10px)",
              border: themeMode === 'dark' 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(0, 0, 0, 0.05)',
              borderRadius: 3,
            }}
          >
            <Skeleton variant="text" width={120} height={32} sx={{ mb: 3 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[1, 2, 3].map((item) => (
                <Box
                  key={item}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: themeMode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                      <Skeleton variant="text" width="40%" height={20} />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Skeleton variant="rectangular" width={60} height={32} sx={{ borderRadius: 2 }} />
                      <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 2 }} />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <ThemeProvider theme={themeObject}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: themeMode === 'dark' 
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "url('./assets/bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: themeMode === 'dark' ? 0.05 : 0.1,
            zIndex: 0,
          },
        }}
      >
        {/* Modern Navbar */}
        <Navbar
          themeMode={themeMode}
          title="EventHub"
          showMenuButton={true}
          onMenuClick={() => setMenuOpen(true)}
          user={user}
        />

        {/* Main Content */}
        <Container 
          maxWidth="xl" 
          sx={{
            pt: 4,
            pb: 6,
            flex: 1,
            position: 'relative',
            zIndex: 1
          }}
        >
          {isDataLoading ? renderSkeletonContent() : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Welcome Section */}
              <Box>
                <Typography 
                  variant="h4" 
              sx={{
                    mb: 1,
                    color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
                    fontWeight: 700,
                    letterSpacing: '-0.5px'
                  }}
                >
                  Welcome back!
                </Typography>
                <Typography 
                  variant="body1" 
                sx={{
                    color: themeMode === 'dark' ? 'text.secondary' : 'text.primary',
                    opacity: 0.8
                  }}
                >
                  Hello, {user?.firstname || user?.username || "Guest"}! Here's your event dashboard.
              </Typography>
            </Box>

              {/* Stats Overview */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      height: '100%',
                      background: themeMode === 'dark'
                        ? 'linear-gradient(135deg, rgba(56, 176, 0, 0.1) 0%, rgba(112, 224, 0, 0.05) 100%)'
                        : 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                      border: themeMode === 'dark' 
                        ? '1px solid rgba(56, 176, 0, 0.2)' 
                        : '1px solid rgba(0,0,0,0.05)',
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Typography
                        variant="subtitle2"
                      sx={{
                          color: themeMode === 'dark' ? 'success.light' : 'success.dark',
                          fontWeight: 600,
                          mb: 1
                        }}
                    >
                      TOTAL EVENTS
                    </Typography>
                    <Typography
                      variant="h3"
                sx={{
                          color: themeMode === 'dark' ? 'success.light' : 'success.dark',
                          fontWeight: 700,
                          mb: 2
                        }}
                    >
                      {totalEvents}
                    </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: themeMode === 'dark' ? 'success.light' : 'success.dark',
                          opacity: 0.8
                        }}
                      >
                        All time events
              </Typography>
            </Box>
                    <Box
                          sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: themeMode === 'dark' 
                          ? 'rgba(56, 176, 0, 0.1)' 
                          : 'rgba(56, 176, 0, 0.2)',
                        zIndex: 0
                      }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      height: '100%',
                      background: themeMode === 'dark'
                        ? 'linear-gradient(135deg, rgba(58, 134, 255, 0.1) 0%, rgba(131, 184, 255, 0.05) 100%)'
                        : 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                      border: themeMode === 'dark' 
                        ? '1px solid rgba(58, 134, 255, 0.2)' 
                        : '1px solid rgba(0,0,0,0.05)',
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Typography
                        variant="subtitle2"
                      sx={{
                          color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
                          fontWeight: 600,
                          mb: 1
                        }}
                      >
                        EVENTS THIS MONTH
                    </Typography>
                    <Typography
                      variant="h3"
                        sx={{
                          color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
                          fontWeight: 700,
                          mb: 2
                        }}
                      >
                        {eventsThisMonth}
                    </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
                          opacity: 0.8
                        }}
                      >
                        Current month events
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: themeMode === 'dark' 
                          ? 'rgba(58, 134, 255, 0.1)' 
                          : 'rgba(58, 134, 255, 0.2)',
                        zIndex: 0
                      }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      height: '100%',
                      background: themeMode === 'dark'
                        ? 'linear-gradient(135deg, rgba(255, 0, 110, 0.1) 0%, rgba(255, 90, 157, 0.05) 100%)'
                        : 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%)',
                      border: themeMode === 'dark' 
                        ? '1px solid rgba(255, 0, 110, 0.2)' 
                        : '1px solid rgba(0,0,0,0.05)',
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography
                        variant="subtitle2"
                      sx={{
                          color: themeMode === 'dark' ? 'secondary.light' : 'secondary.dark',
                          fontWeight: 600,
                          mb: 1
                        }}
                      >
                        NEXT EVENT
                    </Typography>
                    <Typography
                      variant="h3"
                        sx={{
                          color: themeMode === 'dark' ? 'secondary.light' : 'secondary.dark',
                          fontWeight: 700,
                          mb: 2
                        }}
                      >
                        {nextEvent ? new Date(nextEvent.date).getDate() : '-'}
                    </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: themeMode === 'dark' ? 'secondary.light' : 'secondary.dark',
                          opacity: 0.8
                        }}
                      >
                        {nextEvent ? new Date(nextEvent.date).toLocaleString('default', { month: 'long' }) : 'No upcoming events'}
                      </Typography>
                    </Box>
                    <Box
                          sx={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: themeMode === 'dark' 
                          ? 'rgba(255, 0, 110, 0.1)' 
                          : 'rgba(255, 0, 110, 0.2)',
                        zIndex: 0
                      }}
                    />
                  </Paper>
                </Grid>
              </Grid>

              {/* Main Content Grid */}
              <Grid container spacing={3}>
              {/* Next Event Card */}
                <Grid item xs={12} md={8}>
              <Paper
                    elevation={0}
                sx={{
                      p: 3,
                      height: '100%',
                      background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: "blur(10px)",
                      border: themeMode === 'dark' 
                        ? '1px solid rgba(255, 255, 255, 0.1)' 
                        : '1px solid rgba(0, 0, 0, 0.05)',
                  borderRadius: 3,
                    }}
                  >
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" fontWeight="bold">
                        Next Event Details
                  </Typography>
                  {nextEvent && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewEventDetails(nextEvent.event_id)}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            borderColor: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                            color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                            '&:hover': {
                              borderColor: themeMode === 'dark' ? 'primary.main' : 'primary.dark',
                              background: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.1)' : 'rgba(58, 134, 255, 0.05)',
                            }
                          }}
                    >
                      View Details
                    </Button>
                  )}
                </Box>

                {nextEvent ? (
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
                  <Box
                    sx={{
                            width: { xs: '100%', sm: 120 },
                            height: { xs: 80, sm: 120 },
                            background: 'linear-gradient(135deg, #3a86ff 0%, #4776E6 100%)',
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            p: 2,
                          }}
                        >
                          <Typography variant="h3" fontWeight="bold">
                        {new Date(nextEvent.date).getDate()}
                      </Typography>
                          <Typography variant="subtitle1">
                        {new Date(nextEvent.date).toLocaleString('default', { month: 'short' })}
                      </Typography>
                    </Box>

                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                            {nextEvent.name || "Untitled Event"}
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AccessTimeIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <Typography variant="body2">
                              {new Date(nextEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <LocationOnIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <Typography variant="body2">
                              {nextEvent.location || "Location not specified"}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <CalendarMonthIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                            <Typography variant="body2">
                              {new Date(nextEvent.date).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </Typography>
                          </Box>
                        </Grid>
                        {nextEvent.description && (
                          <Grid item xs={12}>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  sx={{ 
                                    mt: 1,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden'
                                  }}
                                >
                                  {nextEvent.description}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  </Box>
                ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      No upcoming events found.
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleAddEvent}
                          sx={{
                            background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                            color: 'white',
                            '&:hover': {
                              background: 'linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)',
                            }
                          }}
                    >
                      Create New Event
                    </Button>
                  </Box>
                )}
              </Paper>
                </Grid>

                {/* Quick Actions */}
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{ 
                      p: 3,
                      height: '100%',
                      background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: "blur(10px)",
                      border: themeMode === 'dark' 
                        ? '1px solid rgba(255, 255, 255, 0.1)' 
                        : '1px solid rgba(0, 0, 0, 0.05)',
                      borderRadius: 3,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                      Quick Actions
                      </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<AddBoxIcon />}
                          onClick={handleAddEvent}
                          sx={{
                          justifyContent: 'flex-start',
                          py: 1.5,
                          borderColor: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                          color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                          '&:hover': {
                            borderColor: themeMode === 'dark' ? 'primary.main' : 'primary.dark',
                            background: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.1)' : 'rgba(58, 134, 255, 0.05)',
                          }
                        }}
                      >
                        Create New Event
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<CalendarMonthIcon />}
                          onClick={handleViewRegistrations}
                          sx={{
                          justifyContent: 'flex-start',
                          py: 1.5,
                          borderColor: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                          color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                          '&:hover': {
                            borderColor: themeMode === 'dark' ? 'primary.main' : 'primary.dark',
                            background: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.1)' : 'rgba(58, 134, 255, 0.05)',
                          }
                        }}
                      >
                        View Registrations
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<EventIcon />}
                          onClick={() => navigate("/Event")}
                          sx={{
                          justifyContent: 'flex-start',
                          py: 1.5,
                          borderColor: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                          color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                          '&:hover': {
                            borderColor: themeMode === 'dark' ? 'primary.main' : 'primary.dark',
                            background: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.1)' : 'rgba(58, 134, 255, 0.05)',
                          }
                        }}
                      >
                        Browse Events
                      </Button>
                    </Box>
                  </Paper>
                </Grid>

                {/* Recent Activity */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{ 
                      p: 3,
                      height: '100%',
                      background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: "blur(10px)",
                      border: themeMode === 'dark' 
                        ? '1px solid rgba(255, 255, 255, 0.1)' 
                        : '1px solid rgba(0, 0, 0, 0.05)',
                      borderRadius: 3,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                        Recent Activity
                      </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {activities.map((activity, index) => (
                        <Box
                            key={activity.id}
                            sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            background: themeMode === 'dark' 
                              ? 'rgba(255, 255, 255, 0.05)' 
                              : 'rgba(0, 0, 0, 0.02)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              background: themeMode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.08)' 
                                : 'rgba(0, 0, 0, 0.04)',
                              transform: 'translateX(4px)',
                            }
                          }}
                        >
                              <Avatar
                                sx={{
                              bgcolor: themeMode === 'dark' 
                                ? 'rgba(255, 0, 110, 0.1)' 
                                : 'rgba(255, 0, 110, 0.2)',
                              color: 'secondary.main',
                                }}
                              >
                                {activity.icon}
                              </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {activity.text}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {activity.time}
                            </Typography>
                          </Box>
                        </Box>
                        ))}
                        {activities.length === 0 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body1" color="text.secondary">
                            No recent activity
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>

                {/* Your Events */}
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={0}
                    sx={{ 
                      p: 3,
                      height: '100%',
                      background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: "blur(10px)",
                      border: themeMode === 'dark' 
                        ? '1px solid rgba(255, 255, 255, 0.1)' 
                        : '1px solid rgba(0, 0, 0, 0.05)',
                      borderRadius: 3,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                        Your Events
                      </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {userEvents.length > 0 ? (
                        userEvents.map((event) => (
                          <Box
                            key={event.event_id}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              background: themeMode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.05)' 
                                : 'rgba(0, 0, 0, 0.02)',
                              transition: 'all 0.2s ease',
                              '&:hover': { 
                                background: themeMode === 'dark' 
                                  ? 'rgba(255, 255, 255, 0.08)' 
                                  : 'rgba(0, 0, 0, 0.04)',
                                transform: 'translateX(4px)',
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                  {event.name || 'Untitled Event'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <CalendarMonthIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                {new Date(event.date).toLocaleDateString()}
                              </Typography>
                            </Box>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                  onClick={() => handleViewEventDetails(event.event_id)}
                                  sx={{
                                    borderColor: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                                    color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                                    '&:hover': {
                                      borderColor: themeMode === 'dark' ? 'primary.main' : 'primary.dark',
                                      background: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.1)' : 'rgba(58, 134, 255, 0.05)',
                                    }
                                  }}
                              >
                                View
                              </Button>
                              <Button
                                size="small"
                                  variant="outlined"
                                color="error"
                                onClick={() => handleUnregisterFromEvent(event.event_id)}
                                  sx={{
                                    borderColor: themeMode === 'dark' ? 'error.light' : 'error.main',
                                    color: themeMode === 'dark' ? 'error.light' : 'error.main',
                                    '&:hover': {
                                      borderColor: themeMode === 'dark' ? 'error.main' : 'error.dark',
                                      background: themeMode === 'dark' ? 'rgba(211, 47, 47, 0.1)' : 'rgba(211, 47, 47, 0.05)',
                                    }
                                  }}
                              >
                                Unregister
                              </Button>
                            </Box>
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                            You haven't registered for any events yet.
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={handleAddEvent}
                            sx={{
                              background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)',
                              }
                            }}
                          >
                            Create Your First Event
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </Container>

        {/* Event Map Section */}
        <Box 
                    sx={{ 
            width: '100%', 
            mt: 4,
            mb: 6,
            px: { xs: 2, sm: 4 },
            position: 'relative',
            zIndex: 1
          }}
        >
          <Container maxWidth="xl">
            <Paper
              elevation={0}
              sx={{
                p: 3,
                background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: "blur(10px)",
                border: themeMode === 'dark' 
                  ? '1px solid rgba(255, 255, 255, 0.1)' 
                  : '1px solid rgba(0, 0, 0, 0.05)',
                      borderRadius: 3,
                    }}
                  >
                    <Box 
                      sx={{ 
                  height: 400,
                  width: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: themeMode === 'dark' 
                    ? '1px solid rgba(255, 255, 255, 0.1)' 
                    : '1px solid rgba(0, 0, 0, 0.05)',
                }}
              >
                <EventMap events={userEvents} />
              </Box>
            </Paper>
          </Container>
        </Box>

        {/* Sidebar Drawer */}
        <NavDrawer
          themeMode={themeMode}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          user={user}
          onLogout={handleLogoutClick}
        />

        {/* Logout Dialog */}
        <Dialog
          open={logoutDialogOpen}
          onClose={() => setLogoutDialogOpen(false)}
          PaperProps={{
            sx: {
              background: themeMode === 'dark' ? '#1e293b' : '#ffffff',
              borderRadius: 3,
            }
          }}
        >
          <DialogTitle>Do you want to log out?</DialogTitle>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button
              onClick={() => setLogoutDialogOpen(false)}
              sx={{
                color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
              }}
            >
              No
            </Button>
            <Button
              onClick={confirmLogout}
              variant="contained"
              sx={{
                background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)',
                }
              }}
            >
              Yes
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;

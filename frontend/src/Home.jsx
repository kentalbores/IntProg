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
  Chip,
  Badge,
  Divider,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import EventIcon from "@mui/icons-material/Event";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import GroupIcon from "@mui/icons-material/Group";
import BusinessIcon from "@mui/icons-material/Business";
import StoreIcon from "@mui/icons-material/Store";
import DescriptionIcon from "@mui/icons-material/Description";
import CategoryIcon from "@mui/icons-material/Category";
import StorefrontIcon from "@mui/icons-material/Storefront";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
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

  // User information
  const [userRoles, setUserRoles] = useState([]);
  const [activeRole, setActiveRole] = useState('');
  
  // Dashboard state - Events
  const [userEvents, setUserEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [eventsThisMonth, setEventsThisMonth] = useState(0);
  const [activities, setActivities] = useState([]);
  const [nextEvent, setNextEvent] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  // Organizer specific
  const [organizedEvents, setOrganizedEvents] = useState([]);
  const [totalOrganizedEvents, setTotalOrganizedEvents] = useState(0);
  const [totalAttendees, setTotalAttendees] = useState(0);
  
  // Vendor specific  
  const [services, setServices] = useState([]);
  const [totalServices, setTotalServices] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  
  // Calendar data
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Loading states
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isRoleDataLoading, setIsRoleDataLoading] = useState(true);

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

  // Fetch user role information
  const fetchUserRoles = async (username) => {
    try {
      const response = await axios.get(`/api/user/my-role/${username}`);
      if (response.data?.role) {
        // Handle both array and string responses
        const roles = Array.isArray(response.data.role) 
          ? response.data.role 
          : [response.data.role];
        
        setUserRoles(roles);
        
        // Set active role - prioritize vendor and organizer over guest
        if (roles.includes('vendor')) {
          setActiveRole('vendor');
        } else if (roles.includes('organizer')) {
          setActiveRole('organizer');
        } else {
          setActiveRole('guest');
        }
        
        return roles;
      }
      return ['guest'];
    } catch (error) {
      console.error("Error fetching user roles:", error);
      return ['guest'];
    }
  };

  // Fetch user events (events the user is registered to attend)
  const fetchUserEvents = async (username) => {
    try {
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
        icon: <EventIcon />,
        eventId: event.event_id,
        read: false
        }));
        setActivities(recentActivities);

      // Add to calendar events
      const calEvents = userEvents.map(event => ({
          id: event.event_id,
        title: event.name,
        date: new Date(event.date),
        type: 'registered',
        color: '#3a86ff'
      }));
      return calEvents;
    } catch (error) {
      console.error('Error fetching user events:', error);
      return [];
    }
  };

  // Fetch organizer data (events organized by the user)
  const fetchOrganizerData = async (username) => {
    try {
      setIsRoleDataLoading(true);
      
      // Get organizer profile first
      const organizerProfileRes = await axios.get(`/api/organizer/profile/${username}`);
      let organizerId = username; // Default to username
      
      if (organizerProfileRes.data?.profile?.organizerId) {
        organizerId = organizerProfileRes.data.profile.organizerId;
      }
      
      // Get events organized by this user
      const eventsResponse = await axios.get(`/api/organizer/events/${organizerId}`);
      if (eventsResponse.data?.events) {
        const organizedEventsList = eventsResponse.data.events;
        setOrganizedEvents(organizedEventsList);
        setTotalOrganizedEvents(organizedEventsList.length);
        
        // Calculate total attendees
        let attendeeCount = 0;
        
        // Get attendee counts for each event
        for (const event of organizedEventsList) {
          try {
            const attendeesRes = await axios.get(`/api/events/${event.event_id}/users`);
            attendeeCount += attendeesRes.data.length || 0;
          } catch (err) {
            console.error(`Error fetching attendees for event ${event.event_id}:`, err);
          }
        }
        
        setTotalAttendees(attendeeCount);
        
        // Add to calendar events
        const calEvents = organizedEventsList.map(event => ({
          id: event.event_id,
          title: event.name,
          date: new Date(event.date),
          type: 'organized',
          color: '#ff006e'
        }));
        return calEvents;
      }
      return [];
    } catch (error) {
      console.error('Error fetching organizer data:', error);
      return [];
    } finally {
      setIsRoleDataLoading(false);
    }
  };

  // Fetch vendor data (services offered by the user)
  const fetchVendorData = async (username) => {
    try {
      setIsRoleDataLoading(true);
      
      // Get services offered by this vendor
      const servicesResponse = await axios.get(`/api/vendors/${username}/services`);
      if (servicesResponse.data) {
        const servicesList = servicesResponse.data;
        setServices(servicesList);
        setTotalServices(servicesList.length);
        
        // Placeholder for getting actual bookings
        setTotalBookings(Math.floor(Math.random() * 20)); // Random placeholder
        
        // For calendar, we'd need to fetch actual service booking dates
        // This is a placeholder since we don't have that endpoint yet
        const today = new Date();
        const calEvents = servicesList.map((service, index) => {
          // Create random dates for demonstration
          const randomDate = new Date(today);
          randomDate.setDate(today.getDate() + (index * 2) + Math.floor(Math.random() * 14));
          
          return {
            id: service.serviceId || index,
            title: service.name,
            date: randomDate,
            type: 'service',
            color: '#38b000'
          };
        });
        
        return calEvents;
      }
      return [];
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      return [];
    } finally {
      setIsRoleDataLoading(false);
    }
  };

  // Dashboard data fetching
  const fetchUserData = async () => {
    try {
      const username = sessionStorage.getItem('username');
      if (!username) {
        navigate('/');
        return;
      }

      // Set user data
      setUser({
        username: username,
        email: sessionStorage.getItem('email'),
        firstname: sessionStorage.getItem('firstname') || username
      });
      
      // Fetch user roles
      const roles = await fetchUserRoles(username);
      
      // Fetch user events (common to all roles)
      const userEventsCal = await fetchUserEvents(username);
      let allCalendarEvents = [...userEventsCal];
      
      // Fetch role-specific data
      if (roles.includes('organizer')) {
        const orgEvents = await fetchOrganizerData(username);
        allCalendarEvents = [...allCalendarEvents, ...orgEvents];
      }
      
      // Fetch vendor data if user is a vendor
      if (roles.includes('vendor')) {
        const vendorEvents = await fetchVendorData(username);
        allCalendarEvents = [...allCalendarEvents, ...vendorEvents];
      }
      
      // Set combined calendar events
      setCalendarEvents(allCalendarEvents);

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

  // Handle role switching
  const handleRoleChange = (role) => {
    setActiveRole(role);
  };

  const handleViewEventDetails = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const handleUnregisterFromEvent = async (eventId) => {
    try {
      const username = sessionStorage.getItem('username');
      await axios.delete('/api/event-users', {
        data: { event_id: eventId, username }
      });
      
      // Refresh user data after unregistering
      await fetchUserData();
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

      {/* User Roles & Stats Skeleton */}
      <Box>
        <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 2, mb: 3 }} />
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
      </Box>

      {/* Main Content Grid Skeleton */}
      <Grid container spacing={3}>
        {/* Main Content Area */}
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
            </Box>
            
            {/* Calendar skeleton */}
            <Grid container spacing={1} sx={{ mb: 1 }}>
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <Grid item xs={12/7} key={day}>
                  <Skeleton variant="text" width="100%" height={20} />
                </Grid>
              ))}
            </Grid>
            
            <Grid container spacing={1}>
              {Array(35).fill(0).map((_, index) => (
                <Grid item xs={12/7} key={index}>
                  <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Side Panel Skeleton */}
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
            
            {[1, 2, 3, 4].map((item) => (
              <Box key={item} sx={{ mb: 2 }}>
                <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 2 }} />
            </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  // Custom Calendar Component
  const Calendar = () => {
    const getDaysInMonth = (year, month) => {
      return new Date(year, month + 1, 0).getDate();
    };
    
    const getFirstDayOfMonth = (year, month) => {
      return new Date(year, month, 1).getDay();
    };
    
    const handlePrevMonth = () => {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    };
    
    const handleNextMonth = () => {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    };
    
    const handleDateClick = (day) => {
      if (day) {
        const newSelectedDate = new Date(currentYear, currentMonth, day);
        setSelectedDate(newSelectedDate);
      }
    };
    
    // Days in the month
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);
    
    // Create calendar days array
    const days = [];
    
    // Previous month days to show
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    // Get events for a specific day
    const getEventsForDay = (day) => {
      if (!day) return [];
      
      const date = new Date(currentYear, currentMonth, day);
      return calendarEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === date.getDate() &&
               eventDate.getMonth() === date.getMonth() &&
               eventDate.getFullYear() === date.getFullYear();
      });
    };
    
    // Generate month name and header content
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
      <Box sx={{ width: '100%' }}>
        {/* Calendar Header */}
      <Box
        sx={{
                    display: 'flex',
            justifyContent: 'space-between', 
                    alignItems: 'center',
            mb: 2 
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            {monthNames[currentMonth]} {currentYear}
            </Typography>

          <Box>
            <IconButton onClick={handlePrevMonth} size="small">
              <Typography>←</Typography>
            </IconButton>
              <IconButton
              onClick={() => {
                setCurrentMonth(new Date().getMonth());
                setCurrentYear(new Date().getFullYear());
              }}
              size="small"
              sx={{ mx: 1 }}
            >
              <Typography>Today</Typography>
              </IconButton>
            <IconButton onClick={handleNextMonth} size="small">
              <Typography>→</Typography>
            </IconButton>
                  </Box>
                </Box>
        
        {/* Day names (Su, Mo, etc) */}
        <Grid container spacing={1} sx={{ mb: 1 }}>
          {dayNames.map((day, index) => (
            <Grid item xs={12/7} key={index}>
              <Box 
                sx={{
                  textAlign: 'center', 
                  color: 'text.secondary', 
                  fontWeight: 'bold',
                  fontSize: '0.875rem' 
                }}
              >
                {day}
            </Box>
            </Grid>
          ))}
        </Grid>

        {/* Calendar days */}
        <Grid container spacing={1}>
          {days.map((day, index) => {
            // Get events for this day
            const dayEvents = day ? getEventsForDay(day) : [];
            
            // Check if day has events and is current day
            const isCurrentDay = day && 
              new Date().getDate() === day && 
              new Date().getMonth() === currentMonth && 
              new Date().getFullYear() === currentYear;
            
            // Check if day is selected
            const isSelected = day && 
              selectedDate.getDate() === day && 
              selectedDate.getMonth() === currentMonth && 
              selectedDate.getFullYear() === currentYear;
            
            return (
              <Grid item xs={12/7} key={index}>
                {day ? (
          <Paper
                    onClick={() => handleDateClick(day)}
            elevation={0}
            sx={{
                      p: 1,
                      minHeight: { xs: 60, md: 80 },
                      cursor: 'pointer',
                      borderRadius: 2,
                      position: 'relative',
                      background: isSelected 
                        ? (themeMode === 'dark' ? 'rgba(58, 134, 255, 0.2)' : 'rgba(58, 134, 255, 0.1)')
                        : (themeMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 1'),
                      border: isCurrentDay 
                        ? `2px solid ${themeMode === 'dark' ? '#3a86ff' : '#3a86ff'}`
                        : `1px solid ${themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
                      '&:hover': {
                        background: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.15)' : 'rgba(58, 134, 255, 0.07)',
                      }
                    }}
                  >
                    <Typography 
                      sx={{ 
                        fontWeight: isCurrentDay ? 'bold' : 'normal',
                        color: isCurrentDay ? 'primary.main' : 'text.primary'
                      }}
                    >
                      {day}
                    </Typography>
                    
                    {/* Show event indicators (max 3, with count for more) */}
                    <Box sx={{ mt: 0.5 }}>
                      {dayEvents.slice(0, 3).map((event, idx) => (
                        <Tooltip title={event.title} key={idx}>
            <Box
              sx={{
                              height: 4, 
                              width: '100%', 
                              borderRadius: 1, 
                              mb: 0.5,
                              backgroundColor: event.color,
                            }}
                          />
                        </Tooltip>
                      ))}
                      {dayEvents.length > 3 && (
                        <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                          +{dayEvents.length - 3} more
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                ) : (
                  <Box sx={{ minHeight: { xs: 60, md: 80 }, p: 1 }}></Box>
                )}
              </Grid>
            );
          })}
        </Grid>
        
        {/* Selected day events */}
        {calendarEvents.some(event => {
          const eventDate = new Date(event.date);
          return eventDate.getDate() === selectedDate.getDate() &&
                 eventDate.getMonth() === selectedDate.getMonth() &&
                 eventDate.getFullYear() === selectedDate.getFullYear();
        }) && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
              Events on {selectedDate.toLocaleDateString()}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {calendarEvents
                .filter(event => {
                  const eventDate = new Date(event.date);
                  return eventDate.getDate() === selectedDate.getDate() &&
                         eventDate.getMonth() === selectedDate.getMonth() &&
                         eventDate.getFullYear() === selectedDate.getFullYear();
                })
                .map((event, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{ 
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    borderRadius: 2,
                      borderLeft: `4px solid ${event.color}`,
                      background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      '&:hover': {
                        background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                      }
                    }}
                  >
                    <Box>
                      {event.type === 'registered' && <EventIcon color="primary" />}
                      {event.type === 'organized' && <BusinessIcon color="secondary" />}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {event.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {event.type === 'registered' && ' (Attending)'}
                        {event.type === 'organized' && ' (Organizing)'}
                      </Typography>
                    </Box>
              <Button
                size="small"
                      variant="outlined"
                      onClick={() => {
                        if (event.type === 'registered' || event.type === 'organized') {
                          navigate(`/events/${event.id}`);
                        }
                      }}
                      sx={{ minWidth: 60 }}
                    >
                      View
              </Button>
                  </Paper>
              ))}
            </Box>
          </Box>
        )}
    </Box>
  );
  };

  return (
    <ThemeProvider theme={themeObject}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
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
      }}>
        <Navbar 
          themeMode={themeMode} 
          showBackButton={false} 
          showMenuButton={true} 
          user={user}
          activities={activities}
        />
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
              {/* Welcome Section and User Role Selection */}
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
                    opacity: 0.8,
                    mb: 3
                  }}
                >
                  Hello, {user?.firstname || user?.username || "Guest"}! Here's your personalized dashboard.
              </Typography>
                
                {/* Role selection tabs */}
                {userRoles.length > 1 && (
                  <Paper
                    elevation={0}
              sx={{
                      p: 1,
                      mb: 3,
                      display: 'flex',
                      justifyContent: 'center',
                      background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                      backdropFilter: "blur(10px)",
                      border: themeMode === 'dark' 
                        ? '1px solid rgba(255, 255, 255, 0.1)' 
                        : '1px solid rgba(0, 0, 0, 0.05)',
                      borderRadius: 3,
                    }}
                  >
                    <Tabs
                      value={activeRole}
                      onChange={(_, newValue) => handleRoleChange(newValue)}
                      variant="scrollable"
                      scrollButtons="auto"
                sx={{
                        '& .MuiTab-root': {
                          borderRadius: 2,
                          mx: 0.5,
                          minHeight: 48,
                          textTransform: 'none',
                        },
                      }}
                    >
                      {userRoles.includes('guest') && (
                        <Tab 
                          label="Attendee" 
                          value="guest"
                          icon={<EventIcon />}
                          iconPosition="start"
                        />
                      )}
                      {userRoles.includes('organizer') && (
                        <Tab 
                          label="Organizer" 
                          value="organizer"
                          icon={<BusinessIcon />}
                          iconPosition="start"
                        />
                      )}
                      {userRoles.includes('vendor') && (
                        <Tab 
                          label="Vendor" 
                          value="vendor"
                          icon={<StorefrontIcon />}
                          iconPosition="start"
                        />
                      )}
                    </Tabs>
                  </Paper>
                )}
              </Box>

              {/* Stats Cards - Different for each role */}
              <Grid container spacing={3}>
                {activeRole === 'guest' && (
                  <>
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
                            All time registrations
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
                            Events in current month
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
                  </>
                )}

                {activeRole === 'organizer' && !isRoleDataLoading && (
                  <>
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
                            EVENTS ORGANIZED
                  </Typography>
                          <Typography
                            variant="h3"
                            sx={{
                              color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
                              fontWeight: 700,
                              mb: 2
                            }}
                          >
                            {totalOrganizedEvents}
                          </Typography>
                          <Typography
                            variant="body2"
                    sx={{
                              color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
                              opacity: 0.8
                            }}
                          >
                            Total events created
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
                            TOTAL ATTENDEES
                          </Typography>
                      <Typography
                        variant="h3"
                            sx={{
                              color: themeMode === 'dark' ? 'secondary.light' : 'secondary.dark',
                              fontWeight: 700,
                              mb: 2
                            }}
                          >
                            {totalAttendees}
                      </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: themeMode === 'dark' ? 'secondary.light' : 'secondary.dark',
                              opacity: 0.8
                            }}
                          >
                            People attending your events
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
                            YOUR ATTENDANCE
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
                            Events you're attending
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
                  </>
                )}

                {activeRole === 'vendor' && !isRoleDataLoading && (
                  <>
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
                            SERVICES OFFERED
                            </Typography>
                          <Typography
                            variant="h3"
                            sx={{
                              color: themeMode === 'dark' ? 'success.light' : 'success.dark',
                              fontWeight: 700,
                              mb: 2
                            }}
                          >
                            {totalServices}
                            </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: themeMode === 'dark' ? 'success.light' : 'success.dark',
                              opacity: 0.8
                            }}
                          >
                            Total services listed
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
                            SERVICE BOOKINGS
                      </Typography>
                          <Typography
                            variant="h3"
                          sx={{
                              color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
                              fontWeight: 700,
                              mb: 2
                            }}
                          >
                            {totalBookings}
                          </Typography>
                          <Typography
                            variant="body2"
                          sx={{
                              color: themeMode === 'dark' ? 'primary.light' : 'primary.dark',
                              opacity: 0.8
                            }}
                          >
                            Bookings for your services
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
                            YOUR ATTENDANCE
                      </Typography>
                          <Typography
                            variant="h3"
                            sx={{
                              color: themeMode === 'dark' ? 'secondary.light' : 'secondary.dark',
                              fontWeight: 700,
                              mb: 2
                            }}
                          >
                            {totalEvents}
                          </Typography>
                          <Typography
                            variant="body2"
                                sx={{
                              color: themeMode === 'dark' ? 'secondary.light' : 'secondary.dark',
                              opacity: 0.8
                            }}
                          >
                            Events you're attending
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
                  </>
                )}
                </Grid>

              {/* Main Content Grid */}
              <Grid container spacing={3}>
                {/* Calendar */}
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
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      sx={{ mb: 3 }}
                    >
                      {activeRole === 'organizer' && 'Your Events Calendar'}
                      {activeRole === 'guest' && 'Events Calendar'}
                  </Typography>
                    
                    <Calendar />
                  </Paper>
                </Grid>

                {/* Side Content */}
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
                    {activeRole === 'guest' && (
                      <>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                          Upcoming Events
                      </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {userEvents.length > 0 ? (
                            userEvents
                              .filter(event => new Date(event.date) > new Date())
                              .sort((a, b) => new Date(a.date) - new Date(b.date))
                              .slice(0, 4)
                              .map((event) => (
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
                                  </Box>
                                </Box>
                              ))
                          ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                You haven&apos;t registered for any events yet.
                              </Typography>
                              <Button
                                variant="contained"
                                onClick={() => navigate("/Event")}
                                sx={{
                                  background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                                  color: 'white',
                                  '&:hover': {
                                    background: 'linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)',
                                  }
                                }}
                              >
                                Browse Events
                              </Button>
                            </Box>
                          )}
                          
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                            <Button
                              variant="outlined"
                              startIcon={<EventIcon />}
                              onClick={() => navigate("/Event")}
                              sx={{
                                borderColor: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                                color: themeMode === 'dark' ? 'primary.light' : 'primary.main',
                                '&:hover': {
                                  borderColor: themeMode === 'dark' ? 'primary.main' : 'primary.dark',
                                  background: themeMode === 'dark' ? 'rgba(58, 134, 255, 0.1)' : 'rgba(58, 134, 255, 0.05)',
                                }
                              }}
                            >
                              View All Events
                            </Button>
                </Box>
                        </Box>
                      </>
                    )}
                    
                    {activeRole === 'organizer' && !isRoleDataLoading && (
                      <>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                          Your Organized Events
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {organizedEvents.length > 0 ? (
                            organizedEvents
                              .sort((a, b) => new Date(a.date) - new Date(b.date))
                              .slice(0, 4)
                              .map((event) => (
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
                            </Box>
                                </Box>
                        ))
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                You haven&apos;t created any events yet.
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
                          
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                            <Button
                              variant="outlined"
                              startIcon={<AddBoxIcon />}
                              onClick={handleAddEvent}
                    sx={{ 
                                borderColor: themeMode === 'dark' ? 'secondary.light' : 'secondary.main',
                                color: themeMode === 'dark' ? 'secondary.light' : 'secondary.main',
                      '&:hover': {
                                  borderColor: themeMode === 'dark' ? 'secondary.main' : 'secondary.dark',
                                  background: themeMode === 'dark' ? 'rgba(255, 0, 110, 0.1)' : 'rgba(255, 0, 110, 0.05)',
                                }
                              }}
                            >
                              Create New Event
                            </Button>
                          </Box>
                          </Box>
                      </>
                    )}
                    
                    {activeRole === 'vendor' && !isRoleDataLoading && (
                      <>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                          Your Services
                            </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {services.length > 0 ? (
                            services
                              .slice(0, 4)
                              .map((service) => (
                                <Box
                                  key={service.serviceId || service._id}
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
                                        {service.name || 'Untitled Service'}
                            </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        <BusinessCenterIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                                        {service.category || 'Uncategorized'}
                      </Typography>
                    </Box>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => navigate('/vendor-services')}
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
                  </Box>
                                </Box>
                              ))
                ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                You haven&apos;t added any services yet.
                            </Typography>
                    <Button
                      variant="contained"
                                onClick={() => navigate('/add-service')}
                          sx={{
                            background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                            color: 'white',
                            '&:hover': {
                              background: 'linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)',
                            }
                          }}
                    >
                                Add Your First Service
                    </Button>
                  </Box>
                )}
                          
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                            <Button
                              variant="outlined"
                              startIcon={<StorefrontIcon />}
                              onClick={() => navigate('/vendor-services')}
                    sx={{ 
                                borderColor: themeMode === 'dark' ? 'success.light' : 'success.main',
                                color: themeMode === 'dark' ? 'success.light' : 'success.main',
                                '&:hover': {
                                  borderColor: themeMode === 'dark' ? 'success.main' : 'success.dark',
                                  background: themeMode === 'dark' ? 'rgba(56, 176, 0, 0.1)' : 'rgba(56, 176, 0, 0.05)',
                                }
                              }}
                            >
                              Manage Services
                            </Button>
                          </Box>
                        </Box>
                      </>
                    )}
                          </Paper>
                        </Grid>
              </Grid>
            </Box>
          )}
        </Container>

        {/* Event Map Section */}
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid item xs={12} md={4}>
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
                    Registered Events
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
                        </Box>
                      )}
                  </Box>
                </Paper>
                </Grid>
              </Grid>
          </Box>
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

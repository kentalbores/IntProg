import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  IconButton,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Button,
  useTheme,
  InputAdornment,
  Divider,
  keyframes,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import axios from "./config/axiosconfig";
import { useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import NavDrawer from "./components/NavDrawer";

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const glow = keyframes`
  0% { text-shadow: 0 0 10px rgba(71, 118, 230, 0.5); }
  50% { text-shadow: 0 0 20px rgba(71, 118, 230, 0.8); }
  100% { text-shadow: 0 0 10px rgba(71, 118, 230, 0.5); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const typewriter = keyframes`
  from { width: 0 }
  to { width: 100% }
`;

const blink = keyframes`
  from, to { border-color: transparent }
  50% { border-color: rgba(71, 118, 230, 0.8); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const radar = keyframes`
  0% { transform: scale(0.5); opacity: 0.5; }
  50% { transform: scale(1.5); opacity: 0; }
  100% { transform: scale(0.5); opacity: 0.5; }
`;

const AiSearch = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [searchAnimation, setSearchAnimation] = useState(false);

  const searchHints = [
    "Try 'tech conference in New York next month'",
    "Find me a photography workshop this weekend",
    "Looking for music festivals in summer 2023",
    "Art exhibitions with free admission",
    "Business networking events near me",
  ];

  useEffect(() => {
    const hintInterval = setInterval(() => {
      setShowHint(false);
      setTimeout(() => {
        setHintIndex((prevIndex) => (prevIndex + 1) % searchHints.length);
        setShowHint(true);
      }, 500);
    }, 5000);

    return () => clearInterval(hintInterval);
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearchAttempted(true);
    setError(null);
    setSearchAnimation(true);
    
    try {
      // Slight delay to show the animation
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const searchResponse = await axios.post("/api/ai/search", { searchQuery: query });
      const eventIds = searchResponse.data.eventIds;

      const eventPromises = eventIds.map(eventId => 
        axios.get(`/api/events/${eventId}`)
      );
      const eventResponses = await Promise.all(eventPromises);
      const eventDetails = eventResponses.map(response => response.data.event);
      
      setEvents(eventDetails);
    } catch (err) {
      console.error("Error searching events:", err);
      setError("Failed to search events. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setSearchAnimation(false), 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  const getCategoryColor = (category) => {
    const colors = {
      Conference: "primary",
      Workshop: "secondary",
      Seminar: "success",
      Exhibition: "info",
      Concert: "warning",
      Sports: "error",
      Networking: "default",
      Other: "default",
    };
    return colors[category] || "default";
  };

  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      bgcolor: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'background.default',
      backgroundImage: isDarkMode 
        ? "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjMGYxNzJhIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiMxZTI5M2IiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')"
        : "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZjhmYWZjIj48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDVMNSAwWk02IDRMNCA2Wk0tMSAxTDEgLTFaIiBzdHJva2U9IiNlMmU4ZjAiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')",
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        background: isDarkMode 
          ? "radial-gradient(circle at 20% 30%, rgba(58, 134, 255, 0.15), transparent 35%), radial-gradient(circle at 80% 70%, rgba(142, 84, 233, 0.1), transparent 35%)"
          : "radial-gradient(circle at 20% 30%, rgba(58, 134, 255, 0.1), transparent 35%), radial-gradient(circle at 80% 70%, rgba(142, 84, 233, 0.05), transparent 35%)",
        zIndex: 0,
      },
    }}>
      <Navbar 
        themeMode={theme.palette.mode} 
        showBackButton={false} 
        showMenuButton={true}
        onMenuClick={() => setMenuOpen(true)}
      />
      
      <NavDrawer
        themeMode={theme.palette.mode}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={null}
        onLogout={() => {
          setMenuOpen(false);
          navigate('/');
        }}
      />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 3,
            mb: 4,
            backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'background.paper',
            backdropFilter: isDarkMode ? 'blur(8px)' : 'none',
            border: isDarkMode 
              ? '1px solid rgba(255,255,255,0.1)' 
              : '1px solid rgba(0,0,0,0.05)',
            boxShadow: isDarkMode 
              ? '0 10px 25px rgba(0,0,0,0.3)' 
              : theme.shadows[2],
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box sx={{ 
            display: "flex", 
            flexDirection: "column",
            alignItems: "center",
            mb: 6,
            position: "relative"
          }}>
            <Box sx={{ 
              animation: `${float} 3s ease-in-out infinite`,
              mb: 2
            }}>
              <AutoAwesomeIcon sx={{ 
                fontSize: 48, 
                color: isDarkMode ? 'primary.light' : 'primary.main',
                animation: `${glow} 2s ease-in-out infinite`
              }} />
            </Box>
            
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: "bold",
                fontFamily: "'Inter', 'Poppins', 'Roboto', sans-serif",
                textAlign: "center",
                mb: 2,
                background: "linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)",
                backgroundClip: "text",
                textFillColor: "transparent",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: `${glow} 2s ease-in-out infinite`
              }}
            >
              AI-Powered Event Search
            </Typography>

            <Typography
              variant="h6"
              color={isDarkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary'}
              sx={{ 
                mb: 4, 
                maxWidth: 600,
                textAlign: "center",
                lineHeight: 1.6
              }}
            >
              Describe the type of event you&apos;re looking for, and our AI will find the perfect matches for you.
            </Typography>
            
            {/* Animated hint text */}
            <Box 
              sx={{ 
                height: 24, 
                mb: 3, 
                overflow: 'hidden',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: 0,
                  width: 6,
                  height: '100%',
                  borderRight: '2px solid',
                  animation: `${blink} 0.75s step-end infinite`,
                  opacity: showHint ? 1 : 0,
                  borderColor: isDarkMode ? 'rgba(71, 118, 230, 0.8)' : 'rgba(71, 118, 230, 0.5)'
                }
              }}
            >
              <Typography
                variant="body1"
                color="primary"
                sx={{
                  fontStyle: 'italic',
                  opacity: 0.9,
                  animation: showHint ? `${typewriter} 2.5s steps(40, end)` : 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  borderRight: 'transparent',
                  transition: 'opacity 0.5s ease',
                }}
              >
                {searchHints[hintIndex]}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                width: "100%",
                maxWidth: 800,
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: -20,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "100%",
                  height: "100%",
                  background: "radial-gradient(circle, rgba(71, 118, 230, 0.1) 0%, rgba(71, 118, 230, 0) 70%)",
                  borderRadius: "50%",
                  zIndex: 0
                }
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="e.g., 'Looking for a tech conference in the city' or 'Find me a weekend workshop'"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
                    backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.4)' : 'background.default',
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : theme.palette.divider,
                      },
                      "&:hover fieldset": {
                        borderColor: isDarkMode ? 'primary.light' : theme.palette.primary.main,
                      },
                    },
                  },
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSearch}
                disabled={loading || !query.trim()}
                sx={{
                  bgcolor: isDarkMode 
                    ? 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)'
                    : theme.palette.primary.main,
                  color: "white",
                  width: 56,
                  height: 56,
                  boxShadow: isDarkMode 
                    ? '0 4px 12px rgba(0,0,0,0.3)' 
                    : theme.shadows[2],
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: isDarkMode 
                      ? 'linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)'
                      : theme.palette.primary.dark,
                    transform: "scale(1.05)",
                    boxShadow: isDarkMode 
                      ? '0 6px 16px rgba(0,0,0,0.4)' 
                      : theme.shadows[4],
                  },
                  animation: loading ? `${pulse} 1.5s ease-in-out infinite` : 'none',
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
              </IconButton>
            </Box>
          </Box>

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {events.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 600,
                  color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'text.primary'
                }}
              >
                Found {events.length} matching events
              </Typography>
              <Divider sx={{ 
                mb: 3,
                borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'divider'
              }} />
            </Box>
          )}

          {/* Search animation overlay */}
          {searchAnimation && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(5px)',
                backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                zIndex: 10,
                borderRadius: 3,
                animation: `${fadeIn} 0.3s ease`,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CircularProgress size={80} color="primary" thickness={4} />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        opacity: 0.6,
                        position: 'absolute',
                        animation: `${radar} 2s infinite`,
                      }}
                    />
                  </Box>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                    backgroundClip: 'text',
                    textFillColor: 'transparent',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    animation: `${pulse} 1.5s infinite ease-in-out`,
                  }}
                >
                  AI searching events...
                </Typography>
              </Box>
            </Box>
          )}

          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.event_id}
                sx={{ 
                  animation: `${fadeIn} 0.5s ease-out both`,
                  animationDelay: `${(events.indexOf(event) * 0.1)}s`
                }}
              >
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.2s ease-in-out",
                    borderRadius: 2,
                    overflow: "hidden",
                    backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.8)' : 'background.paper',
                    border: isDarkMode 
                      ? '1px solid rgba(255,255,255,0.1)' 
                      : '1px solid rgba(0,0,0,0.05)',
                    boxShadow: isDarkMode 
                      ? '0 4px 12px rgba(0,0,0,0.2)' 
                      : theme.shadows[2],
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: isDarkMode 
                        ? '0 8px 24px rgba(0,0,0,0.3)' 
                        : theme.shadows[4],
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={event.image || "https://via.placeholder.com/400x200?text=Event+Image"}
                    alt={event.name}
                    sx={{ objectFit: "cover" }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Chip
                        label={event.category}
                        color={getCategoryColor(event.category)}
                        size="small"
                        sx={{ 
                          mb: 1.5,
                          backgroundColor: isDarkMode 
                            ? `${theme.palette[getCategoryColor(event.category)].dark}`
                            : undefined,
                        }}
                      />
                      <Typography 
                        variant="h6" 
                        component="h2" 
                        gutterBottom
                        sx={{ 
                          fontWeight: 600,
                          fontSize: "1.1rem",
                          lineHeight: 1.4,
                          color: isDarkMode ? 'rgba(255,255,255,0.9)' : 'text.primary',
                        }}
                      >
                        {event.name}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                      <LocationOnIcon sx={{ 
                        mr: 1, 
                        color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary', 
                        fontSize: 20 
                      }} />
                      <Typography variant="body2" color={isDarkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary'}>
                        {event.location}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                      <AccessTimeIcon sx={{ 
                        mr: 1, 
                        color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary', 
                        fontSize: 20 
                      }} />
                      <Typography variant="body2" color={isDarkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary'}>
                        {new Date(event.date).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 2.5 }}>
                      <AttachMoneyIcon sx={{ 
                        mr: 1, 
                        color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary', 
                        fontSize: 20 
                      }} />
                      <Typography variant="body2" color={isDarkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary'}>
                        {event.price ? `$${event.price}` : "Free"}
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleEventClick(event.event_id)}
                      sx={{
                        mt: "auto",
                        borderRadius: 2,
                        textTransform: "none",
                        py: 1,
                        fontWeight: 600,
                        background: isDarkMode 
                          ? 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)'
                          : theme.palette.primary.main,
                        boxShadow: isDarkMode 
                          ? '0 4px 12px rgba(0,0,0,0.2)' 
                          : theme.shadows[2],
                        "&:hover": {
                          background: isDarkMode 
                            ? 'linear-gradient(90deg, #3D67D6 0%, #7E45D9 100%)'
                            : theme.palette.primary.dark,
                          boxShadow: isDarkMode 
                            ? '0 6px 16px rgba(0,0,0,0.3)' 
                            : theme.shadows[4],
                        },
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {loading && !searchAnimation && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress sx={{ color: isDarkMode ? 'primary.light' : 'primary.main' }} />
            </Box>
          )}

          {!loading && events.length === 0 && query && searchAttempted && (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Typography
                variant="h6"
                color={isDarkMode ? 'rgba(255,255,255,0.9)' : 'text.secondary'}
                sx={{ mb: 1 }}
              >
                No events found
              </Typography>
              <Typography
                variant="body1"
                color={isDarkMode ? 'rgba(255,255,255,0.7)' : 'text.secondary'}
              >
                Try adjusting your search criteria or try a different query
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default AiSearch; 
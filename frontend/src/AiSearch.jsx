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

const AiSearch = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearchAttempted(true);
    setError(null);
    try {
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
    }
  };

  const handleKeyPress = (e) => {
    setSearchAttempted(false);
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
        ? 'linear-gradient(to bottom, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.95))'
        : 'none',
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
                color: isDarkMode ? 'primary.light' : 'primary.main',
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
              Describe the type of event you're looking for, and our AI will find the perfect matches for you.
            </Typography>

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
                  }
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

          <Grid container spacing={3}>
            {events.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.event_id}>
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

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress sx={{ color: isDarkMode ? 'primary.light' : 'primary.main' }} />
            </Box>
          )}

          {!loading && events.length === 0 && query && (
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
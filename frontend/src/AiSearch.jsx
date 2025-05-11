import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  IconButton,
  Avatar,
  useTheme,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import Navbar from './components/Navbar';
import NavDrawer from './components/NavDrawer';

const AiSearch = ({ themeMode = 'light' }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  // Create theme based on themeMode
  const themeObject = createTheme({
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
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            background: themeMode === 'dark' ? '#1e293b' : '#ffffff',
            border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
          },
        },
      },
    },
  });

  const handleSendMessage = () => {
    if (input.trim()) {
      const newMessage = {
        id: messages.length + 1,
        text: input,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages([...messages, newMessage]);
      setInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
        {/* Navbar */}
        <Navbar
          themeMode={themeMode}
          title="AI Search"
          showMenuButton={true}
          onMenuClick={() => setMenuOpen(true)}
        />

        {/* Main Content */}
        <Container 
          maxWidth="xl" 
          sx={{
            pt: 4,
            pb: 6,
            flex: 1,
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 64px)', // Subtract navbar height
          }}
        >
          {/* Messages Area */}
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              mb: 2,
              p: 3,
              overflowY: 'auto',
              background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: "blur(10px)",
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start',
                  opacity: 0,
                  animation: 'fadeIn 0.3s ease forwards',
                  '@keyframes fadeIn': {
                    '0%': { opacity: 0, transform: 'translateY(10px)' },
                    '100%': { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: message.sender === 'ai' 
                      ? themeMode === 'dark' ? 'rgba(58, 134, 255, 0.2)' : 'rgba(58, 134, 255, 0.1)'
                      : themeMode === 'dark' ? 'rgba(255, 0, 110, 0.2)' : 'rgba(255, 0, 110, 0.1)',
                    color: message.sender === 'ai' ? 'primary.main' : 'secondary.main',
                  }}
                >
                  {message.sender === 'ai' ? <SmartToyIcon /> : <PersonIcon />}
                </Avatar>
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: 2,
                    background: themeMode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    {message.text}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {message.timestamp}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>

          {/* Input Area */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              background: themeMode === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: "blur(10px)",
              display: 'flex',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  background: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                  '& fieldset': {
                    borderColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: themeMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />
            <IconButton
              onClick={handleSendMessage}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Paper>
        </Container>

        {/* Sidebar Drawer */}
        <NavDrawer
          themeMode={themeMode}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
        />
      </Box>
    </ThemeProvider>
  );
};

export default AiSearch;

import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  CardActionArea,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import StoreIcon from "@mui/icons-material/Store";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import PersonIcon from "@mui/icons-material/Person";

const RoleSelection = ({ onContinue }) => {
  const [selectedRole, setSelectedRole] = useState("");

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  const handleContinue = () => {
    if (selectedRole) {
      onContinue({ role: selectedRole });
    }
  };

  const roleOptions = [
    {
      value: "organizer",
      label: "Organizing Events",
      description: "Create and manage events for attendees",
      icon: <EventIcon fontSize="large" color="primary" />,
    },
    {
      value: "vendor",
      label: "Offering Services (as Vendor)",
      description: "Provide services for events and organizers",
      icon: <StoreIcon fontSize="large" color="primary" />,
    },
    {
      value: "both",
      label: "Both",
      description: "Organize events and offer services as a vendor",
      icon: <BusinessCenterIcon fontSize="large" color="primary" />,
    },
    {
      value: "attendee",
      label: "Just Joining Events",
      description: "Discover and attend events that interest you",
      icon: <PersonIcon fontSize="large" color="primary" />,
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 3,
          textAlign: "center",
          width: "100%",
          maxWidth: 700,
          mx: "auto",
          mb: 4,
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          What do you want to use this platform for?
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Choose how you'd like to participate. You can always change this
          later.
        </Typography>

        <RadioGroup
          value={selectedRole}
          onChange={handleRoleChange}
          sx={{ width: "100%" }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 2,
              width: "100%",
            }}
          >
            {roleOptions.map((option) => (
              <Card
                key={option.value}
                variant="outlined"
                className="role-card"
                sx={{
                  borderRadius: 2,
                  borderWidth: selectedRole === option.value ? 2 : 1,
                  borderColor:
                    selectedRole === option.value ? "primary.main" : "divider",
                  backgroundColor:
                    selectedRole === option.value
                      ? "primary.light"
                      : "background.paper",
                  opacity:
                    selectedRole && selectedRole !== option.value ? 0.7 : 1,
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <CardActionArea
                  onClick={() => setSelectedRole(option.value)}
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <FormControlLabel
                    value={option.value}
                    control={
                      <Radio
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                        }}
                      />
                    }
                    label=""
                    sx={{
                      m: 0,
                      width: "100%",
                      height: "100%",
                      "& .MuiFormControlLabel-label": {
                        display: "none",
                      },
                    }}
                  />
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: "100%",
                      textAlign: "center",
                      p: 2,
                    }}
                  >
                    <Box
                      sx={{
                        mb: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        backgroundColor:
                          selectedRole === option.value
                            ? "rgba(255, 255, 255, 0.8)"
                            : "primary.lighter",
                        color: "primary.main",
                      }}
                    >
                      {option.icon}
                    </Box>
                    <Typography variant="h6" component="h3" fontWeight="600">
                      {option.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {option.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </RadioGroup>
      </Paper>

      <Button
        variant="contained"
        color="primary"
        size="large"
        disabled={!selectedRole}
        onClick={handleContinue}
        sx={{
          px: 6,
          py: 1.5,
          borderRadius: 2,
          textTransform: "none",
          fontWeight: "bold",
          boxShadow: "0 4px 14px rgba(58, 134, 255, 0.4)",
        }}
      >
        Continue
      </Button>
    </Box>
  );
};

export default RoleSelection;

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from "@mui/material";

const API_KEY = "AIzaSyCHf7X0jKkx2h0ceUJ4S7l2Pa-l95P1qwA";
const StaticMap = ({
  open,
  onClose,
  latitude,
  longitude,
  embedded = false,
}) => {
  // Generate map URL for the static map
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x400&markers=color:red%7C${latitude},${longitude}&key=${API_KEY}`;

  // If embedded is true, render just the map content without the dialog
  const mapContent = (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url(${mapUrl})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          bottom: 10,
          right: 10,
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
        }}
      >
        {latitude.toFixed(6)}, {longitude.toFixed(6)}
      </Box>
    </Box>
  );

  // If embedded, return just the map content
  if (embedded) {
    return mapContent;
  }

  // Otherwise return the dialog with the map content
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Event Location</DialogTitle>
      <DialogContent sx={{ height: "400px", padding: 0 }}>
        {mapContent}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
export default StaticMap;

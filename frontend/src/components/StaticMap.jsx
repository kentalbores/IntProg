import React from "react";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";

const StaticMap = ({ open, onClose, latitude, longitude }) => {
  const API_KEY = "AIzaSyCHf7X0jKkx2h0ceUJ4S7l2Pa-l95P1qwA";
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x400&markers=color:red%7C${latitude},${longitude}&key=${API_KEY}`;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Set Event Location</DialogTitle>
      <DialogContent>
        <img src={mapUrl} alt="Event Location" style={{ width: "100%" }} />
      </DialogContent>
      <Button onClick={onClose} variant="contained" sx={{ m: 2 }}>
        Close
      </Button>
    </Dialog>
  );
};

export default StaticMap;

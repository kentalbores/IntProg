import React, { useState, useCallback } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";

const mapContainerStyle = { width: "500px", height: "400px" };
const center = { lat: 10.3518, lng: 123.9053};


const LocationPicker = ({ open, onClose, onSelect }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCHf7X0jKkx2h0ceUJ4S7l2Pa-l95P1qwA",
  });

  const [marker, setMarker] = useState(null);

  const handleClick = useCallback((event) => {
    setMarker({ lat: event.latLng.lat(), lng: event.latLng.lng() });
  }, []);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select a Location</DialogTitle>
      <DialogContent>
        {!isLoaded ? (
          <p>Loading Map...</p>
        ) : (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={10}
            center={center}
            onClick={handleClick}
          >
            {marker && <Marker position={marker} />}
          </GoogleMap>
        )}
        <Button 
          variant="contained" 
          sx={{ mt: 2 }} 
          onClick={() => {
            if (marker) onSelect(marker);
            onClose();
          }}
        >
          Save Location
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPicker;

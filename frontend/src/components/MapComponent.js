import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, Polygon } from "@react-google-maps/api";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/applicant-locations/";
const GOOGLE_MAPS_API_KEY = "AIzaSyAE84E5M0Qnb0ZI4erRXfgFACfR1ZfzabA"; // Replace with your API key

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 13.9333,
  lng: 121.6172,
};

// 13.947702653239158, 121.63779175301936;
// 13.944591264104197, 121.51018336824447;
// 13.959180954773736, 121.45673847752202;
// 13.939946000594816, 121.35662861784843;

const districtCoords = [
  { lat: 13.947702653239158, lng: 121.63779175301936 }, // Lucena (Northeast)
  { lat: 13.944591264104197, lng: 121.51018336824447 }, // Sariaya (Northwest)
  { lat: 13.959180954773736, lng: 121.45673847752202 }, // Sariaya (Southwest)
  { lat: 13.939946000594816, lng: 121.35662861784843 }, // Candelaria (West)
  { lat: 13.7926, lng: 121.5115 }, // Candelaria (South)
  { lat: 13.7433, lng: 121.4653 }, // Tiaong (West)
  { lat: 13.7339, lng: 121.5904 }, // Dolores (South)
  { lat: 13.8252, lng: 121.6087 }, // San Antonio (Southeast)
  { lat: 13.9461, lng: 121.6233 }, // Back to Lucena (East)
];

const MapComponent = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const token = localStorage.getItem("accessToken"); // Get stored token
        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLocations(response.data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    fetchLocations();
  }, []);

  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={mapContainerStyle} zoom={12} center={center}>
        <Polygon
          paths={districtCoords}
          options={{
            fillColor: "blue",
            fillOpacity: 0.2,
            strokeColor: "blue",
            strokeOpacity: 0.8,
            strokeWeight: 2,
          }}
        />

        {locations.map((applicant, index) => (
          <Marker
            key={index}
            position={{ lat: applicant.latitude, lng: applicant.longitude }}
            label={applicant.full_name}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;

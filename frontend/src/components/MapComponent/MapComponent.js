import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapComponent.css";

const defaultCenter = [13.938, 121.508];

const assistanceColors = {
  Medical: "#4caf50",
  Burial: "#2196f3",
  Educational: "#9c27b0",
};

const MapComponent = ({ province, city, barangay, applicantName }) => {
  // Added props
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("");
  const [availableBarangays, setAvailableBarangays] = useState([]);
  const [stats, setStats] = useState({});
  const [mapCenter, setMapCenter] = useState(defaultCenter); // New state for map center

  const assistanceTypes = ["Medical", "Burial", "Educational"];
  const cities = ["Lucena City", "Sariaya", "Candelaria", "Tiaong", "San Antonio", "Dolores"];

  useEffect(() => {
    document.title = "Quickaid | Geolocation Map";
    return () => {
      document.title = "Quickaid | Home";
    };
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      let url = "http://127.0.0.1:8000/api/applicant-locations/";
      const params = new URLSearchParams();
      if (typeFilter) params.append("type", typeFilter);
      if (cityFilter) params.append("city", cityFilter);
      if (barangayFilter) params.append("barangay", barangayFilter);
      if ([...params].length) url += `?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();
      setLocations(data);

      const typeCounts = {};
      assistanceTypes.forEach(type => {
        typeCounts[type] = data.filter(loc => loc.type_of_assistance === type).length;
      });
      setStats(typeCounts);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [typeFilter, cityFilter, barangayFilter]);

  useEffect(() => {
    const brgys = locations
      .filter(loc => (cityFilter ? loc.city_municipality === cityFilter : true))
      .map(loc => loc.barangay);
    setAvailableBarangays([...new Set(brgys)].sort());

    if (barangayFilter && !brgys.includes(barangayFilter)) {
      setBarangayFilter("");
    }
  }, [locations, cityFilter]);

  const getColor = type => assistanceColors[type] || "#ff5722";

  const resetFilters = () => {
    setTypeFilter("");
    setCityFilter("");
    setBarangayFilter("");
  };

  // Geocoding and Map Update Effect
  useEffect(() => {
    const geocodeAddress = async () => {
      if (!province || !city || !barangay) return; // Don't geocode if address is incomplete

      const addressString = `${barangay}, ${city}, ${province}`;
      try {
        // Replace with your actual geocoding API call
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            addressString
          )}&format=json`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const { lat, lon } = data[0]; // Use the first result
          setMapCenter([parseFloat(lat), parseFloat(lon)]); // Update map center state
        } else {
          console.error("Geocoding failed for:", addressString);
          // Optionally, set a default center or display an error message
          setMapCenter(defaultCenter); // Revert to default if geocoding fails
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        setMapCenter(defaultCenter); // Revert to default on error
      }
    };

    geocodeAddress();
  }, [province, city, barangay]); // Re-run when address props change

  return (
    <div className="map-wrapper">
      <div className="map-container">
        {loading ? (
          <p>Loading map data...</p>
        ) : (
          <MapContainer center={mapCenter} zoom={11} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Single Marker for Edited Applicant */}
            {province && city && barangay && (
              <Marker
                position={mapCenter}
                icon={L.icon({
                  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })}
              >
                <Popup>
                  <strong>{applicantName}</strong>
                  <br />
                  {barangay}, {city}, {province}
                </Popup>
              </Marker>
            )}

            {locations.map((loc, index) => {
              const offset = (Math.random() - 0.5) * 0.0005; // very tiny offset
              const adjustedLat = loc.latitude + offset;
              const adjustedLng = loc.longitude + offset;

              return (
                <React.Fragment key={loc.id || `${loc.full_name}-${index}`}>
                  <Marker
                    position={[adjustedLat, adjustedLng]}
                    icon={L.icon({
                      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                      iconSize: [25, 41],
                      iconAnchor: [12, 41],
                    })}
                  >
                    <Popup>
                      <strong>{loc.full_name}</strong>
                      <br />
                      {loc.address}
                      <br />
                      <em className={loc.type_of_assistance}>{loc.type_of_assistance}</em>
                    </Popup>
                  </Marker>

                  <Circle
                    center={[adjustedLat, adjustedLng]}
                    radius={50}
                    pathOptions={{
                      color: getColor(loc.type_of_assistance),
                      fillOpacity: 0.2,
                      weight: 2,
                    }}
                  />
                </React.Fragment>
              );
            })}
          </MapContainer>
        )}
      </div>

      <aside className="map-filters">
        <h2>Filter Applicants</h2>

        <label>Type of Assistance</label>
        <select onChange={e => setTypeFilter(e.target.value)} value={typeFilter}>
          <option value="">All Types</option>
          {assistanceTypes.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <label>City/Municipality</label>
        <select onChange={e => setCityFilter(e.target.value)} value={cityFilter}>
          <option value="">All Cities</option>
          {cities.map(city => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        {cityFilter && (
          <>
            <label>Barangay</label>
            <select onChange={e => setBarangayFilter(e.target.value)} value={barangayFilter}>
              <option value="">All Barangays</option>
              {availableBarangays.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </>
        )}

        <button className="reset-btn" onClick={resetFilters}>
          Reset Filters
        </button>

        <div className="legend">
          <h4>Legend</h4>
          {Object.entries(assistanceColors).map(([type, color]) => (
            <div key={type} className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: color }}></span>
              {type} ({stats[type] || 0})
            </div>
          ))}
        </div>

        <p>
          <strong>Total Applicants:</strong> {locations.length}
        </p>
      </aside>
    </div>
  );
};

export default MapComponent;

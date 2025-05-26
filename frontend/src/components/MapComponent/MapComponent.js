import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  GeoJSON,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapComponent.css";
import { API_URL } from "../../services/api";

// ============= SETUP & CONFIGURATION =============
// Import ng marker icons para sa map
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Setup ng default marker icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Default center ng map (Quezon Province)
const defaultCenter = [13.938, 121.508];

// Colors para sa different types of assistance
const assistanceColors = {
  Medical: "#4caf50", // Green
  Burial: "#2196f3", // Blue
  Educational: "#9c27b0", // Purple
};

// List ng available cities at assistance types
const assistanceTypes = ["Medical", "Burial", "Educational"];
const cities = ["Lucena City", "Sariaya", "Candelaria", "Tiaong", "San Antonio", "Dolores"];

// ============= MAP BOUNDS COMPONENT =============
// Component para sa pag-adjust ng map view kapag may city na pinili
const MapBounds = ({ cityGeoData }) => {
  const map = useMap();

  useEffect(() => {
    if (cityGeoData) {
      try {
        // Kunin yung boundaries ng city
        const bounds = L.geoJSON(cityGeoData).getBounds();
        // Dagdag ng konting space sa paligid (3%)
        const paddedBounds = bounds.pad(0.01);
        // I-adjust yung view ng map para makita yung buong city
        map.fitBounds(paddedBounds, {
          padding: [20, 20],
          maxZoom: 50,
          animate: true,
          duration: 1,
        });
      } catch (error) {
        console.error("Error sa pag-set ng map bounds:", error);
      }
    }
  }, [cityGeoData, map]);

  return null;
};

// ============= MAIN MAP COMPONENT =============
const MapComponent = ({ province, city, barangay, applicantName }) => {
  // ============= STATE VARIABLES =============
  const [locations, setLocations] = useState([]); // List ng applicants
  const [loading, setLoading] = useState(true); // Loading state
  const [typeFilter, setTypeFilter] = useState(""); // Filter by assistance type
  const [cityFilter, setCityFilter] = useState(""); // Filter by city
  const [barangayFilter, setBarangayFilter] = useState(""); // Filter by barangay
  const [availableBarangays, setAvailableBarangays] = useState([]); // List ng available barangays
  const [stats, setStats] = useState({}); // Statistics ng applicants
  const [mapCenter, setMapCenter] = useState(defaultCenter); // Center ng map
  const [markerOffsets, setMarkerOffsets] = useState({}); // Para sa marker positions
  const [geoData, setGeoData] = useState(null); // GeoJSON data ng buong province
  const [cityGeoData, setCityGeoData] = useState(null); // GeoJSON data ng selected city

  // ============= UTILITY FUNCTIONS =============
  // Get color based on assistance type
  const getColor = type => assistanceColors[type] || "#ff5722";

  // Reset all filters
  const resetFilters = () => {
    setTypeFilter("");
    setCityFilter("");
    setBarangayFilter("");
    setCityGeoData("");
  };

  // ============= DATA FETCHING FUNCTIONS =============
  // Function para kunin yung locations ng applicants
  const fetchLocations = async () => {
    setLoading(true);
    try {
      // Build yung URL with filters
      let url = `${API_URL}/applicant-locations/`;
      const params = new URLSearchParams();
      if (typeFilter) params.append("type", typeFilter);
      if (cityFilter) params.append("city", cityFilter);
      if (barangayFilter) params.append("barangay", barangayFilter);
      if ([...params].length) url += `?${params.toString()}`;

      // Fetch data
      const response = await fetch(url);
      const data = await response.json();

      // Filter out invalid locations
      const validLocations = data.filter(
        loc => loc.latitude && loc.longitude && !isNaN(loc.latitude) && !isNaN(loc.longitude)
      );

      setLocations(validLocations);

      // Add random offset sa markers para hindi mag-overlap
      const offsets = {};
      validLocations.forEach(loc => {
        const key = loc.id || loc.full_name;
        offsets[key] = {
          latOffset: (Math.random() - 0.5) * 0.0005,
          lngOffset: (Math.random() - 0.5) * 0.0005,
        };
      });
      setMarkerOffsets(offsets);

      // Calculate statistics
      const typeCounts = {};
      assistanceTypes.forEach(type => {
        typeCounts[type] = validLocations.filter(
          loc => loc.type_of_assistance === type
        ).length;
      });
      setStats(typeCounts);
    } catch (error) {
      console.error("Error sa pag-fetch ng locations:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============= EFFECTS & DATA LOADING =============
  // Set page title
  useEffect(() => {
    document.title = "Quickaid | Geolocation Map";
    return () => {
      document.title = "Quickaid | Home";
    };
  }, []);

  // Fetch locations kapag nagbago yung filters
  useEffect(() => {
    fetchLocations();
  }, [typeFilter, cityFilter, barangayFilter]);

  // Update available barangays kapag nagbago yung city
  useEffect(() => {
    const brgys = locations
      .filter(loc => (cityFilter ? loc.city === cityFilter : true))
      .map(loc => loc.barangay);
    setAvailableBarangays([...new Set(brgys)].sort());

    if (barangayFilter && !brgys.includes(barangayFilter)) {
      setBarangayFilter("");
    }
  }, [locations, cityFilter]);

  // Load city GeoJSON data
  useEffect(() => {
    const loadCityGeoJSON = async () => {
      if (!cityFilter) {
        setCityGeoData(null);
        return;
      }

      const fileName = cityFilter.toLowerCase().replace(/ /g, "_", " ") + ".geojson";
      try {
        const response = await fetch(`/${fileName}`);
        if (!response.ok) throw new Error("Error sa pag-load ng GeoJSON");

        const data = await response.json();
        setCityGeoData(data);
      } catch (error) {
        console.error("Error sa pag-load ng city geojson:", error);
        setCityGeoData(null);
      }
    };

    loadCityGeoJSON();
  }, [cityFilter]);

  // Load province GeoJSON data
  useEffect(() => {
    fetch("/all_cities.geojson")
      .then(res => res.json())
      .then(data => setGeoData(data));
  }, []);

  // ============= RENDER =============
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

            <MapBounds cityGeoData={cityGeoData} />

            {/* Province boundary */}
            {geoData && (
              <GeoJSON
                data={geoData}
                style={{
                  color: "red",
                  weight: 1,
                  fillOpacity: 0,
                  opacity: 0.5,
                }}
              />
            )}

            {/* City boundary */}
            {cityGeoData && (
              <GeoJSON
                data={cityGeoData}
                style={{
                  color: "blue",
                  weight: 3,
                  fillOpacity: 0,
                  opacity: 0.8,
                }}
              />
            )}

            {/* Applicant markers - only show if there are valid locations */}
            {locations.length > 0 &&
              locations.map((loc, index) => {
                if (
                  !loc.latitude ||
                  !loc.longitude ||
                  isNaN(loc.latitude) ||
                  isNaN(loc.longitude)
                ) {
                  return null;
                }

                const key = loc.id || loc.full_name;
                const offset = markerOffsets[key] || { latOffset: 0, lngOffset: 0 };
                const adjustedLat = loc.latitude + offset.latOffset;
                const adjustedLng = loc.longitude + offset.lngOffset;

                return (
                  <React.Fragment key={loc.id || `${loc.full_name}-${index}`}>
                    <Marker position={[adjustedLat, adjustedLng]} icon={DefaultIcon}>
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

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapComponent.css";

const defaultCenter = [13.9177, 121.607];

const assistanceColors = {
  Medical: "#4caf50",
  Burial: "#2196f3",
  Educational: "#9c27b0",
};

const MapComponent = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("");
  const [availableBarangays, setAvailableBarangays] = useState([]);
  const [stats, setStats] = useState({});

  const assistanceTypes = ["Medical", "Burial", "Educational"];
  const cities = ["Lucena City", "Sariaya", "Candelaria", "Tiaong", "San Antonio", "Dolores"];

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

  return (
    <div className="map-wrapper">
      <div className="map-container">
        {loading ? (
          <p>Loading map data...</p>
        ) : (
          <MapContainer
            center={defaultCenter}
            zoom={11.5}
            style={{ height: "80vh", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarkerClusterGroup>
              {locations.map(loc => (
                <React.Fragment
                  key={loc.id || `${loc.full_name}-${loc.latitude}-${loc.longitude}`}
                >
                  <Marker
                    position={[loc.latitude, loc.longitude]}
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
                    center={[loc.latitude, loc.longitude]}
                    radius={50}
                    pathOptions={{
                      color: getColor(loc.type_of_assistance),
                      fillOpacity: 0.2,
                      weight: 2,
                    }}
                  />
                </React.Fragment>
              ))}
            </MarkerClusterGroup>
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

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapComponent.css";

const defaultCenter = [13.9177, 121.607];

const MapComponent = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");

  const assistanceTypes = ["Medical", "Burial", "Educational"];
  const cities = ["Lucena City", "Sariaya", "Candelaria", "Tiaong", "San Antonio", "Dolores"];

  useEffect(() => {
    fetchLocations();
  }, [typeFilter, cityFilter]);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      let url = "http://127.0.0.1:8000/api/applicant-locations/";
      const params = new URLSearchParams();
      if (typeFilter) params.append("type", typeFilter);
      if (cityFilter) params.append("city", cityFilter);
      if ([...params].length) url += `?${params.toString()}`;

      const response = await fetch(url);
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="map-wrapper">
      <aside className="map-filters">
        <h2>Filter Applicants</h2>
        <select onChange={e => setTypeFilter(e.target.value)} value={typeFilter}>
          <option value="">All Types</option>
          {assistanceTypes.map((type, idx) => (
            <option key={idx} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select onChange={e => setCityFilter(e.target.value)} value={cityFilter}>
          <option value="">All Cities</option>
          {cities.map((city, idx) => (
            <option key={idx} value={city}>
              {city}
            </option>
          ))}
        </select>
      </aside>

      <div className="map-container">
        {loading ? (
          <p>Loading map...</p>
        ) : (
          <MapContainer
            center={defaultCenter}
            zoom={11.5}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((loc, index) => (
              <Marker
                key={index}
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
                  <em>{loc.type_of_assistance}</em>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default MapComponent;

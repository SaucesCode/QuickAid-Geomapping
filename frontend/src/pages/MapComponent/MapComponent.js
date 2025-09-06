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
import { api } from "../../services/api";
import {
  MapPin,
  Filter,
  RotateCcw,
  Users,
  Map as MapIcon,
  Activity,
  Loader2,
} from "lucide-react";

// ============= SETUP & CONFIGURATION =============
// Import marker icons for map
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Setup default marker icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Default center of map (Quezon Province)
const defaultCenter = [13.938, 121.508];

// Colors for different types of assistance - using QuickAid colors
const assistanceColors = {
  Medical: "#38b2ac", // QuickAid accent
  Burial: "#1a202c", // QuickAid primary
  Educational: "#2d3748", // QuickAid secondary
};

// List of available cities and assistance types
const assistanceTypes = ["Medical", "Burial", "Educational"];
const cities = ["Lucena City", "Sariaya", "Candelaria", "Tiaong", "San Antonio", "Dolores"];

// ============= MAP BOUNDS COMPONENT =============
// Component for adjusting map view when a city is selected
const MapBounds = ({ cityGeoData }) => {
  const map = useMap();

  useEffect(() => {
    if (cityGeoData) {
      try {
        // Get city boundaries
        const bounds = L.geoJSON(cityGeoData).getBounds();
        // Add some padding around the area (3%)
        const paddedBounds = bounds.pad(0.01);
        // Adjust map view to show the entire city
        map.fitBounds(paddedBounds, {
          padding: [20, 20],
          maxZoom: 50,
          animate: true,
          duration: 1,
        });
      } catch (error) {
        console.error("Error setting map bounds:", error);
      }
    }
  }, [cityGeoData, map]);

  return null;
};

// ============= MAIN MAP COMPONENT =============
const MapComponent = ({ province, city, barangay, applicantName }) => {
  // ============= STATE VARIABLES =============
  const [locations, setLocations] = useState([]); // List of applicants
  const [loading, setLoading] = useState(true); // Loading state
  const [typeFilter, setTypeFilter] = useState(""); // Filter by assistance type
  const [cityFilter, setCityFilter] = useState(""); // Filter by city
  const [barangayFilter, setBarangayFilter] = useState(""); // Filter by barangay
  const [availableBarangays, setAvailableBarangays] = useState([]); // List of available barangays
  const [stats, setStats] = useState({}); // Statistics of applicants
  const [mapCenter, setMapCenter] = useState(defaultCenter); // Center of map
  const [markerOffsets, setMarkerOffsets] = useState({}); // For marker positions
  const [geoData, setGeoData] = useState(null); // GeoJSON data of entire province
  const [cityGeoData, setCityGeoData] = useState(null); // GeoJSON data of selected city

  // ============= UTILITY FUNCTIONS =============
  // Get color based on assistance type
  const getColor = type => assistanceColors[type] || "#f87171";

  // Reset all filters
  const resetFilters = () => {
    setTypeFilter("");
    setCityFilter("");
    setBarangayFilter("");
    setCityGeoData(null);
  };

  // ============= DATA FETCHING FUNCTIONS =============
  // Function to fetch applicant locations
  const fetchLocations = async () => {
    setLoading(true);
    try {
      // Build URL with filters
      const res = await api.get("/applicant-locations/", {
        params: {
          type: typeFilter,
          city: cityFilter,
          barangay: barangayFilter,
        },
      });

      // Fetch data
      const data = res.data;

      // Filter out invalid locations
      const validLocations = data.filter(
        loc => loc.latitude && loc.longitude && !isNaN(loc.latitude) && !isNaN(loc.longitude)
      );

      setLocations(validLocations);

      // Add random offset to markers to prevent overlap
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
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============= EFFECTS & DATA LOADING =============
  // Set page title
  useEffect(() => {
    document.title = "QuickAid | Geolocation Map";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  // Fetch locations when filters change
  useEffect(() => {
    fetchLocations();
  }, [typeFilter, cityFilter, barangayFilter]);

  // Update available barangays when city changes
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

      const fileName = cityFilter.toLowerCase().replace(/ /g, "_") + ".geojson";
      try {
        const response = await fetch(`/${fileName}`);
        if (!response.ok) throw new Error("Error loading GeoJSON");

        const data = await response.json();
        setCityGeoData(data);
      } catch (error) {
        console.error("Error loading city geojson:", error);
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
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-quickaid-bg">
      {/* Map Container */}
      <div className="flex-1 relative min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-quickaid-bg z-10">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 text-quickaid-accent animate-spin" />
              <p className="text-quickaid-text-secondary">Loading map data...</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={11}
            className="w-full h-full rounded-lg shadow -z-7"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapBounds cityGeoData={cityGeoData} />

            {/* Province + City Boundaries */}
            {geoData && (
              <GeoJSON
                data={geoData}
                style={{ color: "#f87171", weight: 1, fillOpacity: 0 }}
              />
            )}
            {cityGeoData && (
              <GeoJSON
                data={cityGeoData}
                style={{ color: "#38b2ac", weight: 3, fillOpacity: 0 }}
              />
            )}

            {/* Markers */}
            {locations.map((loc, i) => {
              if (!loc.latitude || !loc.longitude) return null;
              const key = loc.id || loc.full_name;
              const offset = markerOffsets[key] || { latOffset: 0, lngOffset: 0 };
              return (
                <React.Fragment key={key || i}>
                  <Marker
                    position={[
                      loc.latitude + offset.latOffset,
                      loc.longitude + offset.lngOffset,
                    ]}
                    icon={DefaultIcon}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-quickaid-text-primary mb-1">
                          {loc.full_name}
                        </h3>
                        <p className="text-sm text-quickaid-text-secondary mb-2">
                          {loc.address}
                        </p>
                        <span
                          className="inline-block px-2 py-1 rounded-full text-xs text-white"
                          style={{ backgroundColor: getColor(loc.type_of_assistance) }}
                        >
                          {loc.type_of_assistance}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[
                      loc.latitude + offset.latOffset,
                      loc.longitude + offset.lngOffset,
                    ]}
                    radius={40}
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

      {/* Filters Sidebar */}
      <aside className="w-full lg:w-72 xl:w-80 bg-quickaid-surface border-t lg:border-t-0 lg:border-l border-gray-200 p-4 lg:p-6 overflow-y-auto max-h-[50vh] lg:max-h-full">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-quickaid-text-primary flex items-center gap-2 mb-2">
            <Filter className="w-5 h-5 text-quickaid-accent" />
            Filter Applicants
          </h2>
          <p className="text-sm text-quickaid-text-secondary">
            Filter applicants by assistance type and location
          </p>
        </div>

        <div className="space-y-6">
          {/* Type of Assistance Filter */}
          <div className="form-control">
            <label className="block text-sm font-medium text-quickaid-text-primary mb-2">
              Type of Assistance
            </label>
            <select
              className="select select-bordered w-full focus:ring-2 focus:ring-quickaid-accent"
              onChange={e => setTypeFilter(e.target.value)}
              value={typeFilter}
            >
              <option value="">All Types</option>
              {assistanceTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* City Filter */}
          <div className="form-control">
            <label className="block text-sm font-medium text-quickaid-text-primary mb-2">
              City/Municipality
            </label>
            <select
              className="select select-bordered w-full focus:ring-2 focus:ring-quickaid-accent"
              onChange={e => setCityFilter(e.target.value)}
              value={cityFilter}
            >
              <option value="">All Cities</option>
              {cities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Barangay Filter - only show if city is selected */}
          {cityFilter && (
            <div className="form-control">
              <label className="block text-sm font-medium text-quickaid-text-primary mb-2">
                Barangay
              </label>
              <select
                className="select select-bordered w-full focus:ring-2 focus:ring-quickaid-accent"
                onChange={e => setBarangayFilter(e.target.value)}
                value={barangayFilter}
              >
                <option value="">All Barangays</option>
                {availableBarangays.map(b => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reset Button */}
          <button
            className="btn w-full bg-quickaid-accent hover:bg-teal-600 text-white border-quickaid-accent"
            onClick={resetFilters}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Filters
          </button>
        </div>

        {/* Legend */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-quickaid-text-primary flex items-center gap-2 mb-4">
            <MapIcon className="w-5 h-5 text-quickaid-accent" />
            Legend
          </h3>
          <div className="space-y-3">
            {Object.entries(assistanceColors).map(([type, color]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full border-2"
                    style={{ backgroundColor: color, borderColor: color }}
                  ></div>
                  <span className="text-quickaid-text-primary font-medium">{type}</span>
                </div>
                <span className="text-quickaid-text-secondary bg-quickaid-bg px-2 py-1 rounded-full text-sm">
                  {stats[type] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Total Count */}
        <div className="mt-6 p-4 bg-quickaid-bg rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-quickaid-accent" />
              <span className="font-medium text-quickaid-text-primary">Total Applicants</span>
            </div>
            <span className="text-2xl font-bold text-quickaid-accent">{locations.length}</span>
          </div>
        </div>

        {/* Active Filters Display */}
        {(typeFilter || cityFilter || barangayFilter) && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Active Filters:</h4>
            <div className="space-y-1 text-sm text-blue-700">
              {typeFilter && <div>• Type: {typeFilter}</div>}
              {cityFilter && <div>• City: {cityFilter}</div>}
              {barangayFilter && <div>• Barangay: {barangayFilter}</div>}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default MapComponent;

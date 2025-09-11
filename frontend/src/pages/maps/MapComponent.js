import React, { useEffect, useState } from "react";
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
  Filter,
  RotateCcw,
  Users,
  Map as MapIcon,
  Loader2,
  MapPin,
  Target,
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
    <div className="h-screen bg-quickaid-bg overflow-hidden">
      <div className="flex flex-col xl:flex-row h-[calc(100vh-4rem)]">
        {/* Map Container */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-quickaid-bg z-10">
              <div className="bg-quickaid-surface rounded-xl p-8 shadow-lg border">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 text-quickaid-accent animate-spin" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-quickaid-text-primary">
                      Loading Map
                    </h3>
                    <p className="text-sm text-quickaid-text-secondary">
                      Fetching applicant locations...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white shadow-sm">
              <MapContainer center={mapCenter} zoom={11} className="w-full h-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapBounds cityGeoData={cityGeoData} />

                {/* Province + City Boundaries */}
                {geoData && (
                  <GeoJSON
                    data={geoData}
                    style={{ color: "#f87171", weight: 3, fillOpacity: 0 }}
                  />
                )}
                {cityGeoData && (
                  <GeoJSON
                    data={cityGeoData}
                    style={{ color: "#38b2ac", weight: 1, fillOpacity: 0.2 }}
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
            </div>
          )}
        </div>

        {/* Enhanced Sidebar */}
        {/* Sidebar */}
        <aside className="w-full xl:w-80 bg-quickaid-surface border-t xl:border-l border-slate-200 flex flex-col">
          <div className="p-6 flex-1 overflow-y-auto">
            {/* Title */}
            <div className="mb-6 sticky top-0 bg-quickaid-surface z-10 pb-4 border-b">
              <h1 className="text-lg font-bold text-quickaid-text-primary flex items-center gap-2">
                <div className="p-1.5 bg-quickaid-accent/10 rounded-lg">
                  <MapPin className="w-5 h-5 text-quickaid-accent" />
                </div>
                Applicant Location Map
              </h1>
            </div>

            {/* Filters */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-quickaid-text-primary mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4 text-quickaid-accent" />
                Filters
              </h2>

              <div className="space-y-3">
                {/* Type */}
                <select
                  className="select select-sm select-bordered w-full bg-white"
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

                {/* City */}
                <select
                  className="select select-sm select-bordered w-full bg-white"
                  onChange={e => setCityFilter(e.target.value)}
                  value={cityFilter}
                >
                  <option value="">All Cities</option>
                  {cities.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {/* Barangay */}
                {cityFilter && (
                  <select
                    className="select select-sm select-bordered w-full bg-white"
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
                )}

                <button
                  className="btn btn-xs w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                  onClick={resetFilters}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </button>
              </div>

              {/* Active filters as badges */}
              <div className="flex flex-wrap gap-2 mt-3">
                {typeFilter && (
                  <span className="badge badge-sm bg-blue-100 text-blue-700">
                    Type: {typeFilter}
                  </span>
                )}
                {cityFilter && (
                  <span className="badge badge-sm bg-green-100 text-green-700">
                    City: {cityFilter}
                  </span>
                )}
                {barangayFilter && (
                  <span className="badge badge-sm bg-purple-100 text-purple-700">
                    Brgy: {barangayFilter}
                  </span>
                )}
              </div>
            </div>

            {/* Overview */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-quickaid-text-primary mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-quickaid-accent" />
                Overview
              </h3>

              {/* Total applicants card */}
              <div className="bg-gradient-to-r from-quickaid-accent to-blue-700 rounded-lg p-3 text-white mb-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-xl font-bold">{locations.length}</p>
                </div>
              </div>

              {/* Assistance breakdown */}
              <div className="space-y-2">
                {Object.entries(assistanceColors).map(([type, color]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      {type}
                    </div>
                    <span className="font-semibold">{stats[type] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend at bottom */}
          <div className="p-4 border-t bg-slate-50">
            <h4 className="text-xs font-semibold text-slate-600 mb-2">Legend</h4>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-300 border border-red-400 rounded" />
                Province Boundary
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-200 border border-teal-500 rounded" />
                Selected City
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-slate-600" />
                Applicant Location
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MapComponent;

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
  MapPin,
  Target,
  Loader2,
  X,
} from "lucide-react";

// ============= SETUP & CONFIGURATION =============
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Default center (Quezon Province)
const defaultCenter = [13.938, 121.508];

// Colors
const assistanceColors = {
  Medical: "#3b82f6",
  Burial: "#fef08a",
  Educational: "#10b981",
};

const assistanceTypes = ["Medical", "Burial", "Educational"];
const cities = [
  "Lucena City",
  "Sariaya",
  "Candelaria",
  "Tiaong",
  "San Antonio",
  "Dolores",
];

// ============= MAP BOUNDS COMPONENT =============
const MapBounds = ({ cityGeoData }) => {
  const map = useMap();
  useEffect(() => {
    if (cityGeoData) {
      try {
        const bounds = L.geoJSON(cityGeoData).getBounds();
        map.fitBounds(bounds.pad(0.01), {
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
const MapComponent = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("");
  const [availableBarangays, setAvailableBarangays] = useState([]);
  const [stats, setStats] = useState({});
  const [mapCenter] = useState(defaultCenter);
  const [markerOffsets, setMarkerOffsets] = useState({});
  const [geoData, setGeoData] = useState(null);
  const [cityGeoData, setCityGeoData] = useState(null);

  const getColor = (type) => assistanceColors[type] || "#f87171";

  const resetFilters = () => {
    setTypeFilter("");
    setCityFilter("");
    setBarangayFilter("");
    setCityGeoData(null);
  };

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/applicant-locations/", {
        params: { type: typeFilter, city: cityFilter, barangay: barangayFilter },
      });

      const data = res.data;
      const valid = data.filter(
        (loc) => loc.latitude && loc.longitude && !isNaN(loc.latitude)
      );
      setLocations(valid);

      const offsets = {};
      valid.forEach((loc) => {
        const key = loc.id || loc.full_name;
        offsets[key] = {
          latOffset: (Math.random() - 0.5) * 0.0005,
          lngOffset: (Math.random() - 0.5) * 0.0005,
        };
      });
      setMarkerOffsets(offsets);

      const typeCounts = {};
      assistanceTypes.forEach((t) => {
        typeCounts[t] = valid.filter((l) => l.type_of_assistance === t).length;
      });
      setStats(typeCounts);
    } catch (err) {
      console.error("Error fetching locations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "QuickAid | Geolocation Map";
    fetchLocations();
    fetch("/all_cities.geojson")
      .then((r) => r.json())
      .then(setGeoData);
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [typeFilter, cityFilter, barangayFilter]);

  useEffect(() => {
    const brgys = locations
      .filter((loc) => (cityFilter ? loc.city === cityFilter : true))
      .map((loc) => loc.barangay);
    setAvailableBarangays([...new Set(brgys)].sort());
  }, [locations, cityFilter]);

  useEffect(() => {
    const loadCityGeo = async () => {
      if (!cityFilter) return setCityGeoData(null);
      const fileName = cityFilter.toLowerCase().replace(/ /g, "_") + ".geojson";
      try {
        const res = await fetch(`/${fileName}`);
        if (!res.ok) throw new Error("Error loading GeoJSON");
        const data = await res.json();
        setCityGeoData(data);
      } catch (e) {
        console.error("Error loading city geojson:", e);
      }
    };
    loadCityGeo();
  }, [cityFilter]);

  // ============= RENDER =============
  return (
    <div className="relative h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden mt-16">
      <div className="flex flex-col xl:flex-row h-full">
        {/* Map Container */}
        <div className="flex-1 relative h-full">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 z-50">
              <div className="bg-white rounded-2xl p-10 shadow-2xl border border-gray-100 flex flex-col items-center gap-6">
                <div className="relative flex items-center justify-center">
                  {/* Outer spinning ring */}
                  <div className="h-24 w-24 rounded-full border-[6px] border-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 border-t-transparent animate-spin"></div>
                  
                  {/* Inner pulsing ring */}
                  <div className="absolute inset-2 rounded-full border-4 border-blue-300 border-t-transparent animate-spin" style={{ animationDelay: '150ms' }}></div>
                  
                  {/* Centered icon with gradient background */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-4 shadow-xl">
                      <MapPin className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Loading Map
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">
                    Fetching applicant locations...
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full rounded-2xl overflow-hidden shadow-2xl m-4 border-2 border-white">
              <MapContainer center={mapCenter} zoom={11} className="w-full h-full" scrollWheelZoom={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapBounds cityGeoData={cityGeoData} />

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

                {locations.map((loc, i) => {
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

        {/* Modern Sidebar */}
        <aside className="w-full xl:w-96 bg-white border-t xl:border-l border-gray-100 flex flex-col shadow-2xl">
          <div className="p-6 flex-1 overflow-y-auto">
            {/* Header */}
            <div className="mb-8 bg-white pb-6 border-b-2 border-gradient-to-r from-blue-200 to-indigo-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Location Map
                  </h1>
                  <p className="text-xs text-gray-600 font-medium">Track applicant locations</p>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  Filters
                </h2>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer hover:border-blue-300"
                    onChange={(e) => setTypeFilter(e.target.value)}
                    value={typeFilter}
                  >
                    <option value="">All Types</option>
                    {assistanceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer hover:border-purple-300"
                    onChange={(e) => setCityFilter(e.target.value)}
                    value={cityFilter}
                  >
                    <option value="">All Cities</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {cityFilter && (
                  <div className="relative animate-fadeIn">
                    <select
                      className="w-full px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer hover:border-green-300"
                      onChange={(e) => setBarangayFilter(e.target.value)}
                      value={barangayFilter}
                    >
                      <option value="">All Barangays</option>
                      {availableBarangays.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}

                <button
                  className="w-full px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2 border border-gray-300"
                  onClick={resetFilters}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Filters
                </button>
              </div>

              {/* Active Filters */}
              {(typeFilter || cityFilter || barangayFilter) && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {typeFilter && (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-blue-200">
                      Type: {typeFilter}
                      <button onClick={() => setTypeFilter("")} className="hover:bg-blue-200 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {cityFilter && (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-purple-200">
                      City: {cityFilter}
                      <button onClick={() => setCityFilter("")} className="hover:bg-purple-200 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {barangayFilter && (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-green-200">
                      Brgy: {barangayFilter}
                      <button onClick={() => setBarangayFilter("")} className="hover:bg-green-200 rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Overview Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  Overview
                </h3>
              </div>

              {/* Total Card */}
              <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl p-5 text-white mb-4 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold opacity-90 mb-1">Total Locations</p>
                    <p className="text-4xl font-bold">{locations.length}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-3 backdrop-blur-sm">
                    <MapPin className="w-8 h-8" />
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="space-y-3">
                {Object.entries(assistanceColors).map(([type, color]) => (
                  <div 
                    key={type} 
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shadow-md border-2 border-white"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-semibold text-gray-800">{type}</span>
                    </div>
                    <span className="text-xl font-bold text-gray-900 bg-white px-3 py-1 rounded-lg shadow-sm">
                      {stats[type] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend Footer */}
          <div className="p-6 border-t-2 border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full"></div>
              <h4 className="text-sm font-bold text-gray-800">Legend</h4>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-300 border-2 border-red-400 rounded shadow-sm" />
                <span className="text-xs font-medium text-gray-700">Province Boundary</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-teal-200 border-2 border-teal-500 rounded shadow-sm" />
                <span className="text-xs font-medium text-gray-700">Selected City</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-gray-700">Applicant Location</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MapComponent;
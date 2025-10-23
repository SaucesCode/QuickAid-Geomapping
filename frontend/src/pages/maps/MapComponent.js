import React, { useEffect, useState, useMemo } from "react";
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
  X,
  Map as MapIcon,
} from "lucide-react";
// Import necessary hook from React Query
import { useQuery, useQueryClient } from "@tanstack/react-query";

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

// Colors (UNCHANGED as per request)
const assistanceColors = {
  Medical: "#3b82f6", // blue-500
  Burial: "#fef08a", // yellow-200
  Educational: "#10b981", // emerald-500
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

// Map Tile URL for Black with Blue accents (Stamen Toner/Dark)
// Note: Some tile providers require API keys or specific attributions.
// We'll use a public dark-themed tile set or a custom filter.
// For a guaranteed BLACK with BLUE feel using OpenStreetMap:
const BLACK_BLUE_TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png";
const BLACK_BLUE_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

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

// ============= FETCH FUNCTIONS (for React Query) =============

const fetchLocationsFn = async ({ queryKey }) => {
  const [_, filters] = queryKey;
  const res = await api.get("/applicant-locations/", {
    params: filters,
  });

  const data = res.data;
  const valid = data.filter(
    (loc) => loc.latitude && loc.longitude && !isNaN(loc.latitude)
  );

  // Added a slight delay for better UX on fast networks (as in the original code)
  await new Promise(resolve => setTimeout(resolve, 500));

  return valid;
};

const fetchGeoJSON = async (fileName) => {
  const res = await fetch(`/${fileName}`);
  if (!res.ok) throw new Error(`Error loading ${fileName}`);
  return res.json();
};

// ============= MAIN MAP COMPONENT =============
const MapComponent = () => {
  const queryClient = useQueryClient();

  // State variables (UNCHANGED as requested)
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("");
  const [markerOffsets, setMarkerOffsets] = useState({});
  const [mapCenter] = useState(defaultCenter);

  const getColor = (type) => assistanceColors[type] || "#f87171";

  const resetFilters = () => {
    setTypeFilter("");
    setCityFilter("");
    setBarangayFilter("");
    // Invalidate the query to force a refetch with new filters
    queryClient.invalidateQueries({ queryKey: ['applicantLocations'] });
  };

  // 1. React Query for Locations
  const locationFilters = useMemo(() => ({
    type: typeFilter,
    city: cityFilter,
    barangay: barangayFilter,
  }), [typeFilter, cityFilter, barangayFilter]);

  const { data: locations = [], isPending: isLocationsLoading, refetch } = useQuery({
    queryKey: ['applicantLocations', locationFilters],
    queryFn: fetchLocationsFn,
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
  });

  // 2. React Query for GeoJSON (Province/All Cities Boundary)
  const { data: geoData = null } = useQuery({
    queryKey: ['allCitiesGeoData'],
    queryFn: () => fetchGeoJSON('all_cities.geojson'),
    staleTime: Infinity, // GeoJSON is static, cache forever
  });

  // 3. React Query for Selected City GeoJSON (Dependent on cityFilter)
  const cityGeoFileName = cityFilter
    ? `${cityFilter.toLowerCase().replace(/ /g, "_")}.geojson`
    : null;

  const { data: cityGeoData = null } = useQuery({
    queryKey: ['cityGeoData', cityFilter],
    queryFn: () => fetchGeoJSON(cityGeoFileName),
    enabled: !!cityFilter, // Only run the query if cityFilter is set
    staleTime: Infinity,
  });
  
  // Combine locations and calculate markerOffsets and stats (logic preserved)
  // Compute derived data (no setState here)
const { availableBarangays, stats, newOffsets } = useMemo(() => {
  const offsets = {};
  locations.forEach((loc) => {
    const key = loc.id || loc.full_name;
    if (!markerOffsets[key]) {
      offsets[key] = {
        latOffset: (Math.random() - 0.5) * 0.0005,
        lngOffset: (Math.random() - 0.5) * 0.0005,
      };
    }
  });

  const typeCounts = {};
  assistanceTypes.forEach((t) => {
    typeCounts[t] = locations.filter((l) => l.type_of_assistance === t).length;
  });

  const brgys = locations
    .filter((loc) => (cityFilter ? loc.city === cityFilter : true))
    .map((loc) => loc.barangay);
  const uniqueBarangays = [...new Set(brgys)].sort();

  return { availableBarangays: uniqueBarangays, stats: typeCounts, newOffsets: offsets };
}, [locations, cityFilter, markerOffsets]);

// ✅ Effect to update offsets separately (runs only when needed)
useEffect(() => {
  if (Object.keys(newOffsets).length > 0) {
    setMarkerOffsets((prev) => ({ ...prev, ...newOffsets }));
  }
}, [newOffsets]);

    
  // Old useEffect cleanup, now for document title
  useEffect(() => {
    document.title = "QuickAid | Geolocation Map";
  }, []);

  // Use a single variable for the loading state
  const loading = isLocationsLoading;

  // Rerun the fetch logic whenever filters change (React Query handles this via queryKey)
  // The old useEffect for filter changes is now redundant because of `useQuery` dependency on `locationFilters`.
  // The old useEffect for availableBarangays is replaced by the `useMemo` above.
  // The old useEffect for city GeoJSON is replaced by the `cityGeoData` useQuery.


  // ============= RENDER =============
  return (
    // Main container is responsive and full-height, but without min-h-screen for flexibility
    <div className="relative w-full h-full bg-white overflow-hidden">
      <style>{`
        /* Custom CSS for smoother dropdown appearance */
        .animate-fadeIn {
            animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        /* Leaflet Z-index fixes */
        .leaflet-container { z-index: 0 !important; }
        /* Black map requires light tooltips/popups for readability */
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: #1f2937 !important; /* Dark Gray */
          color: white !important;
        }
        .leaflet-popup-content h3 {
          color: #60a5fa !important; /* Blue-400 */
        }
        .leaflet-popup-content p {
          color: #d1d5db !important; /* Gray-300 */
        }
      `}</style>

      {/* Responsive layout: vertical stack on mobile (default), horizontal on xl screens */}
      <div className="flex flex-col xl:flex-row h-full">

        {/* Map Container */}
        <div className="flex-1 relative h-[65vh] xl:h-[calc(100vh-4rem)]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-50">
              <div className="bg-gray-800 rounded-2xl p-10 shadow-2xl border border-gray-700 flex flex-col items-center gap-6">
                <div className="relative flex items-center justify-center">
                  {/* Outer spinning ring - Modern Blue/Indigo Gradient */}
                  <div className="h-24 w-24 rounded-full border-[6px] border-transparent border-t-blue-500 border-r-indigo-500 animate-spin"></div>

                  {/* Inner pulsing ring - Subtle accent */}
                  <div className="absolute inset-2 rounded-full border-4 border-blue-700 border-t-transparent animate-spin" style={{ animationDelay: '150ms' }}></div>

                  {/* Centered icon with gradient background */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-4 shadow-xl">
                      <MapIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                    Loading Map
                  </h3>
                  <p className="text-sm text-gray-400 font-medium">
                    Fetching applicant locations...
                  </p>
                </div>
              </div>
            </div>
          ) : (
            // Map Wrapper: Added responsive margin for aesthetic spacing
            <div className="h-full rounded-none xl:rounded-2xl overflow-hidden shadow-2xl xl:m-4 border-2 border-gray-700">
              <MapContainer
                center={mapCenter}
                zoom={11}
                className="w-full h-full"
                scrollWheelZoom={true} // Enabled scroll wheel zoom for better UX
              >
                <TileLayer
                  // BLACK with BLUE map theme
                  attribution={BLACK_BLUE_TILE_ATTRIBUTION}
                  url={BLACK_BLUE_TILE_URL}
                />
                <MapBounds cityGeoData={cityGeoData} />

                {geoData && (
                  <GeoJSON
                    data={geoData}
                    // Updated boundary color for a more professional look
                    style={{ color: "#3b82f6", weight: 2, fillOpacity: 0.05 }} // Blueish boundary
                  />
                )}
                {cityGeoData && (
                  <GeoJSON
                    data={cityGeoData}
                    // Blue-themed city boundary
                    style={{ color: "#60a5fa", weight: 3, fillOpacity: 0.15 }} // Brighter Blue
                  />
                )}

                {locations.map((loc, i) => {
                  const key = loc.id || loc.full_name;
                  const offset = markerOffsets[key] || { latOffset: 0, lngOffset: 0 };
                  const finalLat = loc.latitude + offset.latOffset;
                  const finalLng = loc.longitude + offset.lngOffset;

                  return (
                    <React.Fragment key={key || i}>
                      <Marker
                        position={[finalLat, finalLng]}
                        icon={DefaultIcon}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-semibold text-blue-400 mb-1">
                              {loc.full_name}
                            </h3>
                            <p className="text-sm text-gray-300 mb-2">
                              {loc.address}
                            </p>
                            <span
                              className="inline-block px-2 py-1 rounded-full text-xs font-semibold text-white shadow-sm"
                              style={{ backgroundColor: getColor(loc.type_of_assistance) }}
                            >
                              {loc.type_of_assistance}
                            </span>
                          </div>
                        </Popup>
                      </Marker>
                      <Circle
                        center={[finalLat, finalLng]}
                        radius={40}
                        pathOptions={{
                          color: getColor(loc.type_of_assistance),
                          fillOpacity: 0.3, // Slightly higher opacity for a better visual cue
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

        {/* Modern Sidebar: Full width on mobile, fixed width on XL screens */}
        <aside className="w-full xl:w-96 bg-gray-900 border-t xl:border-l border-gray-700 flex flex-col shadow-2xl text-white">
          <div className="p-6 flex-1 overflow-y-auto">

            {/* Header */}
            <div className="mb-6 sm:mb-8 bg-gray-900 pb-4 border-b-2 border-blue-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-xl shadow-blue-500/50">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                    Location Analytics
                  </h1>
                  <p className="text-xs text-gray-400 font-medium">Filter and track applicant locations</p>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full"></div>
                <h2 className="text-base font-bold text-gray-200 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-400" />
                  Filters
                </h2>
              </div>

              <div className="space-y-3">
                {/* Type Filter */}
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-blue-700 rounded-xl text-sm font-medium text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer hover:border-blue-500 shadow-sm"
                    onChange={(e) => setTypeFilter(e.target.value)}
                    value={typeFilter}
                  >
                    <option value="" className="bg-gray-800">All Types</option>
                    {assistanceTypes.map((type) => (
                      <option key={type} value={type} className="bg-gray-800">
                        {type}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* City Filter */}
                <div className="relative">
                  <select
                    className="w-full px-4 py-3 bg-gray-800 border-2 border-indigo-700 rounded-xl text-sm font-medium text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 appearance-none cursor-pointer hover:border-indigo-500 shadow-sm"
                    onChange={(e) => setCityFilter(e.target.value)}
                    value={cityFilter}
                  >
                    <option value="" className="bg-gray-800">All Cities</option>
                    {cities.map((c) => (
                      <option key={c} value={c} className="bg-gray-800">
                        {c}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Barangay Filter (Conditional) */}
                {cityFilter && (
                  <div className="relative animate-fadeIn">
                    <select
                      className="w-full px-4 py-3 bg-gray-800 border-2 border-emerald-700 rounded-xl text-sm font-medium text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 appearance-none cursor-pointer hover:border-emerald-500 shadow-sm"
                      onChange={(e) => setBarangayFilter(e.target.value)}
                      value={barangayFilter}
                    >
                      <option value="" className="bg-gray-800">All Barangays</option>
                      {availableBarangays.map((b) => (
                        <option key={b} value={b} className="bg-gray-800">
                          {b}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Reset Button */}
                <button
                  className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl font-semibold text-sm transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 border border-gray-600"
                  onClick={resetFilters}
                >
                  <RotateCcw className="w-4 h-4 text-gray-400" />
                  Reset Filters
                </button>
              </div>

              {/* Active Filters Tags */}
              {(typeFilter || cityFilter || barangayFilter) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-700">
                  {typeFilter && (
                    <span className="px-3 py-1.5 bg-blue-900 text-blue-300 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 border border-blue-700">
                      Type: {typeFilter}
                      <button onClick={() => setTypeFilter("")} className="hover:bg-blue-800 rounded-full p-0.5 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {cityFilter && (
                    <span className="px-3 py-1.5 bg-indigo-900 text-indigo-300 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 border border-indigo-700">
                      City: {cityFilter}
                      <button onClick={() => setCityFilter("")} className="hover:bg-indigo-800 rounded-full p-0.5 ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {barangayFilter && (
                    <span className="px-3 py-1.5 bg-emerald-900 text-emerald-300 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 border border-emerald-700">
                      Brgy: {barangayFilter}
                      <button onClick={() => setBarangayFilter("")} className="hover:bg-emerald-800 rounded-full p-0.5 ml-1">
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
                <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full"></div>
                <h3 className="text-base font-bold text-gray-200 flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-400" />
                  Overview
                </h3>
              </div>

              {/* Total Card - Premium Gradient Look */}
              <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-purple-800 rounded-2xl p-5 text-white mb-4 shadow-xl shadow-blue-900/50 relative overflow-hidden transform transition-transform duration-300 hover:scale-[1.02] border border-blue-600">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                <div className="relative flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold opacity-90 mb-1">Total Locations</p>
                    <p className="text-4xl font-bold">{locations.length}</p>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-xl p-3 backdrop-blur-sm shadow-inner">
                    <MapPin className="w-8 h-8" />
                  </div>
                </div>
              </div>

              {/* Stats Cards - Clean and Color-coded */}
              <div className="space-y-3">
                {Object.entries(assistanceColors).map(([type, color]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border-2 border-gray-700 hover:border-blue-500 transition-all duration-200 hover:shadow-lg shadow-black/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shadow-md border-2 border-gray-900"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-semibold text-gray-200">{type}</span>
                    </div>
                    <span className="text-xl font-bold text-gray-100 bg-gray-700 px-3 py-1 rounded-lg border border-gray-600 shadow-inner">
                      {stats[type] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend Footer */}
          <div className="p-6 border-t-2 border-gray-700 bg-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full"></div>
              <h4 className="text-sm font-bold text-gray-200">Map Legend</h4>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-gray-600 border-2 border-blue-500 rounded-sm" />
                <span className="text-xs font-medium text-gray-400">Province Boundary</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-800 border-2 border-blue-400 rounded-sm" />
                <span className="text-xs font-medium text-gray-400">Selected City Boundary</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-medium text-gray-400">Applicant Location</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MapComponent;
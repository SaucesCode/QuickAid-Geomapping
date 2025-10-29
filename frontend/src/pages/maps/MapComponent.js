import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Loader2, X, Map as MapIcon } from "lucide-react";

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

const createColoredIcon = color =>
  L.divIcon({
    className: "custom-marker",
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" width="44" height="64" viewBox="0 0 24 24">
        <path
          d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
          fill="${color}"
        />
        <circle cx="12" cy="9" r="3" fill="white" />
      </svg>
    `,
    iconSize: [44, 64],
    iconAnchor: [22, 64],
    popupAnchor: [0, -58],
  });

L.Marker.prototype.options.icon = DefaultIcon;

// Default center (Quezon Province)
const defaultCenter = [13.938, 121.508];

// Colors (UNCHANGED as per request)
const assistanceColors = {
  Medical: "blue",
  Burial: "#fef08a",
  Educational: "green",
};

const assistanceTypes = ["Medical", "Burial", "Educational"];
const cities = ["Lucena City", "Sariaya", "Candelaria", "Tiaong", "San Antonio", "Dolores"];

const MapBounds = ({ cityGeoData }) => {
  const map = useMap();
  useEffect(() => {
    if (!cityGeoData) return;

    const timeout = setTimeout(() => {
      try {
        const bounds = L.geoJSON(cityGeoData).getBounds();
        map.fitBounds(bounds.pad(0.01), {
          padding: [20, 20],
          maxZoom: 50,
          animate: true,
          duration: 0.5,
        });
      } catch (err) {
        console.error("Error setting bounds:", err);
      }
    }, 50); // short delay ensures old layer is cleared first

    return () => clearTimeout(timeout);
  }, [cityGeoData, map]);

  return null;
};

// ============= MAIN MAP COMPONENT =============
const MapComponent = () => {
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("");
  const [availableBarangays, setAvailableBarangays] = useState([]);
  const [mapCenter] = useState(defaultCenter);
  const [panelOpen, setPanelOpen] = useState(true);
  const togglePanel = () => setPanelOpen(prev => !prev);
  const getColor = type => assistanceColors[type] || "#f87171";
  const resetFilters = () => {
    setTypeFilter("");
    setCityFilter("");
    setBarangayFilter("");
  };

  const cityGeoFileName = cityFilter
    ? `${cityFilter.toLowerCase().replace(/ /g, "_")}.geojson`
    : null;

  useEffect(() => {
    document.title = "QuickAid | Geolocation Map";
  }, []);

  // React Query for Locations
  const {
    data: locations = [],
    isFetching: isLocationLoading,
    refetch: refetchLocations,
  } = useQuery({
    queryKey: ["locations", typeFilter, cityFilter, barangayFilter],
    queryFn: async () => {
      const res = await api.get("/applicant-locations/", {
        params: { type: typeFilter, city: cityFilter, barangay: barangayFilter },
      });
      const data = res.data;

      // Filter valid coordinates
      const valid = data.filter(loc => loc.latitude && loc.longitude && !isNaN(loc.latitude));

      // Add marker offsets
      const offsets = {};
      valid.forEach(loc => {
        const key = loc.id || loc.full_name;
        offsets[key] = {
          latOffset: (Math.random() - 0.5) * 0.0005,
          lngOffset: (Math.random() - 0.5) * 0.0005,
        };
      });

      // Compute type counts
      const typeCounts = {};
      assistanceTypes.forEach(t => {
        typeCounts[t] = valid.filter(l => l.type_of_assistance === t).length;
      });

      return { valid, offsets, typeCounts };
    },
    staleTime: 0,
  });

  const validLocations = locations?.valid || [];
  const markerOffsets = locations?.offsets || {};
  const stats = locations?.typeCounts || {};

  const { data: geoData, isFetching: isAllGeoLoading } = useQuery({
    queryKey: ["allCitiesGeoData"],
    queryFn: async () => {
      const res = await fetch("/all_cities.geojson");
      if (!res.ok) throw new Error("Failed to load all cities GeoJSON");
      return res.json();
    },
    staleTime: Infinity,
  });

  const { data: cityGeoData, isFetching: isCityGeoLoading } = useQuery({
    queryKey: ["cityGeoData", cityFilter],
    queryFn: async () => {
      if (!cityGeoFileName) return null;
      const res = await fetch(`/${cityGeoFileName}`);
      if (!res.ok) throw new Error("Failed to load city GeoJSON");
      return res.json();
    },
    enabled: !!cityFilter,
    staleTime: Infinity,
  });

  const CityPolygon = ({ cityGeoData }) => {
    const map = useMap();

    useEffect(() => {
      if (!cityGeoData) return;

      // Create the GeoJSON layer
      const layer = L.geoJSON(cityGeoData, {
        style: { color: "#3b82f6", weight: 3, fillOpacity: 0.15 },
      }).addTo(map);

      // Fit map bounds
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.01), {
          padding: [20, 20],
          maxZoom: 50,
          animate: true,
          duration: 0.3,
        });
      }

      // Cleanup previous layer when city changes
      return () => {
        map.removeLayer(layer);
      };
    }, [cityGeoData, map]);

    return null;
  };

  useEffect(() => {
    const brgys = validLocations
      .filter(loc => (cityFilter ? loc.city === cityFilter : true))
      .map(loc => loc.barangay);
    setAvailableBarangays([...new Set(brgys)].sort());
  }, [validLocations, cityFilter]);

  return (
    // Updated background to a softer monochromatic blue gradient
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 overflow-hidden"> 
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .leaflet-container { z-index: 0 !important; }
      `}</style>

      <div className="flex flex-col h-full">
        <div className="relative flex-1">
          <MapContainer
            center={mapCenter}
            zoom={11}
            className="w-full h-[calc(100vh-2rem)]"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />

            {isAllGeoLoading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-[999]">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                <span className="ml-3 text-blue-300 font-semibold">
                  Loading province boundaries...
                </span>
              </div>
            )}

            <MapBounds cityGeoData={cityGeoData} />

            {geoData && (
              <GeoJSON
                data={geoData}
                style={{ color: "#3b82f6", weight: 2, fillOpacity: 0.05 }}
              />
            )}

            {cityGeoData && <CityPolygon cityGeoData={cityGeoData} />}

            {validLocations.map((loc, i) => {
              const key = loc.id || loc.full_name;
              const offset = markerOffsets[key] || { latOffset: 0, lngOffset: 0 };
              return (
                <React.Fragment key={key || i}>
                  <Marker
                    position={[
                      loc.latitude + offset.latOffset,
                      loc.longitude + offset.lngOffset,
                    ]}
                    icon={createColoredIcon(getColor(loc.type_of_assistance))}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-blue-700 mb-1">{loc.full_name}</h3>
                        {/* Changed text-gray-600 to text-blue-600 for monochromatic theme */}
                        <p className="text-sm text-blue-600 mb-2">{loc.address}</p> 
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
                    center={[
                      loc.latitude + offset.latOffset,
                      loc.longitude + offset.lngOffset,
                    ]}
                    radius={40}
                    pathOptions={{
                      color: getColor(loc.type_of_assistance),
                      fillOpacity: 0.3,
                      weight: 2,
                    }}
                  />
                </React.Fragment>
              );
            })}
          </MapContainer>

          {/* ========== COLLAPSIBLE TOP-RIGHT PANEL ========== */}
          <div className="absolute top-4 right-4 z-50 w-full max-w-sm">
            <div className="flex justify-end mb-2">
              <button
                // Updated toggle button for blue theme
                className="px-3 py-1 text-xs font-semibold bg-white rounded-full shadow border border-blue-200 text-blue-700 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={togglePanel}
              >
                {panelOpen ? "Hide Filters" : "Show Filters"}
              </button>
            </div>

            <div
              // Added border for a professional look
              className={`bg-white rounded-2xl shadow-xl border border-blue-300 overflow-hidden transition-all duration-300 ${
                panelOpen ? "p-6 max-h-[calc(100vh-3rem)] opacity-100" : "max-h-0 opacity-0 p-0"
              }`}
            >
              {/* Filters */}
              <div className="space-y-4 text-sm">
                
                {/* Type Filter */}
                <select
                  // Monochromatic blue theme for input
                  className="w-full px-4 py-2.5 bg-white border border-blue-300 rounded-lg text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
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

                {/* City Filter */}
                <select
                  // Monochromatic blue theme for input
                  className="w-full px-4 py-2.5 bg-white border border-blue-300 rounded-lg text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
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
                
                {/* Barangay Filter */}
                {cityFilter && (
                  <select
                    // Monochromatic blue theme for input
                    className="w-full px-4 py-2.5 bg-white border border-blue-300 rounded-lg text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
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

                {/* Reset Button */}
                <button
                  // Updated reset button for blue theme
                  className="w-full px-3 py-2 bg-blue-50 text-blue-800 rounded-lg font-semibold hover:bg-blue-100/70 transition-all duration-200 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>

              {/* Active Filters Tags */}
              {(typeFilter || cityFilter || barangayFilter) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-blue-100">
                  {typeFilter && (
                    // Blue monochromatic tag design
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      Type: {typeFilter}
                      <button onClick={() => setTypeFilter("")} className="hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {cityFilter && (
                    // Blue monochromatic tag design (slightly different shade for distinction)
                    <span className="px-2.5 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      City: {cityFilter}
                      <button onClick={() => setCityFilter("")} className="hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {barangayFilter && (
                    // Blue monochromatic tag design (another shade for distinction)
                    <span className="px-2.5 py-1 bg-blue-300 text-blue-900 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                      Brgy: {barangayFilter}
                      <button onClick={() => setBarangayFilter("")} className="hover:text-blue-900">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Overview Section */}
              <div className="mt-6 text-sm">
                
                {/* Total Locations */}
                {/* Changed gradient to monochromatic blue */}
                <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl p-4 text-white mb-4 shadow-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white font-semibold opacity-90">Total Locations</p>
                    <p className="text-3xl text-white font-bold">{validLocations.length}</p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="space-y-2">
                  {Object.entries(assistanceColors).map(([type, color]) => (
                    <div
                      key={type}
                      // Updated neutral classes to monochromatic blue
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 shadow-sm" 
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shadow-md"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-blue-800 text-sm font-medium">{type}</span> {/* Changed text-gray-800 to text-blue-800 */}
                      </div>
                      {/* Changed text-gray-900 to text-blue-900 */}
                      <span className="text-blue-900 text-lg font-bold">
                        {stats[type] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
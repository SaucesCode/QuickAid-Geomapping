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
import {
  Filter,
  RotateCcw,
  X,
  MapPin,
  Building2,
  Tags,
  Loader2,
  Map as MapIcon,
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
          maxZoom: 14,
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
          maxZoom: 15,
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
            minZoom={8}
            maxZoom={13}
            className="w-full h-[calc(100vh-2rem)]"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />

            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
              url="https://services.arcgisonline.com/arcgis/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
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
                className="px-4 py-2 text-sm font-semibold bg-white rounded-lg shadow-md border border-blue-200 text-blue-700 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                onClick={togglePanel}
              >
                <Filter className="w-4 h-4" />
                {panelOpen ? "Hide Filters" : "Show Filters"}
              </button>
            </div>

            <div
              className={`bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden transition-all duration-300 ${
                panelOpen
                  ? "p-4 max-h-[calc(100vh-3rem)] opacity-100"
                  : "max-h-0 opacity-0 p-0"
              }`}
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-100">
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                  <Filter className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">Map Filters</h3>
                  <p className="text-xs text-gray-500">Filter locations on map</p>
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-3 text-sm">
                {/* Type Filter */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Tags className="w-3 h-3" />
                    Assistance Type
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-gray-700 hover:border-blue-400 appearance-none cursor-pointer pr-8"
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
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* City Filter */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    City
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-gray-700 hover:border-blue-400 appearance-none cursor-pointer pr-8"
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
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Barangay Filter */}
                {cityFilter && (
                  <div className="flex flex-col animate-fadeIn">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Barangay
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-gray-700 hover:border-blue-400 appearance-none cursor-pointer pr-8"
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
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reset Button */}
                <button
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-all hover:shadow-sm active:scale-[0.98] border border-gray-200 mt-1"
                  onClick={resetFilters}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Filters
                </button>
              </div>

              {/* Active Filters Tags */}
              {(typeFilter || cityFilter || barangayFilter) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-blue-100">
                  {typeFilter && (
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1.5">
                      {typeFilter}
                      <button
                        onClick={() => setTypeFilter("")}
                        className="hover:text-blue-900 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {cityFilter && (
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium flex items-center gap-1.5">
                      {cityFilter}
                      <button
                        onClick={() => setCityFilter("")}
                        className="hover:text-indigo-900 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {barangayFilter && (
                    <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1.5">
                      {barangayFilter}
                      <button
                        onClick={() => setBarangayFilter("")}
                        className="hover:text-purple-900 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Overview Section */}
              <div className="mt-4 pt-3 border-t border-blue-100">
                {/* Total Locations */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-3 text-white mb-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapIcon className="w-4 h-4" />
                      <p className="text-xs font-semibold opacity-90">Total Locations</p>
                    </div>
                    <p className="text-2xl font-bold">{validLocations.length}</p>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="space-y-2">
                  {Object.entries(assistanceColors).map(([type, color]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-gray-700 text-sm font-medium">{type}</span>
                      </div>
                      <span className="text-gray-900 text-base font-bold">
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

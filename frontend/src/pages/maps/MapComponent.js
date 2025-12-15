import { useEffect, useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-easyprint";
import { api } from "../../services/api";
import {
  Filter,
  RotateCcw,
  X,
  MapPin,
  Building2,
  Tags,
  Loader2,
  Download,
  Map as MapIcon,
} from "lucide-react";
import MapCanvas from "./MapCanvas";
import toast from "react-hot-toast";

// ===========================================
// 1. LEAFLET SETUP & CONFIGURATION
// ===========================================

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Set Leaflet's default marker icon configuration
L.Marker.prototype.options.icon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Default center coordinates for the map (e.g., Quezon Province)
const defaultCenter = [13.918, 121.575];

// Configuration data
const assistanceColors = {
  Medical: "blue",
  Burial: "#fef08a",
  Educational: "green",
};
const assistanceTypes = ["Medical", "Burial", "Educational"];
const cities = ["Lucena City", "Sariaya", "Candelaria", "Tiaong", "San Antonio", "Dolores"];

/**
 * @function createColoredIcon
 * @description Creates a custom, colored Leaflet DivIcon (SVG pin) for a marker.
 * @param {string} color - The color to be used for the SVG pin.
 */
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

// ===========================================
// 2. MAIN MAP COMPONENT
// ===========================================

/**
 * @component MapComponent
 * @description The main container component managing map state, data fetching,
 * filtering logic, and user interface controls.
 */
const MapComponent = () => {
  // --- State Management ---
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("");
  const [availableBarangays, setAvailableBarangays] = useState([]);
  const [mapCenter] = useState(defaultCenter);
  const [panelOpen, setPanelOpen] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [clusterEnabled, setClusterEnabled] = useState(false);
  const [exporting, setExporting] = useState(false);
  const printerRef = useRef(null); // Ref to hold the Leaflet EasyPrint instance

  // --- Utility Functions ---

  /**
   * @function togglePanel
   * @description Toggles the visibility of the filter panel.
   */
  const togglePanel = () => setPanelOpen(prev => !prev);

  /**
   * @function getColor
   * @description Returns the configured color for a given assistance type.
   */
  const getColor = type => assistanceColors[type] || "#f87171";

  /**
   * @function resetFilters
   * @description Clears all filters and triggers a map view reset.
   */
  const resetFilters = () => {
    setTypeFilter("");
    setCityFilter("");
    setBarangayFilter("");
    // Toggling resetTrigger forces MapCanvas to reset the view
    setResetTrigger(prev => !prev);
  };

  // Dynamically generate the GeoJSON file name based on the current city filter
  const cityGeoFileName = cityFilter
    ? `${cityFilter.toLowerCase().replace(/ /g, "_")}.geojson`
    : null;

  // --- Data Fetching (React Query) ---

  /**
   * @hook useQuery (allLocationsData)
   * @description Fetches all location data from the API once and caches it.
   */
  const { data: allLocationsData, isLoading: isLoadingLocations } = useQuery({
    queryKey: ["allLocations"],
    queryFn: async () => {
      const res = await api.get("/applicant-locations/", {
        params: { limit: 2000 },
      });
      // Filter out locations with invalid or missing coordinates
      return res.data.filter(loc => loc.latitude && loc.longitude && !isNaN(loc.latitude));
    },
    // Cache settings
    staleTime: 15 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  /**
   * @hook useQuery (geoData)
   * @description Fetches the GeoJSON data for the overall region boundaries.
   */
  const { data: geoData } = useQuery({
    queryKey: ["allCitiesGeoData"],
    queryFn: async () => {
      const res = await fetch("/all_cities.geojson");
      if (!res.ok) throw new Error("Failed to load all cities GeoJSON");
      return res.json();
    },
    staleTime: Infinity, // Never refetch boundary data
  });

  /**
   * @hook useQuery (cityGeoData)
   * @description Fetches the GeoJSON boundary data for the *currently selected* city.
   */
  const { data: cityGeoData } = useQuery({
    queryKey: ["cityGeoData", cityFilter],
    queryFn: async () => {
      if (!cityGeoFileName) return null;
      const res = await fetch(`/${cityGeoFileName}`);
      if (!res.ok) throw new Error("Failed to load city GeoJSON");
      return res.json();
    },
    enabled: !!cityFilter, // Only run the query when a city is selected
    staleTime: Infinity,
  });

  // --- Filtering & Memoized Values ---

  /**
   * @hook useMemo (filteredLocations)
   * @description Filters the full list of locations based on the current
   * `typeFilter`, `cityFilter`, and `barangayFilter`.
   */
  const filteredLocations = useMemo(() => {
    if (!allLocationsData) return [];

    return allLocationsData.filter(loc => {
      if (typeFilter && loc.type_of_assistance !== typeFilter) return false;
      if (cityFilter && loc.city !== cityFilter) return false;
      if (barangayFilter && loc.barangay !== barangayFilter) return false;
      return true;
    });
  }, [allLocationsData, typeFilter, cityFilter, barangayFilter]);

  /**
   * @hook useMemo (stats)
   * @description Calculates the count of locations for each assistance type
   * within the currently filtered dataset.
   */
  const stats = useMemo(() => {
    const counts = {};
    assistanceTypes.forEach(t => {
      counts[t] = filteredLocations.filter(l => l.type_of_assistance === t).length;
    });
    return counts;
  }, [filteredLocations]);

  // --- Side Effects ---

  /**
   * @hook useEffect
   * @description Updates the list of available barangays whenever the city filter changes.
   */
  useEffect(() => {
    if (!allLocationsData) return;

    // Filter locations by selected city (or all if no city filter)
    const brgys = allLocationsData
      .filter(loc => (cityFilter ? loc.city === cityFilter : true))
      .map(loc => loc.barangay);

    // Get unique barangays and sort them alphabetically
    setAvailableBarangays([...new Set(brgys)].sort());

    // Reset barangay filter when the city changes
    setBarangayFilter("");
  }, [allLocationsData, cityFilter]);

  /**
   * @hook useEffect
   * @description Manages browser tab title.
   */
  useEffect(() => {
    document.title = "QuickAid | Geolocation Map";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  // --- Custom Map Functions ---

  /**
   * @function createClusterCustomIcon
   * @description Creates a custom icon for a marker cluster group. The icon color
   * is determined by the most dominant assistance type within the cluster.
   */
  const createClusterCustomIcon = cluster => {
    const markers = cluster.getAllChildMarkers();
    const typeCounts = {};

    markers.forEach(m => {
      // Note: assistanceType is a custom option passed to the Marker component
      const type = m.options.assistanceType;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    // Find the type with the highest count
    const dominantType = Object.keys(typeCounts).reduce((a, b) =>
      typeCounts[a] > typeCounts[b] ? a : b
    );

    const color = getColor(dominantType);
    const count = markers.length;

    return L.divIcon({
      html: `
          <div style="
            background: ${color};
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          ">
            ${count}
          </div>
        `,
      className: "custom-cluster-icon",
      iconSize: L.point(40, 40, true),
    });
  };

  /**
   * @function handleDownloadMap
   * @description Handles the map download/export process using the EasyPrint plugin.
   * It temporarily enables the MapStatsOverlay component by setting `exporting` to true.
   */
  const handleDownloadMap = () => {
    if (!printerRef.current) {
      toast.error("Map is not ready for download.");
      return;
    }

    setExporting(true); // Show stats overlay for print

    // Create a descriptive filename based on active filters
    const filterStr = [
      typeFilter && `type-${typeFilter}`,
      cityFilter && `city-${cityFilter}`,
      barangayFilter && `barangay-${barangayFilter}`,
    ]
      .filter(Boolean)
      .join("_");

    const filename = `quickaid-map${filterStr ? `-${filterStr}` : ""}`;

    // Small delay to allow the exporting overlay to render before printing
    setTimeout(() => {
      printerRef.current.printMap("CurrentSize", filename);
      // Wait a little longer before hiding the overlay
      setTimeout(() => setExporting(false), 500);
    }, 100);
  };

  // --- Render ---

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 overflow-hidden">
      {/* Inline Styles for Animation and Leaflet Z-index fix */}
      <style>{`
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .leaflet-container { z-index: 0 !important; }
        .custom-cluster-icon { background: transparent !important; border: none !important; }
      `}</style>

      {/* Full-screen Loading Overlay */}
      {isLoadingLocations && (
        <div className="absolute inset-0 bg-blue-900/80 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 shadow-2xl flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <span className="text-blue-900 font-semibold text-lg">Loading map data...</span>
          </div>
        </div>
      )}

      <div className="flex flex-col h-full">
        <div className="relative flex-1">
          {/* Map Canvas (Child Component) */}
          <MapCanvas
            mapCenter={mapCenter}
            filteredLocations={filteredLocations}
            clusterEnabled={clusterEnabled}
            createClusterCustomIcon={createClusterCustomIcon}
            createColoredIcon={createColoredIcon}
            getColor={getColor}
            geoData={geoData}
            cityFilter={cityFilter}
            cityGeoData={cityGeoData}
            resetTrigger={resetTrigger}
            exporting={exporting}
            stats={stats}
            total={filteredLocations.length}
            barangayFilter={barangayFilter}
            typeFilter={typeFilter}
            // Callback to receive the Leaflet EasyPrint instance
            onPrinterReady={printer => {
              printerRef.current = printer;
            }}
          />

          {/* ========== COLLAPSIBLE TOP-RIGHT FILTER PANEL ========== */}
          <div className="absolute top-4 right-4 z-20 w-full max-w-sm ">
            {/* Toggle Button */}
            <div className="flex justify-end gap-2 mb-2">
              <button
                className="px-4 py-2 text-sm font-semibold bg-white rounded-lg shadow-md border border-blue-200 text-blue-700 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                onClick={handleDownloadMap}
              >
                <Download className="w-4 h-4" />
                PNG Download
              </button>
              <button
                className="px-4 py-2 text-sm font-semibold bg-white rounded-lg shadow-md border border-blue-200 text-blue-700 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                onClick={togglePanel}
              >
                <Filter className="w-4 h-4" />
                {panelOpen ? "Hide Filters" : "Show Filters"}
              </button>
            </div>

            {/* Filter Content Panel */}
            <div
              className={`bg-white/40 backdrop-blur-sm rounded-xl shadow-xl border border-white/40 transition-all duration-300 ${
                panelOpen
                  ? "p-4 max-h-[calc(100vh-8rem)] opacity-100 overflow-y-auto"
                  : "max-h-0 opacity-0 p-0 overflow-hidden"
              }`}
              // Custom scrollbar styles (non-tailwind)
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#3b82f6 #e5e7eb",
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-100/50">
                <div className="p-1.5 bg-[#003a76] rounded-lg">
                  <Filter className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">Map Filters</h3>
                  <p className="text-xs text-black">Filter locations on map</p>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-3 text-sm">
                {/* Cluster Toggle */}
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        clusterEnabled ? "bg-blue-500" : "bg-gray-400"
                      } transition-colors`}
                    >
                      <MapIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Cluster Mode</p>
                      <p className="text-xs text-gray-900">
                        {clusterEnabled ? "Groups nearby markers" : "Shows all pins"}
                      </p>
                    </div>
                  </div>
                  {/* Toggle Switch */}
                  <button
                    onClick={() => setClusterEnabled(!clusterEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      clusterEnabled ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        clusterEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Type Filter Select */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <Tags className="w-3 h-3" />
                    Assistance Type
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white/80 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-gray-700 hover:border-blue-400 appearance-none cursor-pointer pr-8"
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
                    {/* SVG Down Arrow */}
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

                {/* City Filter Select */}
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    City
                  </label>
                  <div className="relative">
                    <select
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white/80 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-gray-700 hover:border-blue-400 appearance-none cursor-pointer pr-8"
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
                    {/* SVG Down Arrow */}
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

                {/* Barangay Filter Select (Conditional) */}
                {cityFilter && (
                  <div className="flex flex-col animate-fadeIn">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Barangay
                    </label>
                    <div className="relative">
                      <select
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white/80 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition-all text-gray-700 hover:border-blue-400 appearance-none cursor-pointer pr-8"
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
                      {/* SVG Down Arrow */}
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
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white/50 text-gray-700 hover:bg-white/80 rounded-lg text-sm font-semibold transition-all hover:shadow-sm active:scale-[0.98] border border-gray-200 mt-1"
                  onClick={resetFilters}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Filters/Reset Zoom
                </button>
              </div>

              {/* Active Filters Tags */}
              {(typeFilter || cityFilter || barangayFilter) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-blue-100/50">
                  {typeFilter && (
                    <span className="px-2.5 py-1 bg-blue-100/80 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1.5">
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
                    <span className="px-2.5 py-1 bg-indigo-100/80 text-indigo-700 rounded-full text-xs font-medium flex items-center gap-1.5">
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
                    <span className="px-2.5 py-1 bg-purple-100/80 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1.5">
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

              {/* Overview Section (Stats) */}
              <div className="mt-4 pt-3 border-t border-blue-100/50">
                {/* Total Locations Card */}
                <div className="bg-[#003a76] rounded-lg p-3 text-white mb-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapIcon className="w-4 h-4" />
                      <p className="text-xs text-white font-semibold opacity-90">
                        Total Locations
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-white">{filteredLocations.length}</p>
                  </div>
                </div>

                {/* Stats Cards by Type */}
                <div className="space-y-2">
                  {Object.entries(assistanceColors).map(([type, color]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between p-2.5 bg-white/60 rounded-lg border border-gray-200 hover:bg-white/80 transition-colors"
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

import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMap } from "react-leaflet";
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
import MapCanvas from "./MapCanvas";

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
const defaultCenter = [13.918, 121.575];

// Colors
const assistanceColors = {
  Medical: "blue",
  Burial: "#fef08a",
  Educational: "green",
};

const assistanceTypes = ["Medical", "Burial", "Educational"];
const cities = ["Lucena City", "Sariaya", "Candelaria", "Tiaong", "San Antonio", "Dolores"];

// ============= MAIN MAP COMPONENT =============
const MapComponent = () => {
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("");
  const [availableBarangays, setAvailableBarangays] = useState([]);
  const [mapCenter] = useState(defaultCenter);
  const [panelOpen, setPanelOpen] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(false);
  const [clusterEnabled, setClusterEnabled] = useState(false);
  const togglePanel = () => setPanelOpen(prev => !prev);
  const getColor = type => assistanceColors[type] || "#f87171";
  const resetFilters = () => {
    setTypeFilter("");
    setCityFilter("");
    setBarangayFilter("");
    setResetTrigger(prev => !prev);
  };

  const cityGeoFileName = cityFilter
    ? `${cityFilter.toLowerCase().replace(/ /g, "_")}.geojson`
    : null;

  useEffect(() => {
    document.title = "QuickAid | Geolocation Map";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  // React Query for ALL Locations (loaded once, filtered client-side)
  const { data: allLocationsData, isLoading: isLoadingLocations } = useQuery({
    queryKey: ["allLocations"],
    queryFn: async () => {
      const res = await api.get("/applicant-locations/", {
        params: { limit: 2000 },
      });
      return res.data.filter(loc => loc.latitude && loc.longitude && !isNaN(loc.latitude));
    },
    staleTime: 15 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
  });

  console.log("Locations", allLocationsData);

  // Client-side filtering (instant performance)
  const filteredLocations = useMemo(() => {
    if (!allLocationsData) return [];

    return allLocationsData.filter(loc => {
      if (typeFilter && loc.type_of_assistance !== typeFilter) return false;
      if (cityFilter && loc.city !== cityFilter) return false;
      if (barangayFilter && loc.barangay !== barangayFilter) return false;
      return true;
    });
  }, [allLocationsData, typeFilter, cityFilter, barangayFilter]);

  // Calculate stats from filtered data
  const stats = useMemo(() => {
    const counts = {};
    assistanceTypes.forEach(t => {
      counts[t] = filteredLocations.filter(l => l.type_of_assistance === t).length;
    });
    return counts;
  }, [filteredLocations]);

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

  // Zoom to barangay markers when barangay is selected
  const BarangayZoom = ({ locations, barangayFilter }) => {
    const map = useMap();

    useEffect(() => {
      if (!barangayFilter || locations.length === 0) return;

      const positions = locations.map(loc => [loc.latitude, loc.longitude]);

      if (positions.length > 0) {
        const bounds = L.latLngBounds(positions);
        map.fitBounds(bounds.pad(0.2), {
          padding: [50, 50],
          animate: true,
          duration: 0.3,
        });
      }
    }, [barangayFilter, locations, map]);

    return null;
  };

  useEffect(() => {
    if (!allLocationsData) return;

    const brgys = allLocationsData
      .filter(loc => (cityFilter ? loc.city === cityFilter : true))
      .map(loc => loc.barangay);
    setAvailableBarangays([...new Set(brgys)].sort());

    setBarangayFilter("");
  }, [allLocationsData, cityFilter]);

  const MapReset = ({ trigger }) => {
    const map = useMap();

    useEffect(() => {
      if (trigger) {
        map.setView(defaultCenter, 11, {
          animate: true,
        });
      }
    }, [trigger, map]);

    return null;
  };

  // Custom cluster icon creator
  const createClusterCustomIcon = cluster => {
    const markers = cluster.getAllChildMarkers();
    const typeCounts = {};

    markers.forEach(m => {
      const type = m.options.assistanceType;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    // Determine dominant type
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

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 overflow-hidden">
      <style>{`
          .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
          .leaflet-container { z-index: 0 !important; }
          .custom-cluster-icon { background: transparent !important; border: none !important; }
        `}</style>

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
            // MapReset={() => <MapReset trigger={resetTrigger} />}
            // BarangayZoom={() => (
            //   <BarangayZoom locations={filteredLocations} barangayFilter={barangayFilter} />
            // )}
            // MapBounds={() => <MapBounds cityGeoData={cityGeoData} />}
          />

          {/* ========== COLLAPSIBLE TOP-RIGHT PANEL ========== */}
          <div className="absolute top-4 right-4 z-20 w-full max-w-sm ">
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
              className={`bg-white rounded-xl shadow-md border border-blue-100 transition-all duration-300 ${
                panelOpen
                  ? "p-4 max-h-[calc(100vh-8rem)] opacity-100 overflow-y-auto"
                  : "max-h-0 opacity-0 p-0 overflow-hidden"
              }`}
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#3b82f6 #e5e7eb",
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-100">
                <div className="p-1.5 bg-[#003a76] rounded-lg">
                  <Filter className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">Map Filters</h3>
                  <p className="text-xs text-gray-500">Filter locations on map</p>
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-3 text-sm">
                {/* Cluster Toggle */}
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
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
                      <p className="text-xs text-gray-500">
                        {clusterEnabled ? "Groups nearby markers" : "Shows all pins"}
                      </p>
                    </div>
                  </div>
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
                  Reset Filters/Reset Zoom
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

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import L from "leaflet";
import { api } from "../../services/api";
import {
  Users,
  MapPin,
  Activity,
  BarChart3,
  Loader2,
  Map as MapIcon,
  Layers,
} from "lucide-react";

// ============= THEME COLORS & CONFIGURATION =============

const COLOR_PRIMARY = "text-blue-700";
const COLOR_ACCENT = "text-blue-600";
const COLOR_BACKGROUND = "bg-gray-50"; // Note: This class is overridden in the JSX for the new gradient background.

// District 2 municipalities
const districtCities = [
  "Lucena City",
  "Sariaya",
  "Candelaria",
  "Tiaong",
  "San Antonio",
  "Dolores",
];

// Heatmap gradient shifted to a blue/indigo scale
const BLUE_HEAT_GRADIENT = {
  0.2: "#7dd3fc", // Light Sky Blue (Low)
  0.4: "#38bdf8", // Sky Blue
  0.6: "#2563eb", // Blue
  0.8: "#4f46e5", // Indigo
  1.0: "#6d28d9", // Violet/Purple (High)
};

// Auto-fit map to District 2 boundary
const DistrictBounds = ({ geoData }) => {
  const map = useMap();
  useEffect(() => {
    if (geoData) {
      try {
        const bounds = L.geoJSON(geoData).getBounds();
        map.fitBounds(bounds.pad(0.05), { maxZoom: 13, padding: [20, 20] });
        map.setMaxBounds(bounds.pad(0.05));
      } catch (error) {
        console.error("Error setting map bounds:", error);
      }
    }
  }, [geoData, map]);
  return null;
};

// HeatLayer Component
const HeatLayer = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    // Check for window.L.heatLayer to ensure the plugin loaded
    if (!points.length || !window.L || !window.L.heatLayer) return;

    const heatData = points.map((p) => [p.latitude, p.longitude, 0.8]);
    
    // Use the blue-themed gradient
    const heatLayer = window.L.heatLayer(heatData, {
      radius: 30,
      blur: 20,
      maxZoom: 15,
      gradient: BLUE_HEAT_GRADIENT,
    }).addTo(map);

    // Fade in animation for a modern touch
    const pane = map.getPanes().overlayPane;
    pane.style.opacity = 0;
    let opacity = 0;
    const fadeIn = setInterval(() => {
      opacity += 0.05;
      pane.style.opacity = opacity;
      if (opacity >= 1) clearInterval(fadeIn);
    }, 30);

    return () => {
      clearInterval(fadeIn);
      map.removeLayer(heatLayer);
    };
  }, [points, map]);
  return null;
};

const Geographic = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [districtGeo, setDistrictGeo] = useState(null);

  // Fetch Locations
  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const res = await api.get("/applicant-locations/");
        const valid = res.data.filter(
          (loc) =>
            loc.latitude && loc.longitude && districtCities.includes(loc.city)
        );
        setLocations(valid);
      } catch (err) {
        console.error("Error fetching applicants:", err);
      } finally {
        // Delay setting loading to false to show the loading screen for a minimum duration
        setTimeout(() => setLoading(false), 500); 
      }
    };
    fetchLocations();
  }, []);

  // Load district boundary
  useEffect(() => {
    fetch("/all_cities.geojson")
      .then((res) => res.json())
      .then(setDistrictGeo)
      .catch((err) => console.error("Error loading district geojson:", err));
  }, []);
  
  // Calculate Top City only when locations change
  const topCity = React.useMemo(() => {
    const counts = locations.reduce((acc, loc) => {
      acc[loc.city] = (acc[loc.city] || 0) + 1;
      return acc;
    }, {});
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : "N/A";
  }, [locations]);

  // Calculate Cities Covered only when locations change
  const citiesCovered = React.useMemo(() => {
    return new Set(locations.map((l) => l.city).filter((c) => c)).size;
  }, [locations]);

  return (
    // 1. Updated Background: Replaced COLOR_BACKGROUND with soft blue gradient
    <div className="relative w-full min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 p-4 sm:p-6 md:p-10 overflow-hidden">
      
      {/* 2. Background Blur Shapes (Copied for consistency) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>
      
      {/* 3. Centering Container (Copied for consistency) */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
      
        {/* Cleanup Leaflet z-index issues for a cleaner render - KEEP */}
        <style>{`
          .leaflet-container { z-index: 0 !important; position: relative !important; }
          .leaflet-pane, .leaflet-control, .leaflet-top, .leaflet-bottom { z-index: 0 !important; }
          .leaflet-overlay-pane { z-index: 1 !important; }
        `}</style>

        {/* 4. Header Card (New Card Style) */}
        <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 p-8">
          <header className="pb-0 border-b-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/50">
                <MapIcon className="w-8 h-8  text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  Geographic Heatmap Analytics
                </h1>
                <p className="text-gray-600 text-lg mt-1">
                  Visualize applicant concentration within District 2.
                </p>
              </div>
            </div>
          </header>
        </div>

        {/* KPI Cards: Responsive Grid (1 column -> 2 columns -> 3 columns) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Total Applicants Card - Primary Blue Focus */}
          {/* 5. Uniformed border-blue-200 */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 flex items-center gap-4 border border-blue-200 transition-all hover:shadow-xl hover:scale-[1.01]">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Applicants</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-blue-800">
                {locations.length}
              </h2>
            </div>
          </div>
          
          {/* Cities Covered Card - Secondary Accent */}
          {/* 5. Uniformed border-blue-200 */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 flex items-center gap-4 border border-blue-200 transition-all hover:shadow-xl hover:scale-[1.01]">
            <div className="p-3 bg-indigo-100 rounded-full">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Cities Covered</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-indigo-800">
                {citiesCovered} / {districtCities.length}
              </h2>
            </div>
          </div>
          
          {/* Top City Card - Tertiary Accent */}
          {/* 5. Uniformed border-blue-200 */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 flex items-center gap-4 border border-blue-200 transition-all hover:shadow-xl hover:scale-[1.01]">
            <div className="p-3 bg-sky-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-sky-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Highest Concentration</p>
              {/* Reduced text size for better fit on small cards */}
              <h2 className="text-lg sm:text-xl font-bold text-sky-800 truncate"> 
                {topCity}
              </h2>
            </div>
          </div>
        </section>

        {/* 6. Map Preview Card (New Card Style) */}
        <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 p-4 sm:p-6">
          <div className="relative h-[300px] sm:h-[500px] lg:h-[600px] shadow-2xl rounded-xl overflow-hidden border-4 border-white">
            {loading ? (
              // 7. Modern, simple blue loading state - KEPT
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-50">
                <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-xl border border-gray-100 flex flex-col items-center gap-4 sm:gap-6">
                    <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-blue-600 animate-spin" />
                    <div className="text-center space-y-1">
                      <h3 className="text-lg sm:text-xl font-bold text-blue-700">
                        Generating Heatmap
                      </h3>
                      <p className="text-sm text-gray-500 font-medium">
                        Processing {locations.length} location points...
                      </p>
                    </div>
                  </div>
              </div>
            ) : (
              <div className="relative z-0">
                <MapContainer
                  center={[13.9, 121.475]}
                  zoom={11.4}
                  // The height here must match the parent's responsive height classes
                  className="w-full h-[300px] sm:h-[500px] lg:h-[600px] z-0" 
                  minZoom={10}
                  scrollWheelZoom
                  zoomControl
                  preferCanvas={true} // Improves performance for heatmaps
                >
                  <TileLayer
                    url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png" // Dark theme for better heatmap contrast
                    attribution='&copy; <a href="https://www.stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                  />
                  {districtGeo && (
                    <>
                      <GeoJSON
                        data={districtGeo}
                        style={{
                          // Clean, blue boundary
                          color: "#3b82f6", 
                          weight: 3,
                          fillOpacity: 0.1,
                          opacity: 0.8
                        }}
                      />
                      <DistrictBounds geoData={districtGeo} />
                    </>
                  )}
                  {/* HeatLayer is where the main visual data is rendered */}
                  <HeatLayer points={locations} />
                </MapContainer>
              </div>
            )}
          </div>
        </div>
        
        {/* 8. Legend Card (New Card Style) */}
        <div className="bg-white bg-opacity-90 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 p-6">
          <div className="flex items-center gap-3 mb-3 border-b pb-2">
            <Layers className={`w-5 h-5 ${COLOR_ACCENT}`} />
            <span className={`text-sm font-bold ${COLOR_PRIMARY}`}>
              Heatmap Intensity Legend
            </span>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-700 font-medium">Low Concentration</span>
              <span className="text-xs text-gray-700 font-medium">High Concentration</span>
            </div>
            {/* Legend Gradient Bar matching BLUE_HEAT_GRADIENT - KEPT */}
            <div className="h-3 rounded-full bg-gradient-to-r from-sky-300 via-blue-500 via-indigo-600 to-purple-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Geographic;
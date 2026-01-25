import React, { useEffect, useState, useMemo, useRef } from "react";
import { usePageTitle } from "../../hooks/usePageTitle";
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
  X,
  Map as MapIcon,
  Layers,
  Download,
  Filter,
  Tags,
  RotateCcw,
} from "lucide-react";
import { ASSISTANCE_TYPES } from "../../utils/assistanceColors";
import html2canvas from "html2canvas";

// Import Analytics Components
import {
  PageContainer,
  PageHeader,
  AnalyticsCard,
  AnalyticsStatCard,
  AnalyticsGrid,
  AnalyticsStack,
} from "../../components/AnalyticsComponents";

// District 2 municipalities
const districtCities = [
  "Lucena City",
  "Sariaya",
  "Candelaria",
  "Tiaong",
  "San Antonio",
  "Dolores",
];

const BLUE_HEAT_GRADIENT = {
  0.2: "#12e200", // green1
  0.5: "#d2ff00", // yellowgreen
  0.6: "#fbb021", // yellow
  0.8: "#f68838", // orange
  1.0: "#ee3e32", // red
};

// Auto-fit map to District 2 boundary
const DistrictBounds = ({ geoData }) => {
  const map = useMap();
  useEffect(() => {
    if (geoData) {
      try {
        const bounds = L.geoJSON(geoData).getBounds();
        map.fitBounds(bounds.pad(0.05), { maxZoom: 15, padding: [20, 20] });
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
    if (!points.length || !window.L || !window.L.heatLayer) return;

    const heatData = points.map(p => [p.latitude, p.longitude, p.weight ?? 1]);

    const heatLayer = window.L.heatLayer(heatData, {
      radius: 16,
      blur: 15,
      maxZoom: 13,
      gradient: BLUE_HEAT_GRADIENT,
    }).addTo(map);

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
  const [heatType, setHeatType] = useState("ALL");
  const [selectedCity, setSelectedCity] = useState("ALL");
  const mapRef = useRef(null);

  usePageTitle("HeatMap");

  // Fetch Locations
  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const res = await api.get("/applicant-locations/");
        const valid = res.data.filter(
          loc => loc.latitude && loc.longitude && districtCities.includes(loc.city)
        );
        setLocations(valid);
      } catch (err) {
        console.error("Error fetching applicants:", err);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchLocations();
  }, []);

  // Load district boundary
  useEffect(() => {
    fetch("/all_cities.geojson")
      .then(res => res.json())
      .then(setDistrictGeo)
      .catch(err => console.error("Error loading district geojson:", err));
  }, []);

  // Calculate Top City
  const topCity = React.useMemo(() => {
    const counts = locations.reduce((acc, loc) => {
      acc[loc.city] = (acc[loc.city] || 0) + 1;
      return acc;
    }, {});
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? top[0] : "N/A";
  }, [locations]);

  // Calculate Cities Covered
  const citiesCovered = React.useMemo(() => {
    return new Set(locations.map(l => l.city).filter(c => c)).size;
  }, [locations]);

  const locationFiltered = useMemo(() => {
    if (selectedCity === "ALL") return locations;
    return locations.filter(l => l.city === selectedCity);
  }, [locations, selectedCity]);

  const weightedLocations = useMemo(() => {
    const map = {};
    locationFiltered.forEach(l => {
      const key = `${l.latitude},${l.longitude}`;
      map[key] = (map[key] || 0) + 1;
    });

    return locationFiltered.map(l => ({
      ...l,
      weight: map[`${l.latitude},${l.longitude}`],
    }));
  }, [locationFiltered]);

  const filteredHeatLocations = useMemo(() => {
    if (heatType === "ALL") return weightedLocations;
    return weightedLocations.filter(l => l.type_of_assistance === heatType);
  }, [weightedLocations, heatType]);

  const exportMapPNG = async () => {
    if (!mapRef.current) return;

    try {
      // Hide controls temporarily
      const controls = mapRef.current.querySelectorAll(
        ".leaflet-control, .leaflet-top, .leaflet-bottom"
      );
      controls.forEach(el => (el.style.display = "none"));

      const canvas = await html2canvas(mapRef.current, {
        useCORS: true,
        backgroundColor: "#ffffff",
        scale: 2, // crisp output
        logging: false,
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `heatmap-${Date.now()}.png`;
      link.click();

      // Restore controls
      controls.forEach(el => (el.style.display = ""));
    } catch (err) {
      console.error("PNG export failed:", err);
    }
  };

  return (
    <PageContainer>
      <AnalyticsStack spacing="lg">
        {/* Cleanup Leaflet z-index issues */}
        <style>{`
          .leaflet-container { z-index: 0 !important; position: relative !important; }
          .leaflet-pane, .leaflet-control, .leaflet-top, .leaflet-bottom { z-index: 0 !important; }
          .leaflet-overlay-pane { z-index: 1 !important; }
        `}</style>

        <PageHeader
          icon={MapIcon}
          title="Geographic Heatmap Analytics"
          subtitle="Visualize applicant concentration within District 2"
        />

        {/* KPI Cards */}
        <AnalyticsGrid cols={{ default: 1, sm: 2, md: 3 }} gap="md">
          <AnalyticsStatCard
            icon={Users}
            title="Total Applicants"
            value={locations.length}
            subtitle="Mapped locations"
            color="blue"
            isLoading={loading}
          />

          <AnalyticsStatCard
            icon={Activity}
            title="Cities Covered"
            value={`${citiesCovered}/${districtCities.length}`}
            subtitle="District 2 municipalities"
            color="purple"
            isLoading={loading}
          />

          <AnalyticsStatCard
            icon={BarChart3}
            title="Highest Concentration"
            value={topCity}
            subtitle="Top municipality"
            color="green"
            isLoading={loading}
          />
        </AnalyticsGrid>

        <AnalyticsCard>
  <div className="flex items-center justify-between gap-6 flex-wrap">
    {/* Left: Title */}
    <div className="flex items-center gap-3">
      <div className="p-2 bg-[#003a76] rounded-lg">
        <Filter className="w-4.5 h-4.5 text-white" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900">Heatmap Filters</h3>
        <p className="text-xs text-gray-600 mt-0.5">
          Filter by city and assistance type
        </p>
      </div>
    </div>

    {/* Right: Dropdowns Side by Side */}
    <div className="flex items-end gap-3 flex-wrap">
      {/* City Dropdown */}
      <div className="flex flex-col min-w-[170px]">
        <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-gray-500" />
          City
        </label>
        <div className="relative">
          <select
            value={selectedCity}
            onChange={e => setSelectedCity(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-[#003a76]/10 focus:border-[#003a76] outline-none transition-all text-gray-800 hover:border-gray-400 appearance-none cursor-pointer pr-9"
          >
            <option value="ALL">All Cities</option>
            {districtCities.map(city => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            {selectedCity !== "ALL" ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCity("ALL");
                }}
                className="p-0.5 hover:bg-gray-100 rounded transition-all cursor-pointer pointer-events-auto"
                type="button"
              >
                <X className="w-3.5 h-3.5 text-gray-500 hover:text-gray-700" />
              </button>
            ) : (
              <svg
                className="w-3.5 h-3.5 text-gray-400 pointer-events-auto cursor-pointer"
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
            )}
          </div>
        </div>
      </div>

      {/* Assistance Type Dropdown */}
      <div className="flex flex-col min-w-[170px]">
        <label className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
          <Tags className="w-3.5 h-3.5 text-gray-500" />
          Assistance Type
        </label>
        <div className="relative">
          <select
            value={heatType}
            onChange={e => setHeatType(e.target.value)}
            className="w-full px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:ring-2 focus:ring-[#003a76]/10 focus:border-[#003a76] outline-none transition-all text-gray-800 hover:border-gray-400 appearance-none cursor-pointer pr-9"
          >
            <option value="ALL">All Types</option>
            {ASSISTANCE_TYPES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
            {heatType !== "ALL" ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setHeatType("ALL");
                }}
                className="p-0.5 hover:bg-gray-100 rounded transition-all cursor-pointer pointer-events-auto"
                type="button"
              >
                <X className="w-3.5 h-3.5 text-gray-500 hover:text-gray-700" />
              </button>
            ) : (
              <svg
                className="w-3.5 h-3.5 text-gray-400 pointer-events-auto cursor-pointer"
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
            )}
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          setSelectedCity("ALL");
          setHeatType("ALL");
        }}
        className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-all border border-gray-300 hover:border-gray-400"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reset
      </button>
    </div>
  </div>
</AnalyticsCard>

        {/* Map Card - MODIFIED */}
        <AnalyticsCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#003a76] rounded-lg">
                <MapIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">Heatmap Visualization</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Density map of applicant locations
                </p>
              </div>
            </div>

            {/* Export Button - Moved here */}
            <button
              onClick={exportMapPNG}
              className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border bg-white text-gray-700 hover:bg-gray-100 transition font-medium shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export PNG
            </button>
          </div>

          <div
            ref={mapRef}
            className="relative h-[500px] rounded-xl overflow-hidden border border-gray-200"
          >
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-50">
                <div className="bg-white rounded-2xl p-10 shadow-xl border border-blue-100 flex flex-col items-center gap-6">
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                  <div className="text-center space-y-1">
                    <h3 className="text-xl font-bold text-blue-700">Generating Heatmap</h3>
                    <p className="text-sm text-gray-500 font-medium">
                      Processing {locations.length} location points...
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <MapContainer
                center={[13.9, 121.475]}
                zoom={11}
                minZoom={11}
                maxZoom={17}
                className="w-full h-full z-0"
                scrollWheelZoom
                zoomControl
                preferCanvas={true}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {districtGeo && (
                  <>
                    <GeoJSON
                      data={districtGeo}
                      style={{
                        color: "#3b82f6",
                        weight: 3,
                        fillOpacity: 0.1,
                        opacity: 0.8,
                      }}
                    />
                    <DistrictBounds geoData={districtGeo} />
                  </>
                )}
                <HeatLayer points={filteredHeatLocations} />
              </MapContainer>
            )}
          </div>
        </AnalyticsCard>

        {/* Legend Card */}
        <AnalyticsCard>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-[#003a76] rounded-lg">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">Heatmap Intensity Legend</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Color scale represents applicant density
              </p>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-700 font-medium">Low Concentration</span>
              <span className="text-xs text-gray-700 font-medium">High Concentration</span>
            </div>
            <div className="h-4 rounded-full bg-gradient-to-r from-[#12e200] via-[#fbb021]via-[#f68838] to-[#ee3e32] shadow-sm"></div>
          </div>
        </AnalyticsCard>
      </AnalyticsStack>
    </PageContainer>
  );
};

export default Geographic;

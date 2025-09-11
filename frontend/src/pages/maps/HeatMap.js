import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import L from "leaflet";
import { api } from "../../services/api";
import {
  Filter,
  RotateCcw,
  Users,
  Map as MapIcon,
  Loader2,
  TrendingUp,
  Activity,
  BarChart3,
} from "lucide-react";

const assistanceColors = {
  Medical: "#38b2ac",
  Burial: "#1a202c",
  Educational: "#2d3748",
};
const assistanceTypes = ["Medical", "Burial", "Educational"];
const districtCities = [
  "Lucena City",
  "Sariaya",
  "Candelaria",
  "Tiaong",
  "San Antonio",
  "Dolores",
];

// Auto-fit map to District 2 boundary
const DistrictBounds = ({ geoData }) => {
  const map = useMap();
  useEffect(() => {
    if (geoData) {
      const bounds = L.geoJSON(geoData).getBounds();
      map.fitBounds(bounds);
      map.setMaxBounds(bounds);
    }
  }, [geoData, map]);
  return null;
};

// HeatLayer
const HeatLayer = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const heatData = points.map(p => [p.latitude, p.longitude, 0.8]);
    const heatLayer = window.L.heatLayer(heatData, {
      radius: 30,
      blur: 20,
      maxZoom: 15,
      gradient: {
        0.2: "#4ade80",
        0.4: "#22d3ee",
        0.6: "#3b82f6",
        0.8: "#f97316",
        1.0: "#ef4444",
      },
    }).addTo(map);
    return () => map.removeLayer(heatLayer);
  }, [points, map]);
  return null;
};

const HeatMap = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [districtGeo, setDistrictGeo] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [stats, setStats] = useState({});

  // Fetch applicants
  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const res = await api.get("/applicant-locations/", {
          params: { type: typeFilter },
        });
        const valid = res.data.filter(
          loc => loc.latitude && loc.longitude && districtCities.includes(loc.city)
        );
        setLocations(valid);

        const typeCounts = {};
        assistanceTypes.forEach(type => {
          typeCounts[type] = valid.filter(l => l.type_of_assistance === type).length;
        });
        setStats(typeCounts);
      } catch (err) {
        console.error("Error fetching applicants:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, [typeFilter]);

  // Load district boundary
  useEffect(() => {
    fetch("/all_cities.geojson")
      .then(res => res.json())
      .then(setDistrictGeo)
      .catch(err => console.error("Error loading district geojson:", err));
  }, []);

  return (
    <div className="min-h-screen bg-quickaid-bg">
      <div className="flex flex-col xl:flex-row min-h-[calc(100vh-5rem)]">
        {/* Map Container */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-quickaid-bg z-10">
              <div className="bg-quickaid-surface rounded-xl p-8 shadow-lg border">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 text-quickaid-accent animate-spin" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-quickaid-text-primary">
                      Loading Heatmap
                    </h3>
                    <p className="text-sm text-quickaid-text-secondary">
                      Fetching applicant locations...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[500px] xl:h-[650px] bg-white shadow-sm rounded-lg overflow-hidden">
              <MapContainer
                center={[13.9, 121.475]}
                zoom={11.4}
                className="w-full h-full min-h-[500px] xl:min-h-full"
                minZoom={10}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                {districtGeo && (
                  <>
                    <GeoJSON
                      data={districtGeo}
                      style={{ color: "#f87171", weight: 2, fillOpacity: 0 }}
                    />
                    <DistrictBounds geoData={districtGeo} />
                  </>
                )}
                <HeatLayer points={locations} />
              </MapContainer>
            </div>
          )}
        </div>

        {/* Enhanced Sidebar */}
        <aside className="w-full xl:w-96 bg-quickaid-surface border-t xl:border-l border-slate-200">
          <div className="p-6">
            {/* Sidebar Title */}
            <div className="mb-8">
              <h1 className="text-xl font-bold text-quickaid-text-primary flex items-center gap-3">
                <div className="p-2 bg-quickaid-accent/10 rounded-lg">
                  <Activity className="w-6 h-6 text-quickaid-accent" />
                </div>
                District 2 Assistance Heatmap
              </h1>
              <p className="text-sm text-quickaid-text-secondary mt-1">
                Geographic visualization of assistance requests across District 2
                municipalities
              </p>
            </div>

            {/* Filter Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-quickaid-accent/10 rounded-lg">
                  <Filter className="w-4 h-4 text-quickaid-accent" />
                </div>
                <h2 className="text-lg font-semibold text-quickaid-text-primary">
                  Filters & Controls
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-quickaid-text-primary mb-2">
                    Type of Assistance
                  </label>
                  <select
                    className="select select-bordered w-full bg-white border-slate-200 focus:border-quickaid-accent focus:ring-2 focus:ring-quickaid-accent/20"
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                  >
                    <option value="">All Types</option>
                    {assistanceTypes.map(type => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                  onClick={() => setTypeFilter("")}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Filter
                </button>
              </div>
            </div>

            {/* Statistics Overview */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-quickaid-accent/10 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-quickaid-accent" />
                </div>
                <h3 className="text-lg font-semibold text-quickaid-text-primary">Overview</h3>
              </div>

              {/* Total Applicants Card */}
              <div className="bg-gradient-to-r from-quickaid-accent to-blue-700 rounded-xl p-4 text-white mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Applicants</p>
                    <p className="text-2xl font-bold">{locations.length.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-lg">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Assistance Type Breakdown */}
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(stats).map(([type, count]) => {
                  const percentage = locations.length ? (count / locations.length) * 100 : 0;
                  return (
                    <div
                      key={type}
                      className="bg-slate-50 rounded-lg p-3 border border-slate-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: assistanceColors[type] }}
                          />
                          <span className="text-sm font-medium text-quickaid-text-primary">
                            {type}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-quickaid-text-primary">
                          {count}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: assistanceColors[type],
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs text-quickaid-text-secondary mt-1">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Geographic Analysis */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-quickaid-accent/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-quickaid-accent" />
                </div>
                <h3 className="text-lg font-semibold text-quickaid-text-primary">
                  Geographic Analysis
                </h3>
              </div>

              {/* Top Cities */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-quickaid-text-primary mb-3">
                  Top Cities by Applications
                </h4>
                <div className="space-y-2">
                  {Object.entries(
                    locations.reduce((acc, loc) => {
                      acc[loc.city] = (acc[loc.city] || 0) + 1;
                      return acc;
                    }, {})
                  )
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([city, count], index) => (
                      <div
                        key={city}
                        className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              index === 0
                                ? "bg-yellow-500"
                                : index === 1
                                ? "bg-gray-400"
                                : index === 2
                                ? "bg-amber-600"
                                : "bg-slate-400"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium text-quickaid-text-primary">
                            {city}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-quickaid-accent">
                          {count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              {/* Top Barangay */}
              <div>
                <h4 className="text-sm font-semibold text-quickaid-text-primary mb-3">
                  Most Active Barangay
                </h4>
                {(() => {
                  const brgyCounts = locations.reduce((acc, loc) => {
                    acc[loc.barangay] = (acc[loc.barangay] || 0) + 1;
                    return acc;
                  }, {});
                  const top = Object.entries(brgyCounts).sort((a, b) => b[1] - a[1])[0];
                  return top ? (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <MapIcon className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-800">{top[0]}</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        {top[1]} total applications
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <p className="text-sm text-slate-500">No data available</p>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Heat Intensity Legend */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-quickaid-accent/10 rounded-lg">
                  <MapIcon className="w-4 h-4 text-quickaid-accent" />
                </div>
                <h4 className="text-xs font-semibold text-quickaid-text-primary">
                  Heat Intensity
                </h4>
              </div>
              <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-600">Low</span>
                  <span className="text-xs text-slate-600">High</span>
                </div>
                <div className="h-2 rounded-full bg-gradient-to-r from-green-400 via-blue-500 via-orange-500 to-red-500"></div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Few</span>
                  <span>Many</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HeatMap;

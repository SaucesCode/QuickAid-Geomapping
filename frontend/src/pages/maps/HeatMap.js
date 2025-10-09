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
  Layers
} from "lucide-react";

// District 2 municipalities
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
    const heatData = points.map((p) => [p.latitude, p.longitude, 0.8]);
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

    // Fade in animation
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
        setLoading(false);
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

  return (
    <div className="min-h-screen bg-quickaid-bg p-6">
      {/* Fix for Leaflet z-index overlap */}
      <style>{`
        .leaflet-container {
          z-index: 0 !important;
          position: relative !important;
        }
        .leaflet-pane,
        .leaflet-control,
        .leaflet-top,
        .leaflet-bottom {
          z-index: 0 !important;
        }
        .leaflet-overlay-pane {
          z-index: 1 !important;
        }
      `}</style>

      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-9 h-9 bg-quickaid-accent/10 rounded-md flex items-center justify-center">
            <MapPin className="w-5 h-5 text-quickaid-accent" />
          </div>
          <h1 className="text-2xl font-bold text-quickaid-text-primary">
            Geographic Analytics
          </h1>
        </div>
        <p className="text-sm text-quickaid-text-secondary">
          A geographic heatmap preview showing where applicants are concentrated
          in District 2.
        </p>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-600" />
          <div>
            <p className="text-sm text-slate-500">Total Applicants</p>
            <h2 className="text-xl font-semibold text-slate-900">
              {locations.length}
            </h2>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
          <Activity className="w-6 h-6 text-emerald-600" />
          <div>
            <p className="text-sm text-slate-500">Cities Covered</p>
            <h2 className="text-xl font-semibold text-slate-900">
              {
                new Set(locations.map((l) => l.city).filter((c) => c))
                  .size
              }
            </h2>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-orange-600" />
          <div>
            <p className="text-sm text-slate-500">Top City</p>
            <h2 className="text-xl font-semibold text-slate-900">
              {(() => {
                const counts = locations.reduce((acc, loc) => {
                  acc[loc.city] = (acc[loc.city] || 0) + 1;
                  return acc;
                }, {});
                const top = Object.entries(counts).sort(
                  (a, b) => b[1] - a[1]
                )[0];
                return top ? top[0] : "N/A";
              })()}
            </h2>
          </div>
        </div>
      </section>

      {/* Map Preview */}
      <div className="relative h-[550px] bg-white shadow-sm rounded-lg overflow-hidden">
        {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-quickaid-bg z-10">
                  <div className="bg-quickaid-surface rounded-xl p-8 shadow-lg border">
                    <div className="flex flex-col items-center gap-4">
                      {/* Spinner with centered MapPin */}
                      <div className="relative flex items-center justify-center">
                        <div className="h-20 w-20 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                        <Layers className="absolute h-8 w-8 text-blue-600" />
                      </div>
        
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
          <div className="relative z-0">
            <MapContainer
              center={[13.9, 121.475]}
              zoom={11.4}
              className="w-full h-[550px] rounded-lg z-0"
              minZoom={10}
              scrollWheelZoom
              zoomControl
              style={{ position: "relative" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {districtGeo && (
                <>
                  <GeoJSON
                    data={districtGeo}
                    style={{
                      color: "#f87171",
                      weight: 2,
                      fillOpacity: 0,
                    }}
                  />
                  <DistrictBounds geoData={districtGeo} />
                </>
              )}
              <HeatLayer points={locations} />
            </MapContainer>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-1">
          <MapIcon className="w-4 h-4 text-quickaid-accent" />
          <span className="text-xs font-semibold text-quickaid-text-primary">
            Heat Intensity
          </span>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-600">Low</span>
            <span className="text-xs text-slate-600">High</span>
          </div>
          <div className="h-2 rounded-full bg-gradient-to-r from-green-400 via-blue-500 via-orange-500 to-red-500"></div>
        </div>
      </div>
    </div>
  );
};

export default Geographic;

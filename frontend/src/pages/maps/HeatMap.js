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
        map.fitBounds(bounds.pad(0.05), { maxZoom: 50, padding: [20, 20] });
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

    const heatData = points.map(p => [p.latitude, p.longitude, 0.8]);

    const heatLayer = window.L.heatLayer(heatData, {
      radius: 30,
      blur: 20,
      maxZoom: 15,
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

        {/* Map Card */}
        <AnalyticsCard>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <MapIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">Heatmap Visualization</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Density map of applicant locations
                </p>
              </div>
            </div>
          </div>

          <div className="relative h-[500px] rounded-xl overflow-hidden border border-gray-200">
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
              <div className="relative z-0 h-full">
                <MapContainer
                  center={[13.9, 121.475]}
                  zoom={12}
                  className="w-full h-full z-0"
                  minZoom={10}
                  scrollWheelZoom
                  zoomControl
                  preferCanvas={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
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
                  <HeatLayer points={locations} />
                </MapContainer>
              </div>
            )}
          </div>
        </AnalyticsCard>

        {/* Legend Card */}
        <AnalyticsCard>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
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
            <div className="h-4 rounded-full bg-gradient-to-r from-sky-300 via-blue-500 via-indigo-600 to-purple-700 shadow-sm"></div>
          </div>
        </AnalyticsCard>
      </AnalyticsStack>
    </PageContainer>
  );
};

export default Geographic;

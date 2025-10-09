import React, { useEffect, useState } from "react";
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
  Loader2,
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

L.Marker.prototype.options.icon = DefaultIcon;

// Default center (Quezon Province)
const defaultCenter = [13.938, 121.508];

// Colors
const assistanceColors = {
  Medical: "#38b2ac",
  Burial: "#1a202c",
  Educational: "#2d3748",
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

// ============= MAIN MAP COMPONENT =============
const MapComponent = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("");
  const [availableBarangays, setAvailableBarangays] = useState([]);
  const [stats, setStats] = useState({});
  const [mapCenter] = useState(defaultCenter);
  const [markerOffsets, setMarkerOffsets] = useState({});
  const [geoData, setGeoData] = useState(null);
  const [cityGeoData, setCityGeoData] = useState(null);

  const getColor = (type) => assistanceColors[type] || "#f87171";

  const resetFilters = () => {
    setTypeFilter("");
    setCityFilter("");
    setBarangayFilter("");
    setCityGeoData(null);
  };

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await api.get("/applicant-locations/", {
        params: { type: typeFilter, city: cityFilter, barangay: barangayFilter },
      });

      const data = res.data;
      const valid = data.filter(
        (loc) => loc.latitude && loc.longitude && !isNaN(loc.latitude)
      );
      setLocations(valid);

      const offsets = {};
      valid.forEach((loc) => {
        const key = loc.id || loc.full_name;
        offsets[key] = {
          latOffset: (Math.random() - 0.5) * 0.0005,
          lngOffset: (Math.random() - 0.5) * 0.0005,
        };
      });
      setMarkerOffsets(offsets);

      const typeCounts = {};
      assistanceTypes.forEach((t) => {
        typeCounts[t] = valid.filter((l) => l.type_of_assistance === t).length;
      });
      setStats(typeCounts);
    } catch (err) {
      console.error("Error fetching locations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "QuickAid | Geolocation Map";
    fetchLocations();
    fetch("/all_cities.geojson")
      .then((r) => r.json())
      .then(setGeoData);
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [typeFilter, cityFilter, barangayFilter]);

  useEffect(() => {
    const brgys = locations
      .filter((loc) => (cityFilter ? loc.city === cityFilter : true))
      .map((loc) => loc.barangay);
    setAvailableBarangays([...new Set(brgys)].sort());
  }, [locations, cityFilter]);

  useEffect(() => {
    const loadCityGeo = async () => {
      if (!cityFilter) return setCityGeoData(null);
      const fileName = cityFilter.toLowerCase().replace(/ /g, "_") + ".geojson";
      try {
        const res = await fetch(`/${fileName}`);
        if (!res.ok) throw new Error("Error loading GeoJSON");
        const data = await res.json();
        setCityGeoData(data);
      } catch (e) {
        console.error("Error loading city geojson:", e);
      }
    };
    loadCityGeo();
  }, [cityFilter]);

  // ============= RENDER =============
  return (
    <div className="relative h-[calc(100vh-4rem)] bg-quickaid-bg overflow-hidden mt-16">
      <div className="flex flex-col xl:flex-row h-full">
        {/* Map Container */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-quickaid-bg z-50">
              <div className="bg-quickaid-surface rounded-xl p-8 shadow-lg border flex flex-col items-center gap-4">
                <div className="relative flex items-center justify-center">
                  <div className="h-20 w-20 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
                  <MapPin className="absolute h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-quickaid-text-primary mt-4">
                  Loading Map
                </h3>
                <p className="text-sm text-quickaid-text-secondary">
                  Fetching applicant locations...
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white shadow-sm">
              <MapContainer center={mapCenter} zoom={11} className="w-full h-full">
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapBounds cityGeoData={cityGeoData} />

                {geoData && (
                  <GeoJSON
                    data={geoData}
                    style={{ color: "#f87171", weight: 3, fillOpacity: 0 }}
                  />
                )}
                {cityGeoData && (
                  <GeoJSON
                    data={cityGeoData}
                    style={{ color: "#38b2ac", weight: 1, fillOpacity: 0.2 }}
                  />
                )}

                {locations.map((loc, i) => {
                  const key = loc.id || loc.full_name;
                  const offset = markerOffsets[key] || { latOffset: 0, lngOffset: 0 };
                  return (
                    <React.Fragment key={key || i}>
                      <Marker
                        position={[
                          loc.latitude + offset.latOffset,
                          loc.longitude + offset.lngOffset,
                        ]}
                        icon={DefaultIcon}
                      >
                        <Popup>
                          <div className="p-2">
                            <h3 className="font-semibold text-quickaid-text-primary mb-1">
                              {loc.full_name}
                            </h3>
                            <p className="text-sm text-quickaid-text-secondary mb-2">
                              {loc.address}
                            </p>
                            <span
                              className="inline-block px-2 py-1 rounded-full text-xs text-white"
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
                          fillOpacity: 0.2,
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

        {/* Sidebar */}
        <aside className="w-full xl:w-80 bg-quickaid-surface border-t xl:border-l border-slate-200 flex flex-col">
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="mb-6 sticky top-0 bg-quickaid-surface z-10 pb-4 border-b">
              <h1 className="text-lg font-bold text-quickaid-text-primary flex items-center gap-2">
                <div className="p-1.5 bg-quickaid-accent/10 rounded-lg">
                  <MapPin className="w-5 h-5 text-quickaid-accent" />
                </div>
                Applicant Location Map
              </h1>
            </div>

            {/* Filters */}
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-quickaid-text-primary mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4 text-quickaid-accent" />
                Filters
              </h2>

              <div className="space-y-3">
                <select
                  className="select select-sm select-bordered w-full bg-white"
                  onChange={(e) => setTypeFilter(e.target.value)}
                  value={typeFilter}
                >
                  <option value="">All Types</option>
                  {assistanceTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <select
                  className="select select-sm select-bordered w-full bg-white"
                  onChange={(e) => setCityFilter(e.target.value)}
                  value={cityFilter}
                >
                  <option value="">All Cities</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                {cityFilter && (
                  <select
                    className="select select-sm select-bordered w-full bg-white"
                    onChange={(e) => setBarangayFilter(e.target.value)}
                    value={barangayFilter}
                  >
                    <option value="">All Barangays</option>
                    {availableBarangays.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  className="btn btn-xs w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                  onClick={resetFilters}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                {typeFilter && (
                  <span className="badge badge-sm bg-blue-100 text-blue-700">
                    Type: {typeFilter}
                  </span>
                )}
                {cityFilter && (
                  <span className="badge badge-sm bg-green-100 text-green-700">
                    City: {cityFilter}
                  </span>
                )}
                {barangayFilter && (
                  <span className="badge badge-sm bg-purple-100 text-purple-700">
                    Brgy: {barangayFilter}
                  </span>
                )}
              </div>
            </div>

            {/* Overview */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-quickaid-text-primary mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-quickaid-accent" />
                Overview
              </h3>

              <div className="bg-gradient-to-r from-quickaid-accent to-blue-700 rounded-lg p-3 text-white mb-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-xl font-bold">{locations.length}</p>
                </div>
              </div>

              <div className="space-y-2">
                {Object.entries(assistanceColors).map(([type, color]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      {type}
                    </div>
                    <span className="font-semibold">{stats[type] || 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border-t bg-slate-50">
            <h4 className="text-xs font-semibold text-slate-600 mb-2">Legend</h4>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-300 border border-red-400 rounded" />
                Province Boundary
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-200 border border-teal-500 rounded" />
                Selected City
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-slate-600" />
                Applicant Location
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MapComponent;

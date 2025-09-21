import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapPin,
  Users,
  Building2,
  Activity,
  Loader2,
  TrendingUp,
  AlertCircle,
  BarChart3,
  Map,
  Clock,
  Target,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api } from "../../services/api";

const Geographic = () => {
  const [locations, setLocations] = useState([]);
  const [topBarangays, setTopBarangays] = useState([]);
  const [barangayByType, setBarangayByType] = useState([]);
  const [approvalRates, setApprovalRates] = useState([]);
  const [inactiveApplicants, setInactiveApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalApplicants: 0,
    topBarangay: "N/A",
    barangayCount: 0,
    avgApprovalRate: 0,
    inactiveCount: 0,
  });

  // Fetch all geographic data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [locationsRes, barangaysRes, typeRes, approvalRes, inactiveRes] =
          await Promise.all([
            api.get("/analytics/geographic/locations/"),
            api.get("/analytics/geographic/top-barangays/"),
            api.get("/analytics/geographic/barangay-by-type/"),
            api.get("/analytics/geographic/approval-rate/"),
            api.get("/analytics/geographic/inactive-applicants/"),
          ]);

        // ✅ use .data
        const validLocations = (locationsRes.data || []).filter(
          loc => loc.latitude && loc.longitude
        );

        console.log("Fetched Locations:", locationsRes.data);
        console.log("Valid Locations:", validLocations);
        console.log("Top Barangays:", barangaysRes.data);
        console.log("Barangay by Type:", typeRes.data);
        console.log("Approval Rates:", approvalRes.data);
        console.log("Inactive Applicants:", inactiveRes.data);

        setLocations(validLocations);
        setTopBarangays(barangaysRes.data || []);
        setBarangayByType(typeRes.data || []);
        setApprovalRates(approvalRes.data || []);
        setInactiveApplicants(inactiveRes.data || []);

        // Calculate comprehensive stats
        const totalApplicants = validLocations.length;

        // Find top barangay
        const topBarangay =
          topBarangays.length > 0
            ? topBarangays[0].background_info__barangay__name || "N/A"
            : "N/A";

        // Count unique barangays
        const barangayCount = [...new Set(validLocations.map(loc => loc.barangay))].length;

        // Calculate average approval rate
        const avgApprovalRate =
          approvalRates.length > 0
            ? (
                approvalRates.reduce((sum, item) => sum + (item.approval_rate || 0), 0) /
                approvalRates.length
              ).toFixed(1)
            : 0;

        setStats({
          totalApplicants,
          topBarangay,
          barangayCount,
          avgApprovalRate,
          inactiveCount: inactiveApplicants.length,
        });

        // Initialize heatmap
        initializeHeatmap(validLocations);
      } catch (err) {
        console.error("Error fetching geographic data:", err);
        setError("Failed to load geographic data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize heatmap when locations are available
  const initializeHeatmap = locationData => {
    setTimeout(() => {
      const mapContainer = document.querySelector(".leaflet-container");
      if (!mapContainer || !locationData.length) return;

      const map = mapContainer._leaflet_map;
      if (!map) return;

      // Clear existing heat layers
      map.eachLayer(layer => {
        if (layer._heat) {
          map.removeLayer(layer);
        }
      });

      // Create heatmap data
      const heatData = locationData.map(loc => [loc.latitude, loc.longitude, 1.0]);

      // Add heatmap layer using Leaflet.heat
      if (L.heatLayer) {
        const heatLayer = L.heatLayer(heatData, {
          radius: 20,
          blur: 15,
          maxZoom: 12,
          gradient: {
            0.2: "#4ade80",
            0.4: "#22d3ee",
            0.6: "#3b82f6",
            0.8: "#f97316",
            1.0: "#ef4444",
          },
        });
        heatLayer.addTo(map);
      }
    }, 500);
  };

  // Process data for barangay type chart
  const processBarangayTypeData = () => {
    const barangays = [
      ...new Set(barangayByType.map(item => item.background_info__barangay__name)),
    ];
    return barangays.slice(0, 6).map(barangay => {
      const items = barangayByType.filter(
        item => item.background_info__barangay__name === barangay
      );
      const result = {
        barangay: barangay.length > 15 ? barangay.substring(0, 15) + "..." : barangay,
      };
      items.forEach(item => {
        result[item.type_of_assistance] = item.count;
      });
      return result;
    });
  };

  // Process approval rate data for pie chart
  const processApprovalData = () => {
    if (!approvalRates.length) return [];

    return approvalRates.slice(0, 5).map(item => ({
      name: item.location,
      value: item.approval_rate,
      total: item.total,
      approved: item.approved,
    }));
  };

  const chartData = processBarangayTypeData();
  const pieData = processApprovalData();

  // Colors for pie chart
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading geographic analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <header>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Geographic Analytics</h1>
              <p className="text-gray-600">Spatial distribution insights across all regions</p>
            </div>
          </div>

          {/* Navigation to Full Heatmap */}
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Map className="w-4 h-4" />
            View Full Heatmap
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Mapped</p>
              <h2 className="text-2xl font-bold text-gray-900">
                {stats.totalApplicants.toLocaleString()}
              </h2>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Top Barangay</p>
              <h2 className="text-lg font-bold text-gray-900">{stats.topBarangay}</h2>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Barangays</p>
              <h2 className="text-2xl font-bold text-gray-900">{stats.barangayCount}</h2>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Avg Approval</p>
              <h2 className="text-2xl font-bold text-gray-900">{stats.avgApprovalRate}%</h2>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Inactive</p>
              <h2 className="text-2xl font-bold text-gray-900">{stats.inactiveCount}</h2>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Heatmap */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Distribution Heatmap Preview
            </h3>
          </div>
          <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
            View Full Map
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="h-[350px] relative">
          <MapContainer
            center={[13.9311, 121.5542]}
            zoom={10}
            className="w-full h-full"
            scrollWheelZoom={false}
            doubleClickZoom={false}
            dragging={false}
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </MapContainer>

          {/* Overlay to indicate it's a preview */}
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 cursor-pointer flex items-center justify-center">
            <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity">
              <p className="text-sm font-medium text-gray-900">
                Click to view interactive map
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Barangays */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Top Barangays by Applications
            </h3>
          </div>
          {topBarangays.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={topBarangays.slice(0, 8)}
                margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="background_info__barangay__name"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-280 flex items-center justify-center text-gray-500">
              <p>No barangay data available</p>
            </div>
          )}
        </div>

        {/* Approval Rates Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Approval Rates by Location</h3>
          </div>
          {pieData.length > 0 ? (
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${value}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value, name, props) => [
                      `${value}% (${props.payload.approved}/${props.payload.total})`,
                      "Approval Rate",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {pieData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm text-gray-700">{item.name}</span>
                    <span className="text-sm text-gray-500 ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-280 flex items-center justify-center text-gray-500">
              <p>No approval data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Assistance Types by Barangay */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Assistance Types Distribution by Barangay
          </h3>
        </div>
        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="barangay"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "14px",
                  }}
                />
                <Bar dataKey="Medical" stackId="a" fill="#ef4444" />
                <Bar dataKey="Educational" stackId="a" fill="#3b82f6" />
                <Bar dataKey="Burial" stackId="a" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Medical</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Educational</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span className="text-sm text-gray-600">Burial</span>
              </div>
            </div>
          </>
        ) : (
          <div className="h-350 flex items-center justify-center text-gray-500">
            <p>No assistance type data available</p>
          </div>
        )}
      </div>

      {/* Inactive Applicants Alert */}
      {inactiveApplicants.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                Geographic Distribution Alert
              </h3>
              <p className="text-orange-700 mb-4">
                {inactiveApplicants.length} applicants from various locations haven't submitted
                new applications in over 6 months. This may indicate gaps in outreach coverage.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {inactiveApplicants.slice(0, 3).map(applicant => (
                  <div
                    key={applicant.id}
                    className="bg-white p-3 rounded-lg border border-orange-200"
                  >
                    <span className="font-medium text-gray-900 block">{applicant.name}</span>
                    <span className="text-sm text-gray-500">
                      Last: {new Date(applicant.last_application).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
              {inactiveApplicants.length > 3 && (
                <p className="text-sm text-orange-600 mt-3 font-medium">
                  +{inactiveApplicants.length - 3} more inactive applicants across different
                  areas
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Geographic;

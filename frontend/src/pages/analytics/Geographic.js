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
  Sparkles,
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

        const totalApplicants = validLocations.length;

        const topBarangay =
          topBarangays.length > 0
            ? topBarangays[0].background_info__barangay__name || "N/A"
            : "N/A";

        const barangayCount = [...new Set(validLocations.map(loc => loc.barangay))].length;

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

  const initializeHeatmap = locationData => {
    setTimeout(() => {
      const mapContainer = document.querySelector(".leaflet-container");
      if (!mapContainer || !locationData.length) return;

      const map = mapContainer._leaflet_map;
      if (!map) return;

      map.eachLayer(layer => {
        if (layer._heat) {
          map.removeLayer(layer);
        }
      });

      const heatData = locationData.map(loc => [loc.latitude, loc.longitude, 1.0]);

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

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>
        
        <div className="relative z-10 flex flex-col items-center bg-white bg-opacity-80 backdrop-blur-xl p-12 rounded-3xl shadow-2xl border border-blue-200">
          <div className="relative flex items-center justify-center mb-6">
            <div className="h-24 w-24 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
            <div className="absolute flex items-center justify-center">
              <MapPin className="h-10 w-10 text-blue-600 animate-pulse" />
            </div>
          </div>
  
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center gap-2 mb-3">
            Loading Geographic Data
          </h2>
          <p className="text-gray-600 text-base max-w-md">
            Please wait while we fetch the latest analytics and insights...
          </p>
          
          <div className="flex gap-2 mt-6">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-100"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-red-50 to-indigo-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        </div>
        
        <div className="relative z-10 bg-white p-10 rounded-3xl shadow-2xl border border-red-200 max-w-md w-full mx-4">
          <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-6 shadow-lg">
            <AlertCircle className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Error Loading Data
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {error.message || "Failed to fetch trends data. Please try again later."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <header className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
                  Geographic Analytics
                </h1>
                <p className="text-gray-600 text-lg mt-1">Spatial distribution insights across all regions</p>
              </div>
            </div>

            <button className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
              <Map className="w-5 h-5" />
              <span className="text-white">View Full Heatmap</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </header>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="group bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-blue-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">Total Mapped</p>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
                  {stats.totalApplicants.toLocaleString()}
                </h2>
              </div>
            </div>
          </div>

          <div className="group bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-emerald-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">Top Barangay</p>
                <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-emerald-700">
                  {stats.topBarangay}
                </h2>
              </div>
            </div>
          </div>

          <div className="group bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-purple-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">Barangays</p>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-700">
                  {stats.barangayCount}
                </h2>
              </div>
            </div>
          </div>

          <div className="group bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-green-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">Avg Approval</p>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-700">
                  {stats.avgApprovalRate}%
                </h2>
              </div>
            </div>
          </div>

          <div className="group bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-orange-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold">Inactive</p>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-700">
                  {stats.inactiveCount}
                </h2>
              </div>
            </div>
          </div>
        </section>

        {/* Preview Heatmap */}
        <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-blue-200">
          <div className="p-6 border-b border-blue-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-md">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Distribution Heatmap Preview
              </h3>
            </div>
            <button className="group flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              <span>View Full Map</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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

            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 cursor-pointer flex items-center justify-center group">
              <div className="bg-white bg-opacity-95 backdrop-blur-sm px-6 py-3 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all transform scale-95 group-hover:scale-100 border border-blue-200">
                <p className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Click to view interactive map
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Barangays */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-md">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Top Barangays by Applications
              </h3>
            </div>
            {topBarangays.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={topBarangays.slice(0, 8)}
                  margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis
                    dataKey="background_info__barangay__name"
                    tick={{ fontSize: 11, fill: '#4b5563' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#4b5563' }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "2px solid #dbeafe",
                      borderRadius: "12px",
                      fontSize: "14px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                    }}
                  />
                  <Bar dataKey="count" fill="url(#blueGradient)" radius={[8, 8, 0, 0]} />
                  <defs>
                    <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-280 flex items-center justify-center text-gray-500">
                <p>No barangay data available</p>
              </div>
            )}
          </div>

          {/* Approval Rates Distribution */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-lg flex items-center justify-center shadow-md">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Approval Rates by Location</h3>
            </div>
            {pieData.length > 0 ? (
              <div className="flex items-center">
                <ResponsiveContainer width="60%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${value}%`}
                      strokeWidth={3}
                      stroke="#fff"
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
                      contentStyle={{
                        backgroundColor: "white",
                        border: "2px solid #dbeafe",
                        borderRadius: "12px",
                        fontSize: "14px",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {pieData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                      <div
                        className="w-4 h-4 rounded-md shadow-sm"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700 flex-1">{item.name}</span>
                      <span className="text-sm font-bold text-gray-900">{item.value}%</span>
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
        <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Assistance Types Distribution by Barangay
            </h3>
          </div>
          {chartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis
                    dataKey="barangay"
                    tick={{ fontSize: 11, fill: '#4b5563' }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#4b5563' }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "2px solid #dbeafe",
                      borderRadius: "12px",
                      fontSize: "14px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                    }}
                  />
                  <Bar dataKey="Medical" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Educational" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Burial" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <div className="flex justify-center gap-8 mt-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-200">
                  <div className="w-4 h-4 bg-red-500 rounded-md shadow-sm"></div>
                  <span className="text-sm font-semibold text-gray-700">Medical</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-4 h-4 bg-blue-500 rounded-md shadow-sm"></div>
                  <span className="text-sm font-semibold text-gray-700">Educational</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="w-4 h-4 bg-orange-500 rounded-md shadow-sm"></div>
                  <span className="text-sm font-semibold text-gray-700">Burial</span>
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
          <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 rounded-3xl p-8 shadow-xl backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-orange-900 mb-3">
                  Geographic Distribution Alert
                </h3>
                <p className="text-orange-800 mb-6 leading-relaxed text-base">
                  {inactiveApplicants.length} applicants from various locations haven't submitted
                  new applications in over 6 months. This may indicate gaps in outreach coverage.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {inactiveApplicants.slice(0, 3).map(applicant => (
                    <div
                      key={applicant.id}
                      className="bg-white p-4 rounded-xl border-2 border-orange-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <span className="font-bold text-gray-900 block text-lg mb-1">{applicant.name}</span>
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Last: {new Date(applicant.last_application).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
                {inactiveApplicants.length > 3 && (
                  <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-100 rounded-lg border border-orange-300">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    <p className="text-sm text-orange-700 font-semibold">
                      +{inactiveApplicants.length - 3} more inactive applicants across different areas
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Geographic;
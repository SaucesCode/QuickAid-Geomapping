import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapPin,
  Users,
  Building2,
  Activity,
  Clock,
  Target,
  BarChart3,
  TrendingUp,
  AlertCircle,
  Loader2,
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
  Legend,
} from "recharts";
import { api } from "../../services/api"; // Assuming your API service path is correct

// Custom Heatmap Icon setup (for Leaflet to work correctly with Webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// --- StatCard Component (Consistent) ---
const StatCard = ({ icon: Icon, title, value, subtitle, color, isLoading }) => (
  <div
    className="bg-white rounded-xl shadow-lg p-6 border-l-4"
    style={{ borderLeftColor: color }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        {isLoading ? (
          <div className="mt-1 space-y-2">
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            {subtitle && <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>}
          </div>
        ) : (
          <>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </>
        )}
      </div>
      <div className="p-3 rounded-full" style={{ backgroundColor: color + "20" }}>
        <Icon className="h-6 w-6" style={{ color }} />
      </div>
    </div>
  </div>
);
// --- End StatCard Component ---

// --- Custom Tooltip Component for Charts (Consistent) ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white border border-gray-200 shadow-lg rounded-lg text-sm">
        <p className="font-bold text-gray-800 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: <span className="font-semibold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};
// --- End Custom Tooltip Component ---

// --- Loading/Skeleton Components (Consistent) ---
const LoadingChartSkeleton = ({ height = 300, title = "Loading Chart..." }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
        <h3 className="text-xl font-bold text-gray-400">{title}</h3>
      </div>
      <div className="flex items-center justify-center bg-gray-100 rounded-xl" style={{ height: `${height}px` }}>
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    </div>
);

const LoadingMapSkeleton = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 animate-pulse">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
          <h3 className="text-xl font-bold text-gray-400">
            Distribution Heatmap Preview
          </h3>
        </div>
      </div>
      <div className="h-[350px] relative bg-gray-300 flex items-center justify-center">
        <MapPin className="w-12 h-12 text-gray-500 opacity-60 animate-bounce" />
      </div>
    </div>
);
// --- End Loading/Skeleton Components ---


const Geographic = () => {
  const [locations, setLocations] = useState([]);
  const [topBarangays, setTopBarangays] = useState([]);
  const [barangayByType, setBarangayByType] = useState([]);
  const [approvalRates, setApprovalRates] = useState([]);
  const [inactiveApplicants, setInactiveApplicants] = useState([]);

  // Initialize loading to true
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalApplicants: 0,
    topBarangay: "N/A",
    barangayCount: 0,
    avgApprovalRate: 0,
    inactiveCount: 0,
  });

  const [loadingStates, setLoadingStates] = useState({
    stats: true,
    charts: true,
  });

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  

  // Fetch all geographic data (omitted for brevity, assume correct)
  useEffect(() => {
  setError(null);
  setLoadingStates({ stats: true, charts: true });
  setLoading(true);

  // Locations
  api
    .get("/analytics/geographic/locations/")
    .then((res) => {
      const validLocations = (res.data || []).filter(
        (loc) => loc.latitude && loc.longitude
      );
      setLocations(validLocations);
      setStats((prev) => ({
        ...prev,
        totalApplicants: validLocations.length,
        barangayCount: [...new Set(validLocations.map((loc) => loc.barangay))].length,
      }));
      initializeHeatmap(validLocations);
    })
    .catch((err) => {
      console.error("Error fetching locations:", err);
      setError("Failed to load locations.");
    })
    .finally(() => setLoading(false));

  // Top Barangays
  api
    .get("/analytics/geographic/top-barangays/")
    .then((res) => {
      const fetched = res.data || [];
      setTopBarangays(fetched);
      setStats((prev) => ({
        ...prev,
        topBarangay:
          fetched.length > 0
            ? fetched[0].background_info__barangay__name || "N/A"
            : "N/A",
      }));
    })
    .catch((err) => console.error("Error fetching top barangays:", err));

  // Barangay by Type
  api
    .get("/analytics/geographic/barangay-by-type/")
    .then((res) => setBarangayByType(res.data || []))
    .catch((err) => console.error("Error fetching barangay types:", err));

  // Approval Rate
  api
    .get("/analytics/geographic/approval-rate/")
    .then((res) => {
      const fetched = res.data || [];
      setApprovalRates(fetched);
      const avgApprovalRate =
        fetched.length > 0
          ? (
              fetched.reduce(
                (sum, item) => sum + (item.approval_rate || 0),
                0
              ) / fetched.length
            ).toFixed(1)
          : 0;
      setStats((prev) => ({ ...prev, avgApprovalRate }));
    })
    .catch((err) => console.error("Error fetching approval rate:", err));

  // Inactive Applicants
  api
    .get("/analytics/geographic/inactive-applicants/")
    .then((res) => {
      const fetched = res.data || [];
      setInactiveApplicants(fetched);
      setStats((prev) => ({
        ...prev,
        inactiveCount: fetched.length,
      }));
    })
    .catch((err) => console.error("Error fetching inactive applicants:", err))
    .finally(() => {
      // Once all endpoints have attempted, remove global loading
      setLoadingStates({ stats: false, charts: false });
    });
}, []);

    const fetchData = async () => {
      // Keep setLoading(true) here for any future manual re-fetches
      // It is already true from the useState initial state

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

        const fetchedTopBarangays = Array.isArray(barangaysRes.data)
          ? barangaysRes.data
          : barangaysRes.data?.results || [];
        const fetchedBarangayByType = typeRes.data || [];
        const fetchedApprovalRates = approvalRes.data || [];
        const fetchedInactiveApplicants = inactiveRes.data || [];

        console.log("Fetch Barangays by type:", fetchedBarangayByType);

        setLocations(validLocations);
        setTopBarangays(fetchedTopBarangays);
        setBarangayByType(fetchedBarangayByType);
        setApprovalRates(fetchedApprovalRates);
        setInactiveApplicants(fetchedInactiveApplicants);

        // --- Calculate Stats ---
        const totalApplicants = validLocations.length;

        const topBarangay =
          fetchedTopBarangays?.length > 0
            ? fetchedTopBarangays[0]?.background_info__barangay__name || "N/A"
            : "N/A";

        const barangayCount = [...new Set(validLocations.map(loc => loc.barangay))].length;

        const avgApprovalRate =
          fetchedApprovalRates.length > 0
            ? (
                fetchedApprovalRates.reduce(
                  (sum, item) => sum + (item.approval_rate || 0),
                  0
                ) / fetchedApprovalRates.length
              ).toFixed(1)
            : 0;

        setStats({
          totalApplicants,
          topBarangay,
          barangayCount,
          avgApprovalRate,
          inactiveCount: fetchedInactiveApplicants.length,
        });
        // --- End Calculate Stats ---

        initializeHeatmap(validLocations);
      } catch (err) {
        console.error("Error fetching geographic data:", err);
        setError("Failed to load geographic data. Please try again.");
      } finally {
        // Set loading to false after all fetches (success or fail)
        setLoading(false);
      }
    };




  // Heatmap Initialization (omitted for brevity, assume correct)
  const initializeHeatmap = locationData => {
    setTimeout(() => {
      const mapContainer = document.querySelector(".leaflet-container");
      if (!mapContainer || !locationData.length) return;

      const map = mapContainer._leaflet_map;
      if (!map) return;

      map.eachLayer(layer => {
        if (layer.options && layer.options.heat) { 
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

  // Data processing (omitted for brevity, assume correct)
  const processBarangayTypeData = () => {


    const safeData = Array.isArray(barangayByType) ? barangayByType : [];

    // ✅ Use "barangay" directly (from backend response)
    const barangays = [
      ...new Set(
        safeData
          .map(item => item.barangay)
          .filter(name => typeof name === "string" && name.trim().length > 0)
      ),
    ];

    return barangays.slice(0, 6).map(barangay => {
      const items = safeData.filter(item => item.barangay === barangay);

      const safeBarangayName = barangay || "Unknown";

      const result = {

        barangay: barangay.length > 15 ? barangay.substring(0, 15) + "..." : barangay, 
        barangay:
          safeBarangayName.length > 15
            ? safeBarangayName.substring(0, 15) + "..."
            : safeBarangayName,
      };

      items.forEach(item => {
        result[item.type_of_assistance || "Unknown"] = item.count || 0;
      });

      return result;
    });
  };

  const chartData =
    Array.isArray(barangayByType) && barangayByType.length > 0
      ? processBarangayTypeData()
      : [];

  console.log("Barangay Chart Data →", chartData);

  const processApprovalData = () => {
    if (!approvalRates.length) return [];

    return approvalRates.slice(0, 5).map(item => ({
      name: item.location,
      value: item.approval_rate,
      total: item.total,
      approved: item.approved,
    }));
  };

  const pieData = processApprovalData();

  // Error Component (Consistent)
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
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Data</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {error}
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


  // Main Component Render
  return (
    // Background consistent with Demographics
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* --- MODIFIED HEADER SECTION FOR BUTTON ALIGNMENT --- */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <div className="flex-1 min-w-0">
            {/* Empty div to push the center text */}

  const LoadingChartSkeleton = ({ height = 280, title = "Loading Chart..." }) => (
    <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-gray-200 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
        <h3 className="text-xl font-bold text-gray-400">{title}</h3>
      </div>
      <div
        className="flex items-center justify-center bg-gray-100 rounded-xl"
        style={{ height: `${height}px` }}
      >
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    </div>
  );

  const LoadingMapSkeleton = () => (
    <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-gray-200 animate-pulse">
      <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
          <h3 className="text-xl font-bold text-gray-400">Distribution Heatmap Preview</h3>
        </div>
      </div>
      <div className="h-[350px] relative bg-gray-300 flex items-center justify-center">
        <MapPin className="w-12 h-12 text-gray-500 opacity-60 animate-bounce" />
      </div>
    </div>
  );
  // --- End Loading/Skeleton Components ---

  // Main Component Structure - Always Rendered
  const HeaderComponent = (
    <header className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 p-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
            <MapPin className="w-8 h-8 text-white" />

          </div>
          
          <div className="text-center mx-4"> 
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Geographic Analytics
            </h1>

            <p className="text-gray-600 text-lg">
              Spatial distribution insights across all regions
            </p>
          </div>

          <div className="flex-1 min-w-0 flex justify-end">
            <button className="flex items-center gap-1 bg-white text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors border border-blue-600 px-4 py-2 rounded-xl shadow-md hover:shadow-lg">
              View Full Heatmap
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* --- END MODIFIED HEADER SECTION --- */}

        {/* Stats (Consistent) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            icon={Users}
            title="Total Mapped Applicants"
            value={stats.totalApplicants.toLocaleString()}
            subtitle="Applicants with location data"
            color="#3B82F6"
            isLoading={loadingStates.stats}
          />
          <StatCard
            icon={Building2}
            title="Top Barangay"
            value={stats.topBarangay}
            subtitle="Most applications recorded"
            color="#10B981"
            isLoading={loadingStates.stats}
          />
          <StatCard
            icon={Activity}
            title="Barangay Coverage"
            value={stats.barangayCount}
            subtitle="Unique barangays served"
            color="#8B5CF6"
            isLoading={loadingStates.stats}
          />
          <StatCard
            icon={Target}
            title="Avg Approval Rate"
            value={`${stats.avgApprovalRate}%`}
            subtitle="Across all locations"
            color="#06B6D4"
            isLoading={loadingStates.stats}
          />
          <StatCard
            icon={Clock}
            title="Inactive Applicants"
            value={stats.inactiveCount}
            subtitle="No application > 6 months"
            color="#F59E0B"
            isLoading={loadingStates.stats}
          />
        </div>

            <p className="text-gray-600 text-lg mt-1">
              Spatial distribution insights across all regions
            </p>
          </div>
        </div>

        <button className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
          <Map className="w-5 h-5" />
          <span className="text-white">View Full Heatmap</span>
          <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </header>
  );

  // Render the component
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6 space-y-6">
        {/* Always display the Header/Title immediately */}
        {HeaderComponent}

        {loading ? (
          /* Show skeleton loading state for all data content */
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <LoadingCardSkeleton />
              <LoadingCardSkeleton />
              <LoadingCardSkeleton />
              <LoadingCardSkeleton />
              <LoadingCardSkeleton />
            </section>
            <LoadingMapSkeleton />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LoadingChartSkeleton title="Loading Top Barangays..." />
              <LoadingChartSkeleton title="Loading Approval Rates..." />
            </div>
            <LoadingChartSkeleton
              height={350}
              title="Loading Assistance Types Distribution..."
            />
          </>
        ) : (
          /* Show the actual data content */
          <>
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


        {/* Preview Heatmap (The button from the previous request is moved out of here to the header) */}
        {loadingStates.stats ? <LoadingMapSkeleton /> : (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-800">
                    Distribution Heatmap Preview
                  </h3>
                </div>
                {/* NOTE: The button was removed from here as it was added to the main header */}
                <span className="text-sm text-gray-500">Map data visualization</span>
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
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                </MapContainer>
              </div>
            </div>
        )}

        {/* Charts Grid (Consistent card style) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Barangays by Applications */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                    <BarChart3 className="mr-2 h-5 w-5 text-purple-600" /> Top Barangays by Applications
                </h2>
                {loadingStates.charts ? (
                    <LoadingChartSkeleton />
                ) : topBarangays.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={topBarangays.slice(0, 8)}
                            margin={{ top: 5, right: 10, left: 10, bottom: 60 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="background_info__barangay__name"
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                fontSize={12}
                            />
                            <YAxis />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
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
                        tick={{ fontSize: 11, fill: "#4b5563" }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: 12, fill: "#4b5563" }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "2px solid #dbeafe",
                          borderRadius: "12px",
                          fontSize: "14px",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
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
                  <h3 className="text-xl font-bold text-gray-900">
                    Approval Rates by Location
                  </h3>
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
                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-3">
                      {pieData.map((item, index) => (
                        <div
                          key={item.name}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <div
                            className="w-4 h-4 rounded-md shadow-sm"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-sm font-medium text-gray-700 flex-1">
                            {item.name}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {item.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                        No barangay data available.
                    </div>
                )}
            </div>

            {/* Approval Rates Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-600" /> Approval Rates by Location
                </h2>
                {loadingStates.charts ? (
                    <LoadingChartSkeleton />
                ) : pieData.length > 0 ? (
                    <div className="flex flex-col items-center">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    dataKey="value"
                                    nameKey="name"
                                    labelLine={false}
                                    label={({ value }) => `${value}%`}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip 
                                    content={<CustomTooltip />}
                                    formatter={(value, name, props) => [
                                        `${value}%`,
                                        props.payload.name
                                    ]}
                                />
                                <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
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
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                      <XAxis
                        dataKey="barangay"
                        tick={{ fontSize: 11, fill: "#4b5563" }}
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: 12, fill: "#4b5563" }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "2px solid #dbeafe",
                          borderRadius: "12px",
                          fontSize: "14px",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Bar
                        dataKey="Medical"
                        stackId="a"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="Educational"
                        stackId="a"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar dataKey="Burial" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="flex justify-center gap-8 mt-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-200">
                      <div className="w-4 h-4 bg-red-500 rounded-md shadow-sm"></div>
                      <span className="text-sm font-semibold text-gray-700">Medical</span>
                    </div>
                ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                        No approval rate data available.
                    </div>
                )}
            </div>
        </div>
        
        {/* Assistance Types by Barangay (Consistent card style) */}
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                <Activity className="mr-2 h-5 w-5 text-blue-600" /> Assistance Types Distribution by Barangay
            </h2>
            {loadingStates.charts ? (
                <LoadingChartSkeleton height={350} />
            ) : chartData.length > 0 ? (
                <>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="barangay"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                interval={0}
                                fontSize={11}
                            />
                            <YAxis />
                            <RechartsTooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="Medical" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Educational" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Burial" stackId="a" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </>
            ) : (
                <div className="h-[350px] flex items-center justify-center text-gray-500">
                    No assistance type data available.
                </div>
            )}
        </div>


        {/* Key Insights Section (Consistent card style) */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Geographic Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Coverage Breadth</h3>
              {loadingStates.stats ? (
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              ) : (
                  <p className="text-blue-700 text-sm">
                    The program covers applicants from **{stats.barangayCount} unique barangays**, indicating broad reach.
                  </p>
              )}
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Performance Hotspot</h3>
              {loadingStates.stats ? (
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              ) : (
                  <p className="text-green-700 text-sm">
                    **{stats.topBarangay}** is the primary hotspot, requiring specialized resource allocation.
                  </p>
              )}
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">Retention Alert</h3>
              {loadingStates.stats ? (
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              ) : (
                  <p className="text-yellow-700 text-sm">
                    There are **{stats.inactiveCount.toLocaleString()}** applicants who have been inactive for over 6 months in key areas.
                  </p>
              )}
            </div>
          </div>
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
                      {inactiveApplicants.length} applicants from various locations haven't
                      submitted new applications in over 6 months. This may indicate gaps in
                      outreach coverage.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {inactiveApplicants.slice(0, 3).map(applicant => (
                        <div
                          key={applicant.id}
                          className="bg-white p-4 rounded-xl border-2 border-orange-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        >
                          <span className="font-bold text-gray-900 block text-lg mb-1">
                            {applicant.name}
                          </span>
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
                          +{inactiveApplicants.length - 3} more inactive applicants across
                          different areas
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Geographic;
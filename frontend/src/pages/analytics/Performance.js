import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Clock,
  Users,
  Trophy,
  Activity,
  Zap,
  Target,
  AlertCircle,
  Award,
  Timer,
  UserCheck,
  Calendar,
  MapPin, // Added MapPin for main header icon consistency
} from "lucide-react";
import AnalyticsFilter from "../../components/AnalyticsFilter";

// --- Consistent Design Constants and Helpers ---

// Standardized Color Palette (using the provided hex codes)
const PRIMARY_BLUE = "#3B82F6"; // Stat Card 1, Bar Chart Default
const SUCCESS_GREEN = "#10B981"; // Good performance indicator
const WARNING_YELLOW = "#F59E0B"; // Medium/Warning performance indicator
const DANGER_RED = "#EF4444"; // Poor performance indicator
const PURPLE = "#8B5CF6"; // Stat Card 4

const CHART_COLORS = [PRIMARY_BLUE, SUCCESS_GREEN, WARNING_YELLOW, DANGER_RED, PURPLE];

// Helper to get gradient and border colors for StatCards (Matching Geographic.js)
const getGradientColors = (color) => {
  switch (color) {
    case PRIMARY_BLUE:
      // Avg Processing Time (Blue/Indigo theme)
      return {
        gradient: "from-blue-500 to-blue-700",
        border: "border-blue-200",
        text: "from-blue-600 to-indigo-700",
      };
    case SUCCESS_GREEN:
      // Staff Productivity (Green/Emerald theme)
      return {
        gradient: "from-green-500 to-green-700",
        border: "border-green-200",
        text: "from-green-600 to-green-700",
      };
    case WARNING_YELLOW:
      // Top Performer (Yellow/Orange theme)
      return {
        gradient: "from-yellow-500 to-orange-500",
        border: "border-yellow-200",
        text: "from-orange-600 to-yellow-700",
      };
    case PURPLE:
      // Total Processed (Purple theme)
      return {
        gradient: "from-purple-500 to-purple-700",
        border: "border-purple-200",
        text: "from-purple-600 to-purple-700",
      };
    default:
      return {
        gradient: "from-gray-500 to-gray-700",
        border: "border-gray-200",
        text: "from-gray-600 to-gray-700",
      };
  }
};

// Helper to determine Bar Chart color based on Processing Time (lower is better)
const getTimeColor = (minutes) => {
  if (minutes < 60) return SUCCESS_GREEN; // Excellent
  if (minutes < 120) return WARNING_YELLOW; // Good/Warning
  return DANGER_RED; // Needs Improvement
};

// Helper to determine Bar Chart color based on Productivity Count (higher is better)
const getProductivityColor = (count) => {
  if (count > 50) return SUCCESS_GREEN; // High
  if (count > 25) return WARNING_YELLOW; // Medium
  return DANGER_RED; // Low
};

// Helper to determine Tailwind classes for Heatmap intensity
const getIntensityClass = (intensity) => {
  if (intensity === 0) return "bg-gray-100 text-gray-500 border-gray-200";
  if (intensity < 20) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (intensity < 40) return "bg-yellow-300 text-yellow-900 border-yellow-400";
  if (intensity < 60) return "bg-orange-400 text-orange-900 border-orange-500";
  if (intensity < 80) return "bg-orange-600 text-white border-orange-700";
  return "bg-red-700 text-white border-red-800"; // Highest Intensity
};

// --- Component Definitions ---

// Fallback skeleton loader component for charts and lists
const SkeletonLoader = ({ height = 300, type = "chart" }) => (
  // Updated to use the consistent backdrop-blur styling
  <div
    className={`animate-pulse bg-gray-100 rounded-xl ${type === "chart" ? "p-4" : "p-3"}`}
    style={{ height }}
  >
    {type === "chart" && <div className="h-full w-full bg-gray-200 rounded-lg"></div>}
    {type === "list" && (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded"></div>
        ))}
      </div>
    )}
    {type === "heatmap" && (
      <div className="grid grid-cols-6 md:grid-cols-12 lg:grid-cols-24 gap-2">
        {[...Array(24)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    )}
  </div>
);

// Heatmap Cell Component using standardized classes
const HeatmapCell = ({ hour, count, intensity }) => {
  const colorClass = getIntensityClass(intensity);

  return (
    <div
      className={`flex flex-col items-center p-2 rounded-lg border transition-all hover:scale-105 ${colorClass}`}
    >
      <span className="text-xs font-medium">{hour.label}</span>
      <span className="text-sm font-bold">{count}</span>
    </div>
  );
};

// Refactored StatCard to match Geographic.js styling
const StatCard = ({ icon: Icon, title, value, subtitle, color, badge, isLoading }) => {
  const { gradient, border, text } = getGradientColors(color);
  
  return (
    <div
      className={`group bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border ${border} hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative`}
    >
      {badge && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
          {badge}
        </div>
      )}
      <div className="flex items-center gap-3">
        {/* Icon container with gradient, hover effect */}
        <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-600 font-semibold">{title}</p>
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-300 rounded mt-1 animate-pulse"></div>
          ) : (
            <>
              {/* Value with gradient text style */}
              <h2 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${text}`}>
                {value}
              </h2>
              {/* Subtitle logic preserved */}
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};


const Performance = () => {
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchData = async (url) => {
    try {
      const res = await api.get(url);
      return res.data;
    } catch (err) {
      setError(err); // Centralized error handling
      throw err;
    }
  };

  const { data: avgProcessingTime, isLoading: loadingAvg } = useQuery({
    queryKey: ["performance", "average-processing", filters],
    queryFn: () => fetchData("/analytics/performance/average-processing/"),
  });

  const { data: avgProcessingTimeByType = [], isLoading: loadingType } = useQuery({
    queryKey: ["performance", "processing-by-type", filters],
    queryFn: () => fetchData("/analytics/performance/processing-by-type/"),
  });

  const { data: processingDistribution = [], isLoading: loadingDistribution } = useQuery({
    queryKey: ["performance", "processing-distribution", filters],
    queryFn: () => fetchData("/analytics/performance/processing-distribution/"),
  });

  const { data: staffProductivity = [], isLoading: loadingProductivity } = useQuery({
    queryKey: ["performance", "staff-productivity", filters],
    queryFn: () => fetchData("/analytics/performance/staff-productivity/"),
  });

  const { data: staffLeaderboard = [], isLoading: loadingLeaderboard } = useQuery({
    queryKey: ["performance", "staff-leaderboard", filters],
    queryFn: () => fetchData("/analytics/performance/staff-leaderboard/"),
  });

  const { data: staffActivity = [], isLoading: loadingActivity } = useQuery({
    queryKey: ["performance", "staff-activity", filters],
    queryFn: () => fetchData("/analytics/performance/staff-activity/"),
  });

  const { data: staffHeatmap = [], isLoading: loadingHeatmap } = useQuery({
    queryKey: ["performance", "staff-heatmap", filters],
    queryFn: () => fetchData("/analytics/performance/staff-heatmap/"),
  });

  const PERFORMANCE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  // Data transformation functions
  const transformProcessingByType = (data) => {
    return data.map((item) => ({
      type: item.type,
      avgMinutes: item.avg_minutes,
      // Logic for efficiency summary text, consistent with color function
      efficiency:
        item.avg_minutes < 60
          ? "Excellent"
          : item.avg_minutes < 120
          ? "Good"
          : "Needs Improvement",
    }));
  };

  const transformStaffProductivity = (data) => {
    return data
      .filter((item) => item.processed_by__username || item.staff__username)
      .map((item) => ({
        staff: item.processed_by__username || item.staff__username || "Unknown",
        count: item.count,
        productivity: item.count > 50 ? "High" : item.count > 25 ? "Medium" : "Low",
      }))
      .slice(0, 10);
  };

  const transformStaffLeaderboard = (data) => {
    return data
      .filter((item) => item.processed_by__username || item.staff__username)
      .map((item, index) => ({
        rank: index + 1,
        staff: item.processed_by__username || item.staff__username || "Unknown",
        count: item.count,
        medal: index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`,
      }))
      .slice(0, 10);
  };

  const transformStaffActivity = (data) => {
    return data.slice(0, 20).map((item) => ({
      id: item.id,
      staff: item.staff || "System",
      action: item.action,
      timestamp: new Date(item.timestamp).toLocaleString(),
      timeAgo: getTimeAgo(new Date(item.timestamp)),
    }));
  };

  const transformHeatmapData = (data) => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i.toString().padStart(2, "0")}:00`,
      count: 0,
      intensity: 0,
    }));

    data.forEach((item) => {
      const hourIndex = item.hour;
      if (hourIndex >= 0 && hourIndex < 24) {
        hours[hourIndex].count = item.count;
      }
    });

    const maxCount = Math.max(...hours.map((h) => h.count));
    hours.forEach((hour) => {
      hour.intensity = maxCount > 0 ? (hour.count / maxCount) * 100 : 0;
    });

    return hours;
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  // Statistics calculations
  const calculateStats = () => {
    const processedProductivity = loadingProductivity
      ? []
      : transformStaffProductivity(staffProductivity);
    const processedLeaderboard = loadingLeaderboard
      ? []
      : transformStaffLeaderboard(staffLeaderboard);

    const totalStaffProcessed = processedProductivity.reduce(
      (sum, item) => sum + item.count,
      0
    );
    const averageProductivity =
      processedProductivity.length > 0
        ? Math.round(totalStaffProcessed / processedProductivity.length)
        : 0;
    const topPerformer = processedLeaderboard[0];
    const processingEfficiency = avgProcessingTime?.average_processing_time_minutes || 0;

    return {
      totalStaffProcessed,
      averageProductivity,
      topPerformer,
      processingEfficiency,
    };
  };

  // Refactored Error Screen to match Geographic.js style
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

  const transformedProcessingByType = transformProcessingByType(avgProcessingTimeByType);
  const transformedStaffProductivity = transformStaffProductivity(staffProductivity);
  const transformedStaffLeaderboard = transformStaffLeaderboard(staffLeaderboard);
  const transformedStaffActivity = transformStaffActivity(staffActivity);
  const transformedHeatmapData = staffHeatmap ? transformHeatmapData(staffHeatmap) : [];
  const stats = calculateStats();

  const isAvgProcessingTimeLoaded = avgProcessingTime !== null;
  const isLeaderboardLoaded = !loadingLeaderboard && staffLeaderboard.length > 0;
  const isProductivityLoaded = !loadingProductivity && staffProductivity.length > 0;
  const isTotalProcessedLoaded = isProductivityLoaded;
  
  // Header Component (Geographic style)
  const HeaderComponent = (
    <header className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 p-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Performance Analytics Dashboard</h1>
            <p className="text-gray-600 text-lg mt-1">
              Staff productivity, processing efficiency, and operational performance metrics
            </p>
          </div>
        </div>
      </div>
    </header>
  );

  // Main Return Statement Refactored
  return (
    // Root container with Geographic's style background
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 relative">
      {/* Background Overlays from Geographic.js */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6 max-w-7xl mx-auto space-y-6">
        {HeaderComponent}
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Performance Analytics Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Staff productivity, processing efficiency, and operational performance metrics
          </p>
        </div>
        <AnalyticsFilter onFilterChange={setFilters} />

        {/* Statistics Cards - Uses the refactored StatCard */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Timer}
            title="Avg Processing Time"
            value={
              isAvgProcessingTimeLoaded
                ? `${stats.processingEfficiency.toFixed(1)}min`
                : "0.0min"
            }
            subtitle="Per application"
            color={PRIMARY_BLUE}
            isLoading={!isAvgProcessingTimeLoaded}
          />
          <StatCard
            icon={Users}
            title="Staff Productivity"
            value={isProductivityLoaded ? stats.averageProductivity : "..."}
            subtitle="Avg applications/staff"
            color={SUCCESS_GREEN}
            isLoading={loadingProductivity}
          />
          <StatCard
            icon={Trophy}
            title="Top Performer"
            value={isLeaderboardLoaded ? stats.topPerformer?.staff || "N/A" : "..."}
            subtitle={
              isLeaderboardLoaded ? `${stats.topPerformer?.count || 0} applications` : "..."
            }
            color={WARNING_YELLOW}
            badge="🏆"
            isLoading={loadingLeaderboard}
          />
          <StatCard
            icon={Activity}
            title="Total Processed"
            value={isTotalProcessedLoaded ? stats.totalStaffProcessed.toLocaleString() : "..."}
            subtitle="By all staff"
            color={PURPLE}
            isLoading={loadingProductivity}
          />
        </section>

        {/* Processing Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Processing Time by Type */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Clock className="mr-2 h-5 w-5 text-blue-600" />
                Processing Time by Assistance Type
              </h2>
            </div>
            {loadingType ? (
              <SkeletonLoader />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={transformedProcessingByType}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="type"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} min`, "Processing Time"]} />
                  <Bar dataKey="avgMinutes" radius={[4, 4, 0, 0]}>
                    {/* Use centralized color logic */}
                    {transformedProcessingByType.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getTimeColor(entry.avgMinutes)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Processing Distribution */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Target className="mr-2 h-5 w-5 text-green-600" />
                Processing Time Distribution
              </h2>
            </div>
            {loadingDistribution ? (
              <SkeletonLoader />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={processingDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ bucket, percent }) =>
                      `${bucket} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {/* Use standardized chart colors */}
                    {processingDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Applications"]} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Staff Productivity */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Zap className="mr-2 h-5 w-5 text-yellow-600" />
                Staff Productivity (Applications Processed)
              </h2>
            </div>
            {loadingProductivity ? (
              <SkeletonLoader height={350} />
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={transformedStaffProductivity}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="staff"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={11}
                  />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, "Applications Processed"]} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {/* Use centralized color logic */}
                    {transformedStaffProductivity.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getProductivityColor(entry.count)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Staff Leaderboard */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Award className="mr-2 h-5 w-5 text-purple-600" />
                Staff Leaderboard
              </h2>
            </div>
            {loadingLeaderboard ? (
              <SkeletonLoader height={320} type="list" />
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {transformedStaffLeaderboard.map((staff, index) => (
                  <div
                    key={staff.staff}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all hover:shadow-md ${
                      index < 3
                        ? "bg-gradient-to-r from-yellow-50 to-amber-100 border-amber-300"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{staff.medal}</div>
                      <div>
                        <p className="font-semibold text-gray-800">{staff.staff}</p>
                        <p className="text-sm text-gray-600">Rank #{staff.rank}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">{staff.count}</p>
                      <p className="text-xs text-gray-600">applications</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activity Heatmap */}
        <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-orange-600" />
              Staff Activity Heatmap (Hourly Distribution)
            </h2>
          </div>
          {loadingHeatmap ? (
            <SkeletonLoader height={100} type="heatmap" />
          ) : (
            <>
              <div className="grid grid-cols-6 md:grid-cols-12 lg:grid-cols-24 gap-2">
                {transformedHeatmapData.map((hour) => (
                  <HeatmapCell
                    key={hour.hour}
                    hour={hour}
                    count={hour.count}
                    intensity={hour.intensity}
                  />
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-gray-100 rounded border border-gray-200"></div>
                  <span>No Activity</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-yellow-300 rounded border border-yellow-400"></div>
                  <span>Low Activity</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-orange-600 rounded border border-orange-700"></div>
                  <span>Medium Activity</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-4 bg-red-700 rounded border border-red-800"></div>
                  <span>High Activity</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Recent Staff Activity */}
        <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <UserCheck className="mr-2 h-5 w-5 text-green-600" />
              Recent Staff Activity
            </h2>
          </div>
          {loadingActivity ? (
            <SkeletonLoader height={320} type="list" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 rounded-tl-lg">
                      Staff Member
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Timestamp
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 rounded-tr-lg">
                      Time Ago
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transformedStaffActivity.map((activity) => (
                    <tr
                      key={activity.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {activity.staff}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.action === "CREATE"
                              ? "bg-green-100 text-green-800"
                              : activity.action === "UPDATE"
                              ? "bg-blue-100 text-blue-800"
                              : activity.action === "LOGIN"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {activity.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-sm">
                        {activity.timestamp}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-sm">
                        {activity.timeAgo}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Performance Summary */}
        <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Performance Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Processing Efficiency</h3>
              <p className="text-blue-700 text-sm">
                Average processing time of{" "}
                <span className="font-bold">
                  {stats.processingEfficiency.toFixed(1)} minutes
                </span>{" "}
                shows
                {stats.processingEfficiency < 60
                  ? " excellent"
                  : stats.processingEfficiency < 120
                  ? " good"
                  : " room for improvement in"}{" "}
                efficiency
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Staff Performance</h3>
              <p className="text-green-700 text-sm">
                <span className="font-bold">
                  {stats.topPerformer?.staff || "Top performer"}
                </span>{" "}
                leads with{" "}
                <span className="font-bold">
                  {stats.topPerformer?.count || 0} processed applications
                </span>
                , showing strong individual productivity
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-2">Workload Distribution</h3>
              <p className="text-purple-700 text-sm">
                Average productivity of{" "}
                <span className="font-bold">
                  {stats.averageProductivity} applications
                </span>{" "}
                per staff member indicates balanced workload distribution
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;
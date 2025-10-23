import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api"; // Assuming the original api service is available
import {
  BarChart,
  Bar,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  // Removed unused LineChart, Line, RadialBarChart, RadialBar
} from "recharts";
import {
  Clock,
  Users,
  Trophy,
  Activity,
  Zap,
  Target,
  AlertCircle,
  // Removed unused TrendingUp, Award, Timer, UserCheck, Calendar, Loader2 - keeping only used ones
  Timer,
  UserCheck,
  Calendar,
  Award
} from "lucide-react";

// --- React Query Configuration & Fetchers ---

const performanceKeys = {
  all: ["performance"],
  avgTime: () => [...performanceKeys.all, "average-time"],
  byType: () => [...performanceKeys.all, "by-type"],
  distribution: () => [...performanceKeys.all, "distribution"],
  productivity: () => [...performanceKeys.all, "productivity"],
  leaderboard: () => [...performanceKeys.all, "leaderboard"],
  activity: () => [...performanceKeys.all, "activity"],
  heatmap: () => [...performanceKeys.all, "heatmap"],
};

// Generic fetcher function for reuse
const performanceFetcher = async (path) => {
  const { data } = await api.get(`/analytics/performance/${path}`);
  return data;
};

// Hook for fetching all data
const usePerformanceData = () => {
  // 1️⃣ Avg Processing Time
  const avgTimeQuery = useQuery({
    queryKey: performanceKeys.avgTime(),
    queryFn: () => performanceFetcher("average-processing/"),
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
    retry: false, // Don't retry this high-priority metric if it fails
  });

  // 2️⃣ Processing by Type
  const byTypeQuery = useQuery({
    queryKey: performanceKeys.byType(),
    queryFn: () => performanceFetcher("processing-by-type/"),
  });

  // 3️⃣ Processing Distribution
  const distributionQuery = useQuery({
    queryKey: performanceKeys.distribution(),
    queryFn: () => performanceFetcher("processing-distribution/"),
  });

  // 4️⃣ Staff Productivity
  const productivityQuery = useQuery({
    queryKey: performanceKeys.productivity(),
    queryFn: () => performanceFetcher("staff-productivity/"),
  });

  // 5️⃣ Staff Leaderboard
  const leaderboardQuery = useQuery({
    queryKey: performanceKeys.leaderboard(),
    queryFn: () => performanceFetcher("staff-leaderboard/"),
  });

  // 6️⃣ Staff Activity
  const activityQuery = useQuery({
    queryKey: performanceKeys.activity(),
    queryFn: () => performanceFetcher("staff-activity/"),
  });

  // 7️⃣ Staff Heatmap
  const heatmapQuery = useQuery({
    queryKey: performanceKeys.heatmap(),
    queryFn: () => performanceFetcher("staff-heatmap/"),
  });

  // Combine all results for easier access
  return {
    avgTimeQuery,
    byTypeQuery,
    distributionQuery,
    productivityQuery,
    leaderboardQuery,
    activityQuery,
    heatmapQuery,
  };
};

// --- Helper Functions (Same as original, moved out of component) ---

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

const transformProcessingByType = data => {
  if (!data) return [];
  return data.map(item => ({
    type: item.type,
    avgMinutes: item.avg_minutes,
    efficiency:
      item.avg_minutes < 60
        ? "Excellent"
        : item.avg_minutes < 120
        ? "Good"
        : "Needs Improvement",
  }));
};

const transformStaffProductivity = data => {
  if (!data) return [];
  return data
    .filter(item => item.processed_by__username || item.staff__username)
    .map(item => ({
      staff: item.processed_by__username || item.staff__username || "Unknown",
      count: item.count,
      productivity: item.count > 50 ? "High" : item.count > 25 ? "Medium" : "Low",
    }))
    .slice(0, 10);
};

const transformStaffLeaderboard = data => {
  if (!data) return [];
  return data
    .filter(item => item.processed_by__username || item.staff__username)
    .map((item, index) => ({
      rank: index + 1,
      staff: item.processed_by__username || item.staff__username || "Unknown",
      count: item.count,
      medal: index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`,
    }))
    .slice(0, 10);
};

const transformStaffActivity = data => {
  if (!data) return [];
  return data.slice(0, 20).map(item => ({
    id: item.id,
    staff: item.staff || "System",
    action: item.action,
    timestamp: new Date(item.timestamp).toLocaleString(),
    timeAgo: getTimeAgo(new Date(item.timestamp)),
  }));
};

const transformHeatmapData = data => {
  if (!data) return [];
  const hours = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    label: `${i.toString().padStart(2, "0")}:00`,
    count: 0,
    intensity: 0,
  }));

  data.forEach(item => {
    const hourIndex = item.hour;
    if (hourIndex >= 0 && hourIndex < 24) {
      hours[hourIndex].count = item.count;
    }
  });

  const maxCount = Math.max(...hours.map(h => h.count));
  hours.forEach(hour => {
    hour.intensity = maxCount > 0 ? (hour.count / maxCount) * 100 : 0;
  });

  return hours;
};

// Fallback skeleton loader component for charts and lists (kept the same)
const SkeletonLoader = ({ height = 300, type = 'chart' }) => (
  <div
    className={`animate-pulse bg-gray-100 rounded-lg ${type === 'chart' ? 'p-4' : 'p-3'}`}
    style={{ height }}
  >
    {type === 'chart' && <div className="h-full w-full bg-gray-200 rounded-md"></div>}
    {type === 'list' && (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-200 rounded"></div>
        ))}
      </div>
    )}
    {type === 'heatmap' && (
        <div className="grid grid-cols-6 md:grid-cols-12 lg:grid-cols-24 gap-2">
            {[...Array(24)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
        </div>
    )}
  </div>
);

const Performance = () => {
  // Use the custom hook to get all queries
  const {
    avgTimeQuery,
    byTypeQuery,
    distributionQuery,
    productivityQuery,
    leaderboardQuery,
    activityQuery,
    heatmapQuery,
  } = usePerformanceData();

  // Color palettes (kept the same)
  const PERFORMANCE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
  // Removed unused HEATMAP_COLORS and LEADERBOARD_COLORS as logic uses local colors

  // Extract data and loading states from React Query hooks
  const { data: avgProcessingTime, isLoading: loadingAvgTime, isError: errorAvgTime } = avgTimeQuery;
  const { data: avgProcessingTimeByType, isLoading: loadingType, isError: errorType } = byTypeQuery;
  const { data: processingDistribution, isLoading: loadingDistribution, isError: errorDistribution } = distributionQuery;
  const { data: staffProductivity, isLoading: loadingProductivity, isError: errorProductivity } = productivityQuery;
  const { data: staffLeaderboard, isLoading: loadingLeaderboard, isError: errorLeaderboard } = leaderboardQuery;
  const { data: staffActivity, isLoading: loadingActivity, isError: errorActivity } = activityQuery;
  const { data: staffHeatmap, isLoading: loadingHeatmap, isError: errorHeatmap } = heatmapQuery;

  // Global Error Handling: If *any* query has a hard error (which is now done individually)
  // For simplicity, we'll check the most critical ones for the main error screen
  const hasCriticalError = errorAvgTime || errorProductivity || errorLeaderboard;
  const criticalError = errorAvgTime || errorProductivity || errorLeaderboard; // Use first critical error object

  // --- Data Transformations and Stats Calculation (Now run using fetched data) ---
  
  const transformedProcessingByType = transformProcessingByType(avgProcessingTimeByType);
  const transformedStaffProductivity = transformStaffProductivity(staffProductivity);
  const transformedStaffLeaderboard = transformStaffLeaderboard(staffLeaderboard);
  const transformedStaffActivity = transformStaffActivity(staffActivity);
  const transformedHeatmapData = transformHeatmapData(staffHeatmap);

  const calculateStats = () => {
    // Note: The transformations implicitly handle the 'not-yet-fetched' state by returning [] if data is null/undefined
    const processedProductivity = transformedStaffProductivity;
    const processedLeaderboard = transformedStaffLeaderboard;

    const totalStaffProcessed = processedProductivity.reduce((sum, item) => sum + item.count, 0);
    const averageProductivity =
      processedProductivity.length > 0
        ? Math.round(totalStaffProcessed / processedProductivity.length)
        : 0;
    const topPerformer = processedLeaderboard[0];
    // Optional chaining `?.` is crucial here because `avgProcessingTime` might be undefined on first render or during loading
    const processingEfficiency = avgProcessingTime?.average_processing_time_minutes || 0; 

    return {
      totalStaffProcessed,
      averageProductivity,
      topPerformer,
      processingEfficiency,
    };
  };

  const stats = calculateStats();
  
  // Calculate loading status for StatCards
  const isAvgProcessingTimeLoaded = !loadingAvgTime && avgProcessingTime !== undefined;
  const isLeaderboardLoaded = !loadingLeaderboard && staffLeaderboard?.length > 0;
  const isProductivityLoaded = !loadingProductivity && staffProductivity?.length > 0;
  const isTotalProcessedLoaded = isProductivityLoaded; 

  const StatCard = ({ icon: Icon, title, value, subtitle, color, badge, isLoading }) => (
    <div
      className="bg-white rounded-xl shadow-lg p-6 border-l-4 relative"
      style={{ borderLeftColor: color }}
    >
      {badge && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
          {badge}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          {isLoading ? (
            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mt-2"></div>
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

  const HeatmapCell = ({ hour, count, intensity }) => {
    const getIntensityColor = intensity => {
      if (intensity === 0) return "#F3F4F6";
      if (intensity < 20) return "#FEF3C7";
      if (intensity < 40) return "#FCD34D";
      if (intensity < 60) return "#F59E0B";
      if (intensity < 80) return "#D97706";
      return "#92400E";
    };

    return (
      <div
        className="flex flex-col items-center p-2 rounded-lg border transition-all hover:scale-105"
        style={{ backgroundColor: getIntensityColor(intensity) }}
      >
        <span className="text-xs font-medium text-gray-700">{hour.label}</span>
        <span className="text-sm font-bold text-gray-800">{count}</span>
      </div>
    );
  };
    
  
  if (hasCriticalError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 max-w-md w-full mx-4">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 animate-pulse">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 mb-4">
            {criticalError.message || "Failed to fetch critical data. Please try again later."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }


  return (
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Timer}
            title="Avg Processing Time"
            value={isAvgProcessingTimeLoaded ? `${stats.processingEfficiency.toFixed(1)}min` : '...'}
            subtitle="Per application"
            color="#3B82F6"
            isLoading={loadingAvgTime}
          />
          <StatCard
            icon={Users}
            title="Staff Productivity"
            value={isProductivityLoaded ? stats.averageProductivity : '...'}
            subtitle="Avg applications/staff"
            color="#10B981"
            isLoading={loadingProductivity}
          />
          <StatCard
            icon={Trophy}
            title="Top Performer"
            value={isLeaderboardLoaded ? (stats.topPerformer?.staff || "N/A") : '...'}
            subtitle={isLeaderboardLoaded ? `${stats.topPerformer?.count || 0} applications` : '...'}
            color="#F59E0B"
            badge="🏆"
            isLoading={loadingLeaderboard}
          />
          <StatCard
            icon={Activity}
            title="Total Processed"
            value={isTotalProcessedLoaded ? stats.totalStaffProcessed.toLocaleString() : '...'}
            subtitle="By all staff"
            color="#8B5CF6"
            isLoading={loadingProductivity}
          />
        </div>

        {/* Processing Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Processing Time by Type */}
          <div className="bg-white rounded-xl shadow-lg p-6">
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
                    <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} fontSize={12} />
                    <YAxis />
                    <Tooltip formatter={value => [`${value} min`, "Processing Time"]} />
                    <Bar dataKey="avgMinutes" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                    {transformedProcessingByType.map((entry, index) => (
                        <Cell
                        key={`cell-${index}`}
                        fill={
                            entry.avgMinutes < 60
                              ? "#10B981"
                              : entry.avgMinutes < 120
                              ? "#F59E0B"
                              : "#EF4444"
                        }
                        />
                    ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            )}
          </div>

          {/* Processing Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
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
                    label={({ bucket, percent }) => `${bucket} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    >
                    {processingDistribution.map((entry, index) => (
                        <Cell
                        key={`cell-${index}`}
                        fill={PERFORMANCE_COLORS[index % PERFORMANCE_COLORS.length]}
                        />
                    ))}
                    </Pie>
                    <Tooltip formatter={value => [value, "Applications"]} />
                </PieChart>
                </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Staff Productivity */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Zap className="mr-2 h-5 w-5 text-yellow-600" />
                Staff Productivity
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
                    <Tooltip formatter={value => [value, "Applications Processed"]} />
                    <Bar dataKey="count" fill="#F59E0B" radius={[4, 4, 0, 0]}>
                    {transformedStaffProductivity.map((entry, index) => (
                        <Cell
                        key={`cell-${index}`}
                        fill={
                            entry.count > 50 ? "#10B981" : entry.count > 25 ? "#F59E0B" : "#EF4444"
                        }
                        />
                    ))}
                    </Bar>
                </BarChart>
                </ResponsiveContainer>
            )}
          </div>

          {/* Staff Leaderboard */}
          <div className="bg-white rounded-xl shadow-lg p-6">
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
                            ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200"
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
        <div className="bg-white rounded-xl shadow-lg p-6">
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
                    {transformedHeatmapData.map(hour => (
                        <HeatmapCell
                        key={hour.hour}
                        hour={hour}
                        count={hour.count}
                        intensity={hour.intensity}
                        />
                    ))}
                    </div>
                    <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <span>Low Activity</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                        <span>Medium Activity</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <div className="w-4 h-4 bg-orange-600 rounded"></div>
                        <span>High Activity</span>
                    </div>
                    </div>
                </>
            )}
        </div>

        {/* Recent Staff Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
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
                    <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Staff Member
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Timestamp
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Time Ago</th>
                    </tr>
                    </thead>
                    <tbody>
                    {transformedStaffActivity.map(activity => (
                        <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{activity.staff}</td>
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
                        <td className="py-3 px-4 text-gray-600 text-sm">{activity.timestamp}</td>
                        <td className="py-3 px-4 text-gray-500 text-sm">{activity.timeAgo}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Performance Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Processing Efficiency</h3>
              <p className="text-blue-700 text-sm">
                Average processing time of {stats.processingEfficiency.toFixed(1)} minutes
                shows
                {stats.processingEfficiency < 60
                  ? " excellent"
                  : stats.processingEfficiency < 120
                  ? " good"
                  : " room for improvement in"}{" "}
                efficiency
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Staff Performance</h3>
              <p className="text-green-700 text-sm">
                {stats.topPerformer?.staff || "Top performer"} leads with{" "}
                {stats.topPerformer?.count || 0} processed applications, showing strong
                individual productivity
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2">Workload Distribution</h3>
              <p className="text-purple-700 text-sm">
                Average productivity of {stats.averageProductivity} applications per staff
                member indicates balanced workload distribution
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Performance;
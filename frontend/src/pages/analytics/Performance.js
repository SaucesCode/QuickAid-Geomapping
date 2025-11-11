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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  Clock,
  Users,
  Trophy,
  Activity,
  Timer,
  UserCheck,
  Calendar,
  Target,
} from "lucide-react";
import AnalyticsFilter from "../../components/AnalyticsFilter";

// Import Design System Components
import {
  PageContainer,
  PageHeader,
  Card,
  StatCard,
  ChartCard,
  AlertCard,
  Stack,
  Grid,
} from "../../components/DesignSystem";

// Color Constants - KEPT UNCHANGED
const BLUE_DARK = "#1D4ED8";
const BLUE_MEDIUM = "#3B82F6";
const DANGER_RED = "#EF4444";
const SUCCESS_GREEN = "#10B981";
const WARNING_YELLOW = "#FACC15";

const TEAL = "#14B8A6";
const PURPLE = "#8B5CF6";
const ORANGE = "#F97316";
const GRAY_OUT = "#E5E7EB";

const EDUCATION_GREEN = SUCCESS_GREEN;
const MEDICALS_BLUE = BLUE_MEDIUM;
const BURIAL_YELLOW = "#FDE68A";

const StatCard = ({ icon: Icon, title, value, subtitle, color, badge, isLoading }) => {
  // Simplified getGradientColors inline, keeping only necessary logic
  let gradientClass = "from-gray-500 to-gray-700";
  let borderClass = "border-gray-200";
  let textClass = "from-gray-600 to-gray-700";

  switch (color) {
    case BLUE_MEDIUM:
      gradientClass = "from-blue-500 to-blue-700";
      borderClass = "border-blue-200";
      textClass = "from-blue-600 to-indigo-700";
      break;
    case SUCCESS_GREEN:
      gradientClass = "from-green-500 to-green-700";
      borderClass = "border-green-200";
      textClass = "from-green-600 to-green-700";
      break;
    case WARNING_YELLOW:
      gradientClass = "from-yellow-500 to-orange-500";
      borderClass = "border-yellow-200";
      textClass = "from-orange-600 to-yellow-700";
      break;
    case BLUE_DARK:
      gradientClass = "from-indigo-500 to-indigo-700";
      borderClass = "border-indigo-200";
      textClass = "from-indigo-600 to-indigo-700";
      break;
    default:
      break;
  }

  return (
    <div
      className={`group bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border ${borderClass} hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative`}
    >
      {badge && (
        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
          {badge}
        </div>
      )}
      <div className="flex items-center gap-3">
        <div
          className={`w-14 h-14 bg-gradient-to-br ${gradientClass} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 font-semibold">{title}</p>
          {isLoading ? (
            <div className="h-8 w-20 bg-gray-300 rounded mt-1 animate-pulse"></div>
          ) : (
            <>
              <h2
                className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${textClass} truncate hover:whitespace-normal hover:overflow-visible`}
                title={value}
              >
                {value}
              </h2>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};


// --- Main Component ---
// Chart Colors - KEPT UNCHANGED
const CHART_COLORS = [TEAL, PURPLE, GRAY_OUT, ORANGE, GRAY_OUT, BLUE_DARK, DANGER_RED];

// Helper Functions - KEPT UNCHANGED
const getProductivityColor = count => {
  if (count > 50) return BLUE_MEDIUM;
  if (count > 25) return WARNING_YELLOW;
  return DANGER_RED;
};

const Performance = () => {
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  // Fetch Logic - KEPT UNCHANGED
  const fetchData = async endpoint => {
    const params = new URLSearchParams();
    if (filters.start) params.append("start_date", filters.start);
    if (filters.end) params.append("end_date", filters.end);
    if (filters.type) params.append("type", filters.type);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await api.get(`${endpoint}${query}`).catch(err => {
      setError(err);
      throw err;
    });
    return res.data;
  };

  const { data: avgProcessingTime, isLoading: loadingAvg } = useQuery({
    queryKey: ["performance", "average-processing", filters],
    queryFn: () => fetchData(`/analytics/performance/average-processing/`),
    keepPreviousData: true,
  });

  const { data: avgProcessingTimeByType = [], isLoading: loadingType } = useQuery({
    queryKey: ["performance", "processing-by-type", filters],
    queryFn: () => fetchData(`/analytics/performance/processing-by-type/`),
    keepPreviousData: true,
  });

  const { data: processingDistribution = [], isLoading: loadingDistribution } = useQuery({
    queryKey: ["performance", "processing-distribution", filters],
    queryFn: () => fetchData(`/analytics/performance/processing-distribution/`),
    keepPreviousData: true,
  });

  const { data: staffProductivity = [], isLoading: loadingProductivity } = useQuery({
    queryKey: ["performance", "staff-productivity", filters],
    queryFn: () => fetchData(`/analytics/performance/staff-productivity/`),
    keepPreviousData: true,
  });

  const { data: staffLeaderboard = [], isLoading: loadingLeaderboard } = useQuery({
    queryKey: ["performance", "staff-leaderboard", filters],
    queryFn: () => fetchData(`/analytics/performance/staff-leaderboard/`),
    keepPreviousData: true,
  });

  const { data: staffActivity = [], isLoading: loadingActivity } = useQuery({
    queryKey: ["performance", "staff-activity", filters],
    queryFn: () => fetchData(`/analytics/performance/staff-activity/`),
    keepPreviousData: true,
  });

  // Data Transformations - KEPT UNCHANGED
  const transformProcessingByType = (data = []) => {
    return data.map(item => ({
      type: item.type,
      avgMinutes: item.avg_minutes ?? 0,
      efficiency:
        (item.avg_minutes ?? 0) < 60
          ? "Excellent"
          : (item.avg_minutes ?? 0) < 120
          ? "Good"
          : "Needs Improvement",
    }));
  };

  const transformStaffProductivity = (data = []) => {
    return data
      .filter(item => item.processed_by__username || item.staff__username)
      .map(item => ({
        staff: item.processed_by__username || item.staff__username || "Unknown",
        count: item.count ?? 0,
        productivity:
          (item.count ?? 0) > 50 ? "High" : (item.count ?? 0) > 25 ? "Medium" : "Low",
      }))
      .slice(0, 10);
  };

  const transformStaffLeaderboard = (data = []) => {
    return data
      .filter(item => item.processed_by__username || item.staff__username)
      .map((item, index) => ({
        rank: index + 1,
        staff: item.processed_by__username || item.staff__username || "Unknown",
        count: item.count ?? 0,
        medal: index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`,
      }))
      .slice(0, 10);
  };

  const getTimeAgo = date => {
    if (!date || isNaN(date.getTime())) return "";
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

  const transformStaffActivity = (data = []) => {
    return data.slice(0, 20).map(item => {
      let parsed = null;
      try {
        parsed = item.timestamp ? new Date(item.timestamp) : null;
      } catch (e) {
        parsed = null;
      }
      return {
        id: item.id ?? `${item.staff ?? "unknown"}-${Math.random().toString(36).slice(2, 7)}`,
        staff: item.staff || "System",
        action: item.action || "UNKNOWN",
        timestamp: parsed && !isNaN(parsed.getTime()) ? parsed.toLocaleString() : "—",
        timeAgo: parsed && !isNaN(parsed.getTime()) ? getTimeAgo(parsed) : "",
      };
    });
  };

  // Stats Calculation - KEPT UNCHANGED
  const calculateStats = () => {
    const processedProductivity = !loadingProductivity
      ? transformStaffProductivity(staffProductivity)
      : [];
    const processedLeaderboard = !loadingLeaderboard
      ? transformStaffLeaderboard(staffLeaderboard)
      : [];

    const totalStaffProcessed = processedProductivity.reduce(
      (sum, item) => sum + (item.count ?? 0),
      0
    );
    const averageProductivity =
      processedProductivity.length > 0
        ? Math.round(totalStaffProcessed / processedProductivity.length)
        : 0;
    const topPerformer = processedLeaderboard[0] ?? null;
    const processingEfficiency = avgProcessingTime?.average_processing_time_minutes ?? 0;

    return {
      totalStaffProcessed,
      averageProductivity,
      topPerformer,
      processingEfficiency,
    };
  };

  const transformedProcessingByType = transformProcessingByType(avgProcessingTimeByType);
  const transformedStaffProductivity = transformStaffProductivity(staffProductivity);
  const transformedStaffLeaderboard = transformStaffLeaderboard(staffLeaderboard);
  const transformedStaffActivity = transformStaffActivity(staffActivity);
  const stats = calculateStats();

  const isAvgProcessingTimeLoaded = !loadingAvg && !!avgProcessingTime;
  const isLeaderboardLoaded =
    !loadingLeaderboard && Array.isArray(staffLeaderboard) && staffLeaderboard.length > 0;
  const isProductivityLoaded =
    !loadingProductivity && Array.isArray(staffProductivity) && staffProductivity.length > 0;
  const isTotalProcessedLoaded = isProductivityLoaded;

  return (
    <PageContainer>
      <Stack spacing="lg">
        {/* REDESIGNED: Using PageHeader from Design System */}
        <PageHeader
          icon={Trophy}
          title="Performance Analytics Dashboard"
          subtitle="Staff productivity, processing efficiency, and operational performance metrics"
        />

        <AnalyticsFilter onFilterChange={setFilters} />

        {/* REDESIGNED: Using Grid and StatCard from Design System */}
        <Grid cols={{ default: 1, md: 2, lg: 4 }} gap="md">
          <StatCard
            icon={Timer}
            title="Avg Processing Time"
            value={
              isAvgProcessingTimeLoaded
                ? `${(stats.processingEfficiency ?? 0).toFixed(1)}min`
                : "—"
            }
            subtitle="Per application"
            color="blue"
            isLoading={!isAvgProcessingTimeLoaded}
          />
          <StatCard
            icon={Users}
            title="Staff Productivity"
            value={isProductivityLoaded ? stats.averageProductivity : "—"}
            color="green"
            isLoading={loadingProductivity}
          />
          <StatCard
            icon={Trophy}
            title="Top Performer"
            value={isLeaderboardLoaded ? stats.topPerformer?.staff || "N/A" : "—"}
            subtitle={
              isLeaderboardLoaded ? `${stats.topPerformer?.count || 0} applications` : ""
            }
            color="yellow"
            badge="🏆"
            isLoading={loadingLeaderboard}
          />
          <StatCard
            icon={Activity}
            title="Total Processed"
            value={
              isTotalProcessedLoaded ? (stats.totalStaffProcessed || 0).toLocaleString() : "—"
            }
            subtitle="By all staff"
            color="purple"
            isLoading={loadingProductivity}
          />
        </Grid>

        {/* REDESIGNED: Using Grid and ChartCard from Design System */}
        <Grid cols={{ default: 1, lg: 2 }} gap="lg">
          <ChartCard
            icon={Clock}
            title="Processing Time by Assistance Type"
            isLoading={loadingType}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={transformedProcessingByType}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis />
                <Tooltip formatter={value => [`${value} min`, "Processing Time"]} />
                <Bar dataKey="avgMinutes" radius={[4, 4, 0, 0]}>
                  {transformedProcessingByType.map((entry, index) => {
                    let fillColor = "#94a3b8";
                    if (entry.type.toLowerCase().includes("educational")) {
                      fillColor = EDUCATION_GREEN;
                    } else if (entry.type.toLowerCase().includes("medical")) {
                      fillColor = MEDICALS_BLUE;
                    } else if (entry.type.toLowerCase().includes("burial")) {
                      fillColor = BURIAL_YELLOW;
                    }
                    return <Cell key={`type-cell-${index}-${entry.type}`} fill={fillColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            icon={Target}
            title="Processing Time Distribution"
            isLoading={loadingDistribution}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={processingDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ bucket, percent }) =>
                    `${bucket ?? ""} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  dataKey="count"
                >
                  {processingDistribution.map((entry, index) => (
                    <Cell
                      key={`dist-cell-${index}-${entry.bucket ?? index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={value => [value, "Applications"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid cols={{ default: 1, lg: 2 }} gap="lg">
          <ChartCard
            icon={Calendar}
            title="Staff Productivity (Top 10)"
            isLoading={loadingProductivity}
          >
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
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {transformedStaffProductivity.map((entry, index) => (
                    <Cell
                      key={`prod-cell-${index}-${entry.staff}`}
                      fill={getProductivityColor(entry.count)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard icon={Trophy} title="Staff Leaderboard" isLoading={loadingLeaderboard}>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {transformedStaffLeaderboard.map((staff, index) => (
                <div
                  key={`${staff.staff ?? "unknown"}-${staff.rank}-${index}`}
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
          </ChartCard>
        </Grid>

        {/* REDESIGNED: Using ChartCard from Design System */}
        <ChartCard icon={UserCheck} title="Recent Staff Activity" isLoading={loadingActivity}>
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
                {transformedStaffActivity.slice(0, 10).map(activity => (
                  <tr
                    key={activity.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-gray-800">{activity.staff}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.action === "CREATE"
                            ? "bg-green-100 text-green-800"
                            : activity.action === "UPDATE"
                            ? "bg-blue-100 text-blue-800"
                            : activity.action === "LOGIN"
                            ? "bg-indigo-100 text-indigo-800"
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
        </ChartCard>

        {/* REDESIGNED: Using AlertCard from Design System */}
        <AlertCard icon={Activity} title="Performance Insights" variant="info">
          <Grid cols={{ default: 1, md: 3 }} gap="md">
            <Card className="bg-blue-50 border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Processing Efficiency</h3>
              <p className="text-blue-700 text-sm">
                Average processing time of{" "}
                <span className="font-bold">
                  {(stats.processingEfficiency ?? 0).toFixed(1)} minutes
                </span>{" "}
                indicates
                {(stats.processingEfficiency ?? 0) < 60
                  ? " excellent"
                  : (stats.processingEfficiency ?? 0) < 120
                  ? " good"
                  : " room for improvement"}{" "}
                in efficiency.
              </p>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">Staff Performance</h3>
              <p className="text-green-700 text-sm">
                <span className="font-bold">
                  {stats.topPerformer?.staff || "Top performer"}
                </span>{" "}
                leads with{" "}
                <span className="font-bold">
                  {stats.topPerformer?.count || 0} processed applications
                </span>
                , showing strong productivity.
              </p>
            </Card>

            <Card className="bg-indigo-50 border-indigo-200">
              <h3 className="font-semibold text-indigo-800 mb-2">Workload Distribution</h3>
              <p className="text-indigo-700 text-sm">
                Average productivity of{" "}
                <span className="font-bold">{stats.averageProductivity}</span> applications per
                staff member indicates workload balance.
              </p>
            </Card>
          </Grid>
        </AlertCard>
      </Stack>
    </PageContainer>
  );
};

export default Performance;

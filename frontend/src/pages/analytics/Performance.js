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

// Import Analytics Components
import {
  PageContainer,
  PageHeader,
  AnalyticsStatCard,
  AnalyticsChartCard,
  AnalyticsAlertCard,
  AnalyticsGrid,
  AnalyticsStack,
  ChartContainer,
  InsightCard,
  AnalyticsTable,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  Badge,
} from "../../components/AnalyticsComponents";

// Color Constants
const BLUE_MEDIUM = "#3B82F6";
const DANGER_RED = "#EF4444";
const SUCCESS_GREEN = "#10B981";
const WARNING_YELLOW = "#FACC15";
const EDUCATION_GREEN = SUCCESS_GREEN;
const MEDICALS_BLUE = BLUE_MEDIUM;
const BURIAL_YELLOW = "#FDE68A";

const CHART_COLORS = [
  "#1D4ED8", // Blue
  "#3B82F6", // Light Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#14B8A6", // Teal
  "#F97316", // Orange
];

const getProductivityColor = count => {
  if (count > 50) return BLUE_MEDIUM;
  if (count > 25) return WARNING_YELLOW;
  return DANGER_RED;
};

const Performance = () => {
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

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
      <AnalyticsStack spacing="lg">
        <PageHeader
          icon={Trophy}
          title="Performance Analytics Dashboard"
          subtitle="Staff productivity, processing efficiency, and operational performance metrics"
        />

        <AnalyticsFilter onFilterChange={setFilters} />

        <AnalyticsGrid cols={{ default: 1, sm: 2, lg: 4 }} gap="md">
          <AnalyticsStatCard
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
          <AnalyticsStatCard
            icon={Users}
            title="Staff Productivity"
            value={isProductivityLoaded ? stats.averageProductivity : "—"}
            color="green"
            isLoading={loadingProductivity}
          />
          <AnalyticsStatCard
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
          <AnalyticsStatCard
            icon={Activity}
            title="Total Processed"
            value={
              isTotalProcessedLoaded ? (stats.totalStaffProcessed || 0).toLocaleString() : "—"
            }
            subtitle="By all staff"
            color="purple"
            isLoading={loadingProductivity}
          />
        </AnalyticsGrid>

        <AnalyticsGrid cols={{ default: 1, lg: 2 }} gap="md">
          <AnalyticsChartCard
            icon={Clock}
            title="Processing Time by Assistance Type"
            isLoading={loadingType}
          >
            <ChartContainer height={300}>
              <ResponsiveContainer width="100%" height="100%">
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
                      return (
                        <Cell key={`type-cell-${index}-${entry.type}`} fill={fillColor} />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </AnalyticsChartCard>

          <AnalyticsChartCard
            icon={Target}
            title="Processing Time Distribution"
            isLoading={loadingDistribution}
          >
            <ChartContainer height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processingDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    nameKey="bucket"
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
            </ChartContainer>
          </AnalyticsChartCard>
        </AnalyticsGrid>

        <AnalyticsGrid cols={{ default: 1, lg: 2 }} gap="md">
          <AnalyticsChartCard
            icon={Calendar}
            title="Staff Productivity (Top 10)"
            isLoading={loadingProductivity}
          >
            <ChartContainer height={350}>
              <ResponsiveContainer width="100%" height="100%">
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
            </ChartContainer>
          </AnalyticsChartCard>

          <AnalyticsChartCard
            icon={Trophy}
            title="Staff Leaderboard"
            isLoading={loadingLeaderboard}
          >
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {transformedStaffLeaderboard.map((staff, index) => (
                <div
                  key={`${staff.staff ?? "unknown"}-${staff.rank}-${index}`}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all hover:shadow-md ${
                    index < 3
                      ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-amber-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="text-xl">{staff.medal}</div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{staff.staff}</p>
                      <p className="text-xs text-gray-500">Rank #{staff.rank}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-800">{staff.count}</p>
                    <p className="text-xs text-gray-500">apps</p>
                  </div>
                </div>
              ))}
            </div>
          </AnalyticsChartCard>
        </AnalyticsGrid>

        <AnalyticsChartCard
          icon={UserCheck}
          title="Recent Staff Activity"
          isLoading={loadingActivity}
        >
          <AnalyticsTable>
            <TableHeader>
              <TableHeaderCell>Staff Member</TableHeaderCell>
              <TableHeaderCell>Action</TableHeaderCell>
              <TableHeaderCell>Timestamp</TableHeaderCell>
              <TableHeaderCell>Time Ago</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {transformedStaffActivity.slice(0, 10).map(activity => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium text-gray-800">{activity.staff}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        activity.action === "CREATE"
                          ? "success"
                          : activity.action === "UPDATE"
                          ? "info"
                          : activity.action === "LOGIN"
                          ? "default"
                          : "default"
                      }
                    >
                      {activity.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-600">{activity.timestamp}</TableCell>
                  <TableCell className="text-gray-500">{activity.timeAgo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </AnalyticsTable>
        </AnalyticsChartCard>

        <AnalyticsAlertCard icon={Activity} title="Performance Insights" variant="info">
          <AnalyticsGrid cols={{ default: 1, md: 3 }} gap="sm">
            <InsightCard title="Processing Efficiency">
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
            </InsightCard>

            <InsightCard title="Staff Performance">
              <span className="font-bold">{stats.topPerformer?.staff || "Top performer"}</span>{" "}
              leads with{" "}
              <span className="font-bold">
                {stats.topPerformer?.count || 0} processed applications
              </span>
              , showing strong productivity.
            </InsightCard>

            <InsightCard title="Workload Distribution">
              Average productivity of{" "}
              <span className="font-bold">{stats.averageProductivity}</span> applications per
              staff member indicates workload balance.
            </InsightCard>
          </AnalyticsGrid>
        </AnalyticsAlertCard>
      </AnalyticsStack>
    </PageContainer>
  );
};

export default Performance;

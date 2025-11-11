import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  BarChart3,
  Clock,
  Target,
  FileText,
  AlertCircle,
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

// Assistance Type Color Mapping - KEPT UNCHANGED
const ASSISTANCE_COLOR_MAP = {
  educational: "#10B981",
  medical: "#3B82F6",
  burial: "#FDE68A",
  other: "#EF4444",
  default: "#8B5CF6",
};

const getAssistanceColor = type => {
  const key = type ? type.toLowerCase() : "";
  if (key.includes("educational")) return ASSISTANCE_COLOR_MAP.educational;
  if (key.includes("medical")) return ASSISTANCE_COLOR_MAP.medical;
  if (key.includes("burial")) return ASSISTANCE_COLOR_MAP.burial;
  return ASSISTANCE_COLOR_MAP[key] || ASSISTANCE_COLOR_MAP.default;
};

const Trends = () => {
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [colorMap, setColorMap] = useState({});

  // Fetch Logic - KEPT UNCHANGED
  const fetchData = async endpoint => {
    const params = new URLSearchParams();
    if (filters.start) params.append("start_date", filters.start);
    if (filters.end) params.append("end_date", filters.end);
    if (filters.type) params.append("type", filters.type);
    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await api.get(`${endpoint}${query}`);
    return res.data;
  };

  const { data: monthlyData = [], isLoading: monthlyLoading } = useQuery({
    queryKey: ["trends", "monthly", filters],
    queryFn: () => fetchData("/analytics/trends/monthly/"),
  });
  const { data: yearlyData = [], isLoading: yearlyLoading } = useQuery({
    queryKey: ["trends", "yearly", filters],
    queryFn: () => fetchData("/analytics/trends/yearly/"),
  });
  const { data: overtimeData = [], isLoading: overtimeLoading } = useQuery({
    queryKey: ["trends", "overtime", filters],
    queryFn: () => fetchData("/analytics/trends/over-time/"),
  });
  const { data: cumulativeData = [], isLoading: cumulativeLoading } = useQuery({
    queryKey: ["trends", "cumulative", filters],
    queryFn: () => fetchData("/analytics/trends/cumulative/"),
  });
  const { data: assistanceTypeData = [], isLoading: assistanceTypeLoading } = useQuery({
    queryKey: ["trends", "assistanceType", filters],
    queryFn: () => fetchData("/analytics/trends/assistance-type/"),
  });
  const { data: assistanceTypeDataOverTime = [], isLoading: assistanceTypeOverTimeLoading } =
    useQuery({
      queryKey: ["trends", "assistanceTypeOverTime", filters],
      queryFn: () => fetchData("/analytics/trends/assistance-type-over-time/"),
    });
  const { data: applicantHeatmap = [], isLoading: applicantHeatmapLoading } = useQuery({
    queryKey: ["trends", "applicantHeatmap", filters],
    queryFn: () => fetchData("/analytics/trends/applicant-heatmap/"),
  });

  const loadingStates = {
    monthly: monthlyLoading,
    yearly: yearlyLoading,
    overtime: overtimeLoading,
    cumulative: cumulativeLoading,
    assistanceType: assistanceTypeLoading,
    assistanceTypeOverTime: assistanceTypeOverTimeLoading,
    applicantHeatmap: applicantHeatmapLoading,
  };

  // Data Transformations - KEPT UNCHANGED
  const transformMonthlyData = data =>
    data.map(item => ({
      month: new Date(item.month).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      count: item.count,
    }));

  const transformYearlyData = data =>
    data.map(item => ({
      year: item.year.toString(),
      count: item.count,
    }));

  const transformOvertimeData = data =>
    data.map(item => ({
      date: new Date(item.day).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count: item.count,
    }));

  const transformCumulativeData = data =>
    data.map(item => ({
      date: new Date(item.day).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      cumulative: item.cumulative,
    }));

  const transformAssistanceTypeOverTime = data => {
    const grouped = data.reduce((acc, item) => {
      const monthKey = new Date(item.month).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!acc[monthKey]) acc[monthKey] = { month: monthKey };
      acc[monthKey][item.type_of_assistance] = item.count;
      return acc;
    }, {});
    return Object.values(grouped);
  };

  const transformApplicantHeatmap = data => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i.toString().padStart(2, "0")}:00`,
      count: 0,
      intensity: 0,
    }));

    data.forEach(item => {
      if (item.hour >= 0 && item.hour < 24) hours[item.hour].count = item.count;
    });

    const maxCount = Math.max(...hours.map(h => h.count));
    hours.forEach(h => {
      h.intensity = maxCount > 0 ? (h.count / maxCount) * 100 : 0;
    });

    return hours;
  };

  const calculateGrowthRate = data => {
    if (data.length < 2) return 0;
    const latest = data[data.length - 1]?.count || 0;
    const previous = data[data.length - 2]?.count || 0;
    return previous > 0 ? ((latest - previous) / previous) * 100 : 0;
  };

  // HeatmapCell Component - KEPT UNCHANGED
  const HeatmapCell = ({ hour, count, intensity }) => {
    const getIntensityColor = intensity => {
      if (intensity === 0) return "#F3F4F6";
      if (intensity < 20) return "#E0F2FE";
      if (intensity < 40) return "#93C5FD";
      if (intensity < 60) return "#3B82F6";
      if (intensity < 80) return "#1D4ED8";
      return "#B91C1C";
    };
    return (
      <div
        className="flex flex-col items-center p-2 rounded-lg border border-gray-100 transition-all shadow-sm hover:shadow-md hover:scale-[1.02]"
        style={{ backgroundColor: getIntensityColor(intensity) }}
      >
        <span className="text-xs font-medium text-gray-700">{hour.label}</span>
        <span className="text-sm font-bold text-gray-800">{count}</span>
      </div>
    );
  };

  // Dynamic Color Mapping - KEPT UNCHANGED
  useEffect(() => {
    if (assistanceTypeData.length > 0) {
      const uniqueTypes = [
        ...new Set(assistanceTypeData.map(item => item.type_of_assistance)),
      ];
      const fallbackColors = ["#8B5CF6", "#F59E0B", "#EF4444", "#3B82F6"];
      let fallbackIndex = 0;
      const newColorMap = {};

      uniqueTypes.forEach(type => {
        const primaryColor = getAssistanceColor(type);
        if (primaryColor === ASSISTANCE_COLOR_MAP.default) {
          newColorMap[type] = fallbackColors[fallbackIndex % fallbackColors.length];
          fallbackIndex++;
        } else {
          newColorMap[type] = primaryColor;
        }
      });
      setColorMap(newColorMap);
    }
  }, [assistanceTypeData]);

  const transformedMonthlyData = transformMonthlyData(monthlyData);
  const transformedYearlyData = transformYearlyData(yearlyData);
  const transformedOvertimeData = transformOvertimeData(overtimeData);
  const transformedCumulativeData = transformCumulativeData(cumulativeData);
  const transformedAssistanceOverTime = transformAssistanceTypeOverTime(
    assistanceTypeDataOverTime
  );
  const transformedApplicantHeatmap = transformApplicantHeatmap(applicantHeatmap);

  // Calculated Stats - KEPT UNCHANGED
  const isCumulativeLoaded = !loadingStates.cumulative;
  const isMonthlyLoaded = !loadingStates.monthly;
  const isAssistanceTypeLoaded = !loadingStates.assistanceType;

  const totalApplications = isCumulativeLoaded
    ? transformedCumulativeData.length > 0
      ? transformedCumulativeData[transformedCumulativeData.length - 1].cumulative
      : 0
    : "...";

  const monthlyGrowth = isMonthlyLoaded ? calculateGrowthRate(transformedMonthlyData) : 0;

  const averageMonthlyApplications = isMonthlyLoaded
    ? transformedMonthlyData.length > 0
      ? Math.round(
          transformedMonthlyData.reduce((sum, i) => sum + i.count, 0) /
            transformedMonthlyData.length
        )
      : 0
    : "...";

  const mostPopularAssistance = isAssistanceTypeLoaded
    ? assistanceTypeData.reduce((prev, curr) => (prev.count > curr.count ? prev : curr), {
        type_of_assistance: "N/A",
        count: 0,
      }) || {}
    : { type_of_assistance: "...", count: "..." };

  return (
    <PageContainer>
      <Stack spacing="lg">
        {/* REDESIGNED: Using PageHeader from Design System */}
        <PageHeader
          icon={TrendingUp}
          title="Application Trends Analysis"
          subtitle="Comprehensive temporal analysis of application patterns and assistance types"
        />

        <AnalyticsFilter onFilterChange={setFilters} />

        {/* REDESIGNED: Using Grid and StatCard from Design System */}
        <Grid cols={{ default: 1, md: 2, lg: 4 }} gap="md">
          <StatCard
            icon={FileText}
            title="Total Applications"
            value={
              typeof totalApplications === "number"
                ? totalApplications.toLocaleString()
                : totalApplications
            }
            subtitle="All time"
            color="blue"
            isLoading={!isCumulativeLoaded}
          />
          <StatCard
            icon={TrendingUp}
            title="Monthly Growth"
            value={
              isMonthlyLoaded
                ? `${monthlyGrowth >= 0 ? "+" : ""}${monthlyGrowth.toFixed(1)}%`
                : "..."
            }
            subtitle="vs previous month"
            trend={monthlyGrowth}
            color="green"
            isLoading={!isMonthlyLoaded}
          />
          <StatCard
            icon={BarChart3}
            title="Monthly Average"
            value={
              typeof averageMonthlyApplications === "number"
                ? averageMonthlyApplications.toLocaleString()
                : averageMonthlyApplications
            }
            subtitle="applications per month"
            color="yellow"
            isLoading={!isMonthlyLoaded}
          />
          <StatCard
            icon={Target}
            title="Top Assistance"
            value={mostPopularAssistance.type_of_assistance}
            subtitle={`${mostPopularAssistance.count} applications`}
            color="purple"
            isLoading={!isAssistanceTypeLoaded}
          />
        </Grid>

        {/* REDESIGNED: Using Grid and ChartCard from Design System */}
        <Grid cols={{ default: 1, lg: 2 }} gap="lg">
          <ChartCard
            icon={Calendar}
            title="Monthly Trends (Last 12 Months)"
            isLoading={loadingStates.monthly}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={transformedMonthlyData}>
                <defs>
                  <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="month" fontSize={12} tick={{ fill: "#4b5563" }} />
                <YAxis tick={{ fill: "#4b5563" }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3B82F6"
                  fill="url(#monthlyGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            icon={BarChart3}
            title="Yearly Application Volume"
            isLoading={loadingStates.yearly}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transformedYearlyData}>
                <defs>
                  <linearGradient id="yearlyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e40af" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="year" tick={{ fill: "#4b5563" }} />
                <YAxis tick={{ fill: "#4b5563" }} />
                <Tooltip />
                <Bar dataKey="count" fill="url(#yearlyGradient)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid cols={{ default: 1, lg: 2 }} gap="lg">
          <ChartCard
            icon={Clock}
            title="Daily Application Trends"
            isLoading={loadingStates.overtime}
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={transformedOvertimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis
                  dataKey="date"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fill: "#4b5563" }}
                />
                <YAxis tick={{ fill: "#4b5563" }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#EF4444"
                  strokeWidth={3}
                  dot={{ fill: "#EF4444", stroke: "#fff", strokeWidth: 2, r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            icon={TrendingUp}
            title="Cumulative Growth"
            isLoading={loadingStates.cumulative}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={transformedCumulativeData}>
                <defs>
                  <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis
                  dataKey="date"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fill: "#4b5563" }}
                />
                <YAxis tick={{ fill: "#4b5563" }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#6366F1"
                  fill="url(#cumulativeGradient)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid cols={{ default: 1, lg: 2 }} gap="lg">
          <ChartCard
            icon={Target}
            title="Assistance Type Distribution"
            isLoading={loadingStates.assistanceType}
          >
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={assistanceTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  dataKey="count"
                  nameKey="type_of_assistance"
                  stroke="#fff"
                >
                  {assistanceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorMap[entry.type_of_assistance]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            icon={BarChart3}
            title="Assistance Types Over Time"
            isLoading={loadingStates.assistanceTypeOverTime}
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={transformedAssistanceOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis dataKey="month" tick={{ fill: "#4b5563" }} />
                <YAxis tick={{ fill: "#4b5563" }} />
                <Tooltip />
                <Legend />
                {Object.keys(transformedAssistanceOverTime[0] || {})
                  .filter(key => key !== "month")
                  .map((key, index) => (
                    <Bar key={key} dataKey={key} fill={colorMap[key]} radius={[4, 4, 0, 0]} />
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* REDESIGNED: Using ChartCard from Design System */}
        <ChartCard
          icon={Clock}
          title="Applicant Activity Heatmap (by Hour)"
          isLoading={loadingStates.applicantHeatmap}
        >
          <div className="grid grid-cols-6 sm:grid-cols-12 xl:grid-cols-24 gap-2">
            {transformedApplicantHeatmap.map((hour, index) => (
              <HeatmapCell key={index} {...hour} />
            ))}
          </div>
          <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-gray-200 rounded-full border border-gray-300"></div>
              <span>Low Activity (0)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-blue-600 rounded-full shadow-inner"></div>
              <span>Medium Activity</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 bg-red-700 rounded-full shadow-md"></div>
              <span>High Activity (Max)</span>
            </div>
          </div>
        </ChartCard>

        {/* REDESIGNED: Using AlertCard from Design System */}
        <AlertCard
          icon={AlertCircle}
          title="Trend Analysis Summary & Key Insights"
          description="A snapshot of the most critical temporal and service-related patterns identified in the data."
          variant="info"
        >
          <Grid cols={{ default: 1, md: 3 }} gap="md">
            <Card>
              <h3 className="font-semibold text-blue-800 mb-2">Growth Pattern</h3>
              {loadingStates.monthly ? (
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-gray-700 text-sm">
                  The current application volume shows a{" "}
                  <span
                    className={`font-bold ${
                      monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {monthlyGrowth >= 0 ? "Positive" : "Negative"} growth trend
                  </span>{" "}
                  with {Math.abs(monthlyGrowth).toFixed(1)}% change vs. previous month.
                </p>
              )}
            </Card>

            <Card>
              <h3 className="font-semibold text-blue-800 mb-2">Peak Activity</h3>
              {loadingStates.monthly ? (
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-gray-700 text-sm">
                  The dashboard maintains an average of{" "}
                  {averageMonthlyApplications.toLocaleString()} applications per month,
                  indicating steady demand.
                </p>
              )}
            </Card>

            <Card>
              <h3 className="font-semibold text-blue-800 mb-2">Service Demand</h3>
              {loadingStates.assistanceType ? (
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-gray-700 text-sm">
                  The most demanded service is {mostPopularAssistance.type_of_assistance} with{" "}
                  {mostPopularAssistance.count} requests.
                </p>
              )}
            </Card>
          </Grid>
        </AlertCard>
      </Stack>
    </PageContainer>
  );
};

export default Trends;

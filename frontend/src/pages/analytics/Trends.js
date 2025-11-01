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
  Activity,
  Clock,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Target,
  Loader2,
} from "lucide-react";
import AnalyticsFilter from "../../components/AnalyticsFilter";

// Fallback skeleton loader component for charts and lists
const SkeletonLoader = ({ height = 300, type = "chart" }) => (
  <div
    // Updated to use consistent rounded-3xl style
    className={`animate-pulse bg-gray-100 rounded-3xl ${type === "chart" ? "p-4" : "p-3"}`}
    style={{ height: type === "heatmap" ? "180px" : height }} // Set a fixed height for the heatmap skeleton to reserve space
  >
    {type === "chart" && <div className="h-full w-full bg-gray-200 rounded-lg"></div>}
    {type === "heatmap" && (
      // Skeleton grid representing the 24 hours in the heatmap
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-12 xl:grid-cols-24 gap-3 h-full">
        {[...Array(12)].map(
          (
            _,
            i // Use 12 items to represent rows that will wrap
          ) => (
            <div key={i} className="h-10 w-full bg-gray-200 rounded-lg"></div>
          )
        )}
      </div>
    )}
  </div>
);

// Custom Tooltip component with consistent design
const CustomTooltip = ({ active, payload, label }) =>
  active && payload && payload.length ? (
    <div
      className="bg-white p-3 rounded-lg shadow-lg"
      style={{
        backgroundColor: "white",
        border: "2px solid #dbeafe", // Blue-200 border
        borderRadius: "12px",
        fontSize: "14px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      }}
    >
      <p className="font-medium text-gray-800">{label}</p>
      {payload.map((entry, index) => (
        <p key={index} style={{ color: entry.color }} className="text-sm">
          {entry.name}: {entry.value.toLocaleString()}
        </p>
      ))}
    </div>
  ) : null;

// StatCard component updated to match Geographic/Demographics card style
// StatCard component — updated to NOT call getAssistanceColor
const StatCard = ({ icon: Icon, title, value, subtitle, trend, color, isLoading }) => (
  <div
    className={`group bg-white bg-opacity-80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300`}
    style={{ borderLeftColor: color }}
  >
    <div className="flex items-center gap-4 justify-between">
      <div>
        <p className="text-sm text-gray-600 font-semibold">{title}</p>

        {isLoading ? (
          <div className="mt-1 space-y-2">
            <div className="h-8 w-20 bg-gray-300 rounded animate-pulse"></div>
            {subtitle && <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>}
          </div>
        ) : (
          <>
            {/* If this is the Top Assistance card, show solid color text using `color` prop.
                Otherwise keep the gradient look. */}
            {title === "Top Assistance" ? (
              <h2 className="text-3xl font-bold" style={{ color: color }}>
                {value}
              </h2>
            ) : (
              <h2
                className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r"
                style={{ backgroundImage: `linear-gradient(to right, ${color}, #6366f1)` }}
              >
                {value}
              </h2>
            )}

            {subtitle && (
              <div className="flex items-center mt-1">
                {/* Optional: color subtitle for Top Assistance, otherwise gray */}
                <p
                  className="text-sm"
                  style={{ color: title === "Top Assistance" ? color : "#6B7280" }}
                >
                  {subtitle}
                </p>

                {trend !== undefined && (
                  <div
                    className={`ml-2 flex items-center text-xs font-semibold ${
                      trend >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {trend >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    <span className="ml-1">{Math.abs(trend).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
        style={{
          backgroundColor: color,
          background: `linear-gradient(to bottom right, ${color}90, ${color})`,
        }}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
    </div>
  </div>
);

const Trends = () => {
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchData = async endpoint => {
    const params = new URLSearchParams();

    if (filters.start) params.append("start_date", filters.start);
    if (filters.end) params.append("end_date", filters.end);
    if (filters.type) params.append("type", filters.type); // if you need it

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await api.get(`${endpoint}${query}`);
    return res.data;
  };

  // --- START MODIFICATIONS ---

  // 1. Define the Assistance Type Color Mapping
  // Colors: Educational-Green, Medical-Blue, Burial-Light Yellow.
  // Other colors are kept for general analytics. Red added as secondary.
  const ASSISTANCE_COLOR_MAP = {
    educational: "#10B981", // Green-600
    medical: "#3B82F6",    // Blue-600
    burial: "#FDE68A",     // Yellow-400 (light yellow/gold)
    // Add other colors for any non-mapped types or use default.
    other: "#EF4444",      // Red-600 (as requested for secondary analytics/other)
    default: "#8B5CF6",    // Purple (fallback)
  };

  // Helper function to get the correct color, normalizing the key
  const getAssistanceColor = (type) => {
    const key = type ? type.toLowerCase() : '';
    if (key.includes('educational')) return ASSISTANCE_COLOR_MAP.educational;
    if (key.includes('medical')) return ASSISTANCE_COLOR_MAP.medical;
    if (key.includes('burial')) return ASSISTANCE_COLOR_MAP.burial;
    // Fallback for types not explicitly listed in the map
    // We'll cycle through the explicit map values plus 'other' and 'default'
    const definedColors = Object.values(ASSISTANCE_COLOR_MAP);
    // Find the current type's index in the data array to apply a consistent color if it's not a primary type.
    // This part is complex without knowing all assistance types, so we'll just use the default set of colors for non-primary keys.
    return ASSISTANCE_COLOR_MAP[key] || ASSISTANCE_COLOR_MAP.default;
  };

  // Instead of a fixed array, we'll collect the unique types from the data and assign colors.
  const [colorMap, setColorMap] = useState({});

  // Fetch Logic (No change to logic)
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

  // 2. Map colors dynamically after data fetch for BarChart/Legend
  useEffect(() => {
    if (assistanceTypeData.length > 0) {
      // Collect all unique assistance types
      const uniqueTypes = [...new Set(assistanceTypeData.map(item => item.type_of_assistance))];

      // Use the explicit map, and cycle through the fallback colors for any extra types
      const fallbackColors = ["#8B5CF6", "#F59E0B", "#EF4444", "#3B82F6"]; // A custom cycle array
      let fallbackIndex = 0;
      const newColorMap = {};

      uniqueTypes.forEach(type => {
        const primaryColor = getAssistanceColor(type);
        if (primaryColor === ASSISTANCE_COLOR_MAP.default) {
          // If it's a default, assign a color from the cycle array
          newColorMap[type] = fallbackColors[fallbackIndex % fallbackColors.length];
          fallbackIndex++;
        } else {
          // Assign the specific color
          newColorMap[type] = primaryColor;
        }
      });
      setColorMap(newColorMap);
    }
  }, [assistanceTypeData]);

  const loadingStates = {
    monthly: monthlyLoading,
    yearly: yearlyLoading,
    overtime: overtimeLoading,
    cumulative: cumulativeLoading,
    assistanceType: assistanceTypeLoading,
    assistanceTypeOverTime: assistanceTypeOverTimeLoading,
    applicantHeatmap: applicantHeatmapLoading,
  };

  // **ASSISTANCE_COLORS is replaced by colorMap in usage below**

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

  // 3. HeatmapCell color update (changed default colors to blue monochromatic with red)
  const HeatmapCell = ({ hour, count, intensity }) => {
    const getIntensityColor = intensity => {
      // Monochromatic Blue with Red (for highest)
      if (intensity === 0) return "#F3F4F6"; // Gray-100 (No Activity)
      if (intensity < 20) return "#E0F2FE"; // Blue-50
      if (intensity < 40) return "#93C5FD"; // Blue-300
      if (intensity < 60) return "#3B82F6"; // Blue-600
      if (intensity < 80) return "#1D4ED8"; // Blue-800
      return "#B91C1C"; // Red-700 (Highest Activity - the 'red too' part)
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

  // --- END MODIFICATIONS ---

  // Data transformations
  const transformedMonthlyData = transformMonthlyData(monthlyData);
  const transformedYearlyData = transformYearlyData(yearlyData);
  const transformedOvertimeData = transformOvertimeData(overtimeData);
  const transformedCumulativeData = transformCumulativeData(cumulativeData);
  const transformedAssistanceOverTime = transformAssistanceTypeOverTime(
    assistanceTypeDataOverTime
  );
  const transformedApplicantHeatmap = transformApplicantHeatmap(applicantHeatmap);

  // Calculated stats (only run if data is available)
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

  // Header component matched to Geographic/Demographics.js header style
  const HeaderComponent = (
    <header className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl border border-blue-200 p-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Application Trends Analysis</h1>
          <p className="text-gray-600 text-lg mt-1">
            Comprehensive temporal analysis of application patterns and assistance types
          </p>
        </div>
      </div>
    </header>
  );

  return (
    // New: Matched main container style with gradient and blur effects
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      </div>

      <div className="relative z-10 p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        {HeaderComponent}

        <AnalyticsFilter onFilterChange={setFilters} />

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Activity}
            title="Total Applications"
            value={
              typeof totalApplications === "number"
                ? totalApplications.toLocaleString()
                : totalApplications
            }
            subtitle="All time"
            color="#3B82F6"
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
            color="#10B981"
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
            color="#F59E0B"
            isLoading={!isMonthlyLoaded}
          />
          <StatCard
            icon={Target}
            title="Top Assistance"
            value={mostPopularAssistance.type_of_assistance}
            subtitle={`${mostPopularAssistance.count} applications`}
            color={getAssistanceColor(mostPopularAssistance.type_of_assistance) || "#8B5CF6"} // Use the new color mapping
            isLoading={!isAssistanceTypeLoaded}
          />
        </div>

        {/* Monthly and Yearly Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends - Chart Container Matched */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-6 border-b pb-3 border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                Monthly Trends (Last 12 Months)
              </h2>
            </div>
            {loadingStates.monthly ? (
              <SkeletonLoader height={300} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={transformedMonthlyData}>
                  <defs>
                    {/* Primary Blue for Monochromatic Analytics */}
                    <linearGradient id="monthlyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="month" fontSize={12} tick={{ fill: "#4b5563" }} />
                  <YAxis tick={{ fill: "#4b5563" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3B82F6"
                    fill="url(#monthlyGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Yearly Trends - Chart Container Matched */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-6 border-b pb-3 border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-green-600" />
                Yearly Application Volume
              </h2>
            </div>
            {loadingStates.yearly ? (
              <SkeletonLoader height={300} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transformedYearlyData}>
                  <defs>
                    {/* Secondary Monochromatic Blue for Analytics */}
                    <linearGradient id="yearlyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1e40af" /> 
                      <stop offset="100%" stopColor="#3b82f6" /> 
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="year" tick={{ fill: "#4b5563" }} />
                  <YAxis tick={{ fill: "#4b5563" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="url(#yearlyGradient)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Daily Trends and Cumulative Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Trends - Chart Container Matched */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-6 border-b pb-3 border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Clock className="mr-2 h-5 w-5 text-orange-600" />
                Daily Application Trends
              </h2>
            </div>
            {loadingStates.overtime ? (
              <SkeletonLoader height={300} />
            ) : (
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
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#EF4444" // Red for Monochromatic + Red
                    strokeWidth={3}
                    dot={{ fill: "#EF4444", stroke: "#fff", strokeWidth: 2, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Cumulative Growth - Chart Container Matched */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-6 border-b pb-3 border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
                Cumulative Growth
              </h2>
            </div>
            {loadingStates.cumulative ? (
              <SkeletonLoader height={300} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={transformedCumulativeData}>
                  <defs>
                    {/* Purple/Indigo Monochromatic for Analytics */}
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
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#6366F1" // Indigo-500
                    fill="url(#cumulativeGradient)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Assistance Type Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assistance Type Distribution - Chart Container Matched */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-6 border-b pb-3 border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Target className="mr-2 h-5 w-5 text-blue-600" />
                Assistance Type Distribution
              </h2>
            </div>
            {loadingStates.assistanceType ? (
              <SkeletonLoader height={350} />
            ) : (
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
                    stroke="#fff" // Added stroke for consistent pie chart style
                  >
                    {assistanceTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        // Use the colorMap for specific, consistent colors
                        fill={colorMap[entry.type_of_assistance]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={value => [value, "Applications"]}
                    content={<CustomTooltip />}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Assistance Over Time - Chart Container Matched */}
          <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-6 border-b pb-3 border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-pink-600" />
                Assistance Types Over Time
              </h2>
            </div>
            {loadingStates.assistanceTypeOverTime ? (
              <SkeletonLoader height={350} />
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={transformedAssistanceOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="month" tick={{ fill: "#4b5563" }} />
                  <YAxis tick={{ fill: "#4b5563" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {Object.keys(transformedAssistanceOverTime[0] || {})
                    .filter(key => key !== "month")
                    .map((key, index) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        // Use the colorMap for specific, consistent colors
                        fill={colorMap[key]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Applicant Activity Heatmap - Chart Container Matched */}
        <div className="bg-white bg-opacity-80 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-6 border-b pb-3 border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-red-600" />
              Applicant Activity Heatmap (by Hour)
            </h2>
          </div>
          {/* Ensure this block defines a clear vertical space */}
          <div className="relative">
            {loadingStates.applicantHeatmap ? (
              <SkeletonLoader height={180} type="heatmap" /> // Adjusted height is crucial here
            ) : (
              // Increased grid columns for better layout of 24 hours
              <div className="grid grid-cols-6 sm:grid-cols-12 xl:grid-cols-24 gap-2">
                {transformedApplicantHeatmap.map((hour, index) => (
                  <HeatmapCell key={index} {...hour} />
                ))}
              </div>
            )}

            {/* Color Legend/Key for Heatmap - Enhanced key colors for consistency */}
            <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-600 w-full">
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-gray-200 rounded-full border border-gray-300"></div>
                <span>Low Activity (0)</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-blue-300 rounded-full shadow-inner"></div>
                <span>Medium Activity</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-4 bg-red-700 rounded-full shadow-md"></div>
                <span>High Activity (Max)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trends Summary - Matched to the insight card style */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-3xl p-8 shadow-xl backdrop-blur-xl mt-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center">
            <AlertCircle className="mr-2 h-6 w-6 text-blue-600" />
            Trend Analysis Summary & Key Insights
          </h2>
          <p className="text-blue-800 mb-6 leading-relaxed text-base border-b pb-4 border-blue-200">
            A snapshot of the most critical temporal and service-related patterns identified in
            the data.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-xl border-2 border-blue-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
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
            </div>
            <div className="bg-white p-4 rounded-xl border-2 border-green-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <h3 className="font-semibold text-green-800 mb-2">Peak Activity</h3>
              {loadingStates.monthly ? (
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-gray-700 text-sm">
                  The dashboard maintains an average of 
                  {averageMonthlyApplications.toLocaleString()} applications per month,
                  indicating steady demand.
                </p>
              )}
            </div>
            <div className="bg-white p-4 rounded-xl border-2 border-purple-200 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <h3 className="font-semibold text-purple-800 mb-2">Service Demand</h3>
              {loadingStates.assistanceType ? (
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-gray-700 text-sm">
                  The most demanded service is {mostPopularAssistance.type_of_assistance}
                  with {mostPopularAssistance.count} requests.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trends;
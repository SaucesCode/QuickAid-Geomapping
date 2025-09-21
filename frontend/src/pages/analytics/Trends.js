import React, { useEffect, useState } from "react";
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
  ComposedChart,
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
} from "lucide-react";

const Trends = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [overtimeData, setOvertimeData] = useState([]);
  const [cumulativeData, setCumulativeData] = useState([]);
  const [assistanceTypeData, setAssistanceTypeData] = useState([]);
  const [assistanceTypeDataOverTime, setAssistanceTypeDataOverTime] = useState([]);
  const [applicantHeatmap, setApplicantHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log(assistanceTypeDataOverTime);
  console.log(assistanceTypeData);
  // Color palettes for charts
  const ASSISTANCE_COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"];
  const TREND_COLORS = ["#06B6D4", "#84CC16", "#F97316"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          monthlyRes,
          yearlyRes,
          overtimeRes,
          cumulativeRes,
          assistanceTypeRes,
          assistanceTypeOverTimeRes,
          applicantHeatmapRes,
        ] = await Promise.all([
          api.get("/analytics/trends/monthly/"),
          api.get("/analytics/trends/yearly/"),
          api.get("/analytics/trends/over-time/"),
          api.get("/analytics/trends/cumulative/"),
          api.get("/analytics/trends/assistance-type/"),
          api.get("/analytics/trends/assistance-type-over-time/"),
          api.get("/analytics/trends/applicant-heatmap/"),
        ]);

        setMonthlyData(monthlyRes.data || []);
        setYearlyData(yearlyRes.data || []);
        setOvertimeData(overtimeRes.data || []);
        setCumulativeData(cumulativeRes.data || []);
        setAssistanceTypeData(assistanceTypeRes.data || []);
        setAssistanceTypeDataOverTime(assistanceTypeOverTimeRes.data || []);
        setApplicantHeatmap(applicantHeatmapRes.data || []);
      } catch (err) {
        console.error("Error fetching trends data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Data transformation functions
  const transformMonthlyData = data => {
    return data.map(item => ({
      month: new Date(item.month).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      count: item.count,
      monthDate: item.month,
    }));
  };

  const transformYearlyData = data => {
    return data.map(item => ({
      year: item.year.toString(),
      count: item.count,
    }));
  };

  const transformOvertimeData = data => {
    return data.map(item => ({
      date: new Date(item.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: item.count,
      fullDate: item.day,
    }));
  };

  const transformCumulativeData = data => {
    return data.map(item => ({
      date: new Date(item.day).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      cumulative: item.cumulative,
      fullDate: item.day,
    }));
  };

  const transformAssistanceTypeOverTime = data => {
    // Group by month and assistance type
    const grouped = data.reduce((acc, item) => {
      const monthKey = new Date(item.month).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, monthDate: item.month };
      }
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
      if (item.hour >= 0 && item.hour < 24) {
        hours[item.hour].count = item.count;
      }
    });

    const maxCount = Math.max(...hours.map(h => h.count));
    hours.forEach(h => {
      h.intensity = maxCount > 0 ? (h.count / maxCount) * 100 : 0;
    });

    return hours;
  };

  // Calculate statistics
  const calculateGrowthRate = data => {
    if (data.length < 2) return 0;
    const latest = data[data.length - 1]?.count || 0;
    const previous = data[data.length - 2]?.count || 0;
    return previous > 0 ? ((latest - previous) / previous) * 100 : 0;
  };

  const HeatmapCell = ({ hour, count, intensity, maxCount }) => {
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

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color }) => (
    <div
      className="bg-white rounded-xl shadow-lg p-6 border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && (
            <div className="flex items-center mt-1">
              <p className="text-sm text-gray-500">{subtitle}</p>
              {trend !== undefined && (
                <div
                  className={`ml-2 flex items-center text-xs ${
                    trend >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trend >= 0 ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  <span className="ml-1">{Math.abs(trend).toFixed(1)}%</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="p-3 rounded-full" style={{ backgroundColor: color + "20" }}>
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading trends data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 text-center">
            {error.message || "Failed to fetch trends data"}
          </p>
        </div>
      </div>
    );
  }

  const transformedMonthlyData = transformMonthlyData(monthlyData);
  const transformedYearlyData = transformYearlyData(yearlyData);
  const transformedOvertimeData = transformOvertimeData(overtimeData);
  const transformedCumulativeData = transformCumulativeData(cumulativeData);
  const transformedAssistanceOverTime = transformAssistanceTypeOverTime(
    assistanceTypeDataOverTime
  );
  const transformedApplicantHeatmap = transformApplicantHeatmap(applicantHeatmap);

  // Calculate statistics
  const totalApplications =
    transformedCumulativeData.length > 0
      ? transformedCumulativeData[transformedCumulativeData.length - 1].cumulative
      : assistanceTypeData.reduce((sum, item) => sum + item.count, 0);

  const monthlyGrowth = calculateGrowthRate(transformedMonthlyData);
  const mostPopularAssistance = assistanceTypeData.reduce(
    (prev, current) => (prev.count > current.count ? prev : current),
    { type_of_assistance: "N/A", count: 0 }
  );

  const averageMonthlyApplications =
    transformedMonthlyData.length > 0
      ? Math.round(
          transformedMonthlyData.reduce((sum, item) => sum + item.count, 0) /
            transformedMonthlyData.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Application Trends Analysis
          </h1>
          <p className="text-gray-600 text-lg">
            Comprehensive temporal analysis of application patterns and assistance types
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Activity}
            title="Total Applications"
            value={totalApplications.toLocaleString()}
            subtitle="All time"
            color="#3B82F6"
          />
          <StatCard
            icon={TrendingUp}
            title="Monthly Growth"
            value={`${monthlyGrowth >= 0 ? "+" : ""}${monthlyGrowth.toFixed(1)}%`}
            subtitle="vs previous month"
            trend={monthlyGrowth}
            color="#10B981"
          />
          <StatCard
            icon={BarChart3}
            title="Monthly Average"
            value={averageMonthlyApplications.toLocaleString()}
            subtitle="applications per month"
            color="#F59E0B"
          />
          <StatCard
            icon={Target}
            title="Top Assistance"
            value={mostPopularAssistance.type_of_assistance}
            subtitle={`${mostPopularAssistance.count} applications`}
            color="#8B5CF6"
          />
        </div>

        {/* Monthly and Yearly Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                Monthly Trends (Last 12 Months)
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={transformedMonthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3B82F6"
                  fill="#3B82F6"
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Yearly Trends */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-green-600" />
                Yearly Application Volume
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transformedYearlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Trends and Cumulative Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Trends */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Clock className="mr-2 h-5 w-5 text-orange-600" />
                Daily Application Trends
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={transformedOvertimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={11} angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#F97316"
                  strokeWidth={2}
                  dot={{ fill: "#F97316", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cumulative Growth */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
                Cumulative Growth
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={transformedCumulativeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={11} angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Assistance Type Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assistance Type Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Target className="mr-2 h-5 w-5 text-blue-600" />
                Assistance Type Distribution
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={assistanceTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="type_of_assistance"
                >
                  {assistanceTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={ASSISTANCE_COLORS[index % ASSISTANCE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={value => [value, "Applications"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Assistance Types Over Time */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Assistance Types Trends Over Time
              </h2>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={transformedAssistanceOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={11} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {assistanceTypeData.map((type, index) => (
                  <Area
                    key={type.type_of_assistance}
                    type="monotone"
                    dataKey={type.type_of_assistance}
                    stackId="1"
                    stroke={ASSISTANCE_COLORS[index % ASSISTANCE_COLORS.length]}
                    fill={ASSISTANCE_COLORS[index % ASSISTANCE_COLORS.length]}
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Applicant  Heatmap */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-600" />
              Applicant Application Heatmap (Hourly Distribution)
            </h2>
          </div>
          <div className="grid grid-cols-6 md:grid-cols-12 lg:grid-cols-24 gap-2">
            {transformedApplicantHeatmap.map(hour => (
              <HeatmapCell
                key={hour.hour}
                hour={hour}
                count={hour.count}
                intensity={hour.intensity}
                maxCount={Math.max(...transformedApplicantHeatmap.map(h => h.count))}
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
        </div>

        {/* Trends Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Trend Analysis Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Growth Pattern</h3>
              <p className="text-blue-700 text-sm">
                {monthlyGrowth >= 0 ? "Positive" : "Negative"} growth trend with{" "}
                {Math.abs(monthlyGrowth).toFixed(1)}% change from previous month
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">Peak Activity</h3>
              <p className="text-green-700 text-sm">
                Average of {averageMonthlyApplications} applications per month with seasonal
                variations
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2">Service Demand</h3>
              <p className="text-purple-700 text-sm">
                {mostPopularAssistance.type_of_assistance} assistance shows highest demand with{" "}
                {mostPopularAssistance.count} requests
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trends;

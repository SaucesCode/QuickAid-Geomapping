import React, { useEffect, useState } from "react";
// 1. ADD REACT QUERY IMPORTS
import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api } from "../../services/api";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, Calendar, BarChart3, Activity, Clock, AlertCircle,
  ArrowUp, ArrowDown, Target, Loader2,
} from "lucide-react";

// 2. INITIALIZE QUERY CLIENT
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Set a short staleTime to ensure the data is refetched if needed, matching the original's imperative fetch
      staleTime: 5 * 60 * 1000, 
      refetchOnWindowFocus: false, // Optional: prevents unnecessary refetches on tab switch
    },
  },
});

// Helper function to define the fetcher for useQuery
const trendsFetcher = (endpoint) => async () => {
  const res = await api.get(endpoint);
  return res.data || [];
};

// Fallback skeleton loader component for charts and lists (unchanged)
const SkeletonLoader = ({ height = 300, type = 'chart' }) => (
  <div
    // **FIX HERE: Use h-auto to dynamically size for content and add padding**
    className={`animate-pulse bg-gray-100 rounded-xl ${type === 'chart' ? 'p-4' : 'p-3'}`}
    style={{ height: type === 'heatmap' ? '180px' : height }} // **Set a fixed height for the heatmap skeleton to reserve space**
  >
    {type === 'chart' && <div className="h-full w-full bg-gray-200 rounded-lg"></div>}
    {type === 'heatmap' && (
      // Skeleton grid representing the 24 hours in the heatmap
      // The fixed height above helps contain this grid
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-12 xl:grid-cols-24 gap-3 h-full">
        {[...Array(12)].map((_, i) => ( // Use 12 items to represent rows that will wrap
          <div key={i} className="h-10 w-full bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    )}
  </div>
);


const Trends = () => {
  // ORIGINAL STATE VARIABLES (DO NOT DELETE/CHANGE - CONSTRAINT)
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [overtimeData, setOvertimeData] = useState([]);
  const [cumulativeData, setCumulativeData] = useState([]);
  const [assistanceTypeData, setAssistanceTypeData] = useState([]);
  const [assistanceTypeDataOverTime, setAssistanceTypeDataOverTime] = useState([]);
  const [applicantHeatmap, setApplicantHeatmap] = useState([]);
  const [error, setError] = useState(null); // Retained for consistency

  // Existing individual loading states (DO NOT DELETE/CHANGE - CONSTRAINT)
  const [loadingStates, setLoadingStates] = useState({
    monthly: true, yearly: true, overtime: true, cumulative: true,
    assistanceType: true, assistanceTypeOverTime: true, applicantHeatmap: true,
  });

  const setSectionLoaded = (section) =>
    setLoadingStates((prev) => ({ ...prev, [section]: false }));
  
  // NOTE: The original useEffect hook that contained the fetching logic has been removed.

  // 3. REACT QUERY HOOKS (REPLACING useEffect FETCHING LOGIC)
  const monthlyQuery = useQuery({
    queryKey: ['trends', 'monthly'],
    queryFn: trendsFetcher("/analytics/trends/monthly/"),
  });
  
  const yearlyQuery = useQuery({
    queryKey: ['trends', 'yearly'],
    queryFn: trendsFetcher("/analytics/trends/yearly/"),
  });
  
  const overtimeQuery = useQuery({
    queryKey: ['trends', 'overtime'],
    queryFn: trendsFetcher("/analytics/trends/over-time/"),
  });
  
  const cumulativeQuery = useQuery({
    queryKey: ['trends', 'cumulative'],
    queryFn: trendsFetcher("/analytics/trends/cumulative/"),
  });
  
  const assistanceTypeQuery = useQuery({
    queryKey: ['trends', 'assistanceType'],
    queryFn: trendsFetcher("/analytics/trends/assistance-type/"),
  });
  
  const assistanceTypeOverTimeQuery = useQuery({
    queryKey: ['trends', 'assistanceTypeOverTime'],
    queryFn: trendsFetcher("/analytics/trends/assistance-type-over-time/"),
  });
  
  const applicantHeatmapQuery = useQuery({
    queryKey: ['trends', 'applicantHeatmap'],
    queryFn: trendsFetcher("/analytics/trends/applicant-heatmap/"),
  });
  
  // 4. MAPPING useEffect (BRIDGING REACT QUERY RESULTS TO ORIGINAL STATE VARIABLES)
  useEffect(() => {
    // Helper function for mapping
    const mapQueryToState = (query, setter, sectionKey) => {
        if (query.isSuccess) {
            // Log original console.error message on success (if original logic was present)
            setter(query.data);
            setSectionLoaded(sectionKey);
        } else if (query.isError) {
            // Mimic original behavior: console.error and let loading state remain true
            console.error(`⚠️ Error fetching ${sectionKey}:`, query.error);
            setError(query.error.message || `An error occurred fetching ${sectionKey}`);
        }
    };

    mapQueryToState(monthlyQuery, setMonthlyData, "monthly");
    mapQueryToState(yearlyQuery, setYearlyData, "yearly");
    mapQueryToState(overtimeQuery, setOvertimeData, "overtime");
    mapQueryToState(cumulativeQuery, setCumulativeData, "cumulative");
    mapQueryToState(assistanceTypeQuery, setAssistanceTypeData, "assistanceType");
    mapQueryToState(assistanceTypeOverTimeQuery, setAssistanceTypeDataOverTime, "assistanceTypeOverTime");
    mapQueryToState(applicantHeatmapQuery, setApplicantHeatmap, "applicantHeatmap");
    
  }, [
    monthlyQuery.status, monthlyQuery.data, monthlyQuery.error,
    yearlyQuery.status, yearlyQuery.data, yearlyQuery.error,
    overtimeQuery.status, overtimeQuery.data, overtimeQuery.error,
    cumulativeQuery.status, cumulativeQuery.data, cumulativeQuery.error,
    assistanceTypeQuery.status, assistanceTypeQuery.data, assistanceTypeQuery.error,
    assistanceTypeOverTimeQuery.status, assistanceTypeOverTimeQuery.data, assistanceTypeOverTimeQuery.error,
    applicantHeatmapQuery.status, applicantHeatmapQuery.data, applicantHeatmapQuery.error,
    setSectionLoaded, setMonthlyData, setYearlyData, setOvertimeData, setCumulativeData,
    setAssistanceTypeData, setAssistanceTypeDataOverTime, setApplicantHeatmap, setError,
  ]);


  // ORIGINAL LOGIC (UNCHANGED BELOW THIS LINE)

  const ASSISTANCE_COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"];

  const transformMonthlyData = (data) =>
    data.map((item) => ({
      month: new Date(item.month).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      count: item.count,
    }));

  const transformYearlyData = (data) =>
    data.map((item) => ({
      year: item.year.toString(),
      count: item.count,
    }));

  const transformOvertimeData = (data) =>
    data.map((item) => ({
      date: new Date(item.day).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      count: item.count,
    }));

  const transformCumulativeData = (data) =>
    data.map((item) => ({
      date: new Date(item.day).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      cumulative: item.cumulative,
    }));

  const transformAssistanceTypeOverTime = (data) => {
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

  const transformApplicantHeatmap = (data) => {
    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      label: `${i.toString().padStart(2, "0")}:00`,
      count: 0,
      intensity: 0,
    }));

    data.forEach((item) => {
      if (item.hour >= 0 && item.hour < 24) hours[item.hour].count = item.count;
    });

    const maxCount = Math.max(...hours.map((h) => h.count));
    hours.forEach((h) => {
      h.intensity = maxCount > 0 ? (h.count / maxCount) * 100 : 0;
    });

    return hours;
  };

  const calculateGrowthRate = (data) => {
    if (data.length < 2) return 0;
    const latest = data[data.length - 1]?.count || 0;
    const previous = data[data.length - 2]?.count || 0;
    return previous > 0 ? ((latest - previous) / previous) * 100 : 0;
  };

  const HeatmapCell = ({ hour, count, intensity }) => {
    const getIntensityColor = (intensity) => {
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

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color, isLoading }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 relative" style={{ borderLeftColor: color }}>
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
              {subtitle && (
                <div className="flex items-center mt-1">
                  <p className="text-sm text-gray-500">{subtitle}</p>
                  {trend !== undefined && (
                    <div
                      className={`ml-2 flex items-center text-xs ${
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
        <div className="p-3 rounded-full" style={{ backgroundColor: color + "20" }}>
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) =>
    active && payload && payload.length ? (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-800">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    ) : null;

  // Data transformations
  const transformedMonthlyData = transformMonthlyData(monthlyData);
  const transformedYearlyData = transformYearlyData(yearlyData);
  const transformedOvertimeData = transformOvertimeData(overtimeData);
  const transformedCumulativeData = transformCumulativeData(cumulativeData);
  const transformedAssistanceOverTime = transformAssistanceTypeOverTime(assistanceTypeDataOverTime);
  const transformedApplicantHeatmap = transformApplicantHeatmap(applicantHeatmap);

  // Calculated stats (only run if data is available)
  const isCumulativeLoaded = !loadingStates.cumulative;
  const isMonthlyLoaded = !loadingStates.monthly;
  const isAssistanceTypeLoaded = !loadingStates.assistanceType;

  const totalApplications = isCumulativeLoaded
    ? transformedCumulativeData.length > 0
      ? transformedCumulativeData[transformedCumulativeData.length - 1].cumulative
      : 0
    : '...';

  const monthlyGrowth = isMonthlyLoaded
    ? calculateGrowthRate(transformedMonthlyData)
    : 0;

  const averageMonthlyApplications = isMonthlyLoaded
    ? transformedMonthlyData.length > 0
      ? Math.round(
          transformedMonthlyData.reduce((sum, i) => sum + i.count, 0) /
            transformedMonthlyData.length
        )
      : 0
    : '...';

  const mostPopularAssistance = isAssistanceTypeLoaded
    ? assistanceTypeData.reduce(
        (prev, curr) => (prev.count > curr.count ? prev : curr),
        { type_of_assistance: "N/A", count: 0 }
      ) || {}
    : { type_of_assistance: "...", count: '...' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
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
            value={typeof totalApplications === 'number' ? totalApplications.toLocaleString() : totalApplications}
            subtitle="All time"
            color="#3B82F6"
            isLoading={!isCumulativeLoaded}
          />
          <StatCard
            icon={TrendingUp}
            title="Monthly Growth"
            value={isMonthlyLoaded ? `${monthlyGrowth >= 0 ? "+" : ""}${monthlyGrowth.toFixed(1)}%` : '...'}
            subtitle="vs previous month"
            trend={monthlyGrowth}
            color="#10B981"
            isLoading={!isMonthlyLoaded}
          />
          <StatCard
            icon={BarChart3}
            title="Monthly Average"
            value={typeof averageMonthlyApplications === 'number' ? averageMonthlyApplications.toLocaleString() : averageMonthlyApplications}
            subtitle="applications per month"
            color="#F59E0B"
            isLoading={!isMonthlyLoaded}
          />
          <StatCard
            icon={Target}
            title="Top Assistance"
            value={mostPopularAssistance.type_of_assistance}
            subtitle={`${mostPopularAssistance.count} applications`}
            color="#8B5CF6"
            isLoading={!isAssistanceTypeLoaded}
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
            {loadingStates.monthly ? (
              <SkeletonLoader height={300} />
            ) : (
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
            )}
          </div>

          {/* Yearly Trends */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-green-600" />
                Yearly Application Volume
              </h2>
            </div>
            {loadingStates.yearly ? (
              <SkeletonLoader height={300} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transformedYearlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
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
            {loadingStates.overtime ? (
              <SkeletonLoader height={300} />
            ) : (
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
            )}
          </div>

          {/* Cumulative Growth */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
                Cumulative Growth
              </h2>
            </div>
            {loadingStates.cumulative ? (
              <SkeletonLoader height={300} />
            ) : (
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
            )}
          </div>
        </div>

        {/* Assistance Type Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
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
                  >
                    {assistanceTypeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={ASSISTANCE_COLORS[index % ASSISTANCE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, "Applications"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Assistance Over Time */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-pink-600" />
                Assistance Types Over Time
              </h2>
            </div>
            {loadingStates.assistanceTypeOverTime ? (
              <SkeletonLoader height={350} />
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={transformedAssistanceOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {Object.keys(transformedAssistanceOverTime[0] || {})
                    .filter((key) => key !== "month")
                    .map((key, index) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        fill={ASSISTANCE_COLORS[index % ASSISTANCE_COLORS.length]}
                        radius={[4, 4, 0, 0]}
                      />
                    ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Applicant Activity Heatmap */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-red-600" />
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
            
            {/* Color Legend/Key for Heatmap - Ensure it's static below the content */}
            <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600 w-full">
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
        </div>
        
        {/* Trends Summary - This card is correctly placed after the Heatmap card */}
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Trend Analysis Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">Growth Pattern</h3>
                {loadingStates.monthly ? (
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-blue-700 text-sm">
                    {monthlyGrowth >= 0 ? "Positive" : "Negative"} growth trend with{" "}
                    {Math.abs(monthlyGrowth).toFixed(1)}% change from previous month
                  </p>
                )}
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Peak Activity</h3>
                {loadingStates.monthly ? (
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-green-700 text-sm">
                    Average of {averageMonthlyApplications} applications per month with seasonal
                    variations
                  </p>
                )}
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">Service Demand</h3>
                {loadingStates.assistanceType ? (
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <p className="text-purple-700 text-sm">
                    **{mostPopularAssistance.type_of_assistance}** assistance shows highest demand with{" "}
                    {mostPopularAssistance.count} requests
                  </p>
                )}
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};

// 5. WRAPPER COMPONENT
// The main export should be wrapped in QueryClientProvider to make useQuery available.
const TrendsWithQuery = () => (
    <QueryClientProvider client={queryClient}>
        <Trends />
    </QueryClientProvider>
);

export default TrendsWithQuery;
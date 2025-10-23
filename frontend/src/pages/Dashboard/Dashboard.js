import React, { useEffect, useMemo } from "react";
// Import React Query hooks
import { useQuery, useQueries } from "@tanstack/react-query";
import { api } from "../../services/api";
import toast from "react-hot-toast";
import {
  Users,
  Clock,
  TrendingUp,
  MapPin,
  LayoutDashboard,
  Activity,
  FileText,
  PieChart as PieIcon,
  BarChart as BarIcon,
  Calendar, // Icon for Today's Applicants
  BarChart2, // Icon for Weekly Applicants
  LineChart, // Icon for Monthly Applicants
  Loader2,
} from "lucide-react";
import {
  LineChart as RechartsLineChart, // Renamed to avoid conflict with lucide LineChart
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";

// --- Color Mapping to match your visual analytics ---
const TYPE_COLORS = {
  Medical: "#10b981", // Green
  Educational: "#3b82f6", // Blue
  Burial: "#f59e0b", // Orange/Yellow
  Livelihood: "#8b5cf6", // Purple
  // Add other types if necessary
};

const STATUS_COLORS = {
  Submitted: "#9ca3af", // Grey
  "Pending Review": "#fbbf24", // Yellow
  Approved: "#10b981", // Green
  Rejected: "#ef4444", // Red
};

// --- KPI Definitions (Mapping the original state structure to Query keys) ---
// Note: React Query's parallel nature replaces the need for custom delays and setKpiStats logic.
const KPI_KEYS = [
  { key: 'today', title: "TODAY'S APPLICANTS", icon: Calendar, iconColor: "#06b6d4", gradientEndColor: "#06b6d4", endpoint: "/analytics/dashboard/summary/" },
  { key: 'weekly', title: "WEEKLY APPLICANTS", icon: BarChart2, iconColor: "#8b5cf6", gradientEndColor: "#8b5cf6", endpoint: "/analytics/dashboard/summary/" },
  { key: 'monthly', title: "MONTHLY APPLICANTS", icon: LineChart, iconColor: "#3b82f6", gradientEndColor: "#3b82f6", endpoint: "/analytics/dashboard/summary/" },
  { key: 'avgTime', title: "AVG. PROCESSING TIME", icon: Clock, iconColor: "#06b6d4", gradientEndColor: "#06b6d4", endpoint: "/analytics/dashboard/summary/" },
];

// --- SimpleStatCard, Skeletons, and Card components are kept exactly the same. ---

const SimpleStatCard = ({ stat }) => {
  const { title, value, loading, icon: Icon, iconColor, gradientEndColor } = stat;

  const displayValue = loading ? (
    <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 animate-spin" />
  ) : (
    value === null || value === undefined ? "N/A" : value.toLocaleString()
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100 h-full flex flex-col justify-between overflow-hidden relative">
      <div
        className={`absolute top-0 left-0 bottom-0 w-2 rounded-l-2xl`}
        style={{
          background: `linear-gradient(to bottom, #fff, ${gradientEndColor})`,
          opacity: 0.8,
        }}
      ></div>
      <div className="flex flex-col items-start space-y-2 relative z-10">
        <div className="flex items-center justify-between w-full">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider min-w-0 pr-4">
            {title}
          </p>
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0`}
            style={{
              backgroundColor: `${iconColor}20`,
            }}
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: iconColor }} />
          </div>
        </div>
        <p className={`text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mt-2 ${loading ? 'h-10' : ''}`}>
          {displayValue}
        </p>
      </div>
    </div>
  );
};

const KPISkeleton = () => (
  <div className="animate-pulse bg-white rounded-2xl shadow-lg p-6 border border-gray-100 h-[130px] w-full">
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-3/5 mb-2"></div>
        <div className="h-8 bg-gray-300 rounded w-4/5"></div>
      </div>
      <div className="w-10 h-10 sm:w-14 sm:h-14 bg-gray-200 rounded-xl flex-shrink-0"></div>
    </div>
    <div className="h-1 bg-gray-200 rounded-full"></div>
  </div>
);

const ChartSkeleton = () => (
  <div className="animate-pulse bg-white rounded-3xl shadow-xl p-4 sm:p-8 border border-gray-100 h-[350px] w-full">
    <div className="h-full bg-gray-200 rounded-xl"></div>
  </div>
);

const ListSkeleton = ({ items = 5 }) => (
  <div className="animate-pulse">
    <ul className="space-y-3">
      {[...Array(items)].map((_, i) => (
        <li
          key={i}
          className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>
          <div className="h-5 bg-gray-200 rounded w-16"></div>
        </li>
      ))}
    </ul>
  </div>
);

const Card = ({ title, icon: Icon, children, gradient = "from-indigo-600 to-blue-700" }) => (
  <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 transition-all duration-300 hover:shadow-2xl h-full w-full">
    <div className="flex items-center gap-4 mb-6">
      <div
        className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center shadow-lg flex-shrink-0`}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
      <h2 className="font-bold text-lg sm:text-xl text-gray-900 border-l-4 border-blue-500 pl-3 leading-none flex-grow">
        {title}
      </h2>
    </div>
    {children}
  </div>
);

// ------------------------------------
// --- REACT QUERY FETCH HOOKS ---
// ------------------------------------

// Combines the original fetchKpiStat and fetchAllKpiStatsConcurrently logic
const useAllKpiStats = () => {
    // React Query is designed for parallel fetching, so we only need one query
    const { data: summaryData, isLoading: isSummaryLoading, isError: isSummaryError } = useQuery({
        queryKey: ['kpiSummary'],
        queryFn: async () => {
            // Note: We skip the artificial delays as React Query is natively concurrent.
            const { data } = await api.get("/analytics/dashboard/summary/");
            return data;
        },
        // Using a short staleTime for fresh KPI data
        staleTime: 60000, 
    });

    // We use useMemo to process the fetched data into the original kpiStats shape
    const kpiStats = useMemo(() => {
        const stats = {};
        KPI_KEYS.forEach(config => {
            let value = '-';
            let loading = isSummaryLoading;

            if (summaryData) {
                loading = false;
                if (config.key === 'avgTime') {
                    value = summaryData.averageProcessingTime
                        ? `${summaryData.averageProcessingTime} mins`
                        : "N/A";
                } else if (config.key === 'today') {
                    // Note: Since all keys fetch the same summary endpoint, 
                    // this logic assumes the backend returns all daily/weekly/monthly values in one payload.
                    value = summaryData.dailyApplicants ?? 0;
                } else if (config.key === 'weekly') {
                    value = summaryData.weeklyApplicants ?? 0;
                } else if (config.key === 'monthly') {
                    value = summaryData.monthlyApplicants ?? 0;
                }
            }
            
            // If there's a fetching error, display 'Error'
            if (isSummaryError && !loading) {
                 value = 'Error';
            }

            stats[config.key] = {
                ...config,
                value: value,
                loading: loading,
            };
        });
        return stats;
    }, [summaryData, isSummaryLoading, isSummaryError]);

    return { kpiStats, isLoading: isSummaryLoading, isError: isSummaryError };
};


// Combines the rest of the 'fetchContentData' logic into concurrent React Query hooks
const useDashboardContent = () => {
    // This is equivalent to the original Promise.all for the content data
    const results = useQueries({
        queries: [
            { queryKey: ['totals'], queryFn: async () => (await api.get("/analytics/dashboard/total-applicants/")).data || {}, staleTime: 5 * 60000 },
            { queryKey: ['growth'], queryFn: async () => (await api.get("/analytics/dashboard/growth-rate/")).data || {}, staleTime: 5 * 60000 },
            { queryKey: ['monthlyTrend'], queryFn: async () => (await api.get("/analytics/trends/monthly/")).data || [], staleTime: 5 * 60000 },
            { queryKey: ['staffActivity'], queryFn: async () => (await api.get("/analytics/performance/staff-leaderboard/")).data || [], staleTime: 5 * 60000 },
            { queryKey: ['recentApplicants'], queryFn: async () => {
                const res = await api.get("/recent_applicants/");
                return res.data?.results || res.data || [];
            }, staleTime: 5 * 60000 },
        ]
    });

    // Match the original variable names
    const [totals, growth, monthlyTrend, staffActivity, recentApplicants] = results;
    
    // The original `isChartLoading` logic (which included lists/charts)
    const isChartLoading = results.some(r => r.isLoading);

    // Error handling to match the original toast logic
    results.forEach(res => {
        if (res.isError) {
            console.error("Dashboard content fetch error:", res.error);
            // This ensures the toast shows only once per query failure
            if (!toast.current) { 
                toast.error("Failed to load dashboard data. Check API connections.", {
                    style: { background: "#1e293b", color: "#f1f5f9", border: "1px solid #334155" },
                });
                toast.current = true; // Simple debounce to prevent flood
                setTimeout(() => toast.current = false, 5000); 
            }
        }
    });

    return {
        totals: totals.data,
        growth: growth.data,
        monthlyTrend: monthlyTrend.data,
        staffActivity: staffActivity.data,
        recentApplicants: recentApplicants.data,
        isChartLoading: isChartLoading,
    };
};


// ------------------------------------
// --- MAIN DASHBOARD COMPONENT ---
// ------------------------------------

const Dashboard = () => {
  // Use React Query hooks
  const { kpiStats, isLoading: isKpiLoading } = useAllKpiStats();
  const { 
    totals, 
    growth, 
    monthlyTrend, 
    staffActivity, 
    recentApplicants, 
    isChartLoading 
  } = useDashboardContent();

  // The original component had these empty states but they are now redundant with React Query data.
  // We keep the declaration for variable name consistency, but they won't be used for state.
  const summary = null;
  const typeBreakdown = [];
  const statusFunnel = [];
  
  // Clean up original logic - React Query manages the fetching and loading, 
  // so the original `useEffect` with `fetchAllKpiStatsConcurrently` and `fetchContentData` is removed.

  useEffect(() => {
    document.title = "QuickAid | Dashboard";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getTypeStyles = type => {
    switch (type) {
      case "Medical":
        return "bg-green-100 text-green-700";
      case "Educational":
        return "bg-blue-100 text-blue-700";
      case "Burial":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-xl text-sm">
          {/* We assume the dataKey for recharts is correct, so using 'name' or 'month' */}
          <p className="font-semibold text-gray-800">{payload[0].payload.month || payload[0].payload.name}</p> 
          <p className="text-blue-600">
            Total: <span className="font-bold">{payload[0].value.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 bg-gray-50 min-h-screen">
      {/* 1. Formal Header (Unchanged) */}
      <header className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 border border-gray-100 w-full">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center shadow-xl flex-shrink-0">
            <LayoutDashboard className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-blue-800">
              Operational Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              A high-level overview of key QuickAid metrics and recent activities.
            </p>
          </div>
        </div>
      </header>
      
      {/* 2. KPI Cards (Using data derived from useAllKpiStats) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* We map over the processed kpiStats object */}
        <SimpleStatCard stat={kpiStats.today} />
        <SimpleStatCard stat={kpiStats.weekly} />
        <SimpleStatCard stat={kpiStats.monthly} />
        <SimpleStatCard stat={kpiStats.avgTime} />
      </div>

      {/* 3. Application Analytics (Empty Section) */}
      <div className="grid grid-cols-1">
        {/* Empty section for removed charts */}
      </div>

      {/* 4. Monthly Trend Chart (Uses isChartLoading, which includes monthlyTrend's loading state) */}
      <Card
        title="Monthly Application Volume"
        icon={TrendingUp}
        gradient="from-indigo-600 to-blue-700"
      >
        {isChartLoading ? (
          <ChartSkeleton />
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Tracking application submission rates over time.
            </p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart 
                  data={monthlyTrend} // Directly using data from hook
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    style={{ fontSize: "11px", fontWeight: "500" }}
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis stroke="#6b7280" style={{ fontSize: "11px", fontWeight: "500" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      padding: "10px",
                    }}
                    labelStyle={{ color: "#1f2937", fontWeight: "700" }}
                    formatter={value => [value.toLocaleString(), "Applications"]}
                    content={CustomTooltip}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="url(#colorGradient)"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 8, fill: "#2563eb", stroke: "#fff", strokeWidth: 3 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </Card>

      {/* 5. Staff Activity + Recent Applicants Grid (Uses isChartLoading for list skeletons) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Staff Activity Leaderboard"
            icon={Activity}
            gradient="from-purple-600 to-indigo-700"
          >
            {isChartLoading ? ( // Use isChartLoading for this section
              <ListSkeleton items={5} />
            ) : staffActivity && staffActivity.length > 0 ? ( // Use data from hook
              <ul className="space-y-3">
                {staffActivity.slice(0, 5).map((s, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-200 transition-shadow duration-200 hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-6 text-center font-bold text-lg text-purple-700 flex-shrink-0">
                        #{i + 1}
                      </div>
                      <span className="font-semibold text-gray-800 truncate">
                        {s.staff__username}
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold shadow-sm flex-shrink-0 whitespace-nowrap">
                      {s.count} Processed
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12 bg-gray-100 rounded-lg">
                <Activity className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">
                  No recent staff activity records.
                </p>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card
            title="Recently Submitted Applications"
            icon={FileText}
            gradient="from-green-600 to-teal-700"
          >
            {isChartLoading ? ( // Use isChartLoading for this section
              <ListSkeleton items={5} />
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm border-collapse table-auto">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="p-3 sm:p-4 text-left font-bold text-gray-700 min-w-[130px]">
                        Applicant Name
                      </th>
                      <th className="p-3 sm:p-4 text-center font-bold text-gray-700 min-w-[90px]">
                        Barangay
                      </th>
                      <th className="p-3 sm:p-4 text-center font-bold text-gray-700 min-w-[80px]">
                        Type
                      </th>
                      <th className="p-3 sm:p-4 text-right font-bold text-gray-700">
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(recentApplicants && // Use data from hook
                      recentApplicants.slice(0, 5).map((a, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-100 transition-colors duration-150 hover:bg-blue-50"
                        >
                          <td className="p-3 sm:p-4 font-medium text-gray-800 truncate max-w-[130px]">
                            {a.background_info?.first_name} {a.background_info?.last_name}
                          </td>
                          <td className="p-3 sm:p-4 text-center text-gray-600 truncate max-w-[90px]">
                            {a.background_info?.barangay}
                          </td>
                          <td className="p-3 sm:p-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${getTypeStyles(
                                a.type_of_assistance
                              )}`}
                            >
                              {a.type_of_assistance}
                            </span>
                          </td>
                          <td className="p-3 sm:p-4 text-right text-gray-500 text-xs">
                            {formatDate(a.date_filled)}
                          </td>
                        </tr>
                      ))) ||
                      null}
                  </tbody>
                </table>
                {(!recentApplicants || recentApplicants.length === 0) && (
                  <div className="text-center py-12 bg-gray-100 rounded-b-xl border-t border-gray-200">
                    <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">
                      No recent applications found.
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
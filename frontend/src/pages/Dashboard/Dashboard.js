import { useEffect, useState, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import {
  LineChart,
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

const StatCard = ({ icon: Icon, title, value, gradient, colorHex }) => (
  <div
    className={`bg-white rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 w-full`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1 min-w-[60%]">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          {title}
        </p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">
          {value}
        </p>
      </div>
      <div
        className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ml-4`}
      >
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </div>
    </div>
    <div className={`h-1`} style={{ backgroundColor: colorHex, opacity: 0.2 }}></div>
  </div>
);

// ------------------------------------
// --- 2. MAIN DASHBOARD COMPONENT ---
// ------------------------------------

const Dashboard = () => {
  // Data States
  const [summary, setSummary] = useState(null);
  const [totals, setTotals] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [staffActivity, setStaffActivity] = useState(null);
  const [recentApplicants, setRecentApplicants] = useState(null);

  console.log("total applicants:", totals);

  // Analytics Data States
  const [typeBreakdown, setTypeBreakdown] = useState([]);
  const [statusFunnel, setStatusFunnel] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "QuickAid | Dashboard";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  // Function to fetch ALL dashboard data from your API
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        summaryRes,
        totalsRes,
        growthRes,
        monthlyRes,
        staffRes,
        recentRes,
        breakdownRes,
        funnelRes,
      ] = await Promise.all([
        api.get("/analytics/dashboard/summary/"),
        api.get("/analytics/dashboard/total-applicants/"),
        api.get("/analytics/dashboard/growth-rate/"),
        api.get("/analytics/trends/monthly/"),
        api.get("/analytics/performance/staff-leaderboard/"),
        api.get("/recent_applicants/"),
      ]);

      // Set Core Data
      setSummary(summaryRes.data || {});
      setTotals(totalsRes.data || {});
      setGrowth(growthRes.data || {});
      setMonthlyTrend(monthlyRes.data || []);
      setStaffActivity(staffRes.data || []);
      setRecentApplicants(recentRes.data?.results || recentRes.data || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Failed to load dashboard data. Check API connections.", {
        style: { background: "#1e293b", color: "#f1f5f9", border: "1px solid #334155" },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
          {/* Recharts uses 'name' for the category, which is correct for both charts */}
          <p className="font-semibold text-gray-800">{payload[0].payload.name}</p>
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

      {/* 2. KPI Cards (Unchanged logic) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {loading ? (
          <>
            <KPISkeleton />
            <KPISkeleton />
            <KPISkeleton />
            <KPISkeleton />
          </>
        ) : (
          <>
            <StatCard
              icon={Users}
              title="Total Applicants"
              value={totals?.total_applicants ?? 0}
              gradient="from-indigo-600 to-blue-700"
              colorHex="#3b82f6"
            />
            <StatCard
              icon={Clock}
              title="Avg. Processing Time"
              value={`${summary?.averageProcessingTime ?? 0} mins`}
              gradient="from-cyan-600 to-sky-700"
              colorHex="#06b6d4"
            />
            <StatCard
              icon={TrendingUp}
              title="Recent Growth Rate"
              value={`${growth?.growth_rate ?? 0}%`}
              gradient="from-green-600 to-emerald-700"
              colorHex="#10b981"
            />
            <StatCard
              icon={MapPin}
              title="Highest Volume Barangay"
              value={summary?.highestBarangay ?? "N/A"}
              gradient="from-orange-600 to-amber-700"
              colorHex="#f59e0b"
            />
          </>
        )}
      </div>

      {/* 3. Application Analytics (Data and Colors integrated) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* 3a. Application Type Breakdown (Donut/Pie Chart) */}
        <Card
          title="Application Type Breakdown"
          icon={PieIcon}
          gradient="from-teal-600 to-cyan-700"
        >
          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="h-[300px] flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    fill="#8884d8"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {/* Use TYPE_COLORS map to assign colors based on the data's 'name' property */}
                    {typeBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.name] || "#ccc"} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* 3b. Application Status Funnel (Horizontal Bar Chart) */}
        <Card
          title="Application Status Funnel"
          icon={BarIcon}
          gradient="from-red-600 to-pink-700"
        >
          {loading ? (
            <ChartSkeleton />
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statusFunnel}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#6b7280"
                    style={{ fontSize: "11px", fontWeight: "500" }}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" barSize={30}>
                    {/* Use STATUS_COLORS map to assign colors based on the data's 'name' property */}
                    {statusFunnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#ccc"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* 4. Monthly Trend Chart (Unchanged logic) */}
      <Card
        title="Monthly Application Volume"
        icon={TrendingUp}
        gradient="from-indigo-600 to-blue-700"
      >
        {loading ? (
          <ChartSkeleton />
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Tracking application submission rates over time.
            </p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyTrend}
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
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="url(#colorGradient)"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 8, fill: "#2563eb", stroke: "#fff", strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </Card>

      {/* 5. Staff Activity + Recent Applicants Grid (Unchanged logic) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <Card
            title="Staff Activity Leaderboard"
            icon={Activity}
            gradient="from-purple-600 to-indigo-700"
          >
            {loading ? (
              <ListSkeleton items={5} />
            ) : staffActivity && staffActivity.length > 0 ? (
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
            {loading ? (
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
                    {(recentApplicants &&
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

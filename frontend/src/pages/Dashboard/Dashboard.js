import { useEffect, useState, useMemo, useCallback } from "react";
import { api } from "../../services/api";
import toast from "react-hot-toast";
import "react-datepicker/dist/react-datepicker.css";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Clock,
  TrendingUp,
  Calendar,
  MapPin,
  Activity,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  Timer,
  LayoutDashboard,
} from "lucide-react";

// COLORS array for charts from the primary accent and its shades
const CHART_COLORS = ["#2563eb", "#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe"];

const Dashboard = () => {
  const [totalApplicants, setTotalApplicants] = useState({ daily: 0, weekly: 0, monthly: 0 });
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [avgProcessing, setAvgProcessing] = useState(null);
  const [staffActivity, setStaffActivity] = useState([]);
  const [assistanceTypes, setAssistanceTypes] = useState([]);
  const [trendsOverTime, setTrendsOverTime] = useState([]);
  const [topBarangays, setTopBarangays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "QuickAid | Dashboard";
    return () => {
      document.title = "QuickAid | Home";
    };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      const [totalRes, avgRes, staffRes, recentRes, assistTypesRes, trendsRes, topBrgysRes] =
        await Promise.all([
          api.get("/analytics/total-applicants/"),
          api.get("/analytics/average-processing-time/"),
          api.get("/analytics/staff-activity/"),
          api.get("/recent_applicants/"),
          api.get("/analytics/applicants-by-assistance-type/"),
          api.get("/analytics/trends-over-time/"),
          api.get("/analytics/top-barangays/"),
        ]);

      setTotalApplicants(totalRes.data || { daily: 0, weekly: 0, monthly: 0 });
      setAvgProcessing(avgRes.data?.average_processing_time ?? null);
      setStaffActivity(staffRes.data || []);
      setRecentApplicants(recentRes.data?.results || recentRes.data || []);
      setAssistanceTypes(assistTypesRes.data || []);
      setTrendsOverTime(trendsRes.data || []);
      setTopBarangays(topBrgysRes.data || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Failed to load dashboard data. Please try again later.", {
        duration: 3000,
        style: {
          background: "#1e293b",
          color: "#f1f5f9",
          border: "1px solid #334155",
        },
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const assistancePieData = useMemo(
    () =>
      (assistanceTypes || []).map(item => ({
        name: item.type_of_assistance,
        value: item.count,
      })),
    [assistanceTypes]
  );

  const topBarangaysData = useMemo(
    () =>
      (topBarangays || []).map(item => ({
        name: item["background_info__barangay__name"],
        count: item.count,
      })),
    [topBarangays]
  );

  const trendsData = useMemo(
    () => (trendsOverTime || []).map(item => ({ date: item.date, count: item.count })),
    [trendsOverTime]
  );

  const formatProcessingTime = seconds => {
    if (seconds === null || seconds === undefined) return "N/A";
    const totalMinutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${totalMinutes}:${String(remainingSeconds).padStart(2, "0")} min`;
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // Reusable card component
  const Card = ({ title, icon: Icon, children, className = "" }) => (
    <div
      className={`bg-quickaid-surface rounded-lg shadow p-3 border border-slate-200 ${className}`}
    >
      <div className="flex items-center gap-3 mb-3">
        {Icon && (
          <div className="w-8 h-8 bg-quickaid-accent/10 rounded-md flex items-center justify-center">
            <Icon className="w-5 h-5 text-quickaid-accent" />
          </div>
        )}
        <h2 className="text-lg font-semibold text-quickaid-text-primary">{title}</h2>
      </div>
      {children}
    </div>
  );

  // Reusable stat card component
  const StatCard = ({
    icon: Icon,
    title,
    value,
    bgColor = "bg-quickaid-accent/10",
    iconColor = "text-quickaid-accent",
  }) => (
    <div className="bg-quickaid-surface rounded-lg shadow p-3 border border-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-quickaid-text-secondary mb-1">{title}</p>
          <p className="text-lg font-bold text-quickaid-text-primary">{value}</p>
        </div>
        <div className={`w-8 h-8 ${bgColor} rounded-md flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-4 bg-quickaid-bg">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
          <span className="loading loading-spinner loading-lg text-quickaid-accent mb-4"></span>
          <p className="text-quickaid-text-secondary font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 bg-quickaid-bg min-h-screen">
      {/* Header */}
      <header className="mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-quickaid-accent/10 rounded-md flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-quickaid-accent" />
          </div>
          <h1 className="text-xl font-bold text-quickaid-text-primary">Dashboard</h1>
        </div>
        <p className="text-sm text-quickaid-text-secondary">
          Analytics and insights overview for QuickAid.
        </p>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Calendar}
          title="Today's Applicants"
          value={totalApplicants.daily ?? 0}
          bgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          icon={BarChart3}
          title="Weekly Applicants"
          value={totalApplicants.weekly ?? 0}
          bgColor="bg-indigo-100"
          iconColor="text-indigo-600"
        />
        <StatCard
          icon={TrendingUp}
          title="Monthly Applicants"
          value={totalApplicants.monthly ?? 0}
          bgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          icon={Timer}
          title="Avg. Completion Time"
          value={formatProcessingTime(avgProcessing)}
          bgColor="bg-emerald-100"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card title="Assistance Types" icon={PieChartIcon}>
          {assistancePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={192}>
              <PieChart>
                <Pie
                  data={assistancePieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {assistancePieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  iconSize={12}
                  iconType="square"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: 10, paddingTop: "10px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center text-quickaid-text-secondary">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                <PieChartIcon className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm font-medium">
                No assistance type data available
              </p>
            </div>
          )}
        </Card>

        <Card title="Top Barangays" icon={MapPin}>
          {topBarangaysData.length > 0 ? (
            <ResponsiveContainer width="100%" height={192}>
              <BarChart
                data={topBarangaysData}
                layout="vertical"
                margin={{ left: 20, right: 10, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={110}
                  interval={0}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" name="Applicants" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center text-quickaid-text-secondary">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                <MapPin className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm font-medium">No barangay data available</p>
            </div>
          )}
        </Card>
      </div>

      {/* Trends Section */}
      <div className="w-full">
        <Card title="Applicant Trends (Last 30 Days)" icon={TrendingUp}>
          {trendsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={192}>
              <LineChart data={trendsData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2}
                  name="Applicants"
                  dot={{ fill: "#2563eb", strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 5, fill: "#1d4ed8" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center text-quickaid-text-secondary">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm font-medium">No trend data available</p>
            </div>
          )}
        </Card>
      </div>

      {/* Staff Activity and Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card title="Top Staff Activity" icon={Activity}>
          {staffActivity.length > 0 ? (
            <div className="space-y-2">
              {staffActivity.slice(0, 6).map((s, index) => (
                <div
                  key={s.staff__username}
                  className="flex justify-between items-center px-3 py-2 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center text-white font-semibold text-sm ${
                        index === 0
                          ? "bg-gradient-to-br from-yellow-400 to-amber-500"
                          : index === 1
                          ? "bg-gradient-to-br from-gray-300 to-gray-500"
                          : index === 2
                          ? "bg-gradient-to-br from-amber-600 to-amber-700"
                          : "bg-gradient-to-br from-blue-500 to-blue-600"
                      }`}
                    >
                      {s.staff__username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-quickaid-text-primary">
                        {s.staff__username}
                      </p>
                      <p className="text-xs text-quickaid-text-secondary">Staff Member</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-600 bg-white px-2 py-1 rounded-full border border-slate-200">
                      {s.count} applications
                    </span>
                    {index < 3 && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-bold ${
                          index === 0
                            ? "bg-yellow-100 text-yellow-800"
                            : index === 1
                            ? "bg-gray-100 text-gray-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        #{index + 1}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-56 text-center text-quickaid-text-secondary">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                <Activity className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-slate-500 text-sm font-medium">No activity recorded</p>
            </div>
          )}
        </Card>

        <Card title="Recent Submissions" icon={Clock}>
          <div className="overflow-x-auto bg-quickaid-surface rounded-lg shadow-sm">
            <table className="table w-full text-xs md:text-sm">
              <thead>
                <tr className="text-left bg-gray-100 text-gray-700 text-xs uppercase">
                  <th className="py-1.5 px-2 font-semibold rounded-l-lg">Name</th>
                  <th className="py-1.5 px-2 font-semibold">Barangay</th>
                  <th className="py-1.5 px-2 font-semibold">Assistance</th>
                  <th className="py-1.5 px-2 font-semibold rounded-r-lg">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentApplicants.length > 0 ? (
                  recentApplicants.slice(0, 5).map((a, idx) => (
                    <tr
                      key={a.id || idx}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-1.5 px-2">
                        <p className="font-medium text-quickaid-text-primary">
                          {`${a.background_info.first_name || ""} ${
                            a.background_info.last_name || ""
                          }`.trim()}
                        </p>
                      </td>
                      <td className="py-1.5 px-2">
                        <p className="text-xs text-quickaid-text-secondary">
                          {a.background_info.barangay}
                        </p>
                      </td>
                      <td className="py-1.5 px-2">
                        <span className="badge badge-primary badge-outline text-xs">
                          {a.type_of_assistance}
                        </span>
                      </td>
                      <td className="py-1.5 px-2">
                        <p className="text-xs text-quickaid-text-secondary">
                          {formatDate(new Date(a.date_filled))}
                        </p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-6">
                      <div className="flex flex-col items-center text-quickaid-text-secondary">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                          <FileText className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">
                          No recent applicants
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

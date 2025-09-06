import { useEffect, useState, useMemo, useCallback } from "react";
import { api } from "../../services/api";
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
  Users,
  Clock,
  TrendingUp,
  Calendar,
  MapPin,
  Activity,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  Timer,
  UserCheck,
} from "lucide-react";

const COLORS = ["#38b2ac", "#1a202c", "#2d3748", "#4ade80", "#fbbf24", "#f87171"];

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

  if (loading) {
    return (
      <div className="p-6 bg-quickaid-bg min-h-screen">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-quickaid-text-primary flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-quickaid-accent" />
              QuickAid Dashboard
            </h1>
            <p className="text-quickaid-text-secondary mt-2">
              Analytics and insights overview
            </p>
          </header>
          <div className="flex justify-center items-center h-96">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-quickaid-accent rounded-full animate-spin"></div>
              <span className="mt-4 text-quickaid-text-secondary">
                Loading dashboard data...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-quickaid-bg min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-quickaid-text-primary flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-quickaid-accent" />
            QuickAid Dashboard
          </h1>
          <p className="text-quickaid-text-secondary mt-2">Analytics and insights overview</p>
        </header>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-quickaid-surface shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-quickaid-accent bg-opacity-10 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-quickaid-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-quickaid-text-secondary mb-1">
                  Today's Applicants
                </h3>
                <div className="text-2xl font-bold text-quickaid-text-primary">
                  {totalApplicants.daily ?? 0}
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-quickaid-surface shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-quickaid-accent bg-opacity-10 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-quickaid-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-quickaid-text-secondary mb-1">
                  Weekly Applicants
                </h3>
                <div className="text-2xl font-bold text-quickaid-text-primary">
                  {totalApplicants.weekly ?? 0}
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-quickaid-surface shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-quickaid-accent bg-opacity-10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-quickaid-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-quickaid-text-secondary mb-1">
                  Monthly Applicants
                </h3>
                <div className="text-2xl font-bold text-quickaid-text-primary">
                  {totalApplicants.monthly ?? 0}
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-quickaid-surface shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-quickaid-accent bg-opacity-10 rounded-xl flex items-center justify-center">
                <Timer className="w-6 h-6 text-quickaid-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-quickaid-text-secondary mb-1">
                  Avg. Form Completion Time
                </h3>
                <div className="text-2xl font-bold text-quickaid-text-primary">
                  {formatProcessingTime(avgProcessing)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card bg-quickaid-surface shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-6">
              <PieChartIcon className="w-5 h-5 text-quickaid-accent" />
              <h2 className="text-xl font-semibold text-quickaid-text-primary">
                Assistance Types
              </h2>
            </div>
            {assistancePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={assistancePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {assistancePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-72 text-quickaid-text-secondary">
                <div className="text-center">
                  <PieChartIcon className="w-12 h-12 text-quickaid-text-secondary mx-auto mb-2 opacity-50" />
                  <p>No assistance type data available</p>
                </div>
              </div>
            )}
          </div>

          <div className="card bg-quickaid-surface shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-5 h-5 text-quickaid-accent" />
              <h2 className="text-xl font-semibold text-quickaid-text-primary">
                Top Barangays
              </h2>
            </div>
            {topBarangaysData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topBarangaysData}
                  layout="vertical"
                  margin={{ left: 20, right: 10, top: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={110}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#38b2ac" name="Applicants" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-72 text-quickaid-text-secondary">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-quickaid-text-secondary mx-auto mb-2 opacity-50" />
                  <p>No barangay data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trends Section */}
        <div className="mb-8">
          <div className="card bg-quickaid-surface shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-5 h-5 text-quickaid-accent" />
              <h2 className="text-xl font-semibold text-quickaid-text-primary">
                Applicant Trends (Last 30 Days)
              </h2>
            </div>
            {trendsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={trendsData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#38b2ac"
                    strokeWidth={2}
                    name="Applicants"
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-72 text-quickaid-text-secondary">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-quickaid-text-secondary mx-auto mb-2 opacity-50" />
                  <p>No trend data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Staff Activity and Recent Submissions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card bg-quickaid-surface shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-5 h-5 text-quickaid-accent" />
              <h2 className="text-xl font-semibold text-quickaid-text-primary">
                Top Staff Activity
              </h2>
            </div>
            {staffActivity.length > 0 ? (
              <div className="space-y-3">
                {staffActivity.slice(0, 5).map((s, index) => (
                  <div
                    key={s.staff__username}
                    className="flex justify-between items-center bg-quickaid-bg p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-quickaid-accent bg-opacity-10 rounded-full flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-quickaid-accent" />
                      </div>
                      <span className="font-medium text-quickaid-text-primary">
                        {s.staff__username}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-quickaid-text-secondary bg-quickaid-surface px-3 py-1 rounded-full border">
                        {s.count} applicants
                      </span>
                      {index === 0 && (
                        <span className="text-xs bg-quickaid-accent text-white px-2 py-1 rounded-full">
                          Top
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-quickaid-text-secondary">
                <div className="text-center">
                  <Activity className="w-12 h-12 text-quickaid-text-secondary mx-auto mb-2 opacity-50" />
                  <p>No activity recorded</p>
                </div>
              </div>
            )}
          </div>

          <div className="card bg-quickaid-surface shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-quickaid-accent" />
              <h2 className="text-xl font-semibold text-quickaid-text-primary">
                Recent Submissions
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-quickaid-text-secondary uppercase bg-quickaid-bg">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Barangay</th>
                    <th className="px-4 py-3 text-left font-medium">Assistance</th>
                    <th className="px-4 py-3 text-left font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplicants.length > 0 ? (
                    recentApplicants.slice(0, 5).map((a, idx) => (
                      <tr
                        key={a.id || idx}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-quickaid-bg transition-colors duration-200"
                      >
                        <td className="px-4 py-3 text-quickaid-text-primary font-medium">
                          {`${a.background_info.first_name || ""} ${
                            a.background_info.last_name || ""
                          }`.trim()}
                        </td>
                        <td className="px-4 py-3 text-quickaid-text-secondary">
                          {a.background_info.barangay}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-quickaid-accent bg-opacity-10 text-quickaid-accent px-2 py-1 rounded-full">
                            {a.type_of_assistance}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-quickaid-text-secondary text-xs">
                          {formatDate(new Date(a.date_filled))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center px-4 py-8 text-quickaid-text-secondary"
                      >
                        <div className="flex flex-col items-center">
                          <FileText className="w-8 h-8 text-quickaid-text-secondary mb-2 opacity-50" />
                          <p>No recent applicants</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

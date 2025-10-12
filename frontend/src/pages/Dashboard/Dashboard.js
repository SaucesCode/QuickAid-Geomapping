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
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [totals, setTotals] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [staffActivity, setStaffActivity] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
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
      const [summaryRes, totalsRes, growthRes, monthlyRes, staffRes, recentRes] =
        await Promise.all([
          api.get("/analytics/dashboard/summary/"),
          api.get("/analytics/dashboard/total-applicants/"),
          api.get("/analytics/dashboard/growth-rate/"),
          api.get("/analytics/trends/monthly/"),
          api.get("/analytics/performance/staff-leaderboard/"),
          api.get("/recent_applicants/"),
        ]);

      console.log("Monthly Trend Data:", monthlyRes.data);
      console.log("Staff Activity Data:", staffRes.data);
      console.log("Recent Applicants Data:", recentRes.data);
      console.log("Summary Data:", summaryRes.data);
      console.log("Totals Data:", totalsRes.data);
      console.log("Growth Data:", growthRes.data);

      setSummary(summaryRes.data || {});
      setTotals(totalsRes.data || {});
      setGrowth(growthRes.data || {});
      setMonthlyTrend(monthlyRes.data || []);
      setStaffActivity(staffRes.data || []);
      setRecentApplicants(recentRes.data?.results || recentRes.data || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Failed to load dashboard data.", {
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
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
          {/* Modern Spinner */}
          <div className="relative w-24 h-24 mb-6">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 border-[6px] border-gradient-to-r from-blue-500 via-blue-500 to-blue-500 border-t-transparent rounded-full animate-spin"></div>
            
            {/* Inner pulsing ring */}
            <div className="absolute inset-2 border-4 border-blue-300 border-t-transparent rounded-full animate-spin animation-delay-150"></div>

            {/* Centered icon with glow effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              
                <LayoutDashboard className="w-8 h-8 text-blue-500" />
              
            </div>
          </div>

          {/* Loading text with gradient */}
          <div className="text-center space-y-2">
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-600 to-blue-600 font-bold text-xl">
              Loading Dashboard
            </p>
            <p className="text-sm text-gray-600 font-medium">
              Fetching your data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50 min-h-screen">
      {/* Modern Header */}
      <header className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-600">
              Dashboard
            </h1>
            <p className="text-sm text-gray-600 font-medium">
              Executive summary of QuickAid operations
            </p>
          </div>
        </div>
      </header>

      {/* Modern KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Total Applicants"
          value={summary?.totalApplicants ?? 0}
          gradient="from-blue-500 to-blue-600"
          bgGradient="from-blue-50 to-blue-50"
        />
        <StatCard
          icon={Clock}
          title="Avg. Processing Time"
          value={`${summary?.averageProcessingTime ?? 0} mins`}
          gradient="from-blue-500 to-pink-600"
          bgGradient="from-blue-50 to-pink-50"
        />
        <StatCard
          icon={TrendingUp}
          title="Growth Rate"
          value={`${growth?.growth_rate ?? 0}%`}
          gradient="from-green-500 to-emerald-600"
          bgGradient="from-green-50 to-emerald-50"
        />
        <StatCard
          icon={MapPin}
          title="Top Barangay"
          value={summary?.highestBarangay ?? "N/A"}
          gradient="from-orange-500 to-red-600"
          bgGradient="from-orange-50 to-red-50"
        />
      </div>

      {/* Monthly Trend Chart */}
      <Card title="Monthly Applications Trend" icon={TrendingUp} gradient="from-blue-500 to-blue-600">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyTrend}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
            <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px', fontWeight: '500' }} />
            <YAxis stroke="#6b7280" style={{ fontSize: '12px', fontWeight: '500' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: 'none', 
                borderRadius: '12px', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="url(#colorGradient)" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: '#6366f1' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Staff Activity + Recent Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Top Staff Activity" icon={Activity} gradient="from-blue-500 to-pink-600">
          {staffActivity.length > 0 ? (
            <ul className="space-y-3">
              {staffActivity.slice(0, 5).map((s, i) => (
                <li 
                  key={i} 
                  className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-pink-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-200 hover:scale-102"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                      {i + 1}
                    </div>
                    <span className="font-semibold text-gray-800">{s.staff__username}</span>
                  </div>
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-bold text-blue-600 shadow-sm">
                    {s.count} apps
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">No staff activity</p>
            </div>
          )}
        </Card>

        <Card title="Recent Applicants" icon={FileText} gradient="from-green-500 to-emerald-600">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
                  <th className="p-3 text-left font-bold text-gray-700">Name</th>
                  <th className="p-3 text-center font-bold text-gray-700">Barangay</th>
                  <th className="p-3 text-center font-bold text-gray-700">Assistance</th>
                  <th className="p-3 text-right font-bold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentApplicants.slice(0, 5).map((a, idx) => (
                  <tr 
                    key={idx} 
                    className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-colors duration-150"
                  >
                    <td className="p-3 font-medium text-gray-800">
                      {a.background_info?.first_name} {a.background_info?.last_name}
                    </td>
                    <td className="p-3 text-center text-gray-600">{a.background_info?.barangay}</td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        {a.type_of_assistance}
                      </span>
                    </td>
                    <td className="p-3 text-right text-gray-500 text-xs">{formatDate(a.date_filled)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Modern Card Component
const Card = ({ title, icon: Icon, children, gradient }) => (
  <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
    <div className="flex items-center gap-3 mb-5">
      <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h2 className="font-bold text-lg text-gray-800">{title}</h2>
    </div>
    {children}
  </div>
);

// Modern Stat Card Component
const StatCard = ({ icon: Icon, title, value, gradient, bgGradient }) => (
  <div className={`bg-gradient-to-br ${bgGradient} rounded-2xl shadow-xl p-6 border border-white hover:shadow-2xl transition-all duration-300 hover:scale-105`}>
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1">
        <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
    </div>
    <div className="h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full"></div>
  </div>
);

export default Dashboard;